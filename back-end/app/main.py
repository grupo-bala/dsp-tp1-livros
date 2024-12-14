import sys
import hashlib
from fastapi import FastAPI, Response, status, Query
from loguru import logger
from app.model import Book
from app.database import Database
from datetime import date
from typing import Any, Optional, Annotated
from zipfile import ZipFile
from fastapi.responses import FileResponse

logger.remove()

LOGGER_FORMAT = (
    "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
    "<level>{message} - Additional information: {extra}</level>"
)

logger.add(sys.stderr, format=LOGGER_FORMAT)

logger.add("actions.log", compression="zip")

DB_PATH = "./db.csv"

DATABASE = Database(DB_PATH)

app = FastAPI()


@app.get("/", status_code=status.HTTP_200_OK)
def get_all_books(
    isbn: Annotated[str | None, Query(min_length=1)] = None,
    title: Annotated[str | None, Query(min_length=1)] = None,
    author: Annotated[str | None, Query(min_length=1)] = None,
    publisher: Annotated[str | None, Query(min_length=1)] = None,
    publish_date: Optional[date] = None,
) -> dict[str, Any]:
    """
    Get all books filtering by the data if given.
    """

    inner_logger = logger

    inner_logger.info("Getting all books")

    books = DATABASE.get_all_books(isbn, title, author, publisher, publish_date)

    inner_logger.info("Got all books")

    return {"books": books}


@app.post("/", status_code=status.HTTP_201_CREATED)
def create_book(book: Book, response: Response) -> dict[str, Any]:
    """
    Creates a book.
    """

    inner_logger = logger.bind(book=book)

    inner_logger.info("Adding book to database")

    if DATABASE.isbn_exists(book.isbn):
        response.status_code = status.HTTP_409_CONFLICT

        inner_logger.info("ISBN already exists")

        return {"message": "ISBN already exists"}

    DATABASE.add_book(book)

    inner_logger.info("Book added")

    return {"message": "Book added"}


@app.delete("/", status_code=status.HTTP_200_OK)
def remove_book(
    isbn: Annotated[str, Query(min_length=1)], response: Response
) -> dict[str, Any]:
    """
    Removes a book that matches the given ISBN.
    """

    inner_logger = logger.bind(isbn=isbn)

    inner_logger.info("Removing book")

    if not DATABASE.remove_book(isbn):
        response.status_code = status.HTTP_404_NOT_FOUND

        return {"message": "Book not found"}

    inner_logger.info("Book removed")

    return {"message": "Removed"}


@app.put("/", status_code=status.HTTP_200_OK)
def update_book(
    old_isbn: Annotated[str, Query(min_length=1)], book: Book, response: Response
) -> dict[str, Any]:
    """
    Updates a book that matches the given ISBN with the provided data.
    """

    inner_logger = logger.bind(old_isbn=old_isbn, book=book)

    inner_logger.info("Updating book")

    if not DATABASE.update_book(old_isbn, book):
        response.status_code = status.HTTP_404_NOT_FOUND

        return {"message": "Book not found"}

    inner_logger.info("Book updated")

    return {"message": "Book updated"}


@app.get("/count", status_code=status.HTTP_200_OK)
def count_books() -> dict[str, Any]:
    """
    Count how many books are in the database.
    """

    inner_logger = logger

    inner_logger.info("Counting books")

    return {"count": DATABASE.count_books()}


@app.get("/download-db", status_code=status.HTTP_200_OK)
def download_db():
    """
    Download the DB csv.
    """

    inner_logger = logger

    inner_logger.info("Downloading DB CSV")

    with ZipFile("db.zip", "w") as zip_object:
        zip_object.write(DB_PATH)

    return FileResponse(path="db.zip", filename="db.zip", media_type="application/zip")


@app.get("/db-hash", status_code=status.HTTP_200_OK)
def get_db_hash() -> dict[str, Any]:
    """
    Get the DB hash.
    """

    inner_logger = logger

    inner_logger.info("Getting DB hash")

    bytes = open(DB_PATH, "rb").read()

    return {"hash": hashlib.sha256(bytes).hexdigest()}
