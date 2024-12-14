import ast
import csv
from app.model import Book
from typing import Optional, Any
from datetime import date
from os import path


class CsvSchema:
    def get_headers() -> list[str]:
        return ["isbn", "title", "authors", "publisher", "publish_date"]

    def get_items(book: Book) -> list[Any]:
        return [
            book.isbn,
            book.title,
            ",".join(book.authors),
            book.publisher,
            book.publish_date,
        ]

    def get_book_from_list(lst: list[str]) -> Book:
        return Book(
            isbn=lst[0],
            title=lst[1],
            authors=lst[2].split(","),
            publisher=lst[3],
            publish_date=lst[4],
        )


class Database:
    def __init__(self, file_path: str) -> None:
        file_already_exists = path.exists(file_path)

        self.file_path = file_path
        self.file = open(file_path, "a+")

        if not file_already_exists:
            csv.writer(self.file).writerow(CsvSchema.get_headers())
            self.file.flush()

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

        csv_reader = csv.reader(self.file)

        books = []

        for idx, line in enumerate(csv_reader):
            if idx == 0:
                continue

            current_book: Book = CsvSchema.get_book_from_list(line)
            print(current_book)

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

            books.append(current_book)

        return books

    def add_book(self, book: Book) -> None:
        csv.writer(self.file).writerow(CsvSchema.get_items(book))
        self.file.flush()

    def update_book(self, old_isbn: str, book: Book) -> bool:
        if not self.remove_book(old_isbn):
            return False

        self.add_book(book)

        return True

    def remove_book(self, isbn: str) -> bool:
        self.file.seek(0, 0)

        csv_reader = csv.reader(self.file)

        removed = False

        books_to_keep: list[Book] = []

        for idx, line in enumerate(csv_reader):
            if idx == 0:
                continue

            current_book: Book = CsvSchema.get_book_from_list(line)

            if current_book.isbn == isbn:
                removed = True
            else:
                books_to_keep.append(current_book)

        self.file.close()

        self.file = open(self.file_path, "w+")

        csv_writer = csv.writer(self.file)

        csv_writer.writerow(CsvSchema.get_headers())

        for book in books_to_keep:
            csv_writer.writerow(CsvSchema.get_items(book))

        self.file.flush()

        return removed

    def count_books(self) -> int:
        self.file.seek(0, 0)

        return len(self.file.readlines()) - 1

    def isbn_exists(self, isbn: str) -> bool:
        self.file.seek(0, 0)

        csv_reader = csv.reader(self.file)

        for idx, line in enumerate(csv_reader):
            if idx == 0:
                continue

            current_book: Book = CsvSchema.get_book_from_list(line)

            if current_book.isbn == isbn:
                return True

        return False
