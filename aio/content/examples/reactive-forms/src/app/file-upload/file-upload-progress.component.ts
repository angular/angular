// #docregion import
import { Injectable, Component, Input } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { FormControl } from '@angular/forms';
// #enddocregion import

// #docregion v1
@Component({
  selector: 'file-upload',
  template: `<input type="file" (change)="upload($event.target.files)" /> Progress: {{progress}}%`
})
export class FileUploadComponent {
  progress: number;

  @Input()
  control: FormControl;

  constructor(
    private readonly httpClient: HttpClient
  ) { }

  upload(files: FileList) {
    this.control.setValue(null);

    const formData = new FormData();
    Array.from(files).forEach(file => formData.append(file.name, file))

    this.httpClient.post<{ url: string }>('/file-upload', formData, { reportProgress: true, observe: 'events' })
      .subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round(100 * event.loaded / event.total);
        } else if (event instanceof HttpResponse) {
          this.control.setValue(event.body.url);
        }
      });
  }
}
// #enddocregion v1
