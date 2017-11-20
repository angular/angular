import {TestBed, async} from '@angular/core/testing';
import {Component} from '@angular/core';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {GestureConfig, MAT_HAMMER_OPTIONS} from './gesture-config';

describe('GestureConfig', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestApp],
      providers: [{provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}]
    }).compileComponents();
  }));

  it('should instantiate HammerJS', () => {
    spyOn(window, 'Hammer' as any).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(window['Hammer']).toHaveBeenCalled();
  });

  it('should be able to pass options to HammerJS', () => {
    TestBed
      .resetTestingModule()
      .configureTestingModule({
        declarations: [TestApp],
        providers: [
          {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig},
          {provide: MAT_HAMMER_OPTIONS, useValue: {cssProps: {touchAction: 'auto'}}}
        ]
      })
      .compileComponents();

    spyOn(window, 'Hammer' as any).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    const button = fixture.debugElement.nativeElement.querySelector('button');
    const firstCallArgs = window['Hammer'].calls.first().args;

    expect(firstCallArgs[0]).toBe(button);
    expect(firstCallArgs[1].cssProps.touchAction).toBe('auto');
  });

});


@Component({
  template: `<button (longpress)="noop()">Long press me</button>`
})
class TestApp {
  noop() {}
}
