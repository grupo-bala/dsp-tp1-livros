import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTheme } from "@/components/theme-provider";
import { FormEvent, useEffect, useState } from "react";
import { bookService } from "@/service/bookService.ts";
import { Book } from "@/model/book.ts";
import { BookPopup } from "@/components/BookPopup.tsx";
import { ConfirmationPopup } from "@/components/ConfirmationPopup.tsx";
import { Trash, Edit } from "lucide-react";
import {HashPopup} from "@/components/HashPopup.tsx";

export default function App() {
  const { setTheme } = useTheme();
  const [books, setBooks] = useState<Book[]>([]);
  const [isbn, setIsbn] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    setTheme("dark");
    getBooks();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await getBooks();
  }

  async function getBooks() {
    const res = await bookService.filter(isbn, title, author, publisher, date);
    setBooks(res.books);
  }

  async function deleteBook(book: Book) {
    await bookService.delete(book.isbn);
    await getBooks();
  }

  async function downloadDb(event: FormEvent) {
    event.preventDefault();
    await bookService.download();
  }

  return (
    <div className="flex flex-col justify-center w-100 m-10 gap-8">
      <header className="flex justify-between">
        <h1 className="text-2xl">Gerenciamento de livros</h1>
        <BookPopup onSubmit={getBooks}>
          <Button>Adicionar livro</Button>
        </BookPopup>
      </header>

      <form
          className="flex flex-col justify-between gap-4 sm:flex-row"
          onSubmit={onSubmit}
      >
        <Input
            placeholder="ISBN"
            value={isbn}
            onChange={e => setIsbn(e.target.value)}
        />
        <Input
            placeholder="Título"
            value={title}
            onChange={e => setTitle(e.target.value)}
        />
        <Input
            placeholder="Autor"
            value={author}
            onChange={e => setAuthor(e.target.value)}
        />
        <Input
            placeholder="Editora"
            value={publisher}
            onChange={e => setPublisher(e.target.value)}
        />
        <Input
            placeholder="Data de publicação"
            value={date}
            onChange={e => setDate(e.target.value)}
        />
        <Button className="w-fit self-end">Filtrar</Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ISBN</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Autores</TableHead>
            <TableHead>Editora</TableHead>
            <TableHead>Data de publicação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          { books.map(book => (
              <TableRow>
                <TableCell>{ book.isbn }</TableCell>
                <TableCell>{ book.title }</TableCell>
                <TableCell>{ book.authors.join(", ") }</TableCell>
                <TableCell>{ book.publisher }</TableCell>
                <TableCell>{ book.publishDate }</TableCell>
                <TableCell>
                  <BookPopup
                    book={book}
                    onSubmit={getBooks}
                  >
                    <Button variant="link">
                      <Edit />
                    </Button>
                  </BookPopup>
                </TableCell>
                <TableCell>
                  <ConfirmationPopup
                    description="Tem certeza que deseja apagar esse livro?"
                    onConfirm={() => deleteBook(book)}
                  >
                    <Button variant="link">
                      <Trash />
                    </Button>
                  </ConfirmationPopup>
                </TableCell>
              </TableRow>
          )) }
        </TableBody>
      </Table>

      <form className="flex justify-end gap-4">
        <Button onClick={downloadDb}>Baixar CSV</Button>
        <HashPopup />
      </form>
    </div>
  );
}