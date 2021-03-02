/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export function loadFakeAsyncCanvas(global: any) {
  const HTMLCanvasElement = global['HTMLCanvasElement'];
  if (!HTMLCanvasElement) {
    return;
  }
  let toBlob: any = null;
  HTMLCanvasElement.prototype.done = function(this: any, blob: any) {
    const callback = this[Zone.__symbol__('canvasCallback')];
    callback && callback.call(this, blob);
  };

  function toBlobCallback(callback: Function, task: Task) {
    return function(this: unknown, blob: Blob) {
      callback.call(this, blob);
      task.invoke();
    }
  }

  function toBlobPatch(this: any, ...args: any[]) {
    Zone.current.scheduleMacroTask('HTMLCanvasElement.toBlob', () => {}, this, (task: Task) => {
      const callback = args[0];
      this[Zone.__symbol__('canvasCallback')] = toBlobCallback(callback, task);
    });
  };

  function fakeCanvas() {
    toBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = toBlobPatch;
  }

  function restoreCanvas() {
    HTMLCanvasElement.prototype.toBlob = toBlob;
  }

  return {fakeCanvas, restoreCanvas};
}

export const supportedSources = ['HTMLCanvasElement.toBlob']
