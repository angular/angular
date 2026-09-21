/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal} from '../../src/core';
import {createWatch, ReactiveNode, SIGNAL} from '../../primitives/signals';

/**
 * Counts the edges a consumer holds, in total and to one specific producer.
 *
 * A consumer should hold one edge per producer it read, however many times it
 * read it.
 */
function countProducerLinks(
  consumer: ReactiveNode,
  producer: ReactiveNode,
): {toProducer: number; total: number} {
  let toProducer = 0;
  let total = 0;
  for (let link = consumer.producers; link !== undefined; link = link.nextProducer) {
    total++;
    if (link.producer === producer) {
      toProducer++;
    }
  }
  return {toProducer, total};
}

describe('signal graph: repeated reads while a signal is written', () => {
  const READS_PER_PASS = 5;

  /**
   * A consumer shaped like a view: it reads two signals alternately, so a
   * re-read never lands on the producer it read last, and writes a third
   * signal in between, the way a template interleaves repeated bindings with
   * writes to child input signals.
   */
  function createInterleavedWatch(
    config: () => unknown,
    data: () => unknown,
    writeChildInput: (value: number) => void,
    onNotify: () => void,
  ) {
    return createWatch(
      () => {
        for (let i = 0; i < READS_PER_PASS; i++) {
          config();
          data();
          writeChildInput(i);
        }
      },
      onNotify,
      true,
    );
  }

  /* Scenario: a producer read several times in one pass is linked once
   *   Given a consumer that reads two signals alternately, writing a third
   *     signal between the reads, so the graph's epoch advances mid-pass
   *   When the consumer runs
   *   Then it holds one edge per producer it read, not one per read
   */
  it('should link a producer once even when reads are interleaved with writes', () => {
    const config = signal(0);
    const data = signal(0);
    const childInput = signal<number | undefined>(undefined);

    const watch = createInterleavedWatch(
      config,
      data,
      (value) => childInput.set(value),
      () => {},
    );
    watch.run();

    const {toProducer, total} = countProducerLinks(watch[SIGNAL], config[SIGNAL] as ReactiveNode);

    expect(toProducer).toBe(1);
    expect(total).toBe(2);
  });

  /* Scenario: re-running a consumer does not accumulate edges
   *   Given a consumer that has already run once with interleaved reads
   *   When it runs again
   *   Then its edge count is the same as after the first run
   */
  it('should not grow the edge count on repeated runs', () => {
    const config = signal(0);
    const data = signal(0);
    const childInput = signal<number | undefined>(undefined);

    const watch = createInterleavedWatch(
      config,
      data,
      (value) => childInput.set(value),
      () => {},
    );

    watch.run();
    const afterFirstRun = countProducerLinks(watch[SIGNAL], config[SIGNAL] as ReactiveNode).total;
    watch.run();
    watch.run();

    expect(countProducerLinks(watch[SIGNAL], config[SIGNAL] as ReactiveNode).total).toBe(
      afterFirstRun,
    );
  });

  /* Scenario: one write notifies a consumer once
   *   Given a consumer that has read a signal, however many times, and
   *     whatever edges that left behind in the graph
   *   When that signal is written once
   *   Then the consumer is notified exactly once, so a change costs one
   *     change detection pass rather than one per edge
   */
  it('should notify a consumer once per change, whatever the graph holds', () => {
    const config = signal(0);
    const data = signal(0);
    const childInput = signal<number | undefined>(undefined);

    let notifications = 0;
    const watch = createInterleavedWatch(
      config,
      data,
      (value) => childInput.set(value),
      () => notifications++,
    );
    watch.run();

    notifications = 0;
    config.set(99);

    expect(notifications).toBe(1);
  });
});
