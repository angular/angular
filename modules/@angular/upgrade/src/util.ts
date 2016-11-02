/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export function onError(e: any) {
  // TODO: (misko): We seem to not have a stack trace here!
  if (console.error) {
    console.error(e, e.stack);
  } else {
    // tslint:disable-next-line:no-console
    console.log(e, e.stack);
  }
  throw e;
}

export function controllerKey(name: string): string {
  return '$' + name + 'Controller';
}

export function getAttributesAsArray(node: Node): string[][] {
  const attributes = node.attributes;
  let asArray: string[][];
  if (attributes) {
    let attrLen = attributes.length;
    asArray = new Array(attrLen);
    for (let i = 0; i < attrLen; i++) {
      asArray[i] = [attributes[i].nodeName, attributes[i].nodeValue];
    }
  }
  return asArray || [];
}

export class Deferred<R> {
  promise: Promise<R>;
  resolve: (value?: R|PromiseLike<R>) => void;
  reject: (error?: any) => void;

  constructor() {
    this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }
}
