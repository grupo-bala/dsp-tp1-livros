import {
  Dialog, DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {FormEvent, ReactNode} from "react";
import {Button} from "@/components/ui/button.tsx";

type Props = {
  description: string;
  children: ReactNode;
  onConfirm: () => void;
}

export function ConfirmationPopup({ description, children, onConfirm }: Props) {
  function onSubmit(event: FormEvent) {
    event.preventDefault();
    onConfirm();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        { children }
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirme a sua ação</DialogTitle>
          <DialogDescription>
            { description }
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex justify-center gap-2 sm:justify-end"
          onSubmit={onSubmit}
        >
          <DialogClose asChild>
            <Button
              variant="destructive"
              type="submit"
            >
              Confirmar
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button">
              Cancelar
            </Button>
          </DialogClose>
        </form>
      </DialogContent>
    </Dialog>
  )
}