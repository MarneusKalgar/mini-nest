import { Controller, Get } from "../core/decorators";
import { BooksService } from "./books.service";

@Controller('/books')
export class BooksController {
  constructor(private svc: BooksService) {}

  @Get('/')
  list() {
    return this.svc.findAll();
  }
}
