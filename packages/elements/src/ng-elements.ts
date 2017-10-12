/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactoryResolver, NgModuleRef, Type} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';

import {NgElement} from './ng-element';
import {NgElementApplicationContext} from './ng-element-application-context';
import {NgElementConstructor, NgElementConstructorInternal, createNgElementConstructor} from './ng-element-constructor';
import {scheduler, throwError} from './utils';

/**
 * TODO(gkalpak): Add docs.
 * @experimental
 */
export class NgElements<T> {
  private doc = this.moduleRef.injector.get<Document>(DOCUMENT);
  private definitions = new Map<string, NgElementConstructorInternal<any, any>>();
  private upgradedElements = new Set<NgElement<any>>();
  private appContext = new NgElementApplicationContext(this.moduleRef.injector);
  private changeDetectionScheduled = false;

  constructor(public readonly moduleRef: NgModuleRef<T>, customElementComponents: Type<any>[]) {
    const resolver = moduleRef.componentFactoryResolver;
    customElementComponents.forEach(
        componentType => this.defineNgElement(this.appContext, resolver, componentType));
  }

  detachAll(root: Element = this.doc.documentElement): void {
    const upgradedElements = Array.from(this.upgradedElements.values());
    const elementsToDetach: NgElement<any>[] = [];

    this.traverseTree(root, (node: HTMLElement) => {
      upgradedElements.some(ngElement => {
        if (ngElement.getHost() === node) {
          elementsToDetach.push(ngElement);
          return true;
        }
        return false;
      });
    });

    // Detach in reverse traversal order.
    this.appContext.runInNgZone(
        () => elementsToDetach.reverse().forEach(ngElement => ngElement.detach()));
  }

  detectChanges(): void {
    this.changeDetectionScheduled = false;
    this.appContext.runInNgZone(
        () => this.upgradedElements.forEach(ngElement => ngElement.detectChanges()));
  }

  forEach(
      cb:
          (def: NgElementConstructor<any, any>, selector: string,
           map: Map<string, NgElementConstructor<any, any>>) => void): void {
    return this.definitions.forEach(cb);
  }

  get<C = any, P = {}>(selector: string): NgElementConstructor<C, P>|undefined {
    return (this.definitions as Map<string, NgElementConstructorInternal<C, P>>).get(selector);
  }

  markDirty(): void {
    if (!this.changeDetectionScheduled) {
      this.changeDetectionScheduled = true;
      scheduler.scheduleBeforeRender(() => this.detectChanges());
    }
  }

  register(customElements?: CustomElementRegistry): void {
    if (!customElements && (typeof window !== 'undefined')) {
      customElements = window.customElements;
    }

    if (!customElements) {
      throwError('Custom Elements are not supported in this environment.');
    }

    this.definitions.forEach(def => customElements !.define(def.is, def));
  }

  upgradeAll(root: Element = this.doc.documentElement): void {
    const definitions = Array.from(this.definitions.values());

    this.appContext.runInNgZone(() => {
      this.traverseTree(root, (node: HTMLElement) => {
        const nodeName = node.nodeName.toLowerCase();
        definitions.some(def => {
          if (def.is === nodeName) {
            // TODO(gkalpak): What happens if `node` contains more custom elements
            //                (as projectable content)?
            def.upgrade(node, true);
            return true;
          }
          return false;
        });
      });
    });
  }

  private defineNgElement(
      appContext: NgElementApplicationContext, resolver: ComponentFactoryResolver,
      componentType: Type<any>): void {
    const componentFactory = resolver.resolveComponentFactory(componentType);
    const def = createNgElementConstructor<any, any>(appContext, componentFactory);
    const selector = def.is;

    if (this.definitions.has(selector)) {
      throwError(
          `Defining an Angular custom element with selector '${selector}' is not allowed, ` +
          'because one is already defined.');
    }

    def.onConnected.subscribe((ngElement: NgElement<T>) => this.upgradedElements.add(ngElement));
    def.onDisconnected.subscribe(
        (ngElement: NgElement<T>) => this.upgradedElements.delete(ngElement));

    this.definitions.set(selector, def);
  }

  // TODO(gkalpak): Add support for traversing through `shadowRoot`
  //                (as should happen according to the spec).
  // TODO(gkalpak): Investigate security implications (e.g. as seen in
  //                https://github.com/angular/angular.js/pull/15699).
  private traverseTree(root: Element, cb: (node: HTMLElement) => void): void {
    let currentNode: Element|null = root;

    const getNextNonDescendant = (node: Element): Element | null => {
      let currNode: Element|null = node;
      let nextNode: Element|null = null;

      while (!nextNode && currNode && (currNode !== root)) {
        nextNode = currNode.nextElementSibling;
        currNode = currNode.parentElement;
      }

      return nextNode;
    };

    while (currentNode) {
      if (currentNode instanceof HTMLElement) {
        cb(currentNode);
      }

      currentNode = currentNode.firstElementChild || getNextNonDescendant(currentNode);
    }
  }
}
