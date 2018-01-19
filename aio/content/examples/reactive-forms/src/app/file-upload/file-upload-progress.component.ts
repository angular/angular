// #docregion import
import { Injectable, Component, Input } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { FileUploadService } from './file-upload.service';
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
    private readonly fileUploadService: FileUploadService
  ) { }

  upload(files: FileList) {
    this.control.setValue(null);

    this.fileUploadService.uploadWithProgress(files)
      .subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progress = this.fileUploadService.calculateProgressPercent(event);
        } else if (event instanceof HttpResponse) {
          this.control.setValue(event.body.url);
        }
      });
  }
}
// #enddocregion v1
