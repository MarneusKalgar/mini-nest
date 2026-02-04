import "reflect-metadata"

import dotenv from 'dotenv';
import { AppModule } from './app/app.module';
import { Factory } from "./core/framework";
import { LoggingPipe } from "./app/pipes";
import { GlobalExceptionFilter } from "./core/filters";
import { RolesGuard } from "./app/guards";

dotenv.config();
const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    const app = Factory.create(AppModule);

    // No real value, just demonstrating global pipe usage
    app.useGlobalPipes(new LoggingPipe());
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalGuards(new RolesGuard());

    await app.listen(PORT as number, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error during server bootstrap:', error);
  }
}

bootstrap();
