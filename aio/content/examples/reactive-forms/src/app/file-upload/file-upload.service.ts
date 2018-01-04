// #docregion import
import { Injectable } from '@angular/core';
import { HttpClient, HttpProgressEvent } from '@angular/common/http';
// #enddocregion import


@Injectable()
export class FileUploadService {

  constructor(
    private readonly httpClient: HttpClient
  ) { }

  // #docregion v1
  upload(files: FileList){
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append(file.name, file))

    return this.httpClient.post<{ url: string }>('/file-upload', files)
  }
  // #enddocregion v1

  // #docregion v2
  uploadWithProgress(files: FileList){
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append(file.name, file))

    return this.httpClient.post<{ url: string }>('/file-upload', formData, { reportProgress: true, observe: 'events' })
  }

  calculateProgressPercent(event: HttpProgressEvent){
    return Math.round(100 * event.loaded / event.total);
  }
  // #enddocregion v2
}

