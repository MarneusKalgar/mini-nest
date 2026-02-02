import z from "zod";

/**
 * Extracts and formats error messages from Zod validation errors.
 * Converts Zod error objects into a human-readable string format.
 *
 * @param {z.ZodError} error - Zod validation error object
 * @param {string} fallback - Fallback message if no issues are found
 * @returns {string} Formatted error string with field paths and messages
 * @example
 * const zodError = userSchema.safeParse(invalidData);
 * const errorMsg = extractZodErrors(zodError, "Validation failed");
 * // Returns: "Field: email, Error: Invalid email, Field: age, Error: Must be positive"
 */
export const extractZodErrors = (error: z.ZodError, fallback: string): string => {
  return (
    error.issues?.map(el => `Field: ${el.path.join(".")}, Error: ${el.message}`).join(", ") ??
    fallback
  );
};