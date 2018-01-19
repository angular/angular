import { TestBed, async, tick, fakeAsync } from '@angular/core/testing';
import { CanvasComponent } from './canvas.component';
describe('CanvasComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CanvasComponent
      ],
    }).compileComponents();
  }));
  beforeEach(() => {
    window['__zone_symbol__FakeAsyncTestMacroTask'] = [
      {
        source: 'HTMLCanvasElement.toBlob',
        callbackArgs: [{ size: 200 }]
      }
    ];
  });
  it('should be able to generate blob data from canvas', fakeAsync(() => {
    const fixture = TestBed.createComponent(CanvasComponent);
    fixture.detectChanges();
    tick();
    const app = fixture.debugElement.componentInstance;
    expect(app.blobSize).toBeGreaterThan(0);
  }));
});

