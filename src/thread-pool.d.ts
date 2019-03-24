import {ThreadedContext, ThreadOpts} from "./comms";

declare class ThreadPool<T extends Array<any>, V> {
  constructor(context: ThreadedContext<T, V>, poolSize?: number, opts?: ThreadOpts)

  run(...args: T): Promise<V>;

  dispose(): void;
}

export = ThreadPool;
