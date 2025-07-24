/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {DocContent, DocsContentLoader} from '@angular/docs';
import {firstValueFrom} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable()
export class ContentLoader implements DocsContentLoader {
  private readonly cache = new Map<string, Promise<DocContent>>();
  private readonly httpClient = inject(HttpClient);

  async getContent(path: string): Promise<DocContent> {
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
      const errorResponse = e as HttpErrorResponse;
      if (!(e instanceof HttpErrorResponse) || errorResponse.status !== 404) {
        // assume 404 errors are permanent but don't cache others that may be temporary
        this.cache.delete(path);
      }
      throw e;
    }
  }
}
