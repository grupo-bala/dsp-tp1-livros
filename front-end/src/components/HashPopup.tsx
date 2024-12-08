import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import {useState} from "react";
import { bookService } from "@/service/bookService.ts";

export function HashPopup() {
  const [hash, setHash] = useState("Carregando...");

  async function getHash() {
    const res = await bookService.hash();
    setHash(res.hash);
  }

  getHash();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Verificar integridade</Button>
      </DialogTrigger>
      <DialogContent className="min-w-fit">
        <DialogHeader>
          <DialogTitle>Verificar integridade</DialogTitle>
        </DialogHeader>
        <p>
          Atualmente, o hash SHA-256 do banco de dados é: <br /> <strong>{hash}</strong>
        </p>
      </DialogContent>
    </Dialog>
  );

}