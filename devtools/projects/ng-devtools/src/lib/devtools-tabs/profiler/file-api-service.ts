/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

import {toISO8601Compact} from '../../vendor/chromium/date-utilities';

@Injectable({
  providedIn: 'root',
})
export class FileApiService {
  uploadedData: Subject<any> = new Subject();

  publishFileUpload(parentEvent: InputEvent): void {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        this.uploadedData.next(JSON.parse((event.target as any).result));
      } catch (e) {
        this.uploadedData.next({error: e});
      }
      (parentEvent.target as any).value = '';
    };
    reader.readAsText((parentEvent.target as any).files[0]);
  }

  saveObjectAsJSON(object: object): void {
    const downloadLink = document.createElement('a');
    downloadLink.download = `NgDevTools-Profile-${toISO8601Compact(new Date())}.json`;
    downloadLink.href =
        URL.createObjectURL(new Blob([JSON.stringify(object)], {type: 'application/json'}));
    downloadLink.click();
    setTimeout(() => URL.revokeObjectURL(downloadLink.href));
  }
}
