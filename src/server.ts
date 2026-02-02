import "reflect-metadata"

import dotenv from 'dotenv';
import { AppModule } from './app.module';
import { Factory } from "./core/framework";
import { LoggingPipe } from "./app/pipes";
import { GlobalExceptionFilter } from "./core/filters";

dotenv.config();
const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    const app = Factory.create(AppModule);

    app.useGlobalPipes(new LoggingPipe());

    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.listen(PORT as number, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error during server bootstrap:', error);
  }
}

bootstrap();
