import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

/**
 * Factory middleware that validates req.body against a Zod schema.
 * Attaches the parsed and coerced data back to req.body.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Request property to validate
 */
export const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return next(ApiError.badRequest("Validation failed", errors));
  }

  // Attach coerced/transformed data
  req[source] = result.data;
  next();
};
