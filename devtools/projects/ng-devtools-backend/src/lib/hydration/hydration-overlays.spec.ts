/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ɵHydratedNode as HydrationNode,
  ɵHydrationStatus as CoreHydrationStatus,
} from '@angular/core';
import {getConfig} from '../config/config';
import {getDirectiveForestManager} from '../directive-forest/manager';
import {removeAllHighlights} from '../shared/highlighter';
import {getRenderer} from '../shared/highlighter/rendering/renderer';
import {Highlight, HighlightType} from '../shared/highlighter/types';
import {ComponentTreeNode} from '../shared/interfaces';
import {loadHydrationOverlays} from './hydration-overlays';

function makeNode(
  nativeElement: Element,
  hydration: ComponentTreeNode['hydration'],
  children: ComponentTreeNode[] = [],
): ComponentTreeNode {
  return {
    tagName: nativeElement.tagName.toLowerCase(),
    nativeElement,
    component: {instance: {}, name: nativeElement.tagName.toLowerCase(), isElement: false},
    directives: [],
    hydration,
    static: false,
    controlFlowBlock: null,
    children,
  };
}

describe('hydration overlays', () => {
  let renderedHighlights: Highlight[];
  let cleanup: (() => void) | null = null;

  beforeEach(() => {
    renderedHighlights = [];
    const renderer = getRenderer();
    spyOn(renderer, 'renderHighlight').and.callFake((highlight: Highlight) => {
      renderedHighlights.push(highlight);
    });
    spyOn(renderer, 'removeHighlight').and.stub();

    (window as any).ng = {
      getComponent: (el: Element) =>
        el.tagName === 'APP-ROOT' || el.tagName === 'CHILD-COMP' ? {} : null,
      getDirectives: () => [],
    };
  });

  afterEach(() => {
    cleanup?.();
    cleanup = null;
    getConfig().set({hydrationOverlays: false});
    removeAllHighlights();
    delete (window as any).ng;
  });

  it('should not throw when dehydrated components are present in the forest', () => {
    const root = document.createElement('app-root');
    const dehydratedChild = document.createElement('child-comp');
    const hydratedChild = document.createElement('child-comp');
    root.append(dehydratedChild, hydratedChild);

    spyOn(getDirectiveForestManager(), 'getDirectiveForest').and.returnValue([
      makeNode(root, {status: 'hydrated'}, [
        makeNode(dehydratedChild, {status: 'dehydrated'}),
        makeNode(hydratedChild, {status: 'hydrated'}),
      ]),
    ]);

    cleanup = loadHydrationOverlays();
    expect(() => getConfig().set({hydrationOverlays: true})).not.toThrow();

    expect(renderedHighlights.length).toBe(1);
    expect(renderedHighlights[0].targetElement.deref()).toBe(hydratedChild);
    expect(renderedHighlights[0].type).toBe(HighlightType.HydrationCompleted);
  });

  it('should highlight a mismatched root component directly', () => {
    const root = document.createElement('app-root');

    spyOn(getDirectiveForestManager(), 'getDirectiveForest').and.returnValue([
      makeNode(root, {
        status: 'mismatched',
        expectedNodeDetails: '<b>expected</b>',
        actualNodeDetails: '<span>actual</span>',
      }),
    ]);

    cleanup = loadHydrationOverlays();
    getConfig().set({hydrationOverlays: true});

    expect(renderedHighlights.length).toBe(1);
    expect(renderedHighlights[0].targetElement.deref()).toBe(root);
    expect(renderedHighlights[0].type).toBe(HighlightType.HydrationMismatched);
  });

  it('should highlight the exact mismatched child DOM element when available', () => {
    const root = document.createElement('app-root');
    const childSpan = document.createElement('span');
    root.appendChild(childSpan);

    (root as HydrationNode).__ngDebugHydrationInfo__ = {
      status: CoreHydrationStatus.Mismatched,
      expectedNodeDetails: '<b>expected</b>',
      actualNodeDetails: '<span>actual</span>',
      actualNode: new WeakRef(childSpan),
    };

    spyOn(getDirectiveForestManager(), 'getDirectiveForest').and.returnValue([
      makeNode(root, {
        status: 'mismatched',
        expectedNodeDetails: '<b>expected</b>',
        actualNodeDetails: '<span>actual</span>',
        hasActualNode: true,
      }),
    ]);

    cleanup = loadHydrationOverlays();
    getConfig().set({hydrationOverlays: true});

    expect(renderedHighlights.length).toBe(1);
    expect(renderedHighlights[0].targetElement.deref()).toBe(childSpan);
    expect(renderedHighlights[0].type).toBe(HighlightType.HydrationMismatched);
  });

  it('should fall back to parentElement when the mismatched node is a text node', () => {
    const root = document.createElement('app-root');
    const wrapper = document.createElement('div');
    const text = document.createTextNode('unexpected text');
    wrapper.appendChild(text);
    root.appendChild(wrapper);

    (root as HydrationNode).__ngDebugHydrationInfo__ = {
      status: CoreHydrationStatus.Mismatched,
      expectedNodeDetails: '<b>expected</b>',
      actualNodeDetails: '#text(unexpected text)',
      actualNode: new WeakRef(text),
    };

    spyOn(getDirectiveForestManager(), 'getDirectiveForest').and.returnValue([
      makeNode(root, {
        status: 'mismatched',
        expectedNodeDetails: '<b>expected</b>',
        actualNodeDetails: '#text(unexpected text)',
        hasActualNode: true,
      }),
    ]);

    cleanup = loadHydrationOverlays();
    getConfig().set({hydrationOverlays: true});

    expect(renderedHighlights.length).toBe(1);
    expect(renderedHighlights[0].targetElement.deref()).toBe(wrapper);
  });
});
