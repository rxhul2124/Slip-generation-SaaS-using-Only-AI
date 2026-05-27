import rateLimit from "express-rate-limit";

const tooManyRequests = (message, retryAfterSeconds) => (_req, res) => {
  res.set("Retry-After", String(retryAfterSeconds));
  res.status(429).json({ status: "error", message });
};

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequests("Too many requests. Please wait a moment and try again.", 60)
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequests("Too many authentication attempts. Try again later.", 15 * 60)
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequests("Too many uploads. Please wait a moment and try again.", 60)
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequests("Too many AI requests. Please wait a moment and try again.", 60)
});
