// #docregion import
import { Injectable, Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { FileUploadService } from './file-upload.service';
// #enddocregion import

// #docregion v1
@Component({
  selector: 'file-upload',
  template: `<input type="file" (change)="upload($event.target.files)" />`
})
export class FileUploadComponent {
  @Input()
  control: FormControl;

  constructor(
    private readonly fileUploadService: FileUploadService
  ) { }

  upload(files: FileList) {
    this.control.setValue(null);
    this.fileUploadService.upload(files)
      .subscribe(response => this.control.setValue(response.url));
  }
}
// #enddocregion v1
