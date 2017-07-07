/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgSwAdapter} from './adapter';

/**
 * @experimental
 */
export class NgSwFetch {
  constructor(private scope: ServiceWorkerGlobalScope, private adapter: NgSwAdapter) {}

  private _request(req: Request): Promise<Response> {
    return this.scope.fetch(req).catch((err: any) => this.adapter.newResponse('', {status: 503}))
  }

  private _followRedirectIfAny(resp: Response, limit: number, origUrl: string): Response
      |Promise<Response> {
    if (!!(resp as any)['redirected']) {
      if (limit <= 0) {
        return Promise.reject(`Hit redirect limit when attempting to fetch ${origUrl}.`);
      }
      if (!resp.url) {
        return resp;
      }
      return this._request(this.adapter.newRequest(resp.url))
          .then(newResp => this._followRedirectIfAny(newResp, limit - 1, origUrl));
    }
    return resp;
  }

  request(req: Request, redirectSafe: boolean = false): Promise<Response> {
    if (!redirectSafe) {
      return this._request(req);
    }
    return this._request(req).then(resp => this._followRedirectIfAny(resp, 3, req.url));
  }

  refresh(req: string|Request): Promise<Response> {
    let request: Request;
    if (typeof req == 'string') {
      request = this.adapter.newRequest(this._cacheBust(<string>req));
    } else {
      request = this.adapter.newRequest(this._cacheBust((<Request>req).url), <Request>req);
    }
    return this.request(request);
  }

  private _cacheBust(url: string): string {
    var bust = Math.random();
    if (url.indexOf('?') == -1) {
      return `${url}?ngsw-cache-bust=${bust}`;
    }
    return `${url}&ngsw-cache-bust=${bust}`;
  }
}
