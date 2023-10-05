const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 3, 
    message: 'Too many login attempts, please try again later.',
  });

  function loginRateLimitMiddleware(req, res, next) {
    loginLimiter(req, res, (err) => {
      if (err) {
        return res.status(429).json({ error: err.message });
      }
      next();
    });
  }

  module.exports = loginRateLimitMiddleware;
