const getMonthRange = (year, month) => {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

const getCurrentMonthRange = () => {
  const now = new Date();
  return getMonthRange(now.getFullYear(), now.getMonth() + 1);
};

const getCurrentWeekRange = () => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(now);
  start.setDate(now.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getMonthsAgo = (n) => {
  const date = new Date();
  date.setMonth(date.getMonth() - n);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

const getDaysElapsedThisMonth = () => new Date().getDate();

const getTotalDaysThisMonth = () => {
  const now = new Date();
  return getDaysInMonth(now.getFullYear(), now.getMonth() + 1);
};

module.exports = {
  getMonthRange, getCurrentMonthRange, getCurrentWeekRange,
  getMonthsAgo, getDaysInMonth, getDaysElapsedThisMonth, getTotalDaysThisMonth,
};
