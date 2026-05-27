import { AppError } from "../utils/AppError.js";

export const validate = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params
  });

  if (!parsed.success) {
    return next(new AppError("Validation failed", 400, parsed.error.flatten()));
  }

  req.validated = parsed.data;
  return next();
};
