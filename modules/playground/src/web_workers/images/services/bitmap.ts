/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {fromByteArray} from 'base64-js';

// This class is based on the Bitmap examples at:
// http://www.i-programmer.info/projects/36-web/6234-reading-a-bmp-file-in-javascript.html
// and http://www.worldwidewhat.net/2012/07/how-to-draw-bitmaps-using-javascript/
@Injectable()
export class BitmapService {
  convertToImageData(buffer: ArrayBuffer): ImageData {
    const bmp = this._getBMP(buffer);
    return this._BMPToImageData(bmp);
  }

  applySepia(imageData: ImageData): ImageData {
    const buffer = imageData.data;
    for (let i = 0; i < buffer.length; i += 4) {
      const r = buffer[i];
      const g = buffer[i + 1];
      const b = buffer[i + 2];
      buffer[i] = (r * .393) + (g * .769) + (b * .189);
      buffer[i + 1] = (r * .349) + (g * .686) + (b * .168);
      buffer[i + 2] = (r * .272) + (g * .534) + (b * .131);
    }
    return imageData;
  }

  toDataUri(imageData: ImageData): string {
    const header = this._createBMPHeader(imageData);
    imageData = this._imageDataToBMP(imageData);
    return 'data:image/bmp;base64,' + btoa(header) + fromByteArray(imageData.data);
  }

  // converts a .bmp file ArrayBuffer to a dataURI
  arrayBufferToDataUri(data: Uint8Array): string {
    return 'data:image/bmp;base64,' + fromByteArray(data);
  }

  // returns a UInt8Array in BMP order (starting from the bottom)
  private _imageDataToBMP(imageData: ImageData): ImageData {
    const width = imageData.width;
    const height = imageData.height;

    const data = imageData.data;
    for (let y = 0; y < height / 2; ++y) {
      let topIndex = y * width * 4;
      let bottomIndex = (height - y) * width * 4;
      for (let i = 0; i < width * 4; i++) {
        this._swap(data, topIndex, bottomIndex);
        topIndex++;
        bottomIndex++;
      }
    }

    return imageData;
  }

  private _swap(data: Uint8Array|Uint8ClampedArray|number[], index1: number, index2: number) {
    const temp = data[index1];
    data[index1] = data[index2];
    data[index2] = temp;
  }

  // Based on example from
  // http://www.worldwidewhat.net/2012/07/how-to-draw-bitmaps-using-javascript/
  private _createBMPHeader(imageData: ImageData): string {
    const numFileBytes = this._getLittleEndianHex(imageData.width * imageData.height);
    const w = this._getLittleEndianHex(imageData.width);
    const h = this._getLittleEndianHex(imageData.height);
    return 'BM' +             // Signature
        numFileBytes +        // size of the file (bytes)*
        '\x00\x00' +          // reserved
        '\x00\x00' +          // reserved
        '\x36\x00\x00\x00' +  // offset of where BMP data lives (54 bytes)
        '\x28\x00\x00\x00' +  // number of remaining bytes in header from here (40 bytes)
        w +                   // the width of the bitmap in pixels*
        h +                   // the height of the bitmap in pixels*
        '\x01\x00' +          // the number of color planes (1)
        '\x20\x00' +          // 32 bits / pixel
        '\x00\x00\x00\x00' +  // No compression (0)
        '\x00\x00\x00\x00' +  // size of the BMP data (bytes)*
        '\x13\x0B\x00\x00' +  // 2835 pixels/meter - horizontal resolution
        '\x13\x0B\x00\x00' +  // 2835 pixels/meter - the vertical resolution
        '\x00\x00\x00\x00' +  // Number of colors in the palette (keep 0 for 32-bit)
        '\x00\x00\x00\x00';   // 0 important colors (means all colors are important)
  }

  private _BMPToImageData(bmp: BitmapFile): ImageData {
    const width = bmp.infoHeader.biWidth;
    const height = bmp.infoHeader.biHeight;
    const imageData = new ImageData(width, height);

    const data = imageData.data;
    const bmpData = bmp.pixels;
    const stride = bmp.stride;

    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const index1 = (x + width * (height - y)) * 4;
        const index2 = x * 3 + stride * y;
        data[index1] = bmpData[index2 + 2];
        data[index1 + 1] = bmpData[index2 + 1];
        data[index1 + 2] = bmpData[index2];
        data[index1 + 3] = 255;
      }
    }
    return imageData;
  }

  private _getBMP(buffer: ArrayBuffer): BitmapFile {
    const datav = new DataView(buffer);
    const bitmap: BitmapFile = {
      fileHeader: {
        bfType: datav.getUint16(0, true),
        bfSize: datav.getUint32(2, true),
        bfReserved1: datav.getUint16(6, true),
        bfReserved2: datav.getUint16(8, true),
        bfOffBits: datav.getUint32(10, true),
      },
      infoHeader: {
        biSize: datav.getUint32(14, true),
        biWidth: datav.getUint32(18, true),
        biHeight: datav.getUint32(22, true),
        biPlanes: datav.getUint16(26, true),
        biBitCount: datav.getUint16(28, true),
        biCompression: datav.getUint32(30, true),
        biSizeImage: datav.getUint32(34, true),
        biXPelsPerMeter: datav.getUint32(38, true),
        biYPelsPerMeter: datav.getUint32(42, true),
        biClrUsed: datav.getUint32(46, true),
        biClrImportant: datav.getUint32(50, true)
      },
      stride: null,
      pixels: null
    };
    const start = bitmap.fileHeader.bfOffBits;
    bitmap.stride =
        Math.floor((bitmap.infoHeader.biBitCount * bitmap.infoHeader.biWidth + 31) / 32) * 4;
    bitmap.pixels = new Uint8Array(datav.buffer, start);
    return bitmap;
  }

  // Based on example from
  // http://www.worldwidewhat.net/2012/07/how-to-draw-bitmaps-using-javascript/
  private _getLittleEndianHex(value: number): string {
    const result: string[] = [];

    for (let bytes = 4; bytes > 0; bytes--) {
      result.push(String.fromCharCode(value & 255));
      value >>= 8;
    }

    return result.join('');
  }
}

interface BitmapFile {
  fileHeader: {
    bfType: number; bfSize: number; bfReserved1: number; bfReserved2: number; bfOffBits: number;
  };
  infoHeader: {
    biSize: number; biWidth: number; biHeight: number; biPlanes: number; biBitCount: number;
    biCompression: number;
    biSizeImage: number;
    biXPelsPerMeter: number;
    biYPelsPerMeter: number;
    biClrUsed: number;
    biClrImportant: number
  };
  stride: number;
  pixels: Uint8Array;
}
