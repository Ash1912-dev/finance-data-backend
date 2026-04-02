const FinancialRecord = require('../records/record.model');
const Budget = require('../budgets/budget.model');
const { getCurrentMonthRange, getCurrentWeekRange, getMonthsAgo, getDaysElapsedThisMonth, getTotalDaysThisMonth, getMonthRange } = require('../../utils/dateHelpers');

const getSummary = async () => {
  const result = await FinancialRecord.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);

  let totalIncome = 0; let totalExpense = 0;
  result.forEach(item => {
    if (item._id === 'income') totalIncome = item.total;
    if (item._id === 'expense') totalExpense = item.total;
  });

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpense: Math.round(totalExpense * 100) / 100,
    netBalance: Math.round((totalIncome - totalExpense) * 100) / 100,
    currency: 'INR',
  };
};

const getByCategory = async (type) => {
  const matchStage = { isDeleted: false };
  if (type) matchStage.type = type;

  const result = await FinancialRecord.aggregate([
    { $match: matchStage },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);

  const grandTotal = result.reduce((sum, item) => sum + item.total, 0);

  return result.map(item => ({
    category: item._id,
    total: Math.round(item.total * 100) / 100,
    count: item.count,
    percentage: grandTotal > 0 ? Math.round((item.total / grandTotal) * 10000) / 100 : 0,
  }));
};

const getMonthlyTrends = async (year) => {
  const matchStage = { isDeleted: false };
  if (year) {
    matchStage.date = { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59, 999) };
  } else {
    matchStage.date = { $gte: getMonthsAgo(12) };
  }

  const result = await FinancialRecord.aggregate([
    { $match: matchStage },
    { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' }, total: { $sum: '$amount' } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthlyMap = {};
  result.forEach(item => {
    const key = `${item._id.year}-${item._id.month}`;
    if (!monthlyMap[key]) monthlyMap[key] = { year: item._id.year, month: item._id.month, income: 0, expense: 0 };
    monthlyMap[key][item._id.type] = Math.round(item.total * 100) / 100;
  });

  return Object.values(monthlyMap).sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
};

const getBudgetStatus = async () => {
  const budgets = await Budget.find({ isActive: true }).lean();
  const results = [];

  for (const budget of budgets) {
    const dateRange = budget.period === 'monthly' ? getCurrentMonthRange() : getCurrentWeekRange();

    const spendResult = await FinancialRecord.aggregate([
      { $match: { isDeleted: false, type: 'expense', category: budget.category, date: { $gte: dateRange.start, $lte: dateRange.end } } },
      { $group: { _id: null, totalSpend: { $sum: '$amount' } } },
    ]);

    const currentSpend = spendResult.length ? spendResult[0].totalSpend : 0;
    const percentUsed = budget.limitAmount > 0 ? Math.round((currentSpend / budget.limitAmount) * 10000) / 100 : 0;

    let status = 'ok';
    if (percentUsed >= 100) status = 'over_budget';
    else if (percentUsed >= budget.alertThreshold) status = 'warning';

    results.push({
      budgetId: budget._id, category: budget.category, period: budget.period,
      limitAmount: budget.limitAmount, alertThreshold: budget.alertThreshold,
      currentSpend: Math.round(currentSpend * 100) / 100, percentUsed, status,
    });
  }
  return results;
};

// Financial Health Score Calculation (0-100)
// Factors: Savings rate (>20%), Budget adherence, Month-over-month expense growth
const getHealthScore = async () => {
  let score = 100;
  const factors = [];

  // 1. Savings Rate
  const { start, end } = getCurrentMonthRange();
  const monthData = await FinancialRecord.aggregate([
    { $match: { isDeleted: false, date: { $gte: start, $lte: end } } },
    { $group: { _id: '$type', total: { $sum: '$amount' } } }
  ]);
  
  let income = 0, expense = 0;
  monthData.forEach(d => { if(d._id === 'income') income = d.total; else expense = d.total; });
  
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
  if (savingsRate < 20) {
      const deduction = Math.min(30, (20 - savingsRate) * 1.5);
      score -= deduction;
      factors.push({ type: 'negative', title: 'Low Savings Rate', description: 'Savings are below the recommended 20% rule.', impact: -Math.round(deduction) });
  } else {
      factors.push({ type: 'positive', title: 'Good Savings Rate', description: `You are saving ${Math.round(savingsRate)}% of your income.`, impact: 0 });
  }

  // 2. Budget Adherence
  const budgetStatuses = await getBudgetStatus();
  let overBudgets = 0;
  budgetStatuses.forEach(b => { if (b.status === 'over_budget') overBudgets++; });
  if (overBudgets > 0) {
      const deduction = overBudgets * 10;
      score -= deduction;
      factors.push({ type: 'negative', title: 'Budget Breaches', description: `You have exceeded ${overBudgets} budgets this period.`, impact: -deduction });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let healthStatus = 'Poor';
  if (score >= 80) healthStatus = 'Excellent';
  else if (score >= 60) healthStatus = 'Good';
  else if (score >= 40) healthStatus = 'Fair';

  return { score, status: healthStatus, savingsRate: Math.round(savingsRate * 100)/100, factors };
};

const getInsights = async () => {
  const insights = [];
  insights.push(...await detectUnusualSpending());
  
  const savingsDecline = await detectSavingsDecline();
  if (savingsDecline) insights.push(savingsDecline);
  
  insights.push(...await projectBudgetOverspend());
  return insights;
};

const detectUnusualSpending = async () => {
  const sixMonthsAgo = getMonthsAgo(6);
  const { start: monthStart, end: monthEnd } = getCurrentMonthRange();

  const avgResult = await FinancialRecord.aggregate([
    { $match: { isDeleted: false, type: 'expense', date: { $gte: sixMonthsAgo, $lt: monthStart } } },
    { $group: { _id: { cat: '$category', yr: { $year: '$date' }, mo: { $month: '$date' } }, total: { $sum: '$amount' } } },
    { $group: { _id: '$_id.cat', avg: { $avg: '$total' } } },
  ]);

  const currentResult = await FinancialRecord.aggregate([
    { $match: { isDeleted: false, type: 'expense', date: { $gte: monthStart, $lte: monthEnd } } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
  ]);

  const avgMap = {};
  avgResult.forEach(item => { avgMap[item._id] = item.avg; });

  const insights = [];
  currentResult.forEach(item => {
    const avg = avgMap[item._id];
    if (avg && item.total > avg * 1.5) {
      const percentInc = Math.round(((item.total - avg) / avg) * 100);
      insights.push({
        type: 'unusual_spending', category: item._id, currentAmount: Math.round(item.total), avgAmount: Math.round(avg), percentageIncrease: percentInc,
        message: `Spending in "${item._id}" is ${percentInc}% higher than your 6-month average.`,
      });
    }
  });
  return insights;
};

const detectSavingsDecline = async () => {
  const now = new Date();
  const trends = [];

  for (let i = 3; i >= 1; i--) {
    const target = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const { start, end } = getMonthRange(target.getFullYear(), target.getMonth() + 1);

    const result = await FinancialRecord.aggregate([
      { $match: { isDeleted: false, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);

    let inc = 0, exp = 0;
    result.forEach(r => { if (r._id === 'income') inc = r.total; if (r._id === 'expense') exp = r.total; });
    trends.push({ month: target.getMonth() + 1, year: target.getFullYear(), rate: inc > 0 ? ((inc - exp) / inc) * 100 : 0 });
  }

  if (trends.length === 3 && trends[1].rate < trends[0].rate && trends[2].rate < trends[1].rate) {
    return { type: 'savings_decline', trend: trends, message: 'Savings rate declining over last 3 months. Review expenses.' };
  }
  return null;
};

const projectBudgetOverspend = async () => {
  const budgets = await Budget.find({ isActive: true, period: 'monthly' }).lean();
  const { start, end } = getCurrentMonthRange();
  const daysElapsed = getDaysElapsedThisMonth();
  const totalDays = getTotalDaysThisMonth();
  if (daysElapsed === 0) return [];

  const insights = [];
  for (const b of budgets) {
    const spend = await FinancialRecord.aggregate([
      { $match: { isDeleted: false, type: 'expense', category: b.category, date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const current = spend.length ? spend[0].total : 0;
    const projected = (current / daysElapsed) * totalDays;

    if (projected > b.limitAmount) {
      insights.push({
        type: 'budget_projection', category: b.category,
        projectedAmount: Math.round(projected), budgetLimit: b.limitAmount,
        projectedOverspend: Math.round(projected - b.limitAmount),
        message: `Projected to exceed "${b.category}" budget by ₹${Math.round(projected - b.limitAmount)}.`
      });
    }
  }
  return insights;
};

module.exports = { getSummary, getByCategory, getMonthlyTrends, getBudgetStatus, getInsights, getHealthScore };
