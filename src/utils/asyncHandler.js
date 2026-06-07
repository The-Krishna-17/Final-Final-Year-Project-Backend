/**
 * Wraps async route handlers to eliminate try/catch boilerplate.
 * Passes any rejected promise to Express's next() error handler.
 *
 * @param {Function} fn - Async express route handler
 * @returns {Function} Wrapped handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
