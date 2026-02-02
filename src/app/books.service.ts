import { Injectable } from "../core/decorators";
import { GetUsersDto } from "./dto";

export interface Book {
  id: number;
  title: string;
}

@Injectable()
export class BooksService {
  private data: Book[] = [{ id: 1, title: '1984' }];

  findAll(query: GetUsersDto) {
    return this.data;
  }

  findOne(id: number) {
    return this.data.find(b => b.id === id);
  }

  create(title: string) {
    const book = { id: Date.now(), title };
    this.data.push(book);
    return book;
  }

  update(id: number, title: string) {
    const book = this.findOne(id);
    if (!book) {
      return null;
    }

    book.title = title;

    return book;
  }

  delete(id: number) {
    const index = this.data.findIndex(b => b.id === id);
    if (index === -1) {
      return false;
    }

    this.data.splice(index, 1);
    return true;
  }
}
