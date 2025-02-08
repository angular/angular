/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ResourceLoader} from '@angular/compiler';
import {Injectable} from '@angular/core';

@Injectable()
export class ResourceLoaderImpl extends ResourceLoader {
  override get(url: string): Promise<string> {
    let resolve: (result: any) => void;
    let reject: (error: any) => void;
    const promise = new Promise<string>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'text';

    xhr.onload = function () {
      const response = xhr.response;

      let status = xhr.status;

      // fix status code when it is 0 (0 status is undocumented).
      // Occurs when accessing file resources or on Android 4.1 stock browser
      // while retrieving files from application cache.
      if (status === 0) {
        status = response ? 200 : 0;
      }

      if (200 <= status && status <= 300) {
        resolve(response);
      } else {
        reject(`Failed to load ${url}`);
      }
    };

    xhr.onerror = function () {
      reject(`Failed to load ${url}`);
    };

    xhr.send();
    return promise;
  }
}
