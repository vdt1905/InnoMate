export const errorHandler = (err, req, res, next) => {
  const status = res.statusCode === 200 ? 500 : res.statusCode;

  // Express 5 forwards rejected promises here, so this is the only place many
  // controller failures surface — log them instead of swallowing them.
  console.error(`${req.method} ${req.originalUrl} -> ${status}:`, err);

  res.status(status).json({
    message: err.message || 'Server Error',
    // Stack traces are useful locally but should not go over the wire in prod.
    ...(process.env.NODE_ENV === 'production' ? {} : { stack: err.stack }),
  });
};
