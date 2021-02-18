/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {createEventTargetPrototype} from './fake-async-event';
import {loadFakeGlobalAPI} from './fake-async-util';

export function loadFakeAsyncFileReader(global: any) {
  const patchTargetMethods =
      ['readAsText', 'readAsArrayBuffer', 'readAsBinaryString', 'readAsDataURL', 'abort'];
  const FakeFileReader = function() {} as any;
  (FakeFileReader as any).EMPTY = 0;
  (FakeFileReader as any).LOADING = 1;
  (FakeFileReader as any).DONE = 2;
  FakeFileReader.prototype = createEventTargetPrototype([
    'onerror',
    'onabort',
    'onload',
    'onloadstart',
    'onloadend',
    'onprogress',
  ]);

  FakeFileReader.prototype.readyState = 0;
  patchTargetMethods.forEach(m => {
    FakeFileReader.prototype[m] = function(blob: any, encoding?: string) {
      const fileReader = this;
      fileReader.readyState = 1;
      fileReader.blob = blob;
      fileReader.encoding = encoding;
      const task = Zone.current.scheduleMacroTask(
          `FileReader.${m}`, () => {}, fileReader, () => {}, () => {});
      fileReader[Zone.__symbol__('fileReaderTask')] = task;
    };
  });

  FakeFileReader.prototype.done = function() {
    const task: Task = this[Zone.__symbol__('fileReaderTask')];
    task && task.invoke();
  };

  FakeFileReader.prototype.abort = function() {
    const task: Task = this[Zone.__symbol__('fileReaderTask')];
    task && task.zone.cancelTask(task);
  };

  const loader = loadFakeGlobalAPI(global, 'FileReader', FakeFileReader);

  function fakeFileReader(api: _ZonePrivate) {
    loader.fakeGlobalAPI(() => {
      api.patchFileReader(global);
    });
  }

  function restoreFileReader() {
    loader.restoreGlobalAPI(patchTargetMethods);
  }

  return {fakeFileReader, restoreFileReader};
}

export const supportedSources = [
  'FileReader.readAsText', 'FileReader.readAsArrayBuffer', 'FileReader.readAsBinaryString',
  'FileReader.readAsDataURL'
]
