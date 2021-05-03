// #docplaster
// #docregion import-canvas-patch
// Import patch to make async `HTMLCanvasElement` methods (such as `.toBlob()`) Zone.js-aware.
// Either import in `polyfills.ts` (if used in more than one places in the app) or in the component
// file using `HTMLCanvasElement` (if it is only used in a single file).
import 'zone.js/plugins/zone-patch-canvas';
// #enddocregion import-canvas-patch
// #docregion main
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'sample-canvas',
  template: '<canvas #sampleCanvas width="200" height="200"></canvas>',
})
export class CanvasComponent implements AfterViewInit {
  blobSize = 0;
  @ViewChild('sampleCanvas') sampleCanvas: ElementRef;

  ngAfterViewInit() {
    const canvas: HTMLCanvasElement = this.sampleCanvas.nativeElement;
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, 200, 200);
    context.fillStyle = '#FF1122';
    context.fillRect(0, 0, 200, 200);

    canvas.toBlob(blob => {
      this.blobSize = blob.size;
    });
  }
}
// #enddocregion main
