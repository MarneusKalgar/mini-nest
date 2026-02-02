import { ZodType, ZodError } from 'zod';
import { PipeTransform, ArgumentMetadata } from '../../core/decorators';
import { extractZodErrors } from '../utils';
import { ValidationError } from '../../core/common';

type RequestFields = "body" | "params" | "query";

const messagePrefixMap: Record<RequestFields, string> = {
  body: "Invalid request body",
  params: "Invalid URL parameters",
  query: "Invalid query parameters",
};


/**
 * Validation pipe that requires a schema to be passed in the constructor.
 * Use this with @UsePipes decorator for route-specific validation.
 */
export class ValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: any, metadata?: ArgumentMetadata) {
    try {
      const result = this.schema.safeParse(value);

      if (!result.success) {
        const message = extractZodErrors(result.error, messagePrefixMap[metadata?.type as RequestFields]);
        throw new ValidationError(message);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const message = extractZodErrors(error, messagePrefixMap[metadata?.type as RequestFields]);
        throw new ValidationError(message);
      }
      throw error;
    }

    return value;
  }
}
