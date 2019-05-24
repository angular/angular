import { Component, AfterViewInit, ViewChild } from '@angular/core';

@Component({
  selector: 'sample-canvas',
  template: '<canvas #sampleCanvas width="200" height="200"></canvas>'
})
export class CanvasComponent implements AfterViewInit {
  blobSize: number;
  @ViewChild('sampleCanvas') sampleCanvas;

  constructor() { }

  ngAfterViewInit() {
    const canvas = this.sampleCanvas.nativeElement;
    const context = canvas.getContext('2d');
    if (context) {
      context.clearRect(0, 0, 200, 200);
      context.fillStyle = '#FF1122';
      context.fillRect(0, 0, 200, 200);
      canvas.toBlob((blob: any) => {
        this.blobSize = blob.size;
      });
    }
  }
}
