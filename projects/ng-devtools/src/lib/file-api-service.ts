import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { saveAs } from './vendor/filesaver';
import { toISO8601Compact } from './vendor/chromium/date-utilities';

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
        this.uploadedData.next({ error: e });
      }
      (parentEvent.target as any).value = '';
    };
    reader.readAsText((parentEvent.target as any).files[0]);
  }

  saveObjectAsJSON(object: object): void {
    const blob = new Blob([JSON.stringify(object)], { type: 'application/json' });
    saveAs(blob, `NgDevTools-Profile-${toISO8601Compact(new Date())}.json`);
  }
}
