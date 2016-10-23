/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

import {BitmapService} from './services/bitmap';


@Component({selector: 'image-demo', viewProviders: [BitmapService], templateUrl: 'image_demo.html'})
export class ImageDemo {
  images: {src: string, buffer: ArrayBuffer, filtering: boolean}[] = [];
  fileInput: String;

  constructor(private _bitmapService: BitmapService) {}

  uploadFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.addEventListener('load', this.handleReaderLoad(reader));
      reader.readAsArrayBuffer(files[i]);
    }
  }

  handleReaderLoad(reader: FileReader): EventListener {
    return (e) => {
      const buffer = reader.result as ArrayBuffer;
      this.images.push({
        src: this._bitmapService.arrayBufferToDataUri(new Uint8Array(buffer)),
        buffer: buffer,
        filtering: false
      });
    };
  }

  applyFilters() {
    for (let i = 0; i < this.images.length; i++) {
      this.images[i].filtering = true;

      setTimeout(this._filter(i), 0);
    }
  }

  private _filter(i: number): () => void {
    return () => {
      let imageData = this._bitmapService.convertToImageData(this.images[i].buffer);
      imageData = this._bitmapService.applySepia(imageData);
      this.images[i].src = this._bitmapService.toDataUri(imageData);
      this.images[i].filtering = false;
    };
  }
}
