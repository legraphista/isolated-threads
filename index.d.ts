import {Class} from "./src/comms";

declare type Thread = import("./src/thread")<any,any>;
declare type ThreadPool = import("./src/thread-pool")<any,any>;

declare interface Exp {
 Thread: Class<Thread>,
 ThreadPool: Class<ThreadPool>,
}

export = Exp
