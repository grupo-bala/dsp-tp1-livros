import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import { FormEvent, ReactNode, useState } from "react";
import { Book } from "@/model/book.ts";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { bookService } from "@/service/bookService.ts";

type Props = {
  book?: Book;
  children: ReactNode;
  onSubmit: () => void;
};

export function BookPopup({ children, book, onSubmit }: Props) {
  const [isbn, setIsbn] = useState(book?.isbn);
  const [title, setTitle] = useState(book?.title);
  const [authors, setAuthors] = useState(book?.authors.join(", "));
  const [publisher, setPublisher] = useState(book?.publisher);
  const [date, setDate] = useState(book?.publishDate);
  const [isOpen, setIsOpen] = useState(false);

  const isValidForm = isbn !== undefined && isbn !== ""
    && title !== undefined && title !== ""
    && authors !== undefined && authors !== ""
    && publisher !== undefined && publisher !== ""
    && date !== undefined && date !== "";

  async function onSubmitForm(event: FormEvent) {
    event.preventDefault();

    if (!isValidForm) {
      return;
    }

    try {
      const newBook = {
        isbn,
        title,
        publisher,
        publishDate: date,
        authors: authors.split(", "),
      };

      if (book) {
        await bookService.update(newBook, book.isbn);
      } else {
        await bookService.create(newBook);
      }
    } catch {
      alert("Algo deu errado");
    }

    setIsOpen(false);
    onSubmit();
  }

  function onOpenChange(open: boolean) {
    setIsOpen(open);

    if (open) {
      setIsbn(book?.isbn);
      setTitle(book?.title);
      setAuthors(book?.authors.join(", "));
      setPublisher(book?.publisher);
      setDate(book?.publishDate);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger asChild>
        { children }
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{book ? "Editar" : "Adicionar"} livro</DialogTitle>
          <DialogDescription>
            Preencha os campos para {book ? "editar o" : "adicionar um novo" } livro
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col justify-between gap-6"
          onSubmit={onSubmitForm}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="isbn">ISBN:</Label>
            <Input
              id="isbn"
              placeholder="Digite o ISBN"
              value={isbn}
              onChange={e => setIsbn(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Título:</Label>
            <Input
              id="title"
              placeholder="Digite o título"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="authors">Autores:</Label>
            <Input
              id="authors"
              placeholder="Digite os nomes dos autores"
              value={authors}
              onChange={e => setAuthors(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="publisher">Editora:</Label>
            <Input
              id="publisher"
              placeholder="Digite o nome da editora"
              value={publisher}
              onChange={e => setPublisher(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Data de publicação:</Label>
            <Input
              id="date"
              placeholder="Digite a data de publicação (YYYY-MM-DD)"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <Button
            className="w-fit self-end"
            disabled={!isValidForm}
          >
            { book ? "Editar" : "Adicionar" }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}