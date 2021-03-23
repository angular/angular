/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {XhrFactory} from '@angular/common';
import {HttpHeaders} from '@angular/common/http/src/headers';

export class MockXhrFactory implements XhrFactory {
  // TODO(issue/24571): remove '!'.
  mock!: MockXMLHttpRequest;

  build(): XMLHttpRequest {
    return (this.mock = new MockXMLHttpRequest()) as any;
  }
}

export class MockXMLHttpRequestUpload {
  constructor(private mock: MockXMLHttpRequest) {}

  addEventListener(event: 'progress', handler: Function) {
    this.mock.addEventListener('uploadProgress', handler);
  }

  removeEventListener(event: 'progress', handler: Function) {
    this.mock.removeEventListener('uploadProgress');
  }
}

export class MockXMLHttpRequest {
  // Set by method calls.
  body: any;
  // TODO(issue/24571): remove '!'.
  method!: string;
  // TODO(issue/24571): remove '!'.
  url!: string;
  mockHeaders: {[key: string]: string} = {};
  mockAborted: boolean = false;

  // Directly settable interface.
  withCredentials: boolean = false;
  responseType: string = 'text';

  // Mocked response interface.
  response: any|undefined = undefined;
  responseText: string|undefined = undefined;
  responseURL: string|null = null;
  status: number = 0;
  statusText: string = '';
  mockResponseHeaders: string = '';

  listeners: {
    error?: (event: ErrorEvent) => void,
    timeout?: (event: ErrorEvent) => void,
    abort?: () => void,
    load?: () => void,
    progress?: (event: ProgressEvent) => void,
    uploadProgress?: (event: ProgressEvent) => void,
  } = {};

  upload = new MockXMLHttpRequestUpload(this);

  open(method: string, url: string): void {
    this.method = method;
    this.url = url;
  }

  send(body: any): void {
    this.body = body;
  }

  addEventListener(
      event: 'error'|'timeout'|'load'|'progress'|'uploadProgress'|'abort',
      handler: Function): void {
    this.listeners[event] = handler as any;
  }

  removeEventListener(event: 'error'|'timeout'|'load'|'progress'|'uploadProgress'|'abort'): void {
    delete this.listeners[event];
  }

  setRequestHeader(name: string, value: string): void {
    this.mockHeaders[name] = value;
  }

  getAllResponseHeaders(): string {
    return this.mockResponseHeaders;
  }

  getResponseHeader(header: string): string|null {
    return new HttpHeaders(this.mockResponseHeaders).get(header);
  }

  mockFlush(status: number, statusText: string, body?: string) {
    if (typeof body === 'string') {
      this.responseText = body;
    } else {
      this.response = body;
    }
    this.status = status;
    this.statusText = statusText;
    this.mockLoadEvent();
  }

  mockDownloadProgressEvent(loaded: number, total?: number): void {
    if (this.listeners.progress) {
      this.listeners.progress({lengthComputable: total !== undefined, loaded, total} as any);
    }
  }

  mockUploadProgressEvent(loaded: number, total?: number) {
    if (this.listeners.uploadProgress) {
      this.listeners.uploadProgress({
        lengthComputable: total !== undefined,
        loaded,
        total,
      } as any);
    }
  }

  mockLoadEvent(): void {
    if (this.listeners.load) {
      this.listeners.load();
    }
  }

  mockErrorEvent(error: any): void {
    if (this.listeners.error) {
      this.listeners.error(error);
    }
  }

  mockTimeoutEvent(error: any): void {
    if (this.listeners.timeout) {
      this.listeners.timeout(error);
    }
  }

  mockAbortEvent(): void {
    if (this.listeners.abort) {
      this.listeners.abort();
    }
  }

  abort() {
    this.mockAborted = true;
  }
}
