import { toCommand } from "$lib/utils";

export class PostEvent {
  name: string;

  constructor(name: string) {
    this.name = name;
    return this;
  }

  Mouse({ x, y }: { x: number; y: number }) {
    return toCommand([
      "CURSOR",
      this.name,
      x.toString(),
      y.toString(),
    ]);
  }
}

export class UpdateEvent {
  command: string;

  constructor(command: string) {
    this.command = command;
  }
}
