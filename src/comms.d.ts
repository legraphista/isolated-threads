
interface ThreadOpts {
  memoryLimit?: number,
  inspector?: number | unknown,
  filename?: string,
}

export type Class<T> = new (...args: any[]) => T;

export type ThreadFunction<T extends Array<any>, V> = (...args: T) => V;

export interface ThreadedContext<T extends Array<any>, V> {
  (): ThreadFunction<T, V>
}
