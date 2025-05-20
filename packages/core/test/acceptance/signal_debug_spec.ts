/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, effect, inject, Injectable, signal} from '../../src/core';
import {
  getFrameworkDIDebugData,
  setupFrameworkInjectorProfiler,
} from '../../src/render3/debug/framework_injector_profiler';
import {setInjectorProfiler} from '../../src/render3/debug/injector_profiler';
import {
  DebugSignalGraphEdge,
  DebugSignalGraphNode,
  getSignalGraph,
} from '../../src/render3/util/signal_debug';
import {fakeAsync, TestBed, tick} from '../../testing';

describe('getSignalGraph', () => {
  beforeEach(() => {
    // Effect detection depends on the framework injector profiler being enabled
    setInjectorProfiler(null);
    setupFrameworkInjectorProfiler();
  });

  afterEach(() => {
    getFrameworkDIDebugData().reset();
    setInjectorProfiler(null);
    TestBed.resetTestingModule();
  });

  /**
   *
   * DebugSignalGraphEdge has integer fields representing indexes in the nodes array.
   * This function maps those indexes to the actual nodes and returns an array of edges.
   *
   */
  function mapEdgeIndicesIntoNodes(
    edges: DebugSignalGraphEdge[],
    nodes: DebugSignalGraphNode[],
  ): {consumer: DebugSignalGraphNode; producer: DebugSignalGraphNode}[] {
    return edges.map(({consumer, producer}) => ({
      consumer: nodes[consumer],
      producer: nodes[producer],
    }));
  }

  it('should return the signal graph for a component with signals', fakeAsync(() => {
    @Component({selector: 'component-with-signals', template: `{{ primitiveSignal() }}`})
    class WithSignals {
      primitiveSignal = signal(123, {debugName: 'primitiveSignal'});
    }
    TestBed.configureTestingModule({imports: [WithSignals]});
    const fixture = TestBed.createComponent(WithSignals);

    tick();
    fixture.detectChanges();
    const injector = fixture.componentRef.injector;
    const signalGraph = getSignalGraph(injector);

    const {nodes, edges} = signalGraph;

    // 2 nodes
    //   template
    //   primitiveSignal
    expect(nodes.length).toBe(2);

    // 1 edge
    //   template depends on primitiveSignal
    expect(edges.length).toBe(1);

    const signalNode = nodes.find((node) => node.kind === 'signal')!;
    expect(signalNode).toBeDefined();
    expect(signalNode.label).toBe('primitiveSignal');
    expect(signalNode.value).toBe(123);
  }));

  it('should return the signal graph for a component with effects', fakeAsync(() => {
    @Component({selector: 'component-with-effect', template: ``})
    class WithEffect {
      stateFromEffect = 0;
      primitiveSignal = signal(123, {debugName: 'primitiveSignal'});
      primitiveSignal2 = signal(456, {debugName: 'primitiveSignal2'});

      constructor() {
        effect(
          () => {
            this.stateFromEffect = this.primitiveSignal() * this.primitiveSignal2();
          },
          {debugName: 'primitiveSignalEffect'},
        );
      }
    }
    TestBed.configureTestingModule({imports: [WithEffect]});
    const fixture = TestBed.createComponent(WithEffect);

    tick();
    fixture.detectChanges();

    const injector = fixture.componentRef.injector;
    const signalGraph = getSignalGraph(injector);

    const {nodes, edges} = signalGraph;

    expect(nodes.length).toBe(3);

    const effectNode = nodes.find((node) => node.label === 'primitiveSignalEffect')!;
    expect(effectNode).toBeDefined();

    const signalNode = nodes.find((node) => node.label === 'primitiveSignal')!;
    expect(signalNode).toBeDefined();

    const signalNode2 = nodes.find((node) => node.label === 'primitiveSignal2')!;
    expect(signalNode2).toBeDefined();

    expect(edges.length).toBe(2);
    const edgesWithNodes = mapEdgeIndicesIntoNodes(edges, nodes);

    expect(edgesWithNodes).toContain({consumer: effectNode, producer: signalNode});
  }));

  it('should return the signal graph for a component with a computed', fakeAsync(() => {
    @Component({selector: 'component-with-computed', template: `{{ computedSignal() }}`})
    class WithComputed {
      primitiveSignal = signal(123, {debugName: 'primitiveSignal'});
      primitiveSignal2 = signal(456, {debugName: 'primitiveSignal2'});
      computedSignal = computed(() => this.primitiveSignal() * this.primitiveSignal2(), {
        debugName: 'computedSignal',
      });
    }
    TestBed.configureTestingModule({imports: [WithComputed]});
    const fixture = TestBed.createComponent(WithComputed);

    tick();
    fixture.detectChanges();

    const injector = fixture.componentRef.injector;
    const signalGraph = getSignalGraph(injector);

    const {nodes, edges} = signalGraph;

    // 4 nodes
    //   template
    //   primitiveSignal
    //   primitiveSignal2
    //   computedSignal
    expect(nodes.length).toBe(4);

    const templateNode = nodes.find((node) => node.kind === 'template')!;
    expect(templateNode).toBeDefined();

    const primitiveSignalNode = nodes.find((node) => node.label === 'primitiveSignal')!;
    expect(primitiveSignalNode).toBeDefined();
    expect(primitiveSignalNode.value).toBe(123);

    const primitiveSignal2Node = nodes.find((node) => node.label === 'primitiveSignal2')!;
    expect(primitiveSignal2Node).toBeDefined();
    expect(primitiveSignal2Node.value).toBe(456);

    const computedSignalNode = nodes.find((node) => node.label === 'computedSignal')!;
    expect(computedSignalNode).toBeDefined();
    expect(computedSignalNode.label).toBe('computedSignal');
    expect(computedSignalNode.value).toBe(123 * 456);

    // 3 edges
    //   computedSignal depends on primitiveSignal
    //   computedSignal depends on primitiveSignal2
    //   template depends on computedSignal
    expect(edges.length).toBe(3);

    const edgesWithNodes = mapEdgeIndicesIntoNodes(edges, nodes);

    expect(edgesWithNodes).toContain({consumer: templateNode, producer: computedSignalNode});
    expect(edgesWithNodes).toContain({
      consumer: computedSignalNode,
      producer: primitiveSignalNode,
    });
    expect(edgesWithNodes).toContain({
      consumer: computedSignalNode,
      producer: primitiveSignal2Node,
    });
  }));

  it('should return the signal graph for a component with unused reactive nodes', fakeAsync(() => {
    @Component({selector: 'component-with-unused-signal', template: ``})
    class WithUnusedReactiveNodes {
      primitiveSignal = signal(123, {debugName: 'primitiveSignal'});
      computedSignal = computed(() => this.primitiveSignal() * this.primitiveSignal(), {
        debugName: 'computedSignal',
      });
    }
    TestBed.configureTestingModule({imports: [WithUnusedReactiveNodes]});
    const fixture = TestBed.createComponent(WithUnusedReactiveNodes);

    tick();
    fixture.detectChanges();

    const injector = fixture.componentRef.injector;
    const signalGraph = getSignalGraph(injector);

    const {nodes, edges} = signalGraph;
    expect(nodes.length).toBe(0);
    expect(edges.length).toBe(0);
  }));

  it('should return the signal graph for a component with no component effect signal dependencies', fakeAsync(() => {
    @Component({selector: 'component-with-zero-effect', template: ``})
    class WithNoEffectSignalDependencies {
      primitiveSignal = signal(123, {debugName: 'primitiveSignal'});
      primitiveSignalEffect = effect(() => {}, {debugName: 'primitiveSignalEffect'});
    }
    TestBed.configureTestingModule({imports: [WithNoEffectSignalDependencies]});
    const fixture = TestBed.createComponent(WithNoEffectSignalDependencies);

    tick();
    fixture.detectChanges();

    const injector = fixture.componentRef.injector;
    const signalGraph = getSignalGraph(injector);

    const {nodes, edges} = signalGraph;
    expect(nodes.length).toBe(1); // 1 effect node detected
    expect(edges.length).toBe(0);
  }));

  it('should return the signal graph for a component with no signal dependencies in the template or component effects', fakeAsync(() => {
    @Component({selector: 'component-with-no-effect-dependencies', template: ``})
    class WithNoEffectDependencies {}
    TestBed.configureTestingModule({imports: [WithNoEffectDependencies]});
    const fixture = TestBed.createComponent(WithNoEffectDependencies);

    tick();
    fixture.detectChanges();

    const injector = fixture.componentRef.injector;
    const signalGraph = getSignalGraph(injector);

    const {nodes, edges} = signalGraph;
    expect(nodes.length).toBe(0);
    expect(edges.length).toBe(0);
  }));

  it('should capture signals created in external services in the signal graph', fakeAsync(() => {
    @Injectable()
    class ExternalService {
      oneTwoThree = signal(123, {debugName: 'oneTwoThree'});
      fourFiveSix = signal(456, {debugName: 'fourFiveSix'});
    }

    @Component({
      providers: [ExternalService],
      selector: 'component-with-external-service',
      template: `{{externalService.oneTwoThree()}}`,
    })
    class WithExternalService {
      externalService = inject(ExternalService);

      constructor() {
        effect(
          () => {
            this.externalService.fourFiveSix();
          },
          {debugName: 'externalServiceEffect'},
        );
      }
    }
    TestBed.configureTestingModule({imports: [WithExternalService]});
    const fixture = TestBed.createComponent(WithExternalService);

    tick();
    fixture.detectChanges();

    const injector = fixture.componentRef.injector;
    const signalGraph = getSignalGraph(injector);

    const {nodes, edges} = signalGraph;
    expect(nodes.length).toBe(4);

    const templateNode = nodes.find((node) => node.kind === 'template')!;
    expect(templateNode).toBeDefined();

    const externalServiceEffectNode = nodes.find((node) => node.label === 'externalServiceEffect')!;
    expect(externalServiceEffectNode).toBeDefined();
    expect(externalServiceEffectNode.kind).toBe('effect');

    const oneTwoThreeNode = nodes.find((node) => node.label === 'oneTwoThree')!;
    expect(oneTwoThreeNode).toBeDefined();
    expect(oneTwoThreeNode.value).toBe(123);

    const fourFiveSixNode = nodes.find((node) => node.label === 'fourFiveSix')!;
    expect(fourFiveSixNode).toBeDefined();
    expect(fourFiveSixNode.value).toBe(456);

    expect(edges.length).toBe(2);
    const edgesWithNodes = mapEdgeIndicesIntoNodes(edges, nodes);
    expect(edgesWithNodes).toContain({consumer: templateNode, producer: oneTwoThreeNode});
    expect(edgesWithNodes).toContain({
      consumer: externalServiceEffectNode,
      producer: fourFiveSixNode,
    });
  }));
});
