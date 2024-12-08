import axios, { AxiosInstance } from "axios";
import { Book } from "@/model/book.ts";

class BookService {

    private readonly httpInstance: AxiosInstance;

    constructor() {
        this.httpInstance = axios.create({
            baseURL: import.meta.env.VITE_API_URL,
        });
    }

    async filter(isbn?: string, title?: string, author?: string, publisher?: string, publishDate?: string) {
        const params = { isbn, title, author, publisher, publishDate };
        const values = Object.keys(params)
            .filter(value => params[value as keyof typeof params] !== undefined && params[value as keyof typeof params] !== "")
            .map(value => value + "=" + params[value as keyof typeof params])
            .join("&");

        const url = "/" + (values.length > 0 ? "?" + values : "");
        const res = await this.httpInstance.get(url);

        return res.data as { books: Book[] };
    }

    async create(book: Book) {
        const res = await this.httpInstance.post("/", book);
        return res.data as { book: Book };
    }

    async update(book: Partial<Book>, oldISBN: string) {
        const res = await this.httpInstance.put("/?old_isbn=" + oldISBN, book);
        return res.data as { book: Book };
    }

    async delete(isbn: string) {
        const res = await this.httpInstance.delete("/?isbn=" + isbn);
        return res.data as { book: Book };
    }

    async download() {
        const res = await this.httpInstance.get("/download-db", {
            responseType: "blob",
        });

        const href = URL.createObjectURL(res.data);
        const anchor = document.createElement("a");
        anchor.href = href;
        anchor.setAttribute("download", "db.zip");
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(href);
    }

    async hash() {
        const res = await this.httpInstance.get("/db-hash");
        return res.data as { hash: string };
    }

}

export const bookService = new BookService();