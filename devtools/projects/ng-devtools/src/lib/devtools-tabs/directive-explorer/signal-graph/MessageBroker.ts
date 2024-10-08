export class MessageBroker<TChannelEventMap extends {[channel: string]: any} = {}> {
  #subscribers = new Map();

  subscribe<TChannel extends string>(
    channel: TChannel,
    sub: (event: TChannelEventMap[TChannel]) => void,
  ) {
    if (!this.#subscribers.has(channel)) {
      this.#subscribers.set(channel, new Set());
    }

    const subs = this.#subscribers.get(channel);
    subs.add(sub);
    return () => {
      subs.delete(sub);
    };
  }

  publish<TChannel extends string>(channel: TChannel, event: TChannelEventMap[TChannel]) {
    if (this.#subscribers.has(channel)) {
      for (const sub of this.#subscribers.get(channel)) {
        sub(event);
      }
    }
  }

  clear() {
    this.#subscribers = new Map();
  }
}

export const signalBroker = new MessageBroker();
// export const signalBroker = new MessageBroker<{
// 'node-add': { node: Record<'type' | 'value' | 'label', any>; idx: string | number };
// 'new-effect': {target: string; getValue: () => unknown};
// 'destroy-effect': {target: string; destroy: () => void};
// 'debug': 'nodes' | 'links';
// 'execute': {nodeId: string; executeFn: (signal: any) => void};
// }>();

(window as any).signalBroker = signalBroker;
