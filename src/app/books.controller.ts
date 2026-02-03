import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Roles, UsePipes } from "../core/decorators";
import { BooksService } from "./books.service";
import { CreateBookDto, createBookSchema, GetUsersDto, getUsersSchema, UpdateBookDto, updateBookSchema } from "./dto";
import { ValidationPipe, ParseIntPipe } from "./pipes";

@Controller('/books')
export class BooksController {
  constructor(private service: BooksService) {}

  @Get('/')
  @UsePipes(new ValidationPipe(getUsersSchema))
  list(@Query() query: GetUsersDto) {
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
  @UsePipes(new ValidationPipe(updateBookSchema))
  update(@Param('id', new ParseIntPipe()) id: number, @Body() body: UpdateBookDto) {
    return this.service.update(+id, body.title!);
  }

  @Delete('/:id')
  @Roles('admin')
  delete(@Param('id') id: string) {
    return this.service.delete(+id);
  }
}
