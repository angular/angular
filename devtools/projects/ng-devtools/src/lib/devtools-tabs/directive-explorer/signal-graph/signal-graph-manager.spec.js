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
import {MessageBus} from '../../../../../../protocol';
const dummyGraph = {
  nodes: [],
  edges: [],
};
class SgmMockMessageBus extends MessageBus {
  constructor() {
    super(...arguments);
    this.cbs = {};
  }
  on(topic, cb) {
    this.cbs[topic] = cb;
    return () => {
      delete this.cbs[topic];
    };
  }
  emit(topic) {
    if (topic === 'getSignalGraph') {
      this.cbs['latestSignalGraph']?.(dummyGraph);
    }
    return true;
  }
  once() {}
  destroy() {}
}
describe('SignalGraphManager', () => {
  let sgm;
  let messageBus;
  beforeEach(() => {
    messageBus = new SgmMockMessageBus();
    TestBed.configureTestingModule({
      providers: [{provide: MessageBus, useValue: messageBus}, SignalGraphManager],
    });
    sgm = TestBed.inject(SignalGraphManager);
  });
  it('should listen and update the graph by a provided element', async () => {
    const dummyEl = [0];
    sgm.listen(signal(dummyEl));
    expect(sgm.element()).toEqual(dummyEl);
    await TestBed.inject(ApplicationRef).whenStable();
    TestBed.tick();
    expect(sgm.graph()).toEqual(dummyGraph);
  });
  it('should unlisten the current element', () => {
    const dummyEl = [0];
    sgm.listen(signal(dummyEl));
    expect('componentTreeDirty' in messageBus.cbs).toBeTrue();
    expect(sgm.element()).toEqual(dummyEl);
    sgm.unlisten();
    expect('componentTreeDirty' in messageBus.cbs).toBeFalse();
    expect(sgm.element()).toBeUndefined();
  });
  it('should clean up after the manager is marked for destruction', () => {
    expect('latestSignalGraph' in messageBus.cbs).toBeTrue();
    spyOn(sgm, 'unlisten').and.callThrough();
    sgm.destroy();
    expect('latestSignalGraph' in messageBus.cbs).toBeFalse();
    expect(sgm.unlisten).toHaveBeenCalled();
  });
});
//# sourceMappingURL=signal-graph-manager.spec.js.map
