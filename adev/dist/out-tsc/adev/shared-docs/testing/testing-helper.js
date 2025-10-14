/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {WebContainer} from '@webcontainer/api';
export class FakeEventTarget {
  listeners = new Map();
  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }
  removeEventListener(type, listener) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
  dispatchEvent(event) {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        if (typeof listener === 'function') {
          listener.call(this, event);
        } else {
          listener.handleEvent(event);
        }
      }
    }
    return true;
  }
}
export class MockLocalStorage {
  items = new Map();
  getItem(key) {
    return this.items.get(key) ?? null;
  }
  setItem(key, value) {
    this.items.set(key, value);
  }
}
export class FakeChangeDetectorRef {
  markForCheck() {}
  detach() {}
  checkNoChanges() {}
  reattach() {}
  detectChanges() {}
}
export class FakeWebContainer extends WebContainer {
  fakeSpawn = undefined;
  constructor(fakeOptions) {
    super();
    if (fakeOptions?.spawn) this.fakeSpawn = fakeOptions.spawn;
  }
  async spawn(command, args, options) {
    if (this.fakeSpawn) return this.fakeSpawn;
    return new FakeWebContainerProcess();
  }
  on(event, listener) {
    return () => {};
  }
  async mount(tree, options) {}
  get path() {
    return '/fake-path';
  }
  get workdir() {
    return '/fake-workdir';
  }
  teardown() {}
  fs = new FakeFileSystemAPI();
}
class FakeFileSystemAPI {
  async readdir(path, options) {
    if (typeof options === 'object' && options?.withFileTypes === true) {
      return [{name: 'fake-file', isFile: () => true, isDirectory: () => false}];
    }
    return ['/fake-dirname'];
  }
  readFile(path, encoding) {
    return Promise.resolve('fake file content');
  }
  async writeFile(path, data, options) {}
  async mkdir(path, options) {}
  async rm(path, options) {}
  rename(oldPath, newPath) {
    throw Error('Not implemented');
  }
  watch(filename, options, listener) {
    throw Error('Not implemented');
  }
}
export class FakeWebContainerProcess {
  exit = Promise.resolve(0);
  input = new WritableStream();
  output = new ReadableStream();
  kill() {}
  resize(dimensions) {}
}
//# sourceMappingURL=testing-helper.js.map
