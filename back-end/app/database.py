from app.model import Book
from typing import Optional
from datetime import date


class Database:
    def __init__(self, file_path: str) -> None:
        self.file_path = file_path
        self.file = open(file_path, "a+")

    def get_all_books(
        self,
        isbn: Optional[str],
        title: Optional[str],
        author: Optional[str],
        publisher: Optional[str],
        publish_date: Optional[date],
    ) -> list[Book]:
        self.file.seek(0, 0)

        isbn = isbn.lower() if isbn is not None else None
        title = title.lower() if title is not None else None
        author = author.lower() if author is not None else None
        publisher = publisher.lower() if publisher is not None else None

        lines = self.file.readlines()

        books = []

        for line in lines:
            current_book: Book = Book.from_str(line)

            if isbn is not None and isbn != current_book.isbn.lower():
                continue

            if title is not None and title != current_book.title.lower():
                continue

            if author is not None and author not in map(
                lambda x: x.lower(), current_book.authors
            ):
                continue

            if publisher is not None and publisher != current_book.publisher.lower():
                continue

            if publish_date is not None and publish_date != current_book.publish_date:
                continue

            books.append(Book.from_str(line))

        return books

    def add_book(self, book: Book) -> None:
        self.file.write(str(book))
        self.file.flush()

    def update_book(self, old_isbn: str, book: Book) -> bool:
        if not self.remove_book(old_isbn):
            return False

        self.add_book(book)

        return True

    def remove_book(self, isbn: str) -> bool:
        self.file.seek(0, 0)

        lines = self.file.readlines()

        self.file.close()

        self.file = open(self.file_path, "w+")

        removed = False

        for line in lines:
            current_isbn = line.split(",")[0]

            if current_isbn == isbn:
                removed = True
            else:
                self.file.write(line)

        self.file.flush()

        return removed

    def count_books(self) -> int:
        self.file.seek(0, 0)

        return len(self.file.readlines())

    def isbn_exists(self, isbn: str) -> bool:
        self.file.seek(0, 0)

        lines = self.file.readlines()

        for line in lines:
            current_isbn = line.split(",")[0]

            if current_isbn == isbn:
                return True

        return False
