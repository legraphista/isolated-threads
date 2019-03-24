# Isolated Threads
_Yes, nodejs has real threads too! Many thanks to [isolated-vm](https://github.com/laverdet/isolated-vm)!_

## Getting Started

### Installation
`npm i isolated-threads`

### Example JS
```js
const { Thread, ThreadPool } = require('isolated-threads');

const context = () => {

  const random = () => Math.round(Math.random() * 255);

  return ({ w, h, c }) => {

    const sharedArray = new SharedArrayBuffer(w * h * c);
    const image = new Uint8Array(sharedArray);

    console.log('generating noise image with params', { w, h, c });

    const stride = w * c;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        for (let k = 0; k < c; k++) {
          image[y * stride + x * c + k] = random();
        }
      }
    }

    return sharedArray;
  }
};

const t = new Thread(context);

(async () => {
  const interval = setInterval(() => console.error('event loop'), 100);

  const image = new Uint8Array(await t.run({ w: 3840, h: 2160, c: 3 }));
  console.log('image output buffer len', image.length);

  clearInterval(interval);
})();
```

### Example TS
```js
import Thread = require("./src/thread");

const context = () => {

  const random = () => Math.round(Math.random() * 255);

  return ({ w, h, c }: { w: number, h: number, c: number }): SharedArrayBuffer => {

    const sharedArray = new SharedArrayBuffer(w * h * c);
    const image = new Uint8Array(sharedArray);

    console.log('generating noise image with params', { w, h, c });

    const stride = w * c;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        for (let k = 0; k < c; k++) {
          image[y * stride + x * c + k] = random();
        }
      }
    }

    return sharedArray;
  }
};

// inferred arguments and result from context 
const t = new Thread(context);
// or
// enforce arguments and result to context
const t = new Thread<[{ w: number, h: number, c: number }], SharedArrayBuffer>(context);

(async () => {
  const interval = setInterval(() => console.error('event loop'), 100);

  const shared = await t.run({ w: 3840, h: 2160, c: 3 });
  const image = new Uint8Array(shared);
  console.log('image output buffer len', image.length);

  clearInterval(interval);
})();

```

## Class `Thread`

### `new Thread(context, {memoryLimit})`
- `context` [Function]
    - Holds a context with constants and/or functions required
    - Returns the function that will be called ar tuntime on a separate thread.
- `options` [object]
    - `memoryLimit`: number - the maximum memory (in MB) at which to trigger an error and disposal (for more info see [here](https://github.com/laverdet/isolated-vm#new-ivmisolateoptions))

### `thread.run(...args): Promise<*>`
- Will run the context returned function in a separate thread with the given parameters and the returned promise will resolve with the function's return data.

## Class `ThreadPool`

### `new ThreadPool(context, poolSize, {memoryLimit})`
- `context` [Function]
    - Holds a context with constants and/or functions required
    - Returns the function that will be called ar tuntime on a separate thread.
- `poolSize` [number] - the number of threads to be spawned
- `options` [object]
    - `memoryLimit`: number - the maximum memory (in MB) at which to trigger an error and disposal (for more info see [here](https://github.com/laverdet/isolated-vm#new-ivmisolateoptions))

### `threadPool.run(...args): Promise<*>`
- Will run the context returned function in a separate thread with the given parameters and the returned promise will resolve with the function's return data.
- Avilable schedulers as of now are only round-robin, more to come.

## A word about `Buffer`s and other `node` features

### Limitations or running in a `v8` only isolate
Since the different thread is executed in an isolated instance of `v8`, you will not be able to use `Buffer` or `require` and you will not have access to any kind of event loop functions, like `setTimeout` or `setInterval`.

### Moving large amounts of data
When you are passing data between isolates, the data is serialized and copied between threads (read more [here](https://github.com/laverdet/isolated-vm#class-externalcopy-transferable)). <br/>
If you with to copy a large amount of data, you should use Typed Arrays (like `UInt8Array` or `Float64Array`) with a `SharedArrayBuffer` backend (if available). <br/>
In the above example we allocate a `w * h * c` sized shared buffer, and then use it as a backend for `Uint8Array`. <br/>
We do all data manipulation using the `uint8` array and then return back the shared one. <br/>
Upon receiving the shared array from the thread, we reinterpret it into a `uint8` array and extract our data. <br/>

## Debugging
To debug other threads, constructor's `options` must contains `inspector` as a port number and optioally `filename` as a file name for the thread. If `filename` is not passed, then the `file:line` where the thread is spawned will be used.
Upon spawning the thread, you will receive a connection URI in the `stderr` stream. Navigate to the URI using [Google Chrome](https://www.google.com/chrome/) or use it to configure your IDE of choice.

## Caveats

#### Passing functions
As of now, you cannot pass function callback to the isolate. If requested, it can be added, but the callback function will run on the main thread, defeating the purposes of isolating threads.

#### Mixing shared buffers in objects
You cannot pass a shared buffer inside an object. You must pass it in a different argument.
- `({sharedBuffer, w, h, c}) => sharedBuffer` will **not** work
- `(sharedBuffer, {w, h, c}) => sharedBuffer` will work
- `({a, b, c}) => ({sum: a+b+c})` will work
- `(...args) => Math.max(...args)` will work
