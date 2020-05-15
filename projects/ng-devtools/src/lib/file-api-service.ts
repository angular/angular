import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { saveAs } from './vendor/filesaver';

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
    saveAs(blob, `${Date.now()}.json`);
  }
}
