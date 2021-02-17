/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {createEventTargetPrototype} from './fake-async-event';
import {loadFakeGlobalAPI} from './fake-async-util';

export function loadFakeAsyncXHR(global: any) {
  const FakeXMLHttpRequest = function() {};
  const patchTargetMethods = ['send', 'abort', 'open'];
  (FakeXMLHttpRequest as any).UNSENT = 0;
  (FakeXMLHttpRequest as any).OPENED = 1;
  (FakeXMLHttpRequest as any).HEADERS_RECEIVED = 2;
  (FakeXMLHttpRequest as any).LOADING = 3;
  (FakeXMLHttpRequest as any).DONE = 4;
  FakeXMLHttpRequest.prototype = createEventTargetPrototype([
                                   'onreadystatechange', 'onabort', 'onload', 'onloadstart',
                                   'onloadend', 'onprogress', 'ontimeout'
                                 ]) as any;

  FakeXMLHttpRequest.prototype.upload = Object.create(createEventTargetPrototype(
      ['onloadstart', 'onprogress', 'onabort', 'onload', 'onerror', 'ontimeout', 'onloadend']));


  FakeXMLHttpRequest.prototype.headers = {};
  FakeXMLHttpRequest.prototype.readyState = 0;

  FakeXMLHttpRequest.prototype.open = function(method: string, url: string, async = true) {
    this.url = url;
    this.async = async;
    this.readState = 1;
  };

  FakeXMLHttpRequest.prototype.send = function(body: any) {
    const xhr = this;
    xhr.body = body;
    const task =
        Zone.current.scheduleMacroTask('XMLHttpRequest.send', () => {}, xhr, () => {}, () => {});
    xhr[Zone.__symbol__('xhrTask')] = task;
  };

  FakeXMLHttpRequest.prototype.done = function() {
    const task: Task = this[Zone.__symbol__('xhrTask')];
    task && task.invoke();
  };

  FakeXMLHttpRequest.prototype.abort = function() {
    const task: Task = this[Zone.__symbol__('xhrTask')];
    task && task.zone.cancelTask(task);
    this.readState = 0;
    this.triggerEvent('abort');
  };

  FakeXMLHttpRequest.prototype.setRequestHeader = function(header: string, value: string) {
    this.headers[header] = value;
  };

  FakeXMLHttpRequest.prototype.overrideMimeType = function() {};

  FakeXMLHttpRequest.prototype.getResponseHeader = function(name: string) {
    return this.headers[name];
  };

  FakeXMLHttpRequest.prototype.getAllResponseHeaders = function() {
    return Object.keys(this.herders)
        .map(key => ({key, value: this.headers[key]}))
        .reduce((acc: string, curr: {key: string, value: string}) => {
          return `${acc}\r\n${curr.key}: ${curr.value}`;
        }, '');
  };

  const loader = loadFakeGlobalAPI(global, 'XMLHttpRequest', FakeXMLHttpRequest);

  function fakeXHR(api: _ZonePrivate) {
    loader.fakeGlobalAPI(() => {
      api.patchXHR(global);
    });
  }

  function restoreXHR() {
    loader.restoreGlobalAPI(patchTargetMethods);
  }
  return {fakeXHR, restoreXHR};
}

export const supportedSources = ['XMLHttpRequest.send'];
