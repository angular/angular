/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ResourceLoader} from '@angular/compiler';

/**
 * A mock implementation of {@link ResourceLoader} that allows outgoing requests to be mocked
 * and responded to within a single test, without going to the network.
 */
export class MockResourceLoader extends ResourceLoader {
  private _expectations: _Expectation[] = [];
  private _definitions = new Map<string, string>();
  private _requests: _PendingRequest[] = [];

  override get(url: string): Promise<string> {
    const request = new _PendingRequest(url);
    this._requests.push(request);
    return request.getPromise();
  }

  hasPendingRequests() {
    return !!this._requests.length;
  }

  /**
   * Add an expectation for the given URL. Incoming requests will be checked against
   * the next expectation (in FIFO order). The `verifyNoOutstandingExpectations` method
   * can be used to check if any expectations have not yet been met.
   *
   * The response given will be returned if the expectation matches.
   */
  expect(url: string, response: string) {
    const expectation = new _Expectation(url, response);
    this._expectations.push(expectation);
  }

  /**
   * Add a definition for the given URL to return the given response. Unlike expectations,
   * definitions have no order and will satisfy any matching request at any time. Also
   * unlike expectations, unused definitions do not cause `verifyNoOutstandingExpectations`
   * to return an error.
   */
  when(url: string, response: string) {
    this._definitions.set(url, response);
  }

  /**
   * Process pending requests and verify there are no outstanding expectations. Also fails
   * if no requests are pending.
   */
  flush() {
    if (this._requests.length === 0) {
      throw new Error('No pending requests to flush');
    }

    do {
      this._processRequest(this._requests.shift()!);
    } while (this._requests.length > 0);

    this.verifyNoOutstandingExpectations();
  }

  /**
   * Throw an exception if any expectations have not been satisfied.
   */
  verifyNoOutstandingExpectations() {
    if (this._expectations.length === 0) return;

    const urls: string[] = [];
    for (let i = 0; i < this._expectations.length; i++) {
      const expectation = this._expectations[i];
      urls.push(expectation.url);
    }

    throw new Error(`Unsatisfied requests: ${urls.join(', ')}`);
  }

  private _processRequest(request: _PendingRequest) {
    const url = request.url;

    if (this._expectations.length > 0) {
      const expectation = this._expectations[0];
      if (expectation.url == url) {
        remove(this._expectations, expectation);
        request.complete(expectation.response);
        return;
      }
    }

    if (this._definitions.has(url)) {
      const response = this._definitions.get(url);
      request.complete(response == null ? null : response);
      return;
    }

    throw new Error(`Unexpected request ${url}`);
  }
}

class _PendingRequest {
  // Using non null assertion, these fields are defined below
  // within the `new Promise` callback (synchronously).
  resolve!: (result: string) => void;
  reject!: (error: any) => void;
  promise: Promise<string>;

  constructor(public url: string) {
    this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }

  complete(response: string | null) {
    if (response == null) {
      this.reject(`Failed to load ${this.url}`);
    } else {
      this.resolve(response);
    }
  }

  getPromise(): Promise<string> {
    return this.promise;
  }
}

class _Expectation {
  url: string;
  response: string;
  constructor(url: string, response: string) {
    this.url = url;
    this.response = response;
  }
}

function remove<T>(list: T[], el: T): void {
  const index = list.indexOf(el);
  if (index > -1) {
    list.splice(index, 1);
  }
}
