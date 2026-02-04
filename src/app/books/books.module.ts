import { Module } from "../../core/decorators";

import { BooksService } from "./books.service";
import  { BooksController } from "./books.controller";

@Module({
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
