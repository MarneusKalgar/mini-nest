import "reflect-metadata"

import { config } from 'dotenv';
import { AppModule } from './app/app.module';
import { Factory } from "./core/framework";
import { LoggingPipe } from "./app/pipes";
import { GlobalExceptionFilter } from "./core/filters";
import { RolesGuard } from "./app/guards";

config();
const PORT = process.env.PORT || 3000;

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

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
    process.exit(1);
  }
}

bootstrap();
