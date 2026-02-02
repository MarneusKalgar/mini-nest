import { BooksModule } from "./app/books.module";
import { Module } from "./core/decorators";

@Module({
  imports: [
    // ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    // AuthModule,
    // UsersModule,
    BooksModule
  ],
  //providers: [Logger]
})
export class AppModule {}