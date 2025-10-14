/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {map} from 'rxjs/operators';
let ContentLoader = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ContentLoader = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ContentLoader = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    cache = new Map();
    httpClient = inject(HttpClient);
    async getContent(path) {
      // If the path does not end with a file extension, add `.md.html` as the default
      if (!path.match(/\.\w+$/)) {
        path += '.md.html';
      }
      try {
        let promise = this.cache.get(path);
        if (!promise) {
          promise = firstValueFrom(
            this.httpClient
              .get(`assets/content/${path}`, {
                responseType: 'text',
              })
              .pipe(map((contents) => ({contents, id: path}))),
          );
          this.cache.set(path, promise);
        }
        return await promise;
      } catch (e) {
        const errorResponse = e;
        if (!(e instanceof HttpErrorResponse) || errorResponse.status !== 404) {
          // assume 404 errors are permanent but don't cache others that may be temporary
          this.cache.delete(path);
        }
        throw e;
      }
    }
  };
  return (ContentLoader = _classThis);
})();
export {ContentLoader};
//# sourceMappingURL=content-loader.service.js.map
