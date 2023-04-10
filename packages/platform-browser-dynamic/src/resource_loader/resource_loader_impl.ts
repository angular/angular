/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ResourceLoader} from '@angular/compiler';
import {Injectable} from '@angular/core';


@Injectable()
export class ResourceLoaderImpl extends ResourceLoader {
  override get(url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'text';

      xhr.onload = () => {
        // responseText is the old-school way of retrieving response (supported by IE8 & 9)
        // response/responseType properties were introduced in ResourceLoader Level2 spec (supported
        // by IE10)
        const response = xhr.response || xhr.responseText;

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

      xhr.onerror = () => {
        reject(`Failed to load ${url}`);
      };

      xhr.send();
    });
  }
}
