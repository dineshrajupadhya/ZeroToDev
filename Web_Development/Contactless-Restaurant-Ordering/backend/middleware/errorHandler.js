const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err.stack);

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    error.message = 'Duplicate field value entered';
    return res.status(400).json({ success: false, message: error.message });
  }

  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    error.message = 'Referenced record not found';
    return res.status(400).json({ success: false, message: error.message });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
