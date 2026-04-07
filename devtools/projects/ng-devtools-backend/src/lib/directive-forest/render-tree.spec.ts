/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ɵDirectiveDebugMetadata as DirectiveDebugMetadata,
  ɵFramework as Framework,
  ɵFrameworkAgnosticGlobalUtils as FrameworkAgnosticGlobalUtils,
  ɵControlFlowBlock as ControlFlowBlock,
  ɵControlFlowBlockType as ControlFlowBlockType,
} from '@angular/core';
import {RTreeStrategy} from './render-tree';

describe('render tree extraction', () => {
  let treeStrategy: RTreeStrategy;
  let directiveMap: Map<Node, any[]>;
  let componentMap: Map<Element, any>;
  let directiveMetadataMap: Map<any, DirectiveDebugMetadata>;
  let controlFlowBlocksMap: Map<Node, Partial<ControlFlowBlock>[]>;

  beforeEach(() => {
    treeStrategy = new RTreeStrategy();
    directiveMap = new Map();
    componentMap = new Map();
    directiveMetadataMap = new Map();
    controlFlowBlocksMap = new Map();

    (window as any).ng = {
      getDirectiveMetadata(dir: any): DirectiveDebugMetadata | null {
        return directiveMetadataMap.get(dir) ?? null;
      },
      getComponent(element: Element): any {
        return componentMap.get(element);
      },
      getDirectives(node: Node): any {
        return directiveMap.get(node) || [];
      },
      ɵgetControlFlowBlocks(node: Node): ControlFlowBlock[] {
        return (controlFlowBlocksMap.get(node) as ControlFlowBlock[]) || [];
      },
    } satisfies Partial<FrameworkAgnosticGlobalUtils>;
  });

  afterEach(() => delete (window as any).ng);

  it('should detect Angular Ivy apps', () => {
    expect(treeStrategy.supports()).toBeTrue();
  });

  it('should fail with detection of non-Ivy apps', () => {
    delete (window as any).ng.getDirectiveMetadata;
    expect(treeStrategy.supports()).toBeFalse();
  });

  it('should extract render tree from an empty element', () => {
    expect(treeStrategy.build(document.createElement('div'))).toEqual([]);
  });

  it('should extract trees without structural directives', () => {
    const appNode = document.createElement('app');
    const childNode = document.createElement('child');
    const childDirectiveNode = document.createElement('div');
    appNode.appendChild(childNode);
    appNode.appendChild(childDirectiveNode);

    const appComponent: any = {};
    const childComponent: any = {};
    const childDirective: any = {};
    componentMap.set(appNode, appComponent);
    componentMap.set(childNode, childComponent);
    directiveMap.set(childDirectiveNode, [childDirective]);

    const rtree = treeStrategy.build(appNode);
    expect(rtree.length).toBe(1);
    expect(rtree[0].children.length).toBe(2);
    expect(rtree[0].children[0].component?.instance).toBe(childComponent);
    expect(rtree[0].children[1].component).toBe(null);
    expect(rtree[0].children[1].directives[0].instance).toBe(childDirective);
  });

  it('should skip nodes without directives', () => {
    const appNode = document.createElement('app');
    const childNode = document.createElement('div');
    const childComponentNode = document.createElement('child');
    appNode.appendChild(childNode);
    childNode.appendChild(childComponentNode);

    const appComponent: any = {};
    const childComponent: any = {};
    componentMap.set(appNode, appComponent);
    componentMap.set(childComponentNode, childComponent);

    const rtree = treeStrategy.build(appNode);
    expect(rtree[0].children.length).toBe(1);
    expect(rtree[0].children[0].children.length).toBe(0);
  });

  it('should use component name from `ng.getDirectiveMetadata`', () => {
    const appNode = document.createElement('app');

    const appComponent = {};
    componentMap.set(appNode, appComponent);
    directiveMetadataMap.set(appComponent, {
      framework: Framework.Angular,
      name: 'AppComponent',
      inputs: {},
      outputs: {},
    });

    const rtree = treeStrategy.build(appNode);
    expect(rtree[0].component!.name).toBe('AppComponent');
  });

  it('should extract a control flow block', () => {
    // Represent:
    //
    // <app>
    //   @defer {
    //     <defer-child />
    //     @defer {
    //       <nested-defer-child />
    //     }
    //   }
    //   <child />
    // </app>

    // Create the DOM
    const appNode = document.createElement('app');
    const deferHostNode = document.createElement('comment');
    const deferChildNode = document.createElement('defer-child');
    const nestedDeferHostNode = document.createElement('comment');
    const nestedDeferChildNode = document.createElement('nested-defer-child');
    const childNode = document.createElement('child');

    appNode.appendChild(deferHostNode);
    appNode.appendChild(deferChildNode);
    appNode.appendChild(childNode);
    appNode.appendChild(nestedDeferHostNode);
    appNode.appendChild(nestedDeferChildNode);

    // Create and set the component instances
    componentMap.set(appNode, {});
    componentMap.set(deferChildNode, {});
    componentMap.set(nestedDeferChildNode, {});
    componentMap.set(childNode, {});

    // Create a the outer and the inner @defer blocks.
    controlFlowBlocksMap.set(appNode, [
      {
        type: ControlFlowBlockType.Defer,
        hostNode: deferHostNode,
        rootNodes: [deferChildNode, nestedDeferHostNode, nestedDeferChildNode],
        triggers: [],
      },
      {
        type: ControlFlowBlockType.Defer,
        hostNode: nestedDeferHostNode,
        rootNodes: [nestedDeferChildNode],
        triggers: [],
      },
    ]);

    const rtree = treeStrategy.build(appNode);

    expect(rtree.length).toBe(1);

    const appRTreeNode = rtree[0];
    expect(appRTreeNode.children.map((c) => c.element)).toEqual(['@defer', 'child']);

    const outerDefer = appRTreeNode.children[0];
    expect(outerDefer.children.length).toBe(2);

    const [deferChild, innerDefer] = outerDefer.children;
    expect(deferChild).toEqual(
      jasmine.objectContaining({
        element: 'defer-child',
        nativeElement: deferChildNode,
      }),
    );
    expect(innerDefer.element).toEqual('@defer');

    expect(innerDefer.children.length).toBe(1);
    expect(innerDefer.children[0]).toEqual(
      jasmine.objectContaining({
        element: 'nested-defer-child',
        nativeElement: nestedDeferChildNode,
      }),
    );
  });
});
