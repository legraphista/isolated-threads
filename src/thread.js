const { createIsolate, stringifyAndRun: run, makeInspectorFileName } = require('./helpers');
const bootstrap = require('./helpers/bootstrap');
const makeTransferable = require('./helpers/transferable');
const WebSocket = require('ws');

class Thread {

  /**
   * @param {function:function} contextFunction - context function to call
   * @param {number=} memoryLimit - memory limit in MB
   * @param {number|WebSocket=} inspector - a port number of a web socket
   * @param {string=} filename - the filename of the thread file
   */
  constructor(contextFunction, { memoryLimit, inspector, filename = makeInspectorFileName() } = {}) {

    this.__debugger = !!inspector;
    const {
      isolate,
      context,
      jail
    } = createIsolate({ memoryLimit, inspector: this.__debugger });

    this._isolate = isolate;
    this._context = context;
    this._jail = jail;

    if (this.__debugger) {
      this._wss = typeof inspector === 'number' ? new WebSocket.Server({ port: inspector }) : inspector;
      this._wssOwner = typeof inspector === 'number';
      this._startDebuggerChannel();
    }

    bootstrap({ jail, isolate, context });

    isolate.compileScriptSync(`global.__runnable = ${run(contextFunction)}`, { filename }).runSync(context);
    isolate.compileScriptSync(run(() => {
      const original = global.__runnable;
      const transferable = global.__transferable;
      global.__runnable = (...args) => transferable(original(...args));
    }), { filename: '/thread/make-transferable.isolate.js' }).runSync(context);

    this.__runnable = jail.getSync('__runnable');
  }

  _startDebuggerChannel() {
    this._wss.on('connection', (ws) => {
      const channel = this._isolate.createInspectorSession();

      function dispose() {
        try {
          channel.dispose();
        } catch (err) {
        }
      }

      ws.once('error', dispose);
      ws.once('close', dispose);

      ws.on('message', (message) => {
        try {
          channel.dispatchProtocolMessage(message);
        } catch (err) {
          ws.close();
        }
      });

      function send(message) {
        try {
          ws.send(message);
        } catch (err) {
          dispose();
        }
      }

      channel.onResponse = (callId, message) => send(message);
      channel.onNotification = send;
    });

    console.error(`Inspector: chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=127.0.0.1:${this._wss.options.port}`);
  }

  _stopDebuggerChannel() {
    if (this._wssOwner) {
      this._wss.close();
    }
  }

  /**
   * @param {*} args
   * @return {Promise<*>}
   */
  run(...args) {
    return this.__runnable.apply(undefined, args.map(makeTransferable));
  }

  dispose() {
    this._isolate.dispose();
    this._stopDebuggerChannel();
  }

}

module.exports = Thread;
