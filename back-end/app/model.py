from datetime import date
from pydantic import BaseModel, ConfigDict, Field, StringConstraints
from pydantic.alias_generators import to_camel
from typing import Annotated

class Book(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

    isbn: str = Field(min_length=1)
    title: str = Field(min_length=1)
    authors: list[Annotated[str, StringConstraints(min_length=1)]] = Field(min_length=1)
    publisher: str = Field(min_length=1)
    publish_date: date
