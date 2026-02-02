import { PipeTransform, ArgumentMetadata } from '../../core/decorators';
import { BadRequestError } from '../../core/common';

export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata?: ArgumentMetadata): number {
    if (value === undefined || value === null) {
      throw new BadRequestError(`${metadata?.data || 'Value'} is required`);
    }

    const val = parseInt(value, 10);

    if (isNaN(val)) {
      throw new BadRequestError(
        `${metadata?.data || 'Value'} must be a valid integer, received: ${value}`
      );
    }

    return val;
  }
}
