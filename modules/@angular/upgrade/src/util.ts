/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as compiler from '@angular/compiler';

export function isPresent(obj: any): boolean {
  return obj !== undefined && obj !== null;
}

export function stringify(obj: any): string {
  if (typeof obj == 'function') return obj.name || obj.toString();
  return '' + obj;
}


export function onError(e: any) {
  // TODO: (misko): We seem to not have a stack trace here!
  console.log(e, e.stack);
  throw e;
}

export function controllerKey(name: string): string {
  return '$' + name + 'Controller';
}

function getAttributesAsArray(node: Node): string[][] {
  var attributes = node.attributes;
  var asArray: string[][];
  if (isPresent(attributes)) {
    let attrLen = attributes.length;
    asArray = new Array(attrLen);
    for (var i = 0; i < attrLen; i++) {
      asArray[i] = [attributes[i].nodeName, attributes[i].nodeValue];
    }
  }
  return asArray || [];
}

export function sortProjectableNodes(ngContentSelectors: string[], childNodes: Node[]): Node[][] {
  let projectableNodes: Node[][] = [];
  let matcher = new compiler.SelectorMatcher();
  let wildcardNgContentIndex: number;
  for (let i = 0, ii = ngContentSelectors.length; i < ii; i++) {
    projectableNodes[i] = [];
    if (ngContentSelectors[i] === '*') {
      wildcardNgContentIndex = i;
    } else {
      matcher.addSelectables(compiler.CssSelector.parse(ngContentSelectors[i]), i);
    }
  }
  for (let node of childNodes) {
    let ngContentIndices: number[] = [];
    let selector =
        compiler.createElementCssSelector(node.nodeName.toLowerCase(), getAttributesAsArray(node));
    matcher.match(
        selector, (selector, ngContentIndex) => { ngContentIndices.push(ngContentIndex); });
    ngContentIndices.sort();
    if (isPresent(wildcardNgContentIndex)) {
      ngContentIndices.push(wildcardNgContentIndex);
    }
    if (ngContentIndices.length > 0) {
      projectableNodes[ngContentIndices[0]].push(node);
    }
  }
  return projectableNodes;
}


export class PromiseCompleter<R> {
  promise: Promise<R>;
  resolve: (value?: R|PromiseLike<R>) => void;
  reject: (error?: any, stackTrace?: string) => void;

  constructor() {
    this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }
}
