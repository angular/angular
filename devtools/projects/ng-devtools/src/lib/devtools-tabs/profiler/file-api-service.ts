/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileApiService {
  uploadedData: Subject<any> = new Subject();

  publishFileUpload(parentEvent: Event): void {
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
    const isoString = new Date().toISOString().slice(0, -5); // remove milliseconds
    downloadLink.download = `NgDevTools-Profile-${isoString}.json`;
    downloadLink.href = URL.createObjectURL(
      new Blob([JSON.stringify(object)], {type: 'application/json'}),
    );
    downloadLink.click();
    setTimeout(() => URL.revokeObjectURL(downloadLink.href));
  }
}
