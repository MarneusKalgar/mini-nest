# Mini-Nest

A lightweight, NestJS-inspired TypeScript framework built on Express with decorator-based dependency injection, modular architecture, and powerful middleware capabilities.

## Features

- 🎯 **Decorator-Based Architecture** - Use familiar decorators for controllers, routes, and dependency injection
- 💉 **Dependency Injection** - Automatic dependency resolution with a built-in IoC container
- 🧩 **Modular Design** - Organize your application into reusable modules
- 🛡️ **Guards** - Control access to routes with custom authorization logic
- 🔄 **Pipes** - Transform and validate input data before it reaches your handlers
- 🚨 **Exception Filters** - Centralized error handling with custom exception filters
- 🎨 **Parameter Decorators** - Extract request data with `@Param()`, `@Body()`, `@Query()`, `@Headers()`
- 🚀 **Built on Express** - Leverage the power and ecosystem of Express.js

## 📋 Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Git

## Installation

```bash
git clone <repository-url>
cd mini-nest
npm install
```

### Dependencies

- `express` - Web framework
- `reflect-metadata` - Metadata reflection API
- `typescript` - TypeScript compiler
- `zod` - Schema validation

## Quick Start

### 1. Create a Service

```typescript
import { Injectable } from './core/decorators';

@Injectable()
export class BooksService {
  private books = [{ id: 1, title: '1984' }];

  findAll() {
    return this.books;
  }

  findOne(id: number) {
    return this.books.find(book => book.id === id);
  }

  create(title: string) {
    const book = { id: Date.now(), title };
    this.books.push(book);
    return book;
  }
}
```

### 2. Create a Controller

```typescript
import { Controller, Get, Post, Param, Body } from './core/decorators';
import { BooksService } from './books.service';

@Controller('/books')
export class BooksController {
  constructor(private service: BooksService) {}

  @Get('/')
  list() {
    return this.service.findAll();
  }

  @Get('/:id')
  one(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post('/')
  add(@Body() body: { title: string }) {
    return this.service.create(body.title);
  }
}
```

### 3. Create a Module

```typescript
import { Module } from './core/decorators';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  controllers: [BooksController],
  providers: [BooksService]
})
export class BooksModule {}
```

### 4. Bootstrap the Application

```typescript
import 'reflect-metadata';
import { Factory } from './core/framework';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = Factory.create(AppModule);
  await app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
}

bootstrap();
```

## Architecture

### Core Components

```
src/core/
├── decorators/      # Decorator implementations
│   ├── controller.ts    # @Controller, route metadata
│   ├── route.ts         # @Get, @Post, @Put, @Patch, @Delete
│   ├── injectable.ts    # @Injectable for DI
│   ├── module.ts        # @Module for organizing components
│   ├── param.ts         # @Param, @Body, @Query, @Headers
│   ├── guards.ts        # @UseGuards
│   ├── pipe.ts          # @UsePipes
│   └── filter.ts        # @UseFilters
├── framework/       # Core framework logic
│   ├── container.ts     # Dependency injection container
│   └── factory.ts       # Application factory and bootstrapping
├── middlewares/     # Middleware implementations
│   ├── preprocessing.ts # Parameter extraction
│   ├── guards.ts        # Guard execution
│   ├── pipes.ts         # Pipe transformation
│   ├── exception-filter.ts # Error handling
│   └── request-handler.ts  # Request processing
├── filters/         # Exception filter implementations
└── common/          # Common utilities and errors
```

### Request Lifecycle

1. **Route Matching** - Express matches the incoming request to a registered route
2. **Preprocessing** - Extracts parameters, creates execution context
3. **Guards** - Execute guards to determine if route can be activated
4. **Pipes** - Transform and validate parameters
5. **Handler Execution** - Controller method is called with processed arguments
6. **Exception Filters** - Catch and handle any errors thrown during the process
7. **Response** - Send the result back to the client

### Dependency Injection

The framework uses a singleton IoC container that:
- Automatically resolves constructor dependencies
- Supports custom injection tokens with `@Inject()`
- Caches instances for reuse
- Supports both class and token-based registration

```typescript
// Automatic dependency resolution
@Injectable()
class UserService {
  constructor(private database: DatabaseService) {}
}

// Custom token injection
@Injectable()
class ConfigService {
  constructor(@Inject('CONFIG') private config: Config) {}
}
```

## Usage Examples

### Guards

Control access to routes based on custom logic:

```typescript
import { Injectable } from './core/decorators';
import { CanActivate, ExecutionContext } from './core/decorators';
import { ForbiddenError } from './core/common';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const roles = context.getHandler().roles || [];
    
    if (roles.length === 0) return true;
    
    const userRoles = request.headers['x-user-roles']?.split(',') || [];
    const hasRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      throw new ForbiddenError('Insufficient permissions');
    }
    
    return true;
  }
}

// Usage in controller
@Controller('/admin')
export class AdminController {
  @Post('/users')
  @Roles('admin')
  @UseGuards(RolesGuard)
  createUser(@Body() data: CreateUserDto) {
    // Only accessible to users with 'admin' role
  }
}
```

### Pipes

Transform and validate data before it reaches your handlers:

```typescript
import { PipeTransform, ArgumentMetadata } from './core/decorators';
import { BadRequestError } from './core/common';

export class ParseIntPipe implements PipeTransform {
  transform(value: any, metadata?: ArgumentMetadata): number {
    const parsed = parseInt(value, 10);
    
    if (isNaN(parsed)) {
      throw new BadRequestError('Validation failed: not a number');
    }
    
    return parsed;
  }
}

// Validation pipe with Zod
export class ValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}

  transform(value: any) {
    const result = this.schema.safeParse(value);
    
    if (!result.success) {
      throw new BadRequestError(result.error.message);
    }
    
    return result.data;
  }
}

// Usage
@Post('/books')
@UsePipes(new ValidationPipe(createBookSchema))
createBook(@Body() dto: CreateBookDto) {
  // dto is validated against createBookSchema
}

@Get('/:id')
getBook(@Param('id', new ParseIntPipe()) id: number) {
  // id is automatically converted to number
}
```

### Exception Filters

Handle errors globally or per-route:

```typescript
import { ExceptionFilter, ExecutionContext } from './core/decorators';

export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ExecutionContext): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    const status = exception.httpCode || 500;
    
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message
    });
  }
}

// Apply globally
const app = Factory.create(AppModule);
app.useGlobalFilters(new GlobalExceptionFilter());

// Or per route
@Post('/data')
@UseFilters(CustomExceptionFilter)
processData(@Body() data: any) {
  // Custom error handling for this route
}
```

### Module System

Organize your application into cohesive modules:

```typescript
// Feature module
@Module({
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService] // Make service available to other modules
})
export class BooksModule {}

// Root module
@Module({
  imports: [
    BooksModule,
    UsersModule,
    AuthModule
  ]
})
export class AppModule {}
```

### Global Middleware

Apply pipes, guards, and filters globally:

```typescript
const app = Factory.create(AppModule);

// Global pipes - run on all routes
app.useGlobalPipes(
  new LoggingPipe(),
  new ValidationPipe(globalSchema)
);

// Global guards - protect all routes
app.useGlobalGuards(
  new AuthGuard(),
  new RolesGuard()
);

// Global exception filters
app.useGlobalFilters(
  new GlobalExceptionFilter()
);

await app.listen(3000);
```

## API Reference

### Decorators

#### Class Decorators

- `@Controller(path?: string)` - Defines a controller class
- `@Injectable(options?)` - Marks a class as injectable
- `@Module(metadata)` - Defines a module

#### Method Decorators

- `@Get(path?)` - HTTP GET route
- `@Post(path?)` - HTTP POST route
- `@Put(path?)` - HTTP PUT route
- `@Patch(path?)` - HTTP PATCH route
- `@Delete(path?)` - HTTP DELETE route
- `@UseGuards(...guards)` - Apply guards to a route
- `@UsePipes(...pipes)` - Apply pipes to a route
- `@UseFilters(...filters)` - Apply exception filters to a route
- `@Roles(...roles)` - Specify required roles for a route

#### Parameter Decorators

- `@Param(key?, pipe?)` - Extract route parameter
- `@Body(pipe?)` - Extract request body
- `@Query(key?, pipe?)` - Extract query parameter
- `@Headers(key?)` - Extract request header
- `@Inject(token)` - Inject custom dependency

### Interfaces

#### Guards
```typescript
interface CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}
```

#### Pipes
```typescript
interface PipeTransform<T = any, R = any> {
  transform(value: T, metadata?: ArgumentMetadata): R | Promise<R>;
}
```

#### Exception Filters
```typescript
interface ExceptionFilter<T = any> {
  catch(exception: T, host: ExecutionContext): void | Promise<void>;
}
```

## Development

### Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build
```

### Project Structure

```
mini-nest/
├── src/
│   ├── app/              # Application code
│   │   ├── app.module.ts
│   │   ├── books/        # Feature module example
│   │   ├── guards/       # Custom guards
│   │   ├── pipes/        # Custom pipes
│   │   └── utils/        # Utilities
│   ├── core/             # Framework core
│   │   ├── decorators/
│   │   ├── framework/
│   │   ├── middlewares/
│   │   ├── filters/
│   │   ├── common/
│   │   └── types/
│   └── server.ts         # Application entry point
├── package.json
├── tsconfig.json
└── nodemon.json
```

## Error Handling

The framework provides built-in error classes:

```typescript
import { 
  BaseError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InternalServerError
} from './core/common';

// Throwing errors
throw new NotFoundError('Resource not found');
throw new BadRequestError('Invalid input');
throw new UnauthorizedError('Authentication required');

// All errors include:
// - httpCode: HTTP status code
// - message: Error message
// - name: Error name
```

## Best Practices

1. **Use modules** to organize related controllers and providers
2. **Apply validation** using pipes at the parameter level or method level
3. **Implement guards** for authentication and authorization
4. **Use exception filters** for consistent error responses
5. **Leverage dependency injection** for testable and maintainable code
6. **Keep controllers thin** - delegate business logic to services
7. **Use global middleware** for cross-cutting concerns

## Contributing

This is a learning project demonstrating the internals of a NestJS-like framework. Feel free to explore, modify, and learn from the codebase.

## License

ISC

---

Built with ❤️ as a learning project to understand the internals of decorator-based frameworks.
