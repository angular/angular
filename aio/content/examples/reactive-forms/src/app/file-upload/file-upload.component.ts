// #docregion import
import { Injectable, Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
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
    private readonly httpClient: HttpClient
  ) { }

  upload(files: FileList) {
    this.control.setValue(null);

    const formData = new FormData();
    Array.from(files).forEach(file => formData.append(file.name, file))

    this.httpClient.post<{ url: string }>('/file-upload', files)
      .subscribe(response => {
        this.control.setValue(response.url)
      });
  }
}
// #enddocregion v1
