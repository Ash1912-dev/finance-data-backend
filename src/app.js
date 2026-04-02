const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { PORT, NODE_ENV } = require('./config/env');
const { SEED_ROLES } = require('./config/constants');
const Role = require('./modules/roles/role.model');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const requestId = require('./middleware/requestId');
const ApiError = require('./utils/ApiError');

// Routers
const authRouter = require('./modules/auth/auth.routes');
const userRouter = require('./modules/users/user.routes');
const roleRouter = require('./modules/roles/role.routes');
const recordRouter = require('./modules/records/record.routes');
const analyticsRouter = require('./modules/analytics/analytics.routes');
const budgetRouter = require('./modules/budgets/budget.routes');
const auditRouter = require('./modules/audit/audit.routes');

const app = express();

app.use(requestId);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to all api routes (max 100 requests per 15 minutes)
app.use('/api', rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }));

if (NODE_ENV === 'development') app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Finance API Running', id: req.requestId });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/roles', roleRouter);
app.use('/api/records', recordRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/budgets', budgetRouter);
app.use('/api/audit', auditRouter);

app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`, 'NOT_FOUND'));
});

app.use(errorHandler);

const seedRoles = async () => {
  try {
    for (const r of SEED_ROLES) await Role.findOneAndUpdate({ slug: r.slug }, { $setOnInsert: r }, { upsert: true });
    console.error('Roles verified.');
  } catch (err) {
    console.error('Role seed error:', err.message);
  }
};

const startServer = async () => {
  try {
    await connectDB();
    await seedRoles();
    app.listen(PORT, () => console.error(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
