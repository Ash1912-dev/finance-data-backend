const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data, message });
};

const sendPaginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({ success: true, data, pagination, message });
};

module.exports = { sendSuccess, sendPaginated };
