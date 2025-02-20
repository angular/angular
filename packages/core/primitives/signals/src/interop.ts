/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  consumerAfterComputation,
  consumerBeforeComputation,
  consumerMarkDirty,
  internalProducerAccessed,
  isInNotificationPhase,
  producerAccessed,
  producerMarkClean,
  producerUpdateValueVersion,
  REACTIVE_NODE,
  ReactiveNode,
  Version,
} from './graph';
import {
  Consumer as InteropConsumer,
  Signal as InteropSignal,
  Watcher as InteropWatcher,
} from './interop_lib';

const interopSignalMap = new WeakMap<InteropSignal<unknown>, ReactiveNode>();

export const CONSUMER_NODE: InteropConsumer = {
  addProducer<T>(this: ReactiveNode & InteropConsumer, signal: InteropSignal<T>) {
    let producer =
      signal.watchSignal === interopWatch
        ? (signal as any as ReactiveNode)
        : interopSignalMap.get(signal);
    if (!producer) {
      producer = interopSignal(signal);
      interopSignalMap.set(signal, producer);
    }
    producer.producerOnAccess?.();
    internalProducerAccessed(producer, this);
  },
};

class Watcher<T> implements InteropWatcher<T> {
  private _started = false;
  private _watchNode: InteropWatchNode<T>;
  private _upToDate = false;
  private _version: Version = -1 as Version;

  constructor(
    private readonly _node: ReactiveNode & InteropSignal<T>,
    private readonly _notify: () => void,
  ) {
    const watchNode: InteropWatchNode<T> = Object.create(INTEROP_WATCH_NODE);
    watchNode.watcher = this;
    this._watchNode = watchNode;
  }

  private _markDirty(): void {
    if (this._upToDate) {
      this._upToDate = false;
      const notify = this._notify;
      notify();
    }
  }

  private _run(): void {
    const watchNode = this._watchNode;
    const prevConsumer = consumerBeforeComputation(watchNode);
    try {
      if (this._started) {
        const node = this._node;
        producerUpdateValueVersion(node);
        producerAccessed(node);
      }
    } finally {
      consumerAfterComputation(watchNode, prevConsumer);
    }
  }

  isStarted(): boolean {
    return this._started;
  }

  isUpToDate(): boolean {
    return this._upToDate;
  }

  update(): boolean {
    producerUpdateValueVersion(this._node);
    const changed = this._version !== this._node.version;
    this._version = this._node.version;
    this._upToDate = this._started;
    return changed;
  }

  get(): T {
    if (isInNotificationPhase()) {
      throw new Error('Cannot access signal value during notification phase');
    }
    if (!this._upToDate) {
      throw new Error('Watcher not up to date');
    }
    const node = this._node;
    return node.producerValue() as any;
  }

  start(): void {
    if (!this._started) {
      this._started = true;
      this._run();
    }
  }

  stop(): void {
    if (this._started) {
      this._started = false;
      this._upToDate = false;
      this._run();
    }
  }
}

interface InteropWatchNode<T> extends ReactiveNode, InteropConsumer {
  watcher: Watcher<T>;
}

// Note: Using an IIFE here to ensure that the spread assignment is not considered
// a side-effect, ending up preserving `INTEROP_SIGNAL_NODE` and `REACTIVE_NODE`.
// TODO: remove when https://github.com/evanw/esbuild/issues/3392 is resolved.
const INTEROP_WATCH_NODE: InteropWatchNode<unknown> = /* @__PURE__ */ (() => {
  return {
    ...REACTIVE_NODE,
    ...CONSUMER_NODE,
    kind: 'interop_watch',
    consumerIsAlwaysLive: true,
    watcher: null!,
    consumerMarkedDirty(this: InteropWatchNode<unknown>) {
      this.watcher['_markDirty']();
    },
  };
})();

function interopWatch<T>(
  this: ReactiveNode & InteropSignal<T>,
  notify: () => void,
): InteropWatcher<T> {
  return new Watcher(this, notify);
}

function interopSignal<T>(signal: InteropSignal<T>): ReactiveNode {
  const node: InteropSignalNode<T> = Object.create(INTEROP_SIGNAL_NODE);
  node.watcher = signal.watchSignal(() => {
    if (!node.dirty) {
      consumerMarkDirty(node);
    }
  });
  return node;
}

interface InteropSignalNode<T> extends ReactiveNode {
  computing: boolean;
  started: boolean;
  watcher: InteropWatcher<T>;
}

// Note: Using an IIFE here to ensure that the spread assignment is not considered
// a side-effect, ending up preserving `INTEROP_SIGNAL_NODE` and `REACTIVE_NODE`.
// TODO: remove when https://github.com/evanw/esbuild/issues/3392 is resolved.
const INTEROP_SIGNAL_NODE: InteropSignalNode<unknown> = /* @__PURE__ */ (() => {
  return {
    ...REACTIVE_NODE,
    dirty: true,
    started: false,
    computing: false,
    kind: 'interop_signal',
    watcher: null!,
    hasInteropSignalDep: true,

    producerMustRecompute(node: InteropSignalNode<unknown>): boolean {
      return node.computing || !node.watcher.isUpToDate();
    },

    producerRecomputeValue(node: InteropSignalNode<unknown>): void {
      if (node.computing) {
        // Our computation somehow led to a cyclic read of itself.
        throw new Error('Detected cycle in computations.');
      }

      node.computing = true;
      let differentValue = true;
      try {
        differentValue = node.watcher.update();
      } finally {
        node.computing = false;
        if (differentValue) {
          node.version++;
        }
      }
    },

    producerOnAccess() {
      producerUpdateValueVersion(this);
    },

    watched() {
      if (!this.started) {
        this.started = true;
        this.watcher.start();
        this.producerRecomputeValue(this);
        producerMarkClean(this);
      }
    },

    unwatched() {
      if (this.started) {
        this.started = false;
        this.watcher.stop();
      }
    },
  };
})();

export const PRODUCER_NODE: InteropSignal<any> = {
  watchSignal: interopWatch,
};
