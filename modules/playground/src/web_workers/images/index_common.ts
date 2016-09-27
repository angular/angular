/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

import {FileReader, Uint8ArrayWrapper} from './file_api';
import {BitmapService} from './services/bitmap';


@Component({selector: 'image-demo', viewProviders: [BitmapService], templateUrl: 'image_demo.html'})
export class ImageDemo {
  images: any[] /** TODO #9100 */ = [];
  fileInput: String;

  constructor(private _bitmapService: BitmapService) {}

  uploadFiles(files: any /** TODO #9100 */) {
    for (var i = 0; i < files.length; i++) {
      var reader = new FileReader();
      reader.addEventListener('load', this.handleReaderLoad(reader));
      reader.readAsArrayBuffer(files[i]);
    }
  }

  handleReaderLoad(reader: FileReader): EventListener {
    return (e) => {
      var buffer = reader.result;
      this.images.push({
        src: this._bitmapService.arrayBufferToDataUri(Uint8ArrayWrapper.create(reader.result)),
        buffer: buffer,
        filtering: false
      });
    };
  }

  applyFilters() {
    for (var i = 0; i < this.images.length; i++) {
      this.images[i].filtering = true;

      setTimeout(this._filter(i), 0);
    }
  }

  private _filter(i: number): (...args: any[]) => void {
    return () => {
      var imageData = this._bitmapService.convertToImageData(this.images[i].buffer);
      imageData = this._bitmapService.applySepia(imageData);
      this.images[i].src = this._bitmapService.toDataUri(imageData);
      this.images[i].filtering = false;
    };
  }
}
