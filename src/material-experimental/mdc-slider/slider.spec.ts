import {BidiModule} from '@angular/cdk/bidi';
import {
  BACKSPACE,
  DOWN_ARROW,
  END,
  HOME,
  LEFT_ARROW,
  PAGE_DOWN,
  PAGE_UP,
  RIGHT_ARROW,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import {Platform} from '@angular/cdk/platform';
import {
  createKeyboardEvent,
  createMouseEvent,
  dispatchEvent,
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
} from '@angular/cdk/testing';
import {Component, DebugElement, Type, ViewChild} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {MatSlider, MatSliderModule} from './index';

describe('MatMdcSlider', () => {
  const platform = new Platform();

  function createComponent<T>(component: Type<T>): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [MatSliderModule, ReactiveFormsModule, FormsModule, BidiModule],
      declarations: [component],
    }).compileComponents();

    return TestBed.createComponent<T>(component);
  }

  describe('standard slider', () => {
    let fixture: ComponentFixture<StandardSlider>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MatSlider;

    beforeEach(() => {
      fixture = createComponent(StandardSlider);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.componentInstance;
    });

    it('should set the default values', () => {
      expect(sliderInstance.value).toBe(0);
      expect(sliderInstance.min).toBe(0);
      expect(sliderInstance.max).toBe(100);
    });

    it('should update the value on mousedown', () => {
      expect(sliderInstance.value).toBe(0);

      dispatchMousedownEventSequence(sliderNativeElement, 0.19);

      expect(sliderInstance.value).toBe(19);
    });

    // TODO(devversion): MDC slider updates values with right mouse button.
    // tslint:disable-next-line
    xit('should not update when pressing the right mouse button', () => {
      expect(sliderInstance.value).toBe(0);

      dispatchMousedownEventSequence(sliderNativeElement, 0.19, 1);

      expect(sliderInstance.value).toBe(0);
    });

    it('should update the value on a slide', () => {
      expect(sliderInstance.value).toBe(0);

      dispatchSlideEventSequence(sliderNativeElement, 0, 0.89);

      expect(sliderInstance.value).toBe(89);
    });

    it('should set the value as min when sliding before the track', () => {
      expect(sliderInstance.value).toBe(0);

      dispatchSlideEventSequence(sliderNativeElement, 0, -1.33);

      expect(sliderInstance.value).toBe(0);
    });

    it('should set the value as max when sliding past the track', () => {
      expect(sliderInstance.value).toBe(0);

      dispatchSlideEventSequence(sliderNativeElement, 0, 1.75);

      expect(sliderInstance.value).toBe(100);
    });

    it('should not change value without emitting a change event', () => {
      const onChangeSpy = jasmine.createSpy('slider onChange');

      sliderInstance.change.subscribe(onChangeSpy);
      sliderInstance.value = 50;
      fixture.detectChanges();

      dispatchSlideEventSequence(sliderNativeElement, 0, 0.1);

      expect(onChangeSpy).toHaveBeenCalledTimes(1);
    });

    it('should have aria-orientation horizontal', () => {
      expect(sliderNativeElement.getAttribute('aria-orientation')).toEqual('horizontal');
    });

    it('should slide to the max value when the steps do not divide evenly into it', () => {
      sliderInstance.min = 5;
      sliderInstance.max = 100;
      sliderInstance.step = 15;

      dispatchSlideEventSequence(sliderNativeElement, 0, 1);
      fixture.detectChanges();

      expect(sliderInstance.value).toBe(100);
    });

  });

  describe('disabled slider', () => {
    let fixture: ComponentFixture<StandardSlider>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MatSlider;

    beforeEach(() => {
      fixture = createComponent(DisabledSlider);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.componentInstance;
    });

    it('should be disabled', () => {
      expect(sliderInstance.disabled).toBeTruthy();
    });

    it('should not change the value on mousedown when disabled', () => {
      expect(sliderInstance.value).toBe(0);

      dispatchMousedownEventSequence(sliderNativeElement, 0.63);

      expect(sliderInstance.value).toBe(0);
    });

    it('should not change the value on slide when disabled', () => {
      expect(sliderInstance.value).toBe(0);

      dispatchSlideEventSequence(sliderNativeElement, 0, 0.5);

      expect(sliderInstance.value).toBe(0);
    });

    it('should not emit change when disabled', () => {
      const onChangeSpy = jasmine.createSpy('slider onChange');
      sliderInstance.change.subscribe(onChangeSpy);

      dispatchSlideEventSequence(sliderNativeElement, 0, 0.5);

      expect(onChangeSpy).toHaveBeenCalledTimes(0);
    });

    it('should not add the mat-slider-active class on mousedown when disabled', () => {
      expect(sliderNativeElement.classList).not.toContain('mat-slider-active');

      dispatchMousedownEventSequence(sliderNativeElement, 0.43);
      fixture.detectChanges();

      expect(sliderNativeElement.classList).not.toContain('mat-slider-active');
    });

    it('should disable tabbing to the slider', () => {
      expect(sliderNativeElement.hasAttribute('tabindex')).toBe(false);
      // The "tabIndex" property returns an incorrect value in Edge 17.
      // See: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/4365703/
      if (!platform.EDGE) {
        expect(sliderNativeElement.tabIndex).toBe(-1);
      }
    });
  });

  describe('slider with set min and max', () => {
    let fixture: ComponentFixture<SliderWithMinAndMax>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MatSlider;
    let thumbContainerEl: HTMLElement;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(SliderWithMinAndMax);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.injector.get<MatSlider>(MatSlider);
      thumbContainerEl = <HTMLElement>sliderNativeElement
          .querySelector('.mdc-slider__thumb-container');

      // Flush the "requestAnimationFrame" timer that performs the initial
      // rendering of the MDC slider.
      flushRequestAnimationFrame();
    }));

    it('should set the default values from the attributes', () => {
      expect(sliderInstance.value).toBe(4);
      expect(sliderInstance.min).toBe(4);
      expect(sliderInstance.max).toBe(6);
    });

    it('should set the correct value on mousedown', () => {
      dispatchMousedownEventSequence(sliderNativeElement, 0.09);
      fixture.detectChanges();

      // Computed by multiplying the difference between the min and the max by the percentage from
      // the mousedown and adding that to the minimum.
      let value = Math.round(4 + (0.09 * (6 - 4)));
      expect(sliderInstance.value).toBe(value);
    });

    it('should set the correct value on slide', () => {
      dispatchSlideEventSequence(sliderNativeElement, 0, 0.62);
      fixture.detectChanges();

      // Computed by multiplying the difference between the min and the max by the percentage from
      // the mousedown and adding that to the minimum.
      let value = Math.round(4 + (0.62 * (6 - 4)));
      expect(sliderInstance.value).toBe(value);
    });

    it('should snap the fill to the nearest value on mousedown', fakeAsync(() => {
      dispatchMousedownEventSequence(sliderNativeElement, 0.68);
      fixture.detectChanges();
      flushRequestAnimationFrame();

      // The closest snap is halfway on the slider.
      expect(thumbContainerEl.style.transform).toContain('translateX(50px)');
    }));

    it('should snap the fill to the nearest value on slide', fakeAsync(() => {
      dispatchSlideEventSequence(sliderNativeElement, 0, 0.74);
      fixture.detectChanges();
      flushRequestAnimationFrame();

      // The closest snap is at the halfway point on the slider.
      expect(thumbContainerEl.style.transform).toContain('translateX(50px)');
    }));
  });

  describe('slider with set value', () => {
    let fixture: ComponentFixture<SliderWithValue>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MatSlider;

    beforeEach(() => {
      fixture = createComponent(SliderWithValue);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.injector.get<MatSlider>(MatSlider);
    });

    it('should set the default value from the attribute', () => {
      expect(sliderInstance.value).toBe(26);
    });

    it('should set the correct value on mousedown', () => {
      dispatchMousedownEventSequence(sliderNativeElement, 0.92);
      fixture.detectChanges();

      // On a slider with default max and min the value should be approximately equal to the
      // percentage clicked. This should be the case regardless of what the original set value was.
      expect(sliderInstance.value).toBe(92);
    });

    it('should set the correct value on slide', () => {
      dispatchSlideEventSequence(sliderNativeElement, 0, 0.32);
      fixture.detectChanges();

      expect(sliderInstance.value).toBe(32);
    });
  });

  describe('slider with set step', () => {
    let fixture: ComponentFixture<SliderWithStep>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MatSlider;
    let thumbContainerEl: HTMLElement;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(SliderWithStep);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.injector.get<MatSlider>(MatSlider);
      thumbContainerEl = <HTMLElement>sliderNativeElement
          .querySelector('.mdc-slider__thumb-container');

      // Flush the "requestAnimationFrame" timer that performs the initial
      // rendering of the MDC slider.
      flushRequestAnimationFrame();
    }));

    it('should set the correct step value on mousedown', () => {
      expect(sliderInstance.value).toBe(0);

      dispatchMousedownEventSequence(sliderNativeElement, 0.13);
      fixture.detectChanges();

      expect(sliderInstance.value).toBe(25);
    });

    it('should set the correct step value on keydown', () => {
      expect(sliderInstance.value).toBe(0);

      dispatchKeyboardEvent(sliderNativeElement, 'keydown', UP_ARROW);
      fixture.detectChanges();

      expect(sliderInstance.value).toBe(25);
    });

    it('should snap the fill to a step on mousedown', fakeAsync(() => {
      dispatchMousedownEventSequence(sliderNativeElement, 0.66);
      fixture.detectChanges();
      flushRequestAnimationFrame();

      // The closest step is at 75% of the slider.
      expect(thumbContainerEl.style.transform).toContain('translateX(75px)');
    }));

    it('should set the correct step value on slide', () => {
      dispatchSlideEventSequence(sliderNativeElement, 0, 0.07);
      fixture.detectChanges();

      expect(sliderInstance.value).toBe(0);
    });

    it('should snap the thumb and fill to a step on slide', fakeAsync(() => {
      dispatchSlideEventSequence(sliderNativeElement, 0, 0.88);
      fixture.detectChanges();
      flushRequestAnimationFrame();

      // The closest snap is at the end of the slider.
      expect(thumbContainerEl.style.transform).toContain('translateX(100px)');
    }));

    it('should not add decimals to the value if it is a whole number', () => {
      fixture.componentInstance.step = 0.1;
      fixture.detectChanges();

      dispatchSlideEventSequence(sliderNativeElement, 0, 1);

      expect(sliderDebugElement.componentInstance.displayValue).toBe('100');
    });

    // TODO(devversion): MDC slider does not support decimal steps.
    // tslint:disable-next-line
    xit('should truncate long decimal values when using a decimal step and the arrow keys', () => {
      fixture.componentInstance.step = 0.1;
      fixture.detectChanges();

      for (let i = 0; i < 3; i++) {
        dispatchKeyboardEvent(sliderNativeElement, 'keydown', UP_ARROW);
      }

      expect(sliderInstance.value).toBe(0.3);
    });
  });

  describe('slider with set tick interval', () => {
    let fixture: ComponentFixture<SliderWithSetTickInterval>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let ticksContainerElement: HTMLElement;

    beforeEach(() => {
      fixture = createComponent(SliderWithSetTickInterval);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      ticksContainerElement =
        <HTMLElement>sliderNativeElement.querySelector('.mdc-slider__track-marker-container');
    });

    it('should set the correct tick separation', () => {
      const step = 3;
      const tickInterval = fixture.componentInstance.tickInterval;
      // Since the step value is set to "3", a slider with a maximum of 100 will have
      // (100/3) visual steps. Of those visual steps, only each 6th (tickInterval) visual
      // step will have a tick on the track. Resulting in ((100/3)/6) ticks on the track.
      const sizeOfTick = (100 / step) / tickInterval;
      // Similarly this equals to 18% of a 100px track as every 18th (3 * 6)
      // pixel will be a tick.
      const ticksPerTrackPercentage = (tickInterval * step);
      // iOS evaluates the "background" expression for the ticks to the exact number,
      // Firefox, Edge, Safari evaluate to a percentage value, and Chrome evaluates to
      // a rounded five-digit decimal number.
      const expectationRegex = new RegExp(
          `(${sizeOfTick}|${ticksPerTrackPercentage}%|${sizeOfTick.toFixed(5)})`);
      expect(ticksContainerElement.style.background)
        .toMatch(expectationRegex);
    });

    it('should be able to reset the tick interval after it has been set', () => {
      expect(sliderNativeElement.classList)
        .toContain('mat-slider-has-ticks', 'Expected element to have ticks initially.');

      fixture.componentInstance.tickInterval = 0;
      fixture.detectChanges();

      expect(sliderNativeElement.classList)
        .not.toContain('mat-slider-has-ticks', 'Expected element not to have ticks after reset.');
    });
  });

  describe('slider with thumb label', () => {
    let fixture: ComponentFixture<SliderWithThumbLabel>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MatSlider;
    let thumbLabelTextElement: Element;

    beforeEach(() => {
      fixture = createComponent(SliderWithThumbLabel);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.componentInstance;
      thumbLabelTextElement = sliderNativeElement.querySelector('.mdc-slider__pin-value-marker')!;
    });

    it('should add the thumb label class to the slider container', () => {
      expect(sliderNativeElement.classList).toContain('mat-slider-thumb-label-showing');
    });

    it('should update the thumb label text on mousedown', () => {
      expect(thumbLabelTextElement.textContent).toBe('0');

      dispatchMousedownEventSequence(sliderNativeElement, 0.13);
      fixture.detectChanges();

      // The thumb label text is set to the slider's value. These should always be the same.
      expect(thumbLabelTextElement.textContent).toBe('13');
    });

    it('should update the thumb label text on slide', () => {
      expect(thumbLabelTextElement.textContent).toBe('0');

      dispatchSlideEventSequence(sliderNativeElement, 0, 0.56);
      fixture.detectChanges();

      // The thumb label text is set to the slider's value. These should always be the same.
      expect(thumbLabelTextElement.textContent).toBe(`${sliderInstance.value}`);
    });
  });

  describe('slider with custom thumb label formatting', () => {
    let fixture: ComponentFixture<SliderWithCustomThumbLabelFormatting>;
    let sliderNativeElement: HTMLElement;
    let thumbLabelTextElement: Element;

    beforeEach(() => {
      fixture = createComponent(SliderWithCustomThumbLabelFormatting);
      fixture.detectChanges();

      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      thumbLabelTextElement = sliderNativeElement.querySelector('.mdc-slider__pin-value-marker')!;
    });

    it('should invoke the passed-in `displayWith` function with the value', () => {
      spyOn(fixture.componentInstance, 'displayWith').and.callThrough();

      dispatchMousedownEventSequence(sliderNativeElement, 0);
      fixture.detectChanges();

      expect(fixture.componentInstance.displayWith).toHaveBeenCalledWith(1);
    });

    // TODO(devversion): MDC does not refresh value pin if value changes programmatically.
    // tslint:disable-next-line
    xit('should format the thumb label based on the passed-in `displayWith` function if value ' +
        'is updated through binding', () => {
      fixture.componentInstance.value = 200000;
      fixture.detectChanges();

      expect(thumbLabelTextElement.textContent).toBe('200k');
    });

    it('should format the thumb label based on the passed-in `displayWith` function', () => {
      dispatchMousedownEventSequence(sliderNativeElement, 1);
      fixture.detectChanges();

      expect(thumbLabelTextElement.textContent).toBe('100k');
    });
  });

  describe('slider with value property binding', () => {
    let fixture: ComponentFixture<SliderWithOneWayBinding>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MatSlider;
    let testComponent: SliderWithOneWayBinding;
    let thumbContainerEl: HTMLElement;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(SliderWithOneWayBinding);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.injector.get<MatSlider>(MatSlider);
      thumbContainerEl = sliderNativeElement
          .querySelector('.mdc-slider__thumb-container') as HTMLElement;

      // Flush the "requestAnimationFrame" timer that performs the initial
      // rendering of the MDC slider.
      flushRequestAnimationFrame();
    }));

    it('should initialize based on bound value', () => {
      expect(sliderInstance.value).toBe(50);
      expect(thumbContainerEl.style.transform).toContain('translateX(50px)');
    });

    it('should update when bound value changes', fakeAsync(() => {
      testComponent.val = 75;
      fixture.detectChanges();
      flushRequestAnimationFrame();

      expect(sliderInstance.value).toBe(75);
      expect(thumbContainerEl.style.transform).toContain('translateX(75px)');
    }));
  });

  describe('slider with set min and max and a value smaller than min', () => {
    let fixture: ComponentFixture<SliderWithValueSmallerThanMin>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MatSlider;
    let thumbContainerEl: HTMLElement;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(SliderWithValueSmallerThanMin);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.componentInstance;
      thumbContainerEl = <HTMLElement>sliderNativeElement
        .querySelector('.mdc-slider__thumb-container');

      // Flush the "requestAnimationFrame" timer that performs the initial
      // rendering of the MDC slider.
      flushRequestAnimationFrame();
    }));

    it('should set the value smaller than the min value', () => {
      expect(sliderInstance.value).toBe(3);
      expect(sliderInstance.min).toBe(4);
      expect(sliderInstance.max).toBe(6);
    });

    it('should set the fill to the min value', () => {
      expect(thumbContainerEl.style.transform).toContain('translateX(0px)');
    });
  });

  describe('slider with set min and max and a value greater than max', () => {
    let fixture: ComponentFixture<SliderWithValueSmallerThanMin>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MatSlider;
    let thumbContainerEl: HTMLElement;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(SliderWithValueGreaterThanMax);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.componentInstance;
      thumbContainerEl = <HTMLElement>sliderNativeElement
        .querySelector('.mdc-slider__thumb-container');

      // Flush the "requestAnimationFrame" timer that performs the initial
      // rendering of the MDC slider.
      flushRequestAnimationFrame();
    }));

    it('should set the value greater than the max value', () => {
      expect(sliderInstance.value).toBe(7);
      expect(sliderInstance.min).toBe(4);
      expect(sliderInstance.max).toBe(6);
    });

    it('should set the fill to the max value', () => {
      expect(thumbContainerEl.style.transform).toContain('translateX(100px)');
    });
  });

  describe('slider with change handler', () => {
    let fixture: ComponentFixture<SliderWithChangeHandler>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let testComponent: SliderWithChangeHandler;

    beforeEach(() => {
      fixture = createComponent(SliderWithChangeHandler);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;
      spyOn(testComponent, 'onChange');
      spyOn(testComponent, 'onInput');

      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
    });

    it('should emit change on mousedown', () => {
      expect(testComponent.onChange).not.toHaveBeenCalled();

      dispatchMousedownEventSequence(sliderNativeElement, 0.2);
      fixture.detectChanges();

      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
    });

    it('should emit change on slide', () => {
      expect(testComponent.onChange).not.toHaveBeenCalled();

      dispatchSlideEventSequence(sliderNativeElement, 0, 0.4);
      fixture.detectChanges();

      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
    });

    // TODO(devversion): MDC slider always emits change event on mouseup (regardless of value)
    // Bug tracked with: https://github.com/material-components/material-components-web/issues/5018
    // tslint:disable-next-line
    xit('should not emit multiple changes for same value', () => {
      expect(testComponent.onChange).not.toHaveBeenCalled();

      dispatchMousedownEventSequence(sliderNativeElement, 0.6);
      dispatchSlideEventSequence(sliderNativeElement, 0.6, 0.6);
      fixture.detectChanges();

      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
    });

    it('should dispatch events when changing back to previously emitted value after ' +
      'programmatically setting value', () => {
      expect(testComponent.onChange).not.toHaveBeenCalled();
      expect(testComponent.onInput).not.toHaveBeenCalled();

      dispatchMousedownEventSequence(sliderNativeElement, 0.2);
      fixture.detectChanges();

      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
      expect(testComponent.onInput).toHaveBeenCalledTimes(1);

      testComponent.value = 0;
      fixture.detectChanges();

      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
      expect(testComponent.onInput).toHaveBeenCalledTimes(1);

      dispatchMousedownEventSequence(sliderNativeElement, 0.2);
      fixture.detectChanges();

      expect(testComponent.onChange).toHaveBeenCalledTimes(2);
      expect(testComponent.onInput).toHaveBeenCalledTimes(2);
    });
  });

  describe('slider with input event', () => {
    let fixture: ComponentFixture<SliderWithChangeHandler>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let testComponent: SliderWithChangeHandler;

    beforeEach(() => {
      fixture = createComponent(SliderWithChangeHandler);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;
      spyOn(testComponent, 'onInput');
      spyOn(testComponent, 'onChange');

      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
    });

    it('should emit an input event while sliding', () => {
      expect(testComponent.onChange).not.toHaveBeenCalled();

      dispatchSliderMouseEvent(sliderNativeElement, 'mousedown', 0);
      dispatchSliderMouseEvent(sliderNativeElement, 'mousemove', 0.5);
      dispatchSliderMouseEvent(sliderNativeElement, 'mousemove', 1);
      dispatchSliderMouseEvent(sliderNativeElement, 'mouseup', 1);

      fixture.detectChanges();

      // The input event should fire twice, because the slider changed two times.
      expect(testComponent.onInput).toHaveBeenCalledTimes(2);
      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
    });

    it('should emit an input event when clicking', () => {
      expect(testComponent.onChange).not.toHaveBeenCalled();

      dispatchMousedownEventSequence(sliderNativeElement, 0.75);
      fixture.detectChanges();

      // The `onInput` event should be emitted once due to a single click.
      expect(testComponent.onInput).toHaveBeenCalledTimes(1);
      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
    });

  });

  describe('slider with auto ticks', () => {
    let fixture: ComponentFixture<SliderWithAutoTickInterval>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let ticksContainerElement: HTMLElement;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(SliderWithAutoTickInterval);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      ticksContainerElement =
        <HTMLElement>sliderNativeElement.querySelector('.mdc-slider__track-marker-container');

      flushRequestAnimationFrame();
    }));

    it('should set the correct tick separation', () => {
      expect(ticksContainerElement.style.background).toContain('30px');
    });
  });

  describe('keyboard support', () => {
    let fixture: ComponentFixture<SliderWithChangeHandler>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let testComponent: SliderWithChangeHandler;
    let sliderInstance: MatSlider;

    beforeEach(() => {
      fixture = createComponent(SliderWithChangeHandler);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;
      spyOn(testComponent, 'onInput');
      spyOn(testComponent, 'onChange');

      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.injector.get<MatSlider>(MatSlider);
    });

    it('should increment slider by 1 on up arrow pressed', () => {
      expect(testComponent.onChange).not.toHaveBeenCalled();

      dispatchKeyboardEvent(sliderNativeElement, 'keydown', UP_ARROW);
      fixture.detectChanges();

      // The `onInput` event should be emitted once due to a single keyboard press.
      expect(testComponent.onInput).toHaveBeenCalledTimes(1);
      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
      expect(sliderInstance.value).toBe(1);
    });

    it('should increment slider by 1 on right arrow pressed', () => {
      expect(testComponent.onChange).not.toHaveBeenCalled();

      dispatchKeyboardEvent(sliderNativeElement, 'keydown', RIGHT_ARROW);
      fixture.detectChanges();

      // The `onInput` event should be emitted once due to a single keyboard press.
      expect(testComponent.onInput).toHaveBeenCalledTimes(1);
      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
      expect(sliderInstance.value).toBe(1);
    });

    it('should decrement slider by 1 on down arrow pressed', () => {
      fixture.componentInstance.value = 100;
      fixture.detectChanges();

      expect(testComponent.onChange).not.toHaveBeenCalled();

      dispatchKeyboardEvent(sliderNativeElement, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      // The `onInput` event should be emitted once due to a single keyboard press.
      expect(testComponent.onInput).toHaveBeenCalledTimes(1);
      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
      expect(sliderInstance.value).toBe(99);
    });

    it('should decrement slider by 1 on left arrow pressed', () => {
      fixture.componentInstance.value = 100;
      fixture.detectChanges();

      expect(testComponent.onChange).not.toHaveBeenCalled();

      dispatchKeyboardEvent(sliderNativeElement, 'keydown', LEFT_ARROW);
      fixture.detectChanges();

      // The `onInput` event should be emitted once due to a single keyboard press.
      expect(testComponent.onInput).toHaveBeenCalledTimes(1);
      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
      expect(sliderInstance.value).toBe(99);
    });

    // TODO(devversion): MDC increments the slider by "4" on page up. The standard
    // Material slider increments by "10".
    it('should increment slider by 4 on page up pressed', () => {
      expect(testComponent.onChange).not.toHaveBeenCalled();

      dispatchKeyboardEvent(sliderNativeElement, 'keydown', PAGE_UP);
      fixture.detectChanges();

      // The `onInput` event should be emitted once due to a single keyboard press.
      expect(testComponent.onInput).toHaveBeenCalledTimes(1);
      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
      expect(sliderInstance.value).toBe(4);
    });

    // TODO(devversion): MDC decrements the slider by "4" on page up. The standard
    // Material slider decrements by "10".
    it('should decrement slider by 4 on page down pressed', () => {
      fixture.componentInstance.value = 100;
      fixture.detectChanges();

      expect(testComponent.onChange).not.toHaveBeenCalled();

      dispatchKeyboardEvent(sliderNativeElement, 'keydown', PAGE_DOWN);
      fixture.detectChanges();

      // The `onInput` event should be emitted once due to a single keyboard press.
      expect(testComponent.onInput).toHaveBeenCalledTimes(1);
      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
      expect(sliderInstance.value).toBe(96);
    });

    it('should set slider to max on end pressed', () => {
      expect(testComponent.onChange).not.toHaveBeenCalled();

      dispatchKeyboardEvent(sliderNativeElement, 'keydown', END);
      fixture.detectChanges();

      // The `onInput` event should be emitted once due to a single keyboard press.
      expect(testComponent.onInput).toHaveBeenCalledTimes(1);
      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
      expect(sliderInstance.value).toBe(100);
    });

    it('should set slider to min on home pressed', () => {
      fixture.componentInstance.value = 100;
      fixture.detectChanges();

      expect(testComponent.onChange).not.toHaveBeenCalled();

      dispatchKeyboardEvent(sliderNativeElement, 'keydown', HOME);
      fixture.detectChanges();

      // The `onInput` event should be emitted once due to a single keyboard press.
      expect(testComponent.onInput).toHaveBeenCalledTimes(1);
      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
      expect(sliderInstance.value).toBe(0);
    });

    it(`should take no action for presses of keys it doesn't care about`, () => {
      fixture.componentInstance.value = 50;
      fixture.detectChanges();

      expect(testComponent.onChange).not.toHaveBeenCalled();

      dispatchKeyboardEvent(sliderNativeElement, 'keydown', BACKSPACE);
      fixture.detectChanges();

      // The `onInput` event should be emitted once due to a single keyboard press.
      expect(testComponent.onInput).not.toHaveBeenCalled();
      expect(testComponent.onChange).not.toHaveBeenCalled();
      expect(sliderInstance.value).toBe(50);
    });

    // TODO: MDC slider does not respect modifier keys.
    // tslint:disable-next-line
    xit('should ignore events modifier keys', () => {
      sliderInstance.value = 0;

      [
        UP_ARROW, DOWN_ARROW, RIGHT_ARROW,
        LEFT_ARROW, PAGE_DOWN, PAGE_UP, HOME, END
      ].forEach(key => {
        const event = createKeyboardEvent('keydown', key);
        Object.defineProperty(event, 'altKey', {get: () => true});
        dispatchEvent(sliderNativeElement, event);
        fixture.detectChanges();
        expect(event.defaultPrevented).toBe(false);
      });

      expect(testComponent.onInput).not.toHaveBeenCalled();
      expect(testComponent.onChange).not.toHaveBeenCalled();
      expect(sliderInstance.value).toBe(0);
    });
  });

  describe('slider with direction', () => {
    let fixture: ComponentFixture<SliderWithDir>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MatSlider;
    let testComponent: SliderWithDir;

    beforeEach(() => {
      fixture = createComponent(SliderWithDir);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;
      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.injector.get<MatSlider>(MatSlider);
      sliderNativeElement = sliderDebugElement.nativeElement;
    });

    it('works in RTL languages', fakeAsync(() => {
      testComponent.dir = 'rtl';
      fixture.detectChanges();
      flushRequestAnimationFrame();

      dispatchMousedownEventSequence(sliderNativeElement, 0.3);
      fixture.detectChanges();

      expect(sliderInstance.value).toBe(70);
    }));

    it('should re-render slider with updated style upon directionality change', fakeAsync(() => {
      testComponent.dir = 'rtl';
      fixture.detectChanges();
      flushRequestAnimationFrame();

      const thumbContainerEl = <HTMLElement>sliderNativeElement
          .querySelector('.mdc-slider__thumb-container');

      expect(thumbContainerEl.style.transform).toContain('translateX(100px)');

      testComponent.dir = 'ltr';
      fixture.detectChanges();
      flushRequestAnimationFrame();

      expect(thumbContainerEl.style.transform).toContain('translateX(0px)');
    }));

    it('should decrement RTL slider by 1 on right arrow pressed', () => {
      testComponent.dir = 'rtl';
      testComponent.value = 100;
      fixture.detectChanges();

      dispatchKeyboardEvent(sliderNativeElement, 'keydown', RIGHT_ARROW);
      fixture.detectChanges();

      expect(sliderInstance.value).toBe(99);
    });

    it('should increment RTL slider by 1 on left arrow pressed', () => {
      testComponent.dir = 'rtl';
      fixture.detectChanges();

      dispatchKeyboardEvent(sliderNativeElement, 'keydown', LEFT_ARROW);
      fixture.detectChanges();

      expect(sliderInstance.value).toBe(1);
    });
  });

  describe('tabindex', () => {

    it('should allow setting the tabIndex through binding', () => {
      const fixture = createComponent(SliderWithTabIndexBinding);
      fixture.detectChanges();

      const sliderNativeEl = fixture.debugElement.query(By.directive(MatSlider)).nativeElement;
      expect(sliderNativeEl.tabIndex).toBe(0, 'Expected the tabIndex to be set to 0 by default.');

      fixture.componentInstance.tabIndex = 3;
      fixture.detectChanges();

      expect(sliderNativeEl.tabIndex).toBe(3, 'Expected the tabIndex to have been changed.');
    });

    it('should detect the native tabindex attribute', () => {
      const fixture = createComponent(SliderWithNativeTabindexAttr);
      fixture.detectChanges();

      const slider = fixture.debugElement.query(By.directive(MatSlider)).componentInstance;

      expect(slider.tabIndex)
        .toBe(5, 'Expected the tabIndex to be set to the value of the native attribute.');
    });
  });

  describe('slider with ngModel', () => {
    let fixture: ComponentFixture<SliderWithNgModel>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let testComponent: SliderWithNgModel;

    beforeEach(() => {
      fixture = createComponent(SliderWithNgModel);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
    });

    it('should update the model on mousedown', () => {
      expect(testComponent.val).toBe(0);

      dispatchMousedownEventSequence(sliderNativeElement, 0.76);
      fixture.detectChanges();

      expect(testComponent.val).toBe(76);
    });

    it('should update the model on slide', () => {
      expect(testComponent.val).toBe(0);

      dispatchSlideEventSequence(sliderNativeElement, 0, 0.19);
      fixture.detectChanges();

      expect(testComponent.val).toBe(19);
    });

    it('should update the model on keydown', () => {
      expect(testComponent.val).toBe(0);

      dispatchKeyboardEvent(sliderNativeElement, 'keydown', UP_ARROW);
      fixture.detectChanges();

      expect(testComponent.val).toBe(1);
    });

    it('should be able to reset a slider by setting the model back to undefined', fakeAsync(() => {
      expect(testComponent.slider.value).toBe(0);

      testComponent.val = 5;
      fixture.detectChanges();
      flush();

      expect(testComponent.slider.value).toBe(5);

      testComponent.val = undefined;
      fixture.detectChanges();
      flush();

      expect(testComponent.slider.value).toBe(0);
    }));

  });

  describe('slider as a custom form control', () => {
    let fixture: ComponentFixture<SliderWithFormControl>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MatSlider;
    let testComponent: SliderWithFormControl;

    beforeEach(() => {
      fixture = createComponent(SliderWithFormControl);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.injector.get<MatSlider>(MatSlider);
    });

    it('should not update the control when the value is updated', () => {
      expect(testComponent.control.value).toBe(0);

      sliderInstance.value = 11;
      fixture.detectChanges();

      expect(testComponent.control.value).toBe(0);
    });

    it('should update the control on mousedown', () => {
      expect(testComponent.control.value).toBe(0);

      dispatchMousedownEventSequence(sliderNativeElement, 0.76);
      fixture.detectChanges();

      expect(testComponent.control.value).toBe(76);
    });

    it('should update the control on slide', () => {
      expect(testComponent.control.value).toBe(0);

      dispatchSlideEventSequence(sliderNativeElement, 0, 0.19);
      fixture.detectChanges();

      expect(testComponent.control.value).toBe(19);
    });

    it('should update the value when the control is set', () => {
      expect(sliderInstance.value).toBe(0);

      testComponent.control.setValue(7);
      fixture.detectChanges();

      expect(sliderInstance.value).toBe(7);
    });

    it('should update the disabled state when control is disabled', () => {
      expect(sliderInstance.disabled).toBe(false);

      testComponent.control.disable();
      fixture.detectChanges();

      expect(sliderInstance.disabled).toBe(true);
    });

    it('should update the disabled state when the control is enabled', () => {
      sliderInstance.disabled = true;

      testComponent.control.enable();
      fixture.detectChanges();

      expect(sliderInstance.disabled).toBe(false);
    });

    it('should have the correct control state initially and after interaction', () => {
      let sliderControl = testComponent.control;

      // The control should start off valid, pristine, and untouched.
      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(true);
      expect(sliderControl.touched).toBe(false);

      // After changing the value, the control should become dirty (not pristine),
      // but remain untouched.
      dispatchMousedownEventSequence(sliderNativeElement, 0.5);
      fixture.detectChanges();

      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(false);
      expect(sliderControl.touched).toBe(false);

      // If the control has been visited due to interaction, the control should remain
      // dirty and now also be touched.
      dispatchFakeEvent(sliderNativeElement, 'blur');
      fixture.detectChanges();

      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(false);
      expect(sliderControl.touched).toBe(true);
    });
  });

  describe('slider with a two-way binding', () => {
    let fixture: ComponentFixture<SliderWithTwoWayBinding>;
    let testComponent: SliderWithTwoWayBinding;
    let sliderNativeElement: HTMLElement;

    beforeEach(() => {
      fixture = createComponent(SliderWithTwoWayBinding);
      fixture.detectChanges();

      testComponent = fixture.componentInstance;
      let sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
    });

    it('should sync the value binding in both directions', () => {
      expect(testComponent.value).toBe(0);
      expect(testComponent.slider.value).toBe(0);

      dispatchMousedownEventSequence(sliderNativeElement, 0.1);
      dispatchMouseEvent(sliderNativeElement, 'mouseup');
      fixture.detectChanges();

      expect(testComponent.value).toBe(10);
      expect(testComponent.slider.value).toBe(10);

      testComponent.value = 20;
      fixture.detectChanges();

      expect(testComponent.value).toBe(20);
      expect(testComponent.slider.value).toBe(20);
    });
  });

});

function flushRequestAnimationFrame() {
  // Flush the "requestAnimationFrame" timer that performs the rendering of
  // the MDC slider. Zone uses 16ms for "requestAnimationFrame".
  tick(16);
}

// Disable animations and make the slider an even 100px, so that we get nice
// round values in tests.
const styles = `
  .mat-mdc-slider { min-width: 100px !important; }
`;

@Component({
  template: `<mat-slider></mat-slider>`,
  styles: [styles],
})
class StandardSlider { }

@Component({
  template: `<mat-slider disabled></mat-slider>`,
  styles: [styles],
})
class DisabledSlider { }

@Component({
  template: `<mat-slider [min]="min" [max]="max" tickInterval="6"></mat-slider>`,
  styles: [styles],
})
class SliderWithMinAndMax {
  min = 4;
  max = 6;
}

@Component({
  template: `<mat-slider value="26"></mat-slider>`,
  styles: [styles],
})
class SliderWithValue { }

@Component({
  template: `<mat-slider [step]="step" [max]="max"></mat-slider>`,
  styles: [styles],
})
class SliderWithStep {
  step = 25;
  max = 100;
}

@Component({
  template: `<mat-slider step="5" tickInterval="auto"></mat-slider>`,
  styles: [styles],
})
class SliderWithAutoTickInterval { }

@Component({
  template: `<mat-slider step="3" [tickInterval]="tickInterval"></mat-slider>`,
  styles: [styles],
})
class SliderWithSetTickInterval {
  tickInterval = 6;
}

@Component({
  template: `<mat-slider thumbLabel></mat-slider>`,
  styles: [styles],
})
class SliderWithThumbLabel { }


@Component({
  template: `<mat-slider min="1" max="100000" [value]="value"
                         [displayWith]="displayWith" thumbLabel></mat-slider>`,
  styles: [styles],
})
class SliderWithCustomThumbLabelFormatting {
  value = 0;

  displayWith(value: number | null) {
    if (!value) {
      return 0;
    }

    if (value >= 1000) {
      return (value / 1000) + 'k';
    }

    return value;
  }
}


@Component({
  template: `<mat-slider [value]="val"></mat-slider>`,
  styles: [styles],
})
class SliderWithOneWayBinding {
  val = 50;
}

@Component({
  template: `<mat-slider [formControl]="control"></mat-slider>`,
  styles: [styles],
})
class SliderWithFormControl {
  control = new FormControl(0);
}

@Component({
  template: `<mat-slider [(ngModel)]="val"></mat-slider>`,
  styles: [styles],
})
class SliderWithNgModel {
  @ViewChild(MatSlider, {static: false}) slider: MatSlider;
  val: number | undefined = 0;
}

@Component({
  template: `<mat-slider value="3" min="4" max="6"></mat-slider>`,
  styles: [styles],
})
class SliderWithValueSmallerThanMin { }

@Component({
  template: `<mat-slider value="7" min="4" max="6"></mat-slider>`,
  styles: [styles],
})
class SliderWithValueGreaterThanMax { }

@Component({
  template: `<mat-slider (change)="onChange($event)" [(value)]="value"
                         (input)="onInput($event)"></mat-slider>`,
  styles: [styles],
})
class SliderWithChangeHandler {
  value = 0;
  onChange() { }
  onInput() { }

  @ViewChild(MatSlider, {static: false}) slider: MatSlider;
}

@Component({
  template: `<div [dir]="dir"><mat-slider [value]="value" tickInterval="5"></mat-slider></div>`,
  styles: [styles],
})
class SliderWithDir {
  value = 0;
  dir = 'ltr';
}

@Component({
  template: `<mat-slider [tabIndex]="tabIndex"></mat-slider>`,
  styles: [styles],
})
class SliderWithTabIndexBinding {
  tabIndex: number;
}

@Component({
  template: `<mat-slider tabindex="5"></mat-slider>`,
  styles: [styles],
})
class SliderWithNativeTabindexAttr {
  tabIndex: number;
}

@Component({
  template: '<mat-slider [(value)]="value"></mat-slider>',
  styles: [styles],
})
class SliderWithTwoWayBinding {
  @ViewChild(MatSlider, {static: false}) slider: MatSlider;
  value = 0;
}

/**
 * Dispatches a mousedown event sequence (consisting of mousedown, mouseup) from an element.
 * Note: The mouse event truncates the position for the event.
 * @param sliderElement The mat-slider element from which the event will be dispatched.
 * @param percentage The percentage of the slider where the event should occur. Used to find the
 * physical location of the pointer.
 * @param button Button that should be held down when starting to drag the slider.
 */
function dispatchMousedownEventSequence(sliderElement: HTMLElement, percentage: number,
                                        button = 0): void {
  dispatchSliderMouseEvent(sliderElement, 'mousedown', percentage, button);
  dispatchSliderMouseEvent(sliderElement, 'mouseup', percentage, button);
}

/**
 * Dispatches a slide event sequence (consisting of slidestart, slide, slideend) from an element.
 * @param sliderElement The mat-slider element from which the event will be dispatched.
 * @param startPercent The percentage of the slider where the slide will begin.
 * @param endPercent The percentage of the slider where the slide will end.
 */
function dispatchSlideEventSequence(sliderElement: HTMLElement, startPercent: number,
                                    endPercent: number): void {
  dispatchSliderMouseEvent(sliderElement, 'mousedown', startPercent);
  dispatchSliderMouseEvent(sliderElement, 'mousemove', startPercent);
  dispatchSliderMouseEvent(sliderElement, 'mousemove', endPercent);
  dispatchSliderMouseEvent(sliderElement, 'mouseup', endPercent);
}

/**
 * Dispatches a mouse event from an element at a given position based on the percentage.
 * @param sliderElement The mat-slider element from which the event will be dispatched.
 * @param type Type of the mouse event that should be dispatched.
 * @param percent The percentage of the slider where the event will happen.
 * @param button Button that should be held for this event.
 */
function dispatchSliderMouseEvent(sliderElement: HTMLElement, type: string, percent: number,
                                  button = 0): void {
  let trackElement = sliderElement.querySelector('.mdc-slider__track-container')!;
  let dimensions = trackElement.getBoundingClientRect();
  let x = dimensions.left + (dimensions.width * percent);
  let y = dimensions.top + (dimensions.height * percent);

  dispatchEvent(sliderElement, createMouseEvent(type, x, y, 0));
}
