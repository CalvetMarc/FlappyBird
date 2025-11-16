export abstract class Pool<T> {
  private pool: T[] = [];

  constructor(
    private readonly create: () => T,
    private readonly reset: (obj: T) => void,
    private readonly hide: (obj: T) => void = () => {}
  ) {}

  get(): T {
    const obj = this.pool.pop() ?? this.create();
    this.reset(obj);
    return obj;
  }

  release(obj: T) {
    this.hide(obj);
    this.pool.push(obj);
  }
}

