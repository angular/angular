interface SignalInterop {
  getActiveConsumer: () => Consumer | null;
  setActiveConsumer: (consumer: Consumer | null) => Consumer | null;
  beginBatch: () => () => {error: any} | void;
  afterBatch: (fn: () => void) => void;
}

const createSignalInterop = (): SignalInterop => {
  let activeConsumer: Consumer | null = null;
  let inBatch = false;
  let batchQueue: (() => void)[] = [];
  let asyncBatchQueue: (() => void)[] = [];
  let plannedAsyncBatch = false;
  const noop = () => {};
  const asyncBatch = () => {
    plannedAsyncBatch = false;
    batchQueue = asyncBatchQueue;
    asyncBatchQueue = [];
    inBatch = true;
    endBatch();
  };
  const endBatch = () => {
    let queueError: {error: any} | undefined;
    while (batchQueue.length > 0) {
      try {
        batchQueue.shift()!();
      } catch (error) {
        if (!queueError) {
          queueError = {error};
        }
      }
    }
    inBatch = false;
    return queueError;
  };
  const beginBatch = () => {
    if (inBatch) {
      return noop;
    }
    inBatch = true;
    return endBatch;
  };
  return {
    getActiveConsumer: () => activeConsumer,
    setActiveConsumer: (consumer: Consumer | null): Consumer | null => {
      const prevConsumer = activeConsumer;
      activeConsumer = consumer;
      return prevConsumer;
    },
    beginBatch,
    afterBatch: (fn) => {
      if (inBatch) {
        batchQueue.push(fn);
      } else {
        asyncBatchQueue.push(fn);
        if (!plannedAsyncBatch) {
          plannedAsyncBatch = true;
          Promise.resolve().then(asyncBatch);
        }
      }
    },
  };
};

const signalInterop: SignalInterop = (() => {
  let res: SignalInterop | undefined = (globalThis as any).signalInterop;
  if (!res) {
    res = createSignalInterop();
    (globalThis as any).signalInterop = res;
  }
  return res;
})();

/**
 * An interoperable signal.
 */
export interface Signal {
  /**
   * Create a watcher on the signal with the given notify function.
   *
   * @remarks
   * The watcher is initially not started and out-of-date. Call {@link Watcher.start|start}
   * and {@link Watcher.update|update} to start it and make it up-to-date.
   *
   * @param notify - the function that will be called synchronously when the signal or any
   * of its (transitive) dependencies changes while the watcher is started and up-to-date
   * @returns a watcher on the signal
   */
  watchSignal(notify: () => void): Watcher;
}

/**
 * A watcher on a signal.
 */
export interface Watcher {
  /**
   * Start the watcher.
   *
   * @remarks
   * Starting the watcher does not make it up-to-date.
   *
   * Call the {@link Watcher.update|update} method to make it up-to-date.
   *
   * Call {@link Watcher.stop|stop} to stop the watcher.
   */
  start(): void;

  /**
   * Stop the watcher.
   *
   * @remarks
   * As long as the watcher is stopped, it stays out-of-date and the notify function is not
   * called.
   */
  stop(): void;

  /**
   * Update the watcher.
   *
   * @remarks
   * It is possible to call this method whether the watcher is started or not:
   * - if the watcher is started, calling this method will make it up-to-date
   * - if the watcher is not started, the signal will be updated but calling
   * {@link Watcher.isUpToDate|isUpToDate} afterward will still return false.
   *
   * @returns true if the value of the watched signal changed since the last call of this
   * method, false otherwise.
   */
  update(): boolean;

  /**
   * Return whether the watcher is started.
   *
   * @remarks
   * A watcher is started if the {@link Watcher.start|start} method has been called and the
   * {@link Watcher.stop|stop} method has not been called since.
   *
   * @returns true if the watcher is started, false otherwise
   */
  isStarted(): boolean;

  /**
   * Return whether the watcher is up-to-date (and started).
   *
   * @remarks
   * A watcher is up-to-date if the watcher is started and its {@link Watcher.update|update}
   * method has been called afterward, and the notify function has not been called since the
   * last call of the update method.
   *
   * @returns true if the watcher is up-to-date (and started), false otherwise
   */
  isUpToDate(): boolean;
}

/**
 * A consumer of signals.
 *
 * @remarks
 *
 * A consumer is an object that can be notified when a signal is being used.
 */
export interface Consumer {
  /**
   * Add a producer to the consumer. This method is called by the producer when it is used.
   */
  addProducer: (signal: Signal) => void;
}

/**
 * Set the active consumer.
 * @param consumer - the new active consumer
 * @returns the previous active consumer
 */
export const setActiveConsumer = signalInterop.setActiveConsumer;

/**
 * Get the active consumer.
 * @returns the active consumer
 */
export const getActiveConsumer = signalInterop.getActiveConsumer;

/**
 * Start batching signal updates.
 * Return a function to call at the end of the batch.
 * At the end of the top-level batch, all the functions planned with afterBatch are called.
 *
 * @returns a function to call at the end of the batch
 *
 * @example
 * ```ts
 * const endBatch = beginBatch();
 * let queueError;
 * try {
 *   // update signals
 * } finally {
 *   queueError = endBatch();
 * }
 * if (queueError) {
 *   throw queueError.error; // the first error that occurred in an afterBatch function
 * }
 * ```
 *
 * @example
 * ```ts
 * const batch = <T>(fn: () => T): T => {
 *   let res;
 *   let queueError;
 *   const endBatch = beginBatch();
 *   try {
 *     res = fn();
 *   } finally {
 *     queueError = endBatch();
 *   }
 *   if (queueError) {
 *     throw queueError.error;
 *   }
 *   return res;
 * };
 * ```
 */
export const beginBatch = signalInterop.beginBatch;

/**
 * Plan a function to be called after the current batch.
 * If the current code is not running in a batch, the function is scheduled to be called after the current microtask.
 * @param fn - the function to call after the current batch
 */
export const afterBatch = signalInterop.afterBatch;
