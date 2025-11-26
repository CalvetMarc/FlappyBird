export abstract class Pool<T> {
  public pool: T[] = [];

  constructor(private readonly create: () => T, public readonly reset: (obj: T) => void, private readonly show: (obj: T) => void = () => {}) {}

  get(): T {
    const obj = this.pool.pop() ?? this.create();
    this.show(obj);
    return obj;
  }

  release(obj: T) {
    this.reset(obj);   
    this.pool.push(obj);
  }

}

