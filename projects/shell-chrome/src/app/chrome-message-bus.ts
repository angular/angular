import { MessageBus, Events, Parameters } from 'protocol';

// Todo: check if this is used anywhere? If not decide whether or not to keep it.
export type Callback = (
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => void;

interface ChromeMessage<T, K extends keyof T> {
  topic: K;
  args: Parameters<T[K]>;
}

type AnyEventCallback<Ev> = <E extends keyof Ev>(topic: E, args: Parameters<Ev[E]>) => void;

export class ChromeMessageBus extends MessageBus<Events> {
  private _disconnected = false;
  private _listeners: any[] = [];

  constructor(private _port: chrome.runtime.Port) {
    super();

    _port.onDisconnect.addListener(() => {
      console.log('Disconnected the port');
      this._disconnected = true;
    });
  }

  onAny(cb: AnyEventCallback<Events>): () => void {
    const listener = (msg: ChromeMessage<Events, keyof Events>): void => {
      console.log('Received message', msg);
      cb(msg.topic, msg.args);
    };
    this._port.onMessage.addListener(listener);
    this._listeners.push(listener);
    return () => {
      this._listeners.splice(this._listeners.indexOf(listener), 1);
      this._port.onMessage.removeListener(listener);
    };
  }

  on<E extends keyof Events>(topic: E, cb: Events[E]): () => void {
    const listener = (msg: ChromeMessage<Events, keyof Events>): void => {
      console.log('Received message', msg);
      if (msg.topic === topic) {
        cb.apply(null, msg.args);
      }
    };
    this._port.onMessage.addListener(listener);
    this._listeners.push(listener);
    return () => {
      this._listeners.splice(this._listeners.indexOf(listener), 1);
      this._port.onMessage.removeListener(listener);
    };
  }

  once<E extends keyof Events>(topic: E, cb: Events[E]): void {
    const listener = (msg: ChromeMessage<Events, keyof Events>) => {
      if (msg.topic === topic) {
        cb.apply(null, msg.args);
        this._port.onMessage.removeListener(listener);
      }
    };
    this._port.onMessage.addListener(listener);
  }

  emit<E extends keyof Events>(topic: E, args?: Parameters<Events[E]>): void {
    console.log('@@ Sending message', topic, args);
    if (this._disconnected) {
      return;
    }
    this._port.postMessage({
      topic,
      args,
    });
  }

  destroy(): void {
    this._listeners.forEach(l => window.removeEventListener('message', l));
    this._listeners = [];
  }
}
