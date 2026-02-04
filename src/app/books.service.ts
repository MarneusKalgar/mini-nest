import { Injectable } from "../core/decorators";
import { NotFoundError, CreatedError, UpdatedError, DeletedError } from "../core/common";
import { GetBooksDto } from "./dto";

export interface Book {
  id: number;
  title: string;
}

@Injectable()
export class BooksService {
  private data: Book[] = [{ id: 1, title: '1984' }];

  findAll(query: GetBooksDto) {
    return this.data;
  }

  findOne(id: number) {
    const book = this.data.find(b => b.id === id);
    
    if (!book) {
      throw new NotFoundError(`Book with id ${id} not found`);
    }

    return book;
  }

  create(title: string) {
    const existingBook = this.data.find(b => b.title.toLowerCase() === title.toLowerCase());
    if (existingBook) {
      throw new CreatedError(`Book with title "${title}" already exists`);
    }

    const book = { id: Date.now(), title };
    this.data.push(book);
    return book;
  }

  update(id: number, title: string) {
    const book = this.data.find(b => b.id === id);

    if (!book) {
      throw new UpdatedError(`Book with id ${id} not found`);
    }

    const existingBook = this.data.find(
      b => b.id !== id && b.title.toLowerCase() === title.toLowerCase()
    );

    if (existingBook) {
      throw new UpdatedError(`Another book already has the title "${title}"`);
    }

    book.title = title;

    return book;
  }

  delete(id: number) {
    const index = this.data.findIndex(b => b.id === id);
    if (index === -1) {
      throw new DeletedError(`Book with id ${id} not found`);
    }

    this.data.splice(index, 1);
    return true;
  }
}
