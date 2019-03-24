import {ThreadedContext, ThreadOpts} from "./comms";

declare class Thread<T extends Array<any>, V> {
  constructor(context: ThreadedContext<T, V>, opts?: ThreadOpts)

  run(...args: T): Promise<V>;

  dispose(): void;
}

export = Thread;
