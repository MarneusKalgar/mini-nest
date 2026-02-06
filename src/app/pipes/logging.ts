import { PipeTransform, ArgumentMetadata } from '../../core/decorators';

// A simple logging pipe that logs the value and its metadata
export class LoggingPipe implements PipeTransform {
  transform(value: any, metadata?: ArgumentMetadata) {
    console.log(`[LoggingPipe] Type: ${metadata?.type}, Value:`, value);
    return value;
  }
}
