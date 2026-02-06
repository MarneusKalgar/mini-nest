import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Roles, UsePipes } from "../../core/decorators";
import { BooksService } from "./books.service";
import { CreateBookDto, createBookSchema, GetBooksDto, getBooksSchema, UpdateBookDto, updateBookSchema } from "./dto";
import { ValidationPipe, ParseIntPipe } from "../pipes";

@Controller('/books')
export class BooksController {
  constructor(private service: BooksService) {}

  @Get('/')
  @UsePipes(new ValidationPipe(getBooksSchema))
  list(@Query() query: GetBooksDto) {
    return this.service.findAll(query);
  }

  @Get('/:id')
  one(@Param('id', new ParseIntPipe()) id: number) {
    return this.service.findOne(id);
  }

  @Post('/')
  @Roles('admin')
  @UsePipes(new ValidationPipe(createBookSchema))
  add(@Body() body: CreateBookDto) {
    return this.service.create(body.title);
  }

  @Patch('/:id')
  @Roles('admin')
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body(new ValidationPipe(updateBookSchema)) body: UpdateBookDto
  ) {
    return this.service.update(id, body.title);
  }

  @Delete('/:id')
  @Roles('admin')
  delete(@Param('id', new ParseIntPipe()) id: number) {
    return this.service.delete(id);
  }
}
