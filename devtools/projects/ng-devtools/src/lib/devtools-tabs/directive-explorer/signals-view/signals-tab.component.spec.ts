/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NO_ERRORS_SCHEMA, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DebugSignalGraph, Events, MessageBus, PropType} from '../../../../../../protocol';
import {ApplicationOperations} from '../../../application-operations/index';
import {FrameManager} from '../../../application-services/frame_manager';
import {SignalGraphManager} from '../signal-graph/signal-graph-manager';
import {SignalsTabComponent} from './signals-tab.component';
import {SignalsGraphVisualizer} from './signals-visualizer';

class MessageBusStub extends MessageBus<Events> {
  override on<E extends keyof Events>(_topic: E, _cb: Events[E]): () => void {
    return () => {};
  }
  override once<E extends keyof Events>(_topic: E, _cb: Events[E]): void {}
  override emit<E extends keyof Events>(_topic: E, _args?: Parameters<Events[E]>): boolean {
    return true;
  }
  override destroy(): void {}
}

class SignalGraphManagerStub {
  readonly graphSignal = signal<DebugSignalGraph | null>(null);
  readonly graph = this.graphSignal.asReadonly();
  readonly element = signal(undefined);
}

class ApplicationOperationsStub extends ApplicationOperations {
  viewSource(): void {}
  selectDomElement(): void {}
  inspect(): void {}
  inspectSignal(): void {}
  viewSourceFromRouter(): void {}
  setStorageItems(): Promise<void> {
    return Promise.resolve();
  }
  getStorageItems(): Promise<{[key: string]: unknown}> {
    return Promise.resolve({});
  }
  removeStorageItems(): Promise<void> {
    return Promise.resolve();
  }
}

class FrameManagerStub {
  selectedFrame() {
    return null;
  }
}

describe('SignalsTabComponent', () => {
  let fixture: ComponentFixture<SignalsTabComponent>;
  let component: SignalsTabComponent;
  let graphManager: SignalGraphManagerStub;
  const setHideInternalSignals = (value: boolean) =>
    (component as any).hideInternalSignals.set(value);
  const readVisibleGraph = () => (component as any).visibleGraph() as DebugSignalGraph | null;

  beforeAll(() => {
    (globalThis as any).ResizeObserver =
      (globalThis as any).ResizeObserver ||
      class {
        observe() {}
        disconnect() {}
      };
  });

  beforeEach(() => {
    spyOn(SignalsTabComponent.prototype as any, 'setUpSignalsVisualizer').and.callFake(function (
      component: SignalsTabComponent,
    ) {
      const visualizer = jasmine.createSpyObj<SignalsGraphVisualizer>('viz', [
        'render',
        'setSelected',
        'reset',
        'cleanup',
        'resize',
        'onNodeClick',
      ]);
      visualizer.onNodeClick.and.returnValue(() => {});
      component.signalsVisualizer = visualizer;
    });

    TestBed.configureTestingModule({
      imports: [SignalsTabComponent],
      providers: [
        {provide: MessageBus, useClass: MessageBusStub},
        {provide: SignalGraphManager, useClass: SignalGraphManagerStub},
        {provide: ApplicationOperations, useClass: ApplicationOperationsStub},
        {provide: FrameManager, useClass: FrameManagerStub},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(SignalsTabComponent, {
      set: {
        template: '<svg #component></svg>',
        imports: [],
        styles: [],
      },
    });

    fixture = TestBed.createComponent(SignalsTabComponent);
    component = fixture.componentInstance;
    graphManager = TestBed.inject(SignalGraphManager) as unknown as SignalGraphManagerStub;
    fixture.detectChanges();
  });

  function buildDescriptor(): DebugSignalGraph['nodes'][number]['preview'] {
    return {
      expandable: false,
      editable: false,
      type: PropType.Number,
      preview: '',
      containerType: null,
    };
  }

  it('filters Angular internal signals and reindexes edges', () => {
    graphManager.graphSignal.set({
      nodes: [
        {id: 'userSignal', kind: 'signal', epoch: 1, preview: buildDescriptor(), debuggable: true},
        {
          id: 'ɵinternal',
          kind: 'signal',
          epoch: 1,
          preview: buildDescriptor(),
          debuggable: false,
          isAngularInternal: true,
        },
        {id: 'userEffect', kind: 'effect', epoch: 1, preview: buildDescriptor(), debuggable: true},
      ],
      edges: [
        {producer: 0, consumer: 1},
        {producer: 0, consumer: 2},
        {producer: 1, consumer: 2},
      ],
    });

    setHideInternalSignals(true);

    const graph = readVisibleGraph()!;
    expect(graph.nodes.map((n) => n.id)).toEqual(['userSignal', 'userEffect']);
    expect(graph.edges).toEqual([{producer: 0, consumer: 1}]);
  });

  it('returns the original graph when filtering is disabled', () => {
    const graph: DebugSignalGraph = {
      nodes: [{id: 'user', kind: 'signal', epoch: 1, preview: buildDescriptor(), debuggable: true}],
      edges: [],
    };

    graphManager.graphSignal.set(graph);
    setHideInternalSignals(false);

    expect(readVisibleGraph()).toBe(graph);
  });
});
