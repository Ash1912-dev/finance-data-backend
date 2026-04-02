const paginate = async (
  query, model, page = 1, limit = 10,
  populateOptions = [], sortOptions = { createdAt: -1 }, selectOptions = ''
) => {
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const perPage = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (currentPage - 1) * perPage;

  const total = await model.countDocuments(query);
  const totalPages = Math.ceil(total / perPage) || 1;

  let dbQuery = model.find(query).skip(skip).limit(perPage).sort(sortOptions).lean();

  if (selectOptions) dbQuery = dbQuery.select(selectOptions);
  for (const pop of populateOptions) dbQuery = dbQuery.populate(pop);

  const data = await dbQuery;

  return {
    data,
    pagination: { page: currentPage, limit: perPage, total, totalPages },
  };
};

module.exports = { paginate };
