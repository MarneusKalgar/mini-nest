import { BooksModule } from "./books/books.module";
import { Module } from "../core/decorators";

@Module({
  imports: [
    BooksModule
  ],
})
export class AppModule {}