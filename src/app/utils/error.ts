import { HttpStatusCodes } from "../constants";

/**
 * Base error class for all custom application errors.
 * Extends the native Error class with HTTP status code support.
 */
export class BaseError extends Error {
  public readonly httpCode: number;
  public readonly name: string;

  /**
   * Creates a new BaseError instance.
   *
   * @param {string} message - Error message describing what went wrong
   * @param {number} httpCode - HTTP status code to return (default: 500)
   */
  constructor(message = "Server error", httpCode = HttpStatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;

    this.httpCode = httpCode;

    Error.captureStackTrace(this, BaseError);
  }
}

/**
 * Error thrown when there's an issue with API versioning.
 * Typically used when an invalid or unsupported API version is requested.
 */
export class ApiVersionError extends BaseError {
  /**
   * @param {string} message - Error message (default: "API version error")
   * @param {number} httpCode - HTTP status code (default: 400)
   */
  constructor(message = "API version error", httpCode = HttpStatusCodes.BAD_REQUEST) {
    super(message, httpCode);

    Error.captureStackTrace(this, ApiVersionError);
  }
}

/**
 * Error thrown when authentication fails or is missing.
 * Used for unauthorized access attempts.
 */
export class AuthError extends BaseError {
  /**
   * @param {string} message - Error message (default: "Not authorized")
   * @param {number} httpCode - HTTP status code (default: 401)
   */
  constructor(message = "Not authorized", httpCode = HttpStatusCodes.UNAUTHORIZED) {
    super(message, httpCode);

    Error.captureStackTrace(this, AuthError);
  }
}

/**
 * Error thrown when the client sends a malformed or invalid request.
 * Indicates the request cannot be processed due to client error.
 */
export class BadRequestError extends BaseError {
  /**
   * @param {string} message - Error message (default: "Bad request")
   * @param {number} httpCode - HTTP status code (default: 400)
   */
  constructor(message = "Bad request", httpCode = HttpStatusCodes.BAD_REQUEST) {
    super(message, httpCode);

    Error.captureStackTrace(this, BadRequestError);
  }
}

/**
 * Error thrown when resource creation fails due to conflicts.
 * Typically used when trying to create a resource that already exists.
 */
export class CreatedError extends BaseError {
  /**
   * @param {string} message - Error message (default: "Created failed")
   * @param {number} httpCode - HTTP status code (default: 409)
   */
  constructor(message = "Created failed", httpCode = HttpStatusCodes.CONFLICT) {
    super(message, httpCode);

    Error.captureStackTrace(this, CreatedError);
  }
}

/**
 * Error thrown when resource deletion fails.
 * Used when the deletion operation cannot be completed.
 */
export class DeletedError extends BaseError {
  /**
   * @param {string} message - Error message (default: "Deleted failed")
   * @param {number} httpCode - HTTP status code (default: 422)
   */
  constructor(message = "Deleted failed", httpCode = HttpStatusCodes.UNPROCESSABLE_ENTITY) {
    super(message, httpCode);

    Error.captureStackTrace(this, DeletedError);
  }
}

/**
 * Error thrown when the user lacks permission to access a resource.
 * Different from AuthError - user is authenticated but not authorized.
 */
export class ForbiddenError extends BaseError {
  /**
   * @param {string} message - Error message (default: "Forbidden")
   * @param {number} httpCode - HTTP status code (default: 403)
   */
  constructor(message = "Forbidden", httpCode = HttpStatusCodes.FORBIDDEN) {
    super(message, httpCode);

    Error.captureStackTrace(this, ForbiddenError);
  }
}

/**
 * Error thrown when a requested resource cannot be found.
 * The most commonly used error for missing resources or routes.
 */
export class NotFoundError extends BaseError {
  /**
   * @param {string} message - Error message (default: "Not found")
   * @param {number} httpCode - HTTP status code (default: 404)
   */
  constructor(message = "Not found", httpCode = HttpStatusCodes.NOT_FOUND) {
    super(message, httpCode);

    Error.captureStackTrace(this, NotFoundError);
  }
}

/**
 * Error thrown when a client exceeds the rate limit.
 * Used by rate limiting middleware to throttle excessive requests.
 */
export class RateLimitError extends BaseError {
  /**
   * @param {string} message - Error message (default: "Too many requests")
   * @param {number} httpCode - HTTP status code (default: 429)
   */
  constructor(message = "Too many requests", httpCode = HttpStatusCodes.TOO_MANY_REQUESTS) {
    super(message, httpCode);
    Error.captureStackTrace(this, RateLimitError);
  }
}

/**
 * Error thrown when resource update fails due to conflicts.
 * Typically used when trying to update a resource with conflicting data.
 */
export class UpdatedError extends BaseError {
  /**
   * @param {string} message - Error message (default: "Updated failed")
   * @param {number} httpCode - HTTP status code (default: 409)
   */
  constructor(message = "Updated failed", httpCode = HttpStatusCodes.CONFLICT) {
    super(message, httpCode);

    Error.captureStackTrace(this, UpdatedError);
  }
}

/**
 * Error thrown when file upload operations fail.
 * Used for handling file upload conflicts or validation errors.
 */
export class UploadError extends BaseError {
  /**
   * @param {string} message - Error message (default: "Upload failed")
   * @param {number} httpCode - HTTP status code (default: 409)
   */
  constructor(message = "Upload failed", httpCode = HttpStatusCodes.CONFLICT) {
    super(message, httpCode);

    Error.captureStackTrace(this, UploadError);
  }
}

/**
 * Error thrown when input validation fails.
 * Commonly used with schema validation libraries like Zod.
 */
export class ValidationError extends BaseError {
  /**
   * @param {string} message - Error message (default: "Validation failed")
   * @param {number} httpCode - HTTP status code (default: 422)
   */
  constructor(message = "Validation failed", httpCode = HttpStatusCodes.UNPROCESSABLE_ENTITY) {
    super(message, httpCode);

    Error.captureStackTrace(this, ValidationError);
  }
}
