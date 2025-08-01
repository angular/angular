/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {SignalGraphManager} from './signal-graph-manager';
import {DebugSignalGraph, ElementPosition, Events, MessageBus} from '../../../../../../protocol';

type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

const dummyGraph: DebugSignalGraph = {
  nodes: [],
  edges: [],
};

class SgmMockMessageBus extends MessageBus<Events> {
  private readonly cbs: PartialRecord<keyof Events, (...args: unknown[]) => void> = {};

  override on<E extends keyof Events>(topic: E, cb: (...args: unknown[]) => void): () => void {
    this.cbs[topic] = cb;
    return () => {};
  }

  override emit<E extends keyof Events>(topic: E): boolean {
    if (topic === 'getSignalGraph') {
      this.cbs['latestSignalGraph']?.(dummyGraph);
    }
    return true;
  }

  override once(): void {}
  override destroy(): void {}
}

describe('SignalGraphManager', () => {
  let sgm: SignalGraphManager;
  let messageBus: SgmMockMessageBus;

  beforeEach(() => {
    messageBus = new SgmMockMessageBus();

    TestBed.configureTestingModule({
      providers: [{provide: MessageBus, useValue: messageBus}, SignalGraphManager],
    });
    sgm = TestBed.inject(SignalGraphManager);
  });

  it('should listen and update the graph by a provided element', async () => {
    const dummyEl: ElementPosition = [0];
    sgm.listen(signal(dummyEl));

    expect(sgm.element()).toEqual(dummyEl);

    await TestBed.inject(ApplicationRef).whenStable();
    TestBed.tick();

    expect(sgm.graph()).toEqual(dummyGraph);
  });
});
