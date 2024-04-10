/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {DocContent, DocsContentLoader} from '@angular/docs';
import {Router} from '@angular/router';
import {firstValueFrom} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable()
export class ContentLoader implements DocsContentLoader {
  private readonly cache = new Map<string, Promise<DocContent | undefined>>();
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);

  async getContent(path: string): Promise<DocContent | undefined> {
    // If the path does not end with a file extension, add `.md.html` as the default
    if (!path.match(/\.\w+$/)) {
      path += '.md.html';
    }
    if (!this.cache.has(path)) {
      try {
        this.cache.set(
          path,
          firstValueFrom(
            this.httpClient
              .get(`assets/content/${path}`, {
                responseType: 'text',
              })
              .pipe(map((contents) => ({contents, id: path}))),
          ),
        );
      } catch {
        this.router.navigateByUrl('/404');
      }
    }
    return this.cache.get(path)!;
  }
}
