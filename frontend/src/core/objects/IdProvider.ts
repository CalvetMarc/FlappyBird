// 🔢 Tipatge segur per IDs únics
export type UniqueId = number & { readonly brand: unique symbol };

// 🧠 Petit helper per convertir qualsevol número a tipus segur
function toUniqueId(value: number): UniqueId {
  return value as UniqueId;
}

export class IdProvider {
  private nextId;
  private freeIds: number[];
  private lastReleased: number | null;

  constructor() {
    this.nextId = 0;
    this.freeIds = [];
    this.lastReleased = null;
  }

  public acquire(): UniqueId {
    const id = this.freeIds.length > 0 ? this.safePop() : this.nextId++;
    return toUniqueId(id);
  }

  public release(id: UniqueId): void {
    const numericId = id as number;
    if (this.freeIds.includes(numericId)) return; // Evita duplicats
    this.freeIds.push(numericId);
    this.lastReleased = numericId;
  }

  public reset(): void {
    this.nextId = 0;
    this.freeIds = [];
    this.lastReleased = null;
  }

  private safePop(): number {
    const id = this.freeIds.pop()!;
    if (id === this.lastReleased && this.freeIds.length > 0) {
      const next = this.freeIds.pop()!;
      this.freeIds.push(id);
      this.lastReleased = next;
      return next;
    }
    return id;
  }
}
