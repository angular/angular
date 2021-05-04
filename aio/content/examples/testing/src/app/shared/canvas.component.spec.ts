// #docplaster
// #docregion without-toBlob-macrotask
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { CanvasComponent } from './canvas.component';

describe('CanvasComponent', () => {
  // #enddocregion without-toBlob-macrotask
  // #docregion enable-toBlob-macrotask
  beforeEach(() => {
    (window as any).__zone_symbol__FakeAsyncTestMacroTask = [
      {
        source: 'HTMLCanvasElement.toBlob',
        callbackArgs: [{size: 200}],
      },
    ];
  });
  // #enddocregion enable-toBlob-macrotask
  // #docregion without-toBlob-macrotask
  beforeEach(async () => {
    await TestBed
        .configureTestingModule({
          declarations: [CanvasComponent],
        })
        .compileComponents();
  });

  it('should be able to generate blob data from canvas', fakeAsync(() => {
       const fixture = TestBed.createComponent(CanvasComponent);
       const canvasComp = fixture.componentInstance;

       fixture.detectChanges();
       expect(canvasComp.blobSize).toBe(0);

       tick();
       expect(canvasComp.blobSize).toBeGreaterThan(0);
     }));
});
// #enddocregion without-toBlob-macrotask
