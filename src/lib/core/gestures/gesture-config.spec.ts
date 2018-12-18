import {TestBed, async} from '@angular/core/testing';
import {Component} from '@angular/core';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {GestureConfig, MAT_HAMMER_OPTIONS} from './gesture-config';

describe('GestureConfig', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ButtonWithLongpressHander],
      providers: [{provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}]
    }).compileComponents();
  }));

  it('should instantiate HammerJS', () => {
    spyOn(window, 'Hammer' as any).and.callThrough();

    const fixture = TestBed.createComponent(ButtonWithLongpressHander);
    fixture.detectChanges();

    expect((window as any).Hammer).toHaveBeenCalled();
  });

  it('should be able to pass options to HammerJS', () => {
    TestBed
      .resetTestingModule()
      .configureTestingModule({
        declarations: [ButtonWithLongpressHander],
        providers: [
          {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig},
          {provide: MAT_HAMMER_OPTIONS, useValue: {cssProps: {touchAction: 'auto'}}}
        ]
      })
      .compileComponents();

    spyOn(window, 'Hammer' as any).and.callThrough();

    const fixture = TestBed.createComponent(ButtonWithLongpressHander);
    fixture.detectChanges();

    const button = fixture.debugElement.nativeElement.querySelector('button');
    const firstCallArgs = (window as any).Hammer.calls.first().args;

    expect(firstCallArgs[0]).toBe(button);
    expect(firstCallArgs[1].cssProps.touchAction).toBe('auto');
  });

  it('should not error when HammerJS is not loaded', () => {
    // Remove the Hammer global from the environment, storing it to restore at the end of the test.
    const hammerGlobal = (window as any).Hammer;
    (window as any).Hammer = undefined;

    // Stub out `console.warn` so the warnings don't pollute our logs.
    spyOn(console, 'warn');

    TestBed
      .resetTestingModule()
      .configureTestingModule({
        declarations: [ButtonWithLongpressHander],
        providers: [{provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}],
      }).compileComponents();

    const fixture = TestBed.createComponent(ButtonWithLongpressHander);
    fixture.detectChanges();

    // No assertions here; the absense of errors satisfies this test.

    // Restore the global Hammer.
    (window as any).Hammer = hammerGlobal;
  });

  // TODO(jelbourn): add a test for use of HAMMER_LOADER when we can depend on Angular 6.1+.

});


@Component({
  template: `<button (longpress)="noop()">Long press me</button>`
})
class ButtonWithLongpressHander {
  noop() {}
}
