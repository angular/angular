/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export function loadFakeAsyncFetch(global: any) {
  let originalFetch = global['fetch'];
  let originalResponse = global['Response'];
  const FakeFetch: any = function(req: RequestInfo, options?: RequestInit) {
    const data: any = {};
    data.req = req;
    data.options = options;
    return new Promise((res, rej) => {
      const task = Zone.current.scheduleMacroTask('fetch', () => {
        if (data.response) {
          res(data.response);
        } else {
          rej(data.error || new Error('No valid response!'));
        }
      }, data, () => {}, () => {});
      data.done = () => {
        task.invoke();
      };
    });
  };

  const FakeResponse = function(this: any, body: string, init?: ResponseInit) {
    this.body = body;
    this.headers = init && init.headers;
    this.status = init && init.status;
    this.statusText = init && init.statusText;
  };

  FakeResponse.prototype.json = function() {
    const json = (JSON.parse as any)(this.body);
    return Promise.resolve(json);
  };

  FakeResponse.prototype.text = function() {
    return Promise.resolve(this.body);
  };

  function fakeFetch() {
    originalFetch = global['fetch'];
    global['fetch'] = FakeFetch;
    global['Response'] = FakeResponse;
  }

  function restoreFetch() {
    global['fetch'] = originalFetch;
    global['Response'] = originalResponse;
  }

  return {fakeFetch, restoreFetch};
}

export const supportedSources = ['fetch'];
