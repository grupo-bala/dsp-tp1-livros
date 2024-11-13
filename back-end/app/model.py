from datetime import date
from pydantic import BaseModel, ConfigDict
from typing import Self
from pydantic.alias_generators import to_camel


class Book(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

    isbn: str
    title: str
    authors: list[str]
    publisher: str
    publish_date: date

    def __str__(self) -> str:
        return f"{self.isbn},{self.title},{self.authors},{self.publisher},{self.publish_date}\n"

    def from_str(text: str) -> Self:
        isbn, title, authors, publisher, publish_date = text.split(",")

        authors = authors[1:-1].replace("'", "").split(", ")
        publish_date = date.fromisoformat(publish_date.strip())

        return Book(
            isbn=isbn,
            title=title,
            authors=authors,
            publisher=publisher,
            publish_date=publish_date,
        )
