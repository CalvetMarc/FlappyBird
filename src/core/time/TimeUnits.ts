type Branded<T, Name extends string> = T & { readonly __brand: Name };

export type Milliseconds = Branded<number, "ms">;
export type Seconds      = Branded<number, "s">;

export const ms = (n: number) => n as Milliseconds;
export const s  = (n: number) => n as Seconds;

export const secondsToMs = (sec: Seconds): Milliseconds => (Number(sec) * 1000) as Milliseconds;
export const msToSeconds = (m: Milliseconds): Seconds => (Number(m) / 1000) as Seconds;

type AnyTime = Milliseconds | Seconds;
const toMs = (t: AnyTime): Milliseconds => (t as any).__brand === "s" ? secondsToMs(t as Seconds) : (t as Milliseconds);

export function addTime<TOut extends AnyTime>(outputType: (n: number) => TOut, ...values: AnyTime[]): TOut {
  const totalMs = values.map(v => Number(toMs(v))).reduce((a, b) => a + b, 0);
  return outputType(totalMs);
}
