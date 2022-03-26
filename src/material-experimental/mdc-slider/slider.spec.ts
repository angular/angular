/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BidiModule, Directionality} from '@angular/cdk/bidi';
import {Platform} from '@angular/cdk/platform';
import {
  dispatchFakeEvent,
  dispatchMouseEvent,
  dispatchPointerEvent,
  dispatchTouchEvent,
} from '../../cdk/testing/private';
import {Component, Provider, QueryList, Type, ViewChild, ViewChildren} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, TestBed, waitForAsync} from '@angular/core/testing';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {Thumb} from '@material/slider';
import {of} from 'rxjs';
import {MatSliderModule} from './module';
import {MatSlider, MatSliderThumb, MatSliderVisualThumb} from './slider';

interface Point {
  x: number;
  y: number;
}

describe('MDC-based MatSlider', () => {
  let platform: Platform;

  function createComponent<T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [FormsModule, MatSliderModule, ReactiveFormsModule, BidiModule],
      declarations: [component],
      providers: [...providers],
    }).compileComponents();

    platform = TestBed.inject(Platform);
    // Mock #setPointerCapture as it throws errors on pointerdown without a real pointerId.
    spyOn(Element.prototype, 'setPointerCapture');

    return TestBed.createComponent<T>(component);
  }

  describe('standard slider', () => {
    let fixture: ComponentFixture<StandardSlider>;
    let sliderInstance: MatSlider;
    let inputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(StandardSlider);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should set the default values', () => {
      expect(inputInstance.value).toBe(0);
      expect(sliderInstance.min).toBe(0);
      expect(sliderInstance.max).toBe(100);
      expect(inputInstance._hostElement.getAttribute('aria-valuetext')).toBe('0');
    });

    it('should update the value on mousedown', () => {
      setValueByClick(sliderInstance, 19, platform.IOS);
      expect(inputInstance.value).toBe(19);
    });

    it('should update the value on a slide', () => {
      slideToValue(sliderInstance, 77, Thumb.END, platform.IOS);
      expect(inputInstance.value).toBe(77);
    });

    it('should set the value as min when sliding before the track', () => {
      slideToValue(sliderInstance, -1, Thumb.END, platform.IOS);
      expect(inputInstance.value).toBe(0);
    });

    it('should set the value as max when sliding past the track', () => {
      slideToValue(sliderInstance, 101, Thumb.END, platform.IOS);
      expect(inputInstance.value).toBe(100);
    });

    it('should focus the slider input when clicking on the slider', () => {
      expect(document.activeElement).not.toBe(inputInstance._hostElement);
      setValueByClick(sliderInstance, 0, platform.IOS);
      expect(document.activeElement).toBe(inputInstance._hostElement);
    });

    it('should not break on when the page layout changes', () => {
      sliderInstance._elementRef.nativeElement.style.marginLeft = '100px';
      setValueByClick(sliderInstance, 10, platform.IOS);
      expect(inputInstance.value).toBe(10);
      sliderInstance._elementRef.nativeElement.style.marginLeft = 'initial';
    });

    it('should not throw if destroyed before initialization is complete', () => {
      fixture.destroy();
      fixture = TestBed.createComponent(StandardSlider);
      expect(() => fixture.destroy()).not.toThrow();
    });
  });

  describe('standard range slider', () => {
    let sliderInstance: MatSlider;
    let startInputInstance: MatSliderThumb;
    let sliderElement: HTMLElement;
    let endInputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(StandardRangeSlider);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      sliderElement = sliderDebugElement.nativeElement;
      endInputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should set the default values', () => {
      expect(startInputInstance.value).toBe(0);
      expect(endInputInstance.value).toBe(100);
      expect(sliderInstance.min).toBe(0);
      expect(sliderInstance.max).toBe(100);
      expect(startInputInstance._hostElement.getAttribute('aria-valuetext')).toBe('0');
      expect(endInputInstance._hostElement.getAttribute('aria-valuetext')).toBe('100');
    });

    it('should update the start value on a slide', () => {
      slideToValue(sliderInstance, 19, Thumb.START, platform.IOS);
      expect(startInputInstance.value).toBe(19);
    });

    it('should update the end value on a slide', () => {
      slideToValue(sliderInstance, 27, Thumb.END, platform.IOS);
      expect(endInputInstance.value).toBe(27);
    });

    it('should update the start value on mousedown behind the start thumb', () => {
      sliderInstance._setValue(19, Thumb.START);
      setValueByClick(sliderInstance, 12, platform.IOS);
      expect(startInputInstance.value).toBe(12);
    });

    it('should update the end value on mousedown in front of the end thumb', () => {
      sliderInstance._setValue(27, Thumb.END);
      setValueByClick(sliderInstance, 55, platform.IOS);
      expect(endInputInstance.value).toBe(55);
    });

    it('should set the start value as min when sliding before the track', () => {
      slideToValue(sliderInstance, -1, Thumb.START, platform.IOS);
      expect(startInputInstance.value).toBe(0);
    });

    it('should set the end value as max when sliding past the track', () => {
      slideToValue(sliderInstance, 101, Thumb.START, platform.IOS);
      expect(startInputInstance.value).toBe(100);
    });

    it('should not let the start thumb slide past the end thumb', () => {
      sliderInstance._setValue(50, Thumb.END);
      slideToValue(sliderInstance, 75, Thumb.START, platform.IOS);
      expect(startInputInstance.value).toBe(50);
    });

    it('should not let the end thumb slide before the start thumb', () => {
      sliderInstance._setValue(50, Thumb.START);
      slideToValue(sliderInstance, 25, Thumb.END, platform.IOS);
      expect(startInputInstance.value).toBe(50);
    });

    it('should have a strong focus indicator in each of the thumbs', () => {
      const indicators = sliderElement.querySelectorAll(
        '.mat-mdc-slider-visual-thumb .mat-mdc-focus-indicator',
      );
      expect(indicators.length).toBe(2);
    });
  });

  describe('disabled slider', () => {
    let sliderInstance: MatSlider;
    let inputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(DisabledSlider);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should be disabled', () => {
      expect(sliderInstance.disabled).toBeTrue();
    });

    it('should have the disabled class on the root element', () => {
      expect(sliderInstance._elementRef.nativeElement.classList).toContain('mdc-slider--disabled');
    });

    it('should set the disabled attribute on the input element', () => {
      expect(inputInstance._hostElement.disabled).toBeTrue();
    });

    it('should not update the value on mousedown', () => {
      setValueByClick(sliderInstance, 19, platform.IOS);
      expect(inputInstance.value).toBe(0);
    });

    it('should not update the value on a slide', () => {
      slideToValue(sliderInstance, 77, Thumb.END, platform.IOS);
      expect(inputInstance.value).toBe(0);
    });
  });

  describe('disabled range slider', () => {
    let sliderInstance: MatSlider;
    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(DisabledRangeSlider);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      endInputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should be disabled', () => {
      expect(sliderInstance.disabled).toBeTrue();
    });

    it('should have the disabled class on the root element', () => {
      expect(sliderInstance._elementRef.nativeElement.classList).toContain('mdc-slider--disabled');
    });

    it('should set the disabled attribute on the input elements', () => {
      expect(startInputInstance._hostElement.disabled).toBeTrue();
      expect(endInputInstance._hostElement.disabled).toBeTrue();
    });

    it('should not update the start value on a slide', () => {
      slideToValue(sliderInstance, 19, Thumb.START, platform.IOS);
      expect(startInputInstance.value).toBe(0);
    });

    it('should not update the end value on a slide', () => {
      slideToValue(sliderInstance, 27, Thumb.END, platform.IOS);
      expect(endInputInstance.value).toBe(100);
    });

    it('should not update the start value on mousedown behind the start thumb', () => {
      sliderInstance._setValue(19, Thumb.START);
      setValueByClick(sliderInstance, 12, platform.IOS);
      expect(startInputInstance.value).toBe(19);
    });

    it('should update the end value on mousedown in front of the end thumb', () => {
      sliderInstance._setValue(27, Thumb.END);
      setValueByClick(sliderInstance, 55, platform.IOS);
      expect(endInputInstance.value).toBe(27);
    });
  });

  describe('ripple states', () => {
    let inputInstance: MatSliderThumb;
    let thumbInstance: MatSliderVisualThumb;
    let thumbElement: HTMLElement;
    let thumbX: number;
    let thumbY: number;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(StandardSlider);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      const sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
      thumbInstance = sliderInstance._getThumb(Thumb.END);
      thumbElement = thumbInstance._getHostElement();
      const thumbDimensions = thumbElement.getBoundingClientRect();
      thumbX = thumbDimensions.left - thumbDimensions.width / 2;
      thumbY = thumbDimensions.top - thumbDimensions.height / 2;
    }));

    function isRippleVisible(selector: string) {
      flushRippleTransitions();
      return thumbElement.querySelector(`.mat-mdc-slider-${selector}-ripple`) !== null;
    }

    function flushRippleTransitions() {
      thumbElement.querySelectorAll('.mat-ripple-element').forEach(el => {
        dispatchFakeEvent(el, 'transitionend');
      });
    }

    function blur() {
      inputInstance._hostElement.blur();
    }

    function mouseenter() {
      dispatchMouseEvent(thumbElement, 'mouseenter', thumbX, thumbY);
    }

    function mouseleave() {
      dispatchMouseEvent(thumbElement, 'mouseleave', thumbX, thumbY);
    }

    function pointerdown() {
      dispatchPointerOrTouchEvent(
        thumbElement,
        PointerEventType.POINTER_DOWN,
        thumbX,
        thumbY,
        platform.IOS,
      );
    }

    function pointerup() {
      dispatchPointerOrTouchEvent(
        thumbElement,
        PointerEventType.POINTER_UP,
        thumbX,
        thumbY,
        platform.IOS,
      );
    }

    it('should show the hover ripple on mouseenter', fakeAsync(() => {
      expect(isRippleVisible('hover')).toBeFalse();
      mouseenter();
      expect(isRippleVisible('hover')).toBeTrue();
    }));

    it('should hide the hover ripple on mouseleave', fakeAsync(() => {
      mouseenter();
      mouseleave();
      expect(isRippleVisible('hover')).toBeFalse();
    }));

    it('should show the focus ripple on pointerdown', fakeAsync(() => {
      expect(isRippleVisible('focus')).toBeFalse();
      pointerdown();
      expect(isRippleVisible('focus')).toBeTrue();
    }));

    it('should continue to show the focus ripple on pointerup', fakeAsync(() => {
      pointerdown();
      pointerup();
      expect(isRippleVisible('focus')).toBeTrue();
    }));

    it('should hide the focus ripple on blur', fakeAsync(() => {
      pointerdown();
      pointerup();
      blur();
      expect(isRippleVisible('focus')).toBeFalse();
    }));

    it('should show the active ripple on pointerdown', fakeAsync(() => {
      expect(isRippleVisible('active')).toBeFalse();
      pointerdown();
      expect(isRippleVisible('active')).toBeTrue();
    }));

    it('should hide the active ripple on pointerup', fakeAsync(() => {
      pointerdown();
      pointerup();
      expect(isRippleVisible('active')).toBeFalse();
    }));

    // Edge cases.

    it('should not show the hover ripple if the thumb is already focused', fakeAsync(() => {
      pointerdown();
      mouseenter();
      expect(isRippleVisible('hover')).toBeFalse();
    }));

    it('should hide the hover ripple if the thumb is focused', fakeAsync(() => {
      mouseenter();
      pointerdown();
      expect(isRippleVisible('hover')).toBeFalse();
    }));

    it('should not hide the focus ripple if the thumb is pressed', fakeAsync(() => {
      pointerdown();
      blur();
      expect(isRippleVisible('focus')).toBeTrue();
    }));

    it('should not hide the hover ripple on blur if the thumb is hovered', fakeAsync(() => {
      mouseenter();
      pointerdown();
      pointerup();
      blur();
      expect(isRippleVisible('hover')).toBeTrue();
    }));

    it('should hide the focus ripple on drag end if the thumb already lost focus', fakeAsync(() => {
      pointerdown();
      blur();
      pointerup();
      expect(isRippleVisible('focus')).toBeFalse();
    }));
  });

  describe('slider with set min and max', () => {
    let fixture: ComponentFixture<SliderWithMinAndMax>;
    let sliderInstance: MatSlider;
    let inputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(SliderWithMinAndMax);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should set the default values from the attributes', () => {
      expect(inputInstance.value).toBe(25);
      expect(sliderInstance.min).toBe(25);
      expect(sliderInstance.max).toBe(75);
    });

    it('should set the correct value on mousedown', () => {
      setValueByClick(sliderInstance, 33, platform.IOS);
      expect(inputInstance.value).toBe(33);
    });

    it('should set the correct value on slide', () => {
      slideToValue(sliderInstance, 55, Thumb.END, platform.IOS);
      expect(inputInstance.value).toBe(55);
    });

    it(
      'should be able to set the min and max values when they are more precise ' + 'than the step',
      () => {
        sliderInstance.step = 10;
        slideToValue(sliderInstance, 25, Thumb.END, platform.IOS);
        expect(inputInstance.value).toBe(25);
        slideToValue(sliderInstance, 75, Thumb.END, platform.IOS);
        expect(inputInstance.value).toBe(75);
      },
    );
  });

  describe('range slider with set min and max', () => {
    let fixture: ComponentFixture<RangeSliderWithMinAndMax>;
    let sliderInstance: MatSlider;
    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(RangeSliderWithMinAndMax);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      endInputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should set the default values from the attributes', () => {
      expect(startInputInstance.value).toBe(25);
      expect(endInputInstance.value).toBe(75);
      expect(sliderInstance.min).toBe(25);
      expect(sliderInstance.max).toBe(75);
    });

    it('should set the correct start value on mousedown behind the start thumb', () => {
      sliderInstance._setValue(50, Thumb.START);
      setValueByClick(sliderInstance, 33, platform.IOS);
      expect(startInputInstance.value).toBe(33);
    });

    it('should set the correct end value on mousedown behind the end thumb', () => {
      sliderInstance._setValue(50, Thumb.END);
      setValueByClick(sliderInstance, 66, platform.IOS);
      expect(endInputInstance.value).toBe(66);
    });

    it('should set the correct start value on slide', () => {
      slideToValue(sliderInstance, 40, Thumb.START, platform.IOS);
      expect(startInputInstance.value).toBe(40);
    });

    it('should set the correct end value on slide', () => {
      slideToValue(sliderInstance, 60, Thumb.END, platform.IOS);
      expect(endInputInstance.value).toBe(60);
    });

    it(
      'should be able to set the min and max values when they are more precise ' + 'than the step',
      () => {
        sliderInstance.step = 10;
        fixture.detectChanges();
        slideToValue(sliderInstance, 25, Thumb.START, platform.IOS);
        expect(startInputInstance.value).toBe(25);
        slideToValue(sliderInstance, 75, Thumb.END, platform.IOS);
        expect(endInputInstance.value).toBe(75);
      },
    );
  });

  describe('slider with set value', () => {
    let sliderInstance: MatSlider;
    let inputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(SliderWithValue);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should set the default value from the attribute', () => {
      expect(inputInstance.value).toBe(50);
    });

    it('should set the correct value on mousedown', () => {
      setValueByClick(sliderInstance, 19, platform.IOS);
      expect(inputInstance.value).toBe(19);
    });

    it('should set the correct value on slide', () => {
      slideToValue(sliderInstance, 77, Thumb.END, platform.IOS);
      expect(inputInstance.value).toBe(77);
    });
  });

  describe('range slider with set value', () => {
    let sliderInstance: MatSlider;
    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(RangeSliderWithValue);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      endInputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should set the default value from the attribute', () => {
      expect(startInputInstance.value).toBe(25);
      expect(endInputInstance.value).toBe(75);
    });

    it('should set the correct start value on mousedown behind the start thumb', () => {
      setValueByClick(sliderInstance, 19, platform.IOS);
      expect(startInputInstance.value).toBe(19);
    });

    it('should set the correct start value on mousedown in front of the end thumb', () => {
      setValueByClick(sliderInstance, 77, platform.IOS);
      expect(endInputInstance.value).toBe(77);
    });

    it('should set the correct start value on slide', () => {
      slideToValue(sliderInstance, 73, Thumb.START, platform.IOS);
      expect(startInputInstance.value).toBe(73);
    });

    it('should set the correct end value on slide', () => {
      slideToValue(sliderInstance, 99, Thumb.END, platform.IOS);
      expect(endInputInstance.value).toBe(99);
    });
  });

  describe('slider with set step', () => {
    let fixture: ComponentFixture<SliderWithStep>;
    let sliderInstance: MatSlider;
    let inputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(SliderWithStep);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should set the correct step value on mousedown', () => {
      expect(inputInstance.value).toBe(0);
      setValueByClick(sliderInstance, 13, platform.IOS);
      expect(inputInstance.value).toBe(25);
    });

    it('should set the correct step value on slide', () => {
      slideToValue(sliderInstance, 12, Thumb.END, platform.IOS);
      expect(inputInstance.value).toBe(0);
    });

    it('should not add decimals to the value if it is a whole number', () => {
      sliderInstance.step = 0.1;
      slideToValue(sliderInstance, 100, Thumb.END, platform.IOS);
      expect(inputInstance.value).toBe(100);
    });

    it('should truncate long decimal values when using a decimal step', () => {
      sliderInstance.step = 0.5;
      slideToValue(sliderInstance, 55.555, Thumb.END, platform.IOS);
      expect(inputInstance.value).toBe(55.5);
    });
  });

  describe('range slider with set step', () => {
    let fixture: ComponentFixture<RangeSliderWithStep>;
    let sliderInstance: MatSlider;
    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(RangeSliderWithStep);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      endInputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should set the correct step value on mousedown behind the start thumb', () => {
      sliderInstance._setValue(50, Thumb.START);
      setValueByClick(sliderInstance, 13, platform.IOS);
      expect(startInputInstance.value).toBe(25);
    });

    it('should set the correct step value on mousedown in front of the end thumb', () => {
      sliderInstance._setValue(50, Thumb.END);
      setValueByClick(sliderInstance, 63, platform.IOS);
      expect(endInputInstance.value).toBe(75);
    });

    it('should set the correct start thumb step value on slide', () => {
      slideToValue(sliderInstance, 26, Thumb.START, platform.IOS);
      expect(startInputInstance.value).toBe(25);
    });

    it('should set the correct end thumb step value on slide', () => {
      slideToValue(sliderInstance, 45, Thumb.END, platform.IOS);
      expect(endInputInstance.value).toBe(50);
    });

    it('should not add decimals to the end value if it is a whole number', () => {
      sliderInstance.step = 0.1;
      slideToValue(sliderInstance, 100, Thumb.END, platform.IOS);
      expect(endInputInstance.value).toBe(100);
    });

    it('should not add decimals to the start value if it is a whole number', () => {
      sliderInstance.step = 0.1;
      slideToValue(sliderInstance, 100, Thumb.END, platform.IOS);
      expect(endInputInstance.value).toBe(100);
    });

    it('should truncate long decimal start values when using a decimal step', () => {
      sliderInstance.step = 0.1;
      slideToValue(sliderInstance, 33.7, Thumb.START, platform.IOS);
      expect(startInputInstance.value).toBe(33.7);
    });

    it('should truncate long decimal end values when using a decimal step', () => {
      sliderInstance.step = 0.1;
      slideToValue(sliderInstance, 33.7, Thumb.END, platform.IOS);
      expect(endInputInstance.value).toBe(33.7);

      // NOTE(wagnermaciel): Different browsers treat the clientX dispatched by us differently.
      // Below is an example of a case that should work but because Firefox rounds the clientX
      // down, the clientX that gets dispatched (1695.998...) is not the same clientX that the MDC
      // Foundation receives (1695). This means the test will pass on chromium but fail on Firefox.
      //
      // slideToValue(sliderInstance, 66.66, Thumb.END, platform.IOS);
      // expect(endInputInstance.value).toBe(66.7);
    });
  });

  describe('slider with custom thumb label formatting', () => {
    let fixture: ComponentFixture<DiscreteSliderWithDisplayWith>;
    let sliderInstance: MatSlider;
    let inputInstance: MatSliderThumb;
    let valueIndicatorTextElement: Element;

    beforeEach(() => {
      fixture = createComponent(DiscreteSliderWithDisplayWith);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider))!;
      const sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.componentInstance;
      valueIndicatorTextElement = sliderNativeElement.querySelector(
        '.mdc-slider__value-indicator-text',
      )!;
      inputInstance = sliderInstance._getInput(Thumb.END);
    });

    it('should set the aria-valuetext attribute with the given `displayWith` function', () => {
      expect(inputInstance._hostElement.getAttribute('aria-valuetext')).toBe('$1');
      sliderInstance._setValue(10000, Thumb.END);
      expect(inputInstance._hostElement.getAttribute('aria-valuetext')).toBe('$10k');
    });

    it('should invoke the passed-in `displayWith` function with the value', () => {
      spyOn(sliderInstance, 'displayWith').and.callThrough();
      sliderInstance._setValue(1337, Thumb.END);
      expect(sliderInstance.displayWith).toHaveBeenCalledWith(1337);
    });

    it('should format the thumb label based on the passed-in `displayWith` function', () => {
      sliderInstance._setValue(200000, Thumb.END);
      fixture.detectChanges();
      expect(valueIndicatorTextElement.textContent).toBe('$200k');
    });
  });

  describe('range slider with custom thumb label formatting', () => {
    let fixture: ComponentFixture<DiscreteRangeSliderWithDisplayWith>;
    let sliderInstance: MatSlider;
    let startValueIndicatorTextElement: Element;
    let endValueIndicatorTextElement: Element;
    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;

    beforeEach(() => {
      fixture = createComponent(DiscreteRangeSliderWithDisplayWith);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider))!;
      sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      endInputInstance = sliderInstance._getInput(Thumb.END);

      const startThumbElement = sliderInstance._getThumbElement(Thumb.START);
      const endThumbElement = sliderInstance._getThumbElement(Thumb.END);
      startValueIndicatorTextElement = startThumbElement.querySelector(
        '.mdc-slider__value-indicator-text',
      )!;
      endValueIndicatorTextElement = endThumbElement.querySelector(
        '.mdc-slider__value-indicator-text',
      )!;
    });

    it('should set the aria-valuetext attribute with the given `displayWith` function', () => {
      expect(startInputInstance._hostElement.getAttribute('aria-valuetext')).toBe('$1');
      expect(endInputInstance._hostElement.getAttribute('aria-valuetext')).toBe('$1000k');
      sliderInstance._setValue(250000, Thumb.START);
      sliderInstance._setValue(810000, Thumb.END);
      expect(startInputInstance._hostElement.getAttribute('aria-valuetext')).toBe('$250k');
      expect(endInputInstance._hostElement.getAttribute('aria-valuetext')).toBe('$810k');
    });

    it('should invoke the passed-in `displayWith` function with the start value', () => {
      spyOn(sliderInstance, 'displayWith').and.callThrough();
      sliderInstance._setValue(1337, Thumb.START);
      expect(sliderInstance.displayWith).toHaveBeenCalledWith(1337);
    });

    it('should invoke the passed-in `displayWith` function with the end value', () => {
      spyOn(sliderInstance, 'displayWith').and.callThrough();
      sliderInstance._setValue(5996, Thumb.END);
      expect(sliderInstance.displayWith).toHaveBeenCalledWith(5996);
    });

    it('should format the start thumb label based on the passed-in `displayWith` function', () => {
      sliderInstance._setValue(200000, Thumb.START);
      fixture.detectChanges();
      expect(startValueIndicatorTextElement.textContent).toBe('$200k');
    });

    it('should format the end thumb label based on the passed-in `displayWith` function', () => {
      sliderInstance._setValue(700000, Thumb.END);
      fixture.detectChanges();
      expect(endValueIndicatorTextElement.textContent).toBe('$700k');
    });
  });

  describe('slider with value property binding', () => {
    let fixture: ComponentFixture<SliderWithOneWayBinding>;
    let testComponent: SliderWithOneWayBinding;
    let inputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(SliderWithOneWayBinding);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      const sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should update when bound value changes', () => {
      testComponent.value = 75;
      fixture.detectChanges();
      expect(inputInstance.value).toBe(75);
    });
  });

  describe('range slider with value property binding', () => {
    let fixture: ComponentFixture<RangeSliderWithOneWayBinding>;
    let testComponent: RangeSliderWithOneWayBinding;
    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(RangeSliderWithOneWayBinding);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      const sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      endInputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should update when bound start value changes', () => {
      testComponent.startValue = 30;
      fixture.detectChanges();
      expect(startInputInstance.value).toBe(30);
    });

    it('should update when bound end value changes', () => {
      testComponent.endValue = 70;
      fixture.detectChanges();
      expect(endInputInstance.value).toBe(70);
    });
  });

  describe('slider with change handler', () => {
    let sliderInstance: MatSlider;
    let inputInstance: MatSliderThumb;
    let sliderElement: HTMLElement;
    let fixture: ComponentFixture<SliderWithChangeHandler>;
    let testComponent: SliderWithChangeHandler;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(SliderWithChangeHandler);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should emit change on mouseup', () => {
      expect(testComponent.onChange).not.toHaveBeenCalled();
      setValueByClick(sliderInstance, 20, platform.IOS);
      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
    });

    it('should emit change on slide', () => {
      expect(testComponent.onChange).not.toHaveBeenCalled();
      slideToValue(sliderInstance, 40, Thumb.END, platform.IOS);
      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
    });

    it('should not emit multiple changes for the same value', () => {
      expect(testComponent.onChange).not.toHaveBeenCalled();

      setValueByClick(sliderInstance, 60, platform.IOS);
      slideToValue(sliderInstance, 60, Thumb.END, platform.IOS);
      setValueByClick(sliderInstance, 60, platform.IOS);
      slideToValue(sliderInstance, 60, Thumb.END, platform.IOS);

      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
    });

    it(
      'should dispatch events when changing back to previously emitted value after ' +
        'programmatically setting value',
      () => {
        const dispatchSliderEvent = (type: PointerEventType, value: number) => {
          const {x, y} = getCoordsForValue(sliderInstance, value);
          dispatchPointerOrTouchEvent(sliderElement, type, x, y, platform.IOS);
        };

        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();

        dispatchSliderEvent(PointerEventType.POINTER_DOWN, 20);
        fixture.detectChanges();

        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).toHaveBeenCalledTimes(1);

        dispatchSliderEvent(PointerEventType.POINTER_UP, 20);
        fixture.detectChanges();

        expect(testComponent.onChange).toHaveBeenCalledTimes(1);
        expect(testComponent.onInput).toHaveBeenCalledTimes(1);

        inputInstance.value = 0;
        fixture.detectChanges();

        expect(testComponent.onChange).toHaveBeenCalledTimes(1);
        expect(testComponent.onInput).toHaveBeenCalledTimes(1);

        dispatchSliderEvent(PointerEventType.POINTER_DOWN, 20);
        fixture.detectChanges();
        dispatchSliderEvent(PointerEventType.POINTER_UP, 20);

        expect(testComponent.onChange).toHaveBeenCalledTimes(2);
        expect(testComponent.onInput).toHaveBeenCalledTimes(2);
      },
    );
  });

  describe('range slider with change handlers', () => {
    let sliderInstance: MatSlider;
    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;
    let sliderElement: HTMLElement;
    let fixture: ComponentFixture<RangeSliderWithChangeHandler>;
    let testComponent: RangeSliderWithChangeHandler;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(RangeSliderWithChangeHandler);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      endInputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should emit change on mouseup on the start thumb', () => {
      expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
      setValueByClick(sliderInstance, 20, platform.IOS);
      expect(testComponent.onStartThumbChange).toHaveBeenCalledTimes(1);
      expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
    });

    it('should emit change on mouseup on the end thumb', () => {
      expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
      setValueByClick(sliderInstance, 80, platform.IOS);
      expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbChange).toHaveBeenCalledTimes(1);
    });

    it('should emit change on start thumb slide', () => {
      expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
      slideToValue(sliderInstance, 40, Thumb.START, platform.IOS);
      expect(testComponent.onStartThumbChange).toHaveBeenCalledTimes(1);
      expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
    });

    it('should emit change on end thumb slide', () => {
      expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
      slideToValue(sliderInstance, 60, Thumb.END, platform.IOS);
      expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbChange).toHaveBeenCalledTimes(1);
    });

    it('should not emit multiple changes for the same start thumb value', () => {
      expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();

      setValueByClick(sliderInstance, 30, platform.IOS);
      slideToValue(sliderInstance, 30, Thumb.START, platform.IOS);
      setValueByClick(sliderInstance, 30, platform.IOS);
      slideToValue(sliderInstance, 30, Thumb.START, platform.IOS);

      expect(testComponent.onStartThumbChange).toHaveBeenCalledTimes(1);
      expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
    });

    it('should not emit multiple changes for the same end thumb value', () => {
      expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();

      setValueByClick(sliderInstance, 60, platform.IOS);
      slideToValue(sliderInstance, 60, Thumb.END, platform.IOS);
      setValueByClick(sliderInstance, 60, platform.IOS);
      slideToValue(sliderInstance, 60, Thumb.END, platform.IOS);

      expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbChange).toHaveBeenCalledTimes(1);
    });

    it(
      'should dispatch events when changing back to previously emitted value after ' +
        'programmatically setting the start value',
      () => {
        const dispatchSliderEvent = (type: PointerEventType, value: number) => {
          const {x, y} = getCoordsForValue(sliderInstance, value);
          dispatchPointerOrTouchEvent(sliderElement, type, x, y, platform.IOS);
        };

        expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
        expect(testComponent.onStartThumbInput).not.toHaveBeenCalled();
        expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
        expect(testComponent.onEndThumbInput).not.toHaveBeenCalled();

        dispatchSliderEvent(PointerEventType.POINTER_DOWN, 20);
        fixture.detectChanges();

        expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
        expect(testComponent.onStartThumbInput).toHaveBeenCalledTimes(1);
        expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
        expect(testComponent.onEndThumbInput).not.toHaveBeenCalled();

        dispatchSliderEvent(PointerEventType.POINTER_UP, 20);
        fixture.detectChanges();

        expect(testComponent.onStartThumbChange).toHaveBeenCalledTimes(1);
        expect(testComponent.onStartThumbInput).toHaveBeenCalledTimes(1);
        expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
        expect(testComponent.onEndThumbInput).not.toHaveBeenCalled();

        startInputInstance.value = 0;
        fixture.detectChanges();

        expect(testComponent.onStartThumbChange).toHaveBeenCalledTimes(1);
        expect(testComponent.onStartThumbInput).toHaveBeenCalledTimes(1);
        expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
        expect(testComponent.onEndThumbInput).not.toHaveBeenCalled();

        dispatchSliderEvent(PointerEventType.POINTER_DOWN, 20);
        fixture.detectChanges();
        dispatchSliderEvent(PointerEventType.POINTER_UP, 20);

        expect(testComponent.onStartThumbChange).toHaveBeenCalledTimes(2);
        expect(testComponent.onStartThumbInput).toHaveBeenCalledTimes(2);
        expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
        expect(testComponent.onEndThumbInput).not.toHaveBeenCalled();
      },
    );

    it(
      'should dispatch events when changing back to previously emitted value after ' +
        'programmatically setting the end value',
      () => {
        const dispatchSliderEvent = (type: PointerEventType, value: number) => {
          const {x, y} = getCoordsForValue(sliderInstance, value);
          dispatchPointerOrTouchEvent(sliderElement, type, x, y, platform.IOS);
        };

        expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
        expect(testComponent.onStartThumbInput).not.toHaveBeenCalled();
        expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
        expect(testComponent.onEndThumbInput).not.toHaveBeenCalled();

        dispatchSliderEvent(PointerEventType.POINTER_DOWN, 80);
        fixture.detectChanges();

        expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
        expect(testComponent.onStartThumbInput).not.toHaveBeenCalled();
        expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
        expect(testComponent.onEndThumbInput).toHaveBeenCalledTimes(1);

        dispatchSliderEvent(PointerEventType.POINTER_UP, 80);
        fixture.detectChanges();

        expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
        expect(testComponent.onStartThumbInput).not.toHaveBeenCalled();
        expect(testComponent.onEndThumbChange).toHaveBeenCalledTimes(1);
        expect(testComponent.onEndThumbInput).toHaveBeenCalledTimes(1);

        endInputInstance.value = 100;
        fixture.detectChanges();

        expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
        expect(testComponent.onStartThumbInput).not.toHaveBeenCalled();
        expect(testComponent.onEndThumbChange).toHaveBeenCalledTimes(1);
        expect(testComponent.onEndThumbInput).toHaveBeenCalledTimes(1);

        dispatchSliderEvent(PointerEventType.POINTER_DOWN, 80);
        fixture.detectChanges();
        dispatchSliderEvent(PointerEventType.POINTER_UP, 80);

        expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
        expect(testComponent.onStartThumbInput).not.toHaveBeenCalled();
        expect(testComponent.onEndThumbChange).toHaveBeenCalledTimes(2);
        expect(testComponent.onEndThumbInput).toHaveBeenCalledTimes(2);
      },
    );
  });

  describe('slider with input event', () => {
    let sliderInstance: MatSlider;
    let sliderElement: HTMLElement;
    let testComponent: SliderWithChangeHandler;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(SliderWithChangeHandler);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      sliderElement = sliderInstance._elementRef.nativeElement;
    }));

    it('should emit an input event while sliding', () => {
      const dispatchSliderEvent = (type: PointerEventType, value: number) => {
        const {x, y} = getCoordsForValue(sliderInstance, value);
        dispatchPointerOrTouchEvent(sliderElement, type, x, y, platform.IOS);
      };

      expect(testComponent.onChange).not.toHaveBeenCalled();
      expect(testComponent.onInput).not.toHaveBeenCalled();

      // pointer down on current value (should not trigger input event)
      dispatchSliderEvent(PointerEventType.POINTER_DOWN, 0);

      // value changes (should trigger input)
      dispatchSliderEvent(PointerEventType.POINTER_MOVE, 10);
      dispatchSliderEvent(PointerEventType.POINTER_MOVE, 25);

      // a new value has been committed (should trigger change event)
      dispatchSliderEvent(PointerEventType.POINTER_UP, 25);

      expect(testComponent.onInput).toHaveBeenCalledTimes(2);
      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
    });

    it('should emit an input event when clicking', () => {
      expect(testComponent.onChange).not.toHaveBeenCalled();
      expect(testComponent.onInput).not.toHaveBeenCalled();
      setValueByClick(sliderInstance, 75, platform.IOS);
      expect(testComponent.onInput).toHaveBeenCalledTimes(1);
      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('range slider with input event', () => {
    let sliderInstance: MatSlider;
    let sliderElement: HTMLElement;
    let testComponent: RangeSliderWithChangeHandler;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(RangeSliderWithChangeHandler);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      sliderElement = sliderInstance._elementRef.nativeElement;
    }));

    it('should emit an input event while sliding the start thumb', () => {
      const dispatchSliderEvent = (type: PointerEventType, value: number) => {
        const {x, y} = getCoordsForValue(sliderInstance, value);
        dispatchPointerOrTouchEvent(sliderElement, type, x, y, platform.IOS);
      };

      expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onStartThumbInput).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbInput).not.toHaveBeenCalled();

      // pointer down on current start thumb value (should not trigger input event)
      dispatchSliderEvent(PointerEventType.POINTER_DOWN, 0);

      // value changes (should trigger input)
      dispatchSliderEvent(PointerEventType.POINTER_MOVE, 10);
      dispatchSliderEvent(PointerEventType.POINTER_MOVE, 25);

      // a new value has been committed (should trigger change event)
      dispatchSliderEvent(PointerEventType.POINTER_UP, 25);

      expect(testComponent.onStartThumbChange).toHaveBeenCalledTimes(1);
      expect(testComponent.onStartThumbInput).toHaveBeenCalledTimes(2);
      expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbInput).not.toHaveBeenCalled();
    });

    it('should emit an input event while sliding the end thumb', () => {
      const dispatchSliderEvent = (type: PointerEventType, value: number) => {
        const {x, y} = getCoordsForValue(sliderInstance, value);
        dispatchPointerOrTouchEvent(sliderElement, type, x, y, platform.IOS);
      };

      expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onStartThumbInput).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbInput).not.toHaveBeenCalled();

      // pointer down on current end thumb value (should not trigger input event)
      dispatchSliderEvent(PointerEventType.POINTER_DOWN, 100);

      // value changes (should trigger input)
      dispatchSliderEvent(PointerEventType.POINTER_MOVE, 90);
      dispatchSliderEvent(PointerEventType.POINTER_MOVE, 55);

      // a new value has been committed (should trigger change event)
      dispatchSliderEvent(PointerEventType.POINTER_UP, 55);

      expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onStartThumbInput).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbChange).toHaveBeenCalledTimes(1);
      expect(testComponent.onEndThumbInput).toHaveBeenCalledTimes(2);
    });

    it('should emit an input event on the start thumb when clicking near it', () => {
      expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onStartThumbInput).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbInput).not.toHaveBeenCalled();

      setValueByClick(sliderInstance, 30, platform.IOS);

      expect(testComponent.onStartThumbChange).toHaveBeenCalledTimes(1);
      expect(testComponent.onStartThumbInput).toHaveBeenCalledTimes(1);
      expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbInput).not.toHaveBeenCalled();
    });

    it('should emit an input event on the end thumb when clicking near it', () => {
      expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onStartThumbInput).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbInput).not.toHaveBeenCalled();

      setValueByClick(sliderInstance, 55, platform.IOS);

      expect(testComponent.onStartThumbChange).not.toHaveBeenCalled();
      expect(testComponent.onStartThumbInput).not.toHaveBeenCalled();
      expect(testComponent.onEndThumbChange).toHaveBeenCalledTimes(1);
      expect(testComponent.onEndThumbInput).toHaveBeenCalledTimes(1);
    });
  });

  describe('slider with direction', () => {
    let sliderInstance: MatSlider;
    let inputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(StandardSlider, [
        {
          provide: Directionality,
          useValue: {value: 'rtl', change: of()},
        },
      ]);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('works in RTL languages', () => {
      setValueByClick(sliderInstance, 30, platform.IOS);
      expect(inputInstance.value).toBe(70);
    });
  });

  describe('range slider with direction', () => {
    let sliderInstance: MatSlider;
    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      const fixture = createComponent(StandardRangeSlider, [
        {
          provide: Directionality,
          useValue: {value: 'rtl', change: of()},
        },
      ]);
      fixture.detectChanges();
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      endInputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('works in RTL languages', () => {
      setValueByClick(sliderInstance, 90, platform.IOS);
      expect(startInputInstance.value).toBe(10);

      setValueByClick(sliderInstance, 10, platform.IOS);
      expect(endInputInstance.value).toBe(90);
    });
  });

  describe('slider with ngModel', () => {
    let fixture: ComponentFixture<SliderWithNgModel>;
    let testComponent: SliderWithNgModel;
    let inputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(SliderWithNgModel);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      const sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should update the model on mouseup', () => {
      expect(testComponent.val).toBe(0);
      setValueByClick(testComponent.slider, 76, platform.IOS);
      fixture.detectChanges();
      expect(testComponent.val).toBe(76);
    });

    it('should update the model on slide', () => {
      expect(testComponent.val).toBe(0);
      slideToValue(testComponent.slider, 19, Thumb.END, platform.IOS);
      fixture.detectChanges();
      expect(testComponent.val).toBe(19);
    });

    it('should be able to reset a slider by setting the model back to undefined', fakeAsync(() => {
      expect(inputInstance.value).toBe(0);
      testComponent.val = 5;
      fixture.detectChanges();
      flush();
      expect(inputInstance.value).toBe(5);

      testComponent.val = undefined;
      fixture.detectChanges();
      flush();
      expect(inputInstance.value).toBe(0);
    }));
  });

  describe('slider with ngModel', () => {
    let fixture: ComponentFixture<RangeSliderWithNgModel>;
    let testComponent: RangeSliderWithNgModel;

    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(RangeSliderWithNgModel);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      const sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      endInputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should update the start thumb model on mouseup', () => {
      expect(testComponent.startVal).toBe(0);
      setValueByClick(testComponent.slider, 25, platform.IOS);
      fixture.detectChanges();
      expect(testComponent.startVal).toBe(25);
    });

    it('should update the end thumb model on mouseup', () => {
      expect(testComponent.endVal).toBe(100);
      setValueByClick(testComponent.slider, 75, platform.IOS);
      fixture.detectChanges();
      expect(testComponent.endVal).toBe(75);
    });

    it('should update the start thumb model on slide', () => {
      expect(testComponent.startVal).toBe(0);
      slideToValue(testComponent.slider, 19, Thumb.START, platform.IOS);
      fixture.detectChanges();
      expect(testComponent.startVal).toBe(19);
    });

    it('should update the end thumb model on slide', () => {
      expect(testComponent.endVal).toBe(100);
      slideToValue(testComponent.slider, 19, Thumb.END, platform.IOS);
      fixture.detectChanges();
      expect(testComponent.endVal).toBe(19);
    });

    it('should be able to reset a slider by setting the start thumb model back to undefined', fakeAsync(() => {
      expect(startInputInstance.value).toBe(0);
      testComponent.startVal = 5;
      fixture.detectChanges();
      flush();
      expect(startInputInstance.value).toBe(5);

      testComponent.startVal = undefined;
      fixture.detectChanges();
      flush();
      expect(startInputInstance.value).toBe(0);
    }));

    it('should be able to reset a slider by setting the end thumb model back to undefined', fakeAsync(() => {
      expect(endInputInstance.value).toBe(100);
      testComponent.endVal = 5;
      fixture.detectChanges();
      flush();
      expect(endInputInstance.value).toBe(5);

      testComponent.endVal = undefined;
      fixture.detectChanges();
      flush();
      expect(endInputInstance.value).toBe(0);
    }));
  });

  describe('slider as a custom form control', () => {
    let fixture: ComponentFixture<SliderWithFormControl>;
    let testComponent: SliderWithFormControl;
    let sliderInstance: MatSlider;
    let inputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(SliderWithFormControl);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      inputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should not update the control when the value is updated', () => {
      expect(testComponent.control.value).toBe(0);
      inputInstance.value = 11;
      fixture.detectChanges();
      expect(testComponent.control.value).toBe(0);
    });

    it('should update the control on mouseup', () => {
      expect(testComponent.control.value).toBe(0);
      setValueByClick(sliderInstance, 76, platform.IOS);
      expect(testComponent.control.value).toBe(76);
    });

    it('should update the control on slide', () => {
      expect(testComponent.control.value).toBe(0);
      slideToValue(sliderInstance, 19, Thumb.END, platform.IOS);
      expect(testComponent.control.value).toBe(19);
    });

    it('should update the value when the control is set', () => {
      expect(inputInstance.value).toBe(0);
      testComponent.control.setValue(7);
      expect(inputInstance.value).toBe(7);
    });

    it('should update the disabled state when control is disabled', () => {
      expect(sliderInstance.disabled).toBe(false);
      testComponent.control.disable();
      expect(sliderInstance.disabled).toBe(true);
    });

    it('should update the disabled state when the control is enabled', () => {
      sliderInstance.disabled = true;
      testComponent.control.enable();
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
      setValueByClick(sliderInstance, 50, platform.IOS);

      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(false);
      expect(sliderControl.touched).toBe(false);

      // If the control has been visited due to interaction, the control should remain
      // dirty and now also be touched.
      inputInstance.blur();
      fixture.detectChanges();

      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(false);
      expect(sliderControl.touched).toBe(true);
    });
  });

  describe('slider as a custom form control', () => {
    let fixture: ComponentFixture<RangeSliderWithFormControl>;
    let testComponent: RangeSliderWithFormControl;
    let sliderInstance: MatSlider;
    let startInputInstance: MatSliderThumb;
    let endInputInstance: MatSliderThumb;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(RangeSliderWithFormControl);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      const sliderDebugElement = fixture.debugElement.query(By.directive(MatSlider));
      sliderInstance = sliderDebugElement.componentInstance;
      startInputInstance = sliderInstance._getInput(Thumb.START);
      endInputInstance = sliderInstance._getInput(Thumb.END);
    }));

    it('should not update the start input control when the value is updated', () => {
      expect(testComponent.startInputControl.value).toBe(0);
      startInputInstance.value = 11;
      fixture.detectChanges();
      expect(testComponent.startInputControl.value).toBe(0);
    });

    it('should not update the end input control when the value is updated', () => {
      expect(testComponent.endInputControl.value).toBe(100);
      endInputInstance.value = 11;
      fixture.detectChanges();
      expect(testComponent.endInputControl.value).toBe(100);
    });

    it('should update the start input control on mouseup', () => {
      expect(testComponent.startInputControl.value).toBe(0);
      setValueByClick(sliderInstance, 20, platform.IOS);
      expect(testComponent.startInputControl.value).toBe(20);
    });

    it('should update the end input control on mouseup', () => {
      expect(testComponent.endInputControl.value).toBe(100);
      setValueByClick(sliderInstance, 80, platform.IOS);
      expect(testComponent.endInputControl.value).toBe(80);
    });

    it('should update the start input control on slide', () => {
      expect(testComponent.startInputControl.value).toBe(0);
      slideToValue(sliderInstance, 20, Thumb.START, platform.IOS);
      expect(testComponent.startInputControl.value).toBe(20);
    });

    it('should update the end input control on slide', () => {
      expect(testComponent.endInputControl.value).toBe(100);
      slideToValue(sliderInstance, 80, Thumb.END, platform.IOS);
      expect(testComponent.endInputControl.value).toBe(80);
    });

    it('should update the start input value when the start input control is set', () => {
      expect(startInputInstance.value).toBe(0);
      testComponent.startInputControl.setValue(10);
      expect(startInputInstance.value).toBe(10);
    });

    it('should update the end input value when the end input control is set', () => {
      expect(endInputInstance.value).toBe(100);
      testComponent.endInputControl.setValue(90);
      expect(endInputInstance.value).toBe(90);
    });

    it('should update the disabled state if the start input control is disabled', () => {
      expect(sliderInstance.disabled).toBe(false);
      testComponent.startInputControl.disable();
      expect(sliderInstance.disabled).toBe(true);
    });

    it('should update the disabled state if the end input control is disabled', () => {
      expect(sliderInstance.disabled).toBe(false);
      testComponent.endInputControl.disable();
      expect(sliderInstance.disabled).toBe(true);
    });

    it('should update the disabled state when both input controls are enabled', () => {
      sliderInstance.disabled = true;
      testComponent.startInputControl.enable();
      expect(sliderInstance.disabled).toBe(true);
      testComponent.endInputControl.enable();
      expect(sliderInstance.disabled).toBe(false);
    });

    it('should have the correct start input control state initially and after interaction', () => {
      let sliderControl = testComponent.startInputControl;

      // The control should start off valid, pristine, and untouched.
      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(true);
      expect(sliderControl.touched).toBe(false);

      // After changing the value, the control should become dirty (not pristine),
      // but remain untouched.
      setValueByClick(sliderInstance, 25, platform.IOS);

      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(false);
      expect(sliderControl.touched).toBe(false);

      // If the control has been visited due to interaction, the control should remain
      // dirty and now also be touched.
      startInputInstance.blur();
      fixture.detectChanges();

      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(false);
      expect(sliderControl.touched).toBe(true);
    });

    it('should have the correct start input control state initially and after interaction', () => {
      let sliderControl = testComponent.endInputControl;

      // The control should start off valid, pristine, and untouched.
      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(true);
      expect(sliderControl.touched).toBe(false);

      // After changing the value, the control should become dirty (not pristine),
      // but remain untouched.
      setValueByClick(sliderInstance, 75, platform.IOS);

      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(false);
      expect(sliderControl.touched).toBe(false);

      // If the control has been visited due to interaction, the control should remain
      // dirty and now also be touched.
      endInputInstance.blur();
      fixture.detectChanges();

      expect(sliderControl.valid).toBe(true);
      expect(sliderControl.pristine).toBe(false);
      expect(sliderControl.touched).toBe(true);
    });
  });

  describe('slider with a two-way binding', () => {
    let fixture: ComponentFixture<SliderWithTwoWayBinding>;
    let testComponent: SliderWithTwoWayBinding;

    beforeEach(() => {
      fixture = createComponent(SliderWithTwoWayBinding);
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
    });

    it('should sync the value binding in both directions', () => {
      expect(testComponent.value).toBe(0);
      expect(testComponent.sliderInput.value).toBe(0);

      slideToValue(testComponent.slider, 10, Thumb.END, platform.IOS);
      expect(testComponent.value).toBe(10);
      expect(testComponent.sliderInput.value).toBe(10);

      testComponent.value = 20;
      fixture.detectChanges();
      expect(testComponent.value).toBe(20);
      expect(testComponent.sliderInput.value).toBe(20);
    });
  });

  describe('range slider with a two-way binding', () => {
    let fixture: ComponentFixture<RangeSliderWithTwoWayBinding>;
    let testComponent: RangeSliderWithTwoWayBinding;

    beforeEach(waitForAsync(() => {
      fixture = createComponent(RangeSliderWithTwoWayBinding);
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
    }));

    it('should sync the start value binding in both directions', () => {
      expect(testComponent.startValue).toBe(0);
      expect(testComponent.sliderInputs.get(0)!.value).toBe(0);

      slideToValue(testComponent.slider, 10, Thumb.START, platform.IOS);

      expect(testComponent.startValue).toBe(10);
      expect(testComponent.sliderInputs.get(0)!.value).toBe(10);

      testComponent.startValue = 20;
      fixture.detectChanges();
      expect(testComponent.startValue).toBe(20);
      expect(testComponent.sliderInputs.get(0)!.value).toBe(20);
    });

    it('should sync the end value binding in both directions', () => {
      expect(testComponent.endValue).toBe(100);
      expect(testComponent.sliderInputs.get(1)!.value).toBe(100);

      slideToValue(testComponent.slider, 90, Thumb.END, platform.IOS);
      expect(testComponent.endValue).toBe(90);
      expect(testComponent.sliderInputs.get(1)!.value).toBe(90);

      testComponent.endValue = 80;
      fixture.detectChanges();
      expect(testComponent.endValue).toBe(80);
      expect(testComponent.sliderInputs.get(1)!.value).toBe(80);
    });
  });
});

const SLIDER_STYLES = ['.mat-mdc-slider { width: 300px; }'];

@Component({
  template: `
  <mat-slider>
    <input matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class StandardSlider {}

@Component({
  template: `
  <mat-slider>
    <input matSliderStartThumb>
    <input matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class StandardRangeSlider {}

@Component({
  template: `
  <mat-slider disabled>
    <input matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class DisabledSlider {}

@Component({
  template: `
  <mat-slider disabled>
    <input matSliderStartThumb>
    <input matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class DisabledRangeSlider {}

@Component({
  template: `
  <mat-slider min="25" max="75">
    <input matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class SliderWithMinAndMax {}

@Component({
  template: `
  <mat-slider min="25" max="75">
    <input matSliderStartThumb>
    <input matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class RangeSliderWithMinAndMax {}

@Component({
  template: `
  <mat-slider>
    <input value="50" matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class SliderWithValue {}

@Component({
  template: `
  <mat-slider>
    <input value="25" matSliderStartThumb>
    <input value="75" matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class RangeSliderWithValue {}

@Component({
  template: `
  <mat-slider step="25">
    <input matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class SliderWithStep {}

@Component({
  template: `
  <mat-slider step="25">
    <input matSliderStartThumb>
    <input matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class RangeSliderWithStep {}

@Component({
  template: `
  <mat-slider [displayWith]="displayWith" min="1" max="1000000" discrete>
    <input matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class DiscreteSliderWithDisplayWith {
  displayWith(v: number) {
    if (v >= 1000) {
      return `$${v / 1000}k`;
    }
    return `$${v}`;
  }
}

@Component({
  template: `
  <mat-slider [displayWith]="displayWith" min="1" max="1000000" discrete>
    <input matSliderStartThumb>
    <input matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class DiscreteRangeSliderWithDisplayWith {
  displayWith(v: number) {
    if (v >= 1000) {
      return `$${v / 1000}k`;
    }
    return `$${v}`;
  }
}

@Component({
  template: `
  <mat-slider>
    <input [value]="value" matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class SliderWithOneWayBinding {
  value = 50;
}

@Component({
  template: `
  <mat-slider>
    <input [value]="startValue" matSliderStartThumb>
    <input [value]="endValue" matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class RangeSliderWithOneWayBinding {
  startValue = 25;
  endValue = 75;
}

@Component({
  template: `
  <mat-slider>
    <input (change)="onChange($event)" (input)="onInput($event)" matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class SliderWithChangeHandler {
  onChange = jasmine.createSpy('onChange');
  onInput = jasmine.createSpy('onChange');
  @ViewChild(MatSlider) slider: MatSlider;
}

@Component({
  template: `
  <mat-slider>
    <input
      (change)="onStartThumbChange($event)"
      (input)="onStartThumbInput($event)"
      matSliderStartThumb>
    <input
      (change)="onEndThumbChange($event)"
      (input)="onEndThumbInput($event)"
      matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class RangeSliderWithChangeHandler {
  onStartThumbChange = jasmine.createSpy('onStartThumbChange');
  onStartThumbInput = jasmine.createSpy('onStartThumbInput');
  onEndThumbChange = jasmine.createSpy('onEndThumbChange');
  onEndThumbInput = jasmine.createSpy('onEndThumbInput');
  @ViewChild(MatSlider) slider: MatSlider;
}

@Component({
  template: `
  <mat-slider>
    <input [(ngModel)]="val" matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class SliderWithNgModel {
  @ViewChild(MatSlider) slider: MatSlider;
  val: number | undefined = 0;
}

@Component({
  template: `
  <mat-slider>
    <input [(ngModel)]="startVal" matSliderStartThumb>
    <input [(ngModel)]="endVal" matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class RangeSliderWithNgModel {
  @ViewChild(MatSlider) slider: MatSlider;
  startVal: number | undefined = 0;
  endVal: number | undefined = 100;
}

@Component({
  template: `
  <mat-slider>
    <input [formControl]="control" matSliderThumb>
  </mat-slider>`,
  styles: SLIDER_STYLES,
})
class SliderWithFormControl {
  control = new FormControl(0);
}

@Component({
  template: `
  <mat-slider>
    <input [formControl]="startInputControl" matSliderStartThumb>
    <input [formControl]="endInputControl" matSliderEndThumb>
  </mat-slider>`,
  styles: SLIDER_STYLES,
})
class RangeSliderWithFormControl {
  startInputControl = new FormControl(0);
  endInputControl = new FormControl(100);
}

@Component({
  template: `
  <mat-slider>
    <input [(value)]="value" matSliderThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class SliderWithTwoWayBinding {
  @ViewChild(MatSlider) slider: MatSlider;
  @ViewChild(MatSliderThumb) sliderInput: MatSliderThumb;
  value = 0;
}

@Component({
  template: `
  <mat-slider>
    <input [(value)]="startValue" matSliderStartThumb>
    <input [(value)]="endValue" matSliderEndThumb>
  </mat-slider>
  `,
  styles: SLIDER_STYLES,
})
class RangeSliderWithTwoWayBinding {
  @ViewChild(MatSlider) slider: MatSlider;
  @ViewChildren(MatSliderThumb) sliderInputs: QueryList<MatSliderThumb>;
  startValue = 0;
  endValue = 100;
}

/** The pointer event types used by the MDC Slider. */
const enum PointerEventType {
  POINTER_DOWN = 'pointerdown',
  POINTER_UP = 'pointerup',
  POINTER_MOVE = 'pointermove',
}

/** The touch event types used by the MDC Slider. */
const enum TouchEventType {
  TOUCH_START = 'touchstart',
  TOUCH_END = 'touchend',
  TOUCH_MOVE = 'touchmove',
}

/** Clicks on the MatSlider at the coordinates corresponding to the given value. */
function setValueByClick(slider: MatSlider, value: number, isIOS: boolean) {
  const sliderElement = slider._elementRef.nativeElement;
  const {x, y} = getCoordsForValue(slider, value);

  dispatchPointerEvent(sliderElement, 'mouseenter', x, y);
  dispatchPointerOrTouchEvent(sliderElement, PointerEventType.POINTER_DOWN, x, y, isIOS);
  dispatchPointerOrTouchEvent(sliderElement, PointerEventType.POINTER_UP, x, y, isIOS);
}

/** Slides the MatSlider's thumb to the given value. */
function slideToValue(slider: MatSlider, value: number, thumbPosition: Thumb, isIOS: boolean) {
  const sliderElement = slider._elementRef.nativeElement;
  const {x: startX, y: startY} = getCoordsForValue(slider, slider._getInput(thumbPosition).value);
  const {x: endX, y: endY} = getCoordsForValue(slider, value);

  dispatchPointerEvent(sliderElement, 'mouseenter', startX, startY);
  dispatchPointerOrTouchEvent(sliderElement, PointerEventType.POINTER_DOWN, startX, startY, isIOS);
  dispatchPointerOrTouchEvent(sliderElement, PointerEventType.POINTER_MOVE, endX, endY, isIOS);
  dispatchPointerOrTouchEvent(sliderElement, PointerEventType.POINTER_UP, endX, endY, isIOS);
}

/** Returns the x and y coordinates for the given slider value. */
function getCoordsForValue(slider: MatSlider, value: number): Point {
  const {min, max} = slider;
  const percent = (value - min) / (max - min);

  const {top, left, width, height} = slider._elementRef.nativeElement.getBoundingClientRect();
  const x = left + width * percent;
  const y = top + height / 2;

  return {x, y};
}

/** Dispatch a pointerdown or pointerup event if supported, otherwise dispatch the touch event. */
function dispatchPointerOrTouchEvent(
  node: Node,
  type: PointerEventType,
  x: number,
  y: number,
  isIOS: boolean,
) {
  if (isIOS) {
    dispatchTouchEvent(node, pointerEventTypeToTouchEventType(type), x, y, x, y);
  } else {
    dispatchPointerEvent(node, type, x, y);
  }
}

/** Returns the touch event equivalent of the given pointer event. */
function pointerEventTypeToTouchEventType(pointerEventType: PointerEventType) {
  switch (pointerEventType) {
    case PointerEventType.POINTER_DOWN:
      return TouchEventType.TOUCH_START;
    case PointerEventType.POINTER_UP:
      return TouchEventType.TOUCH_END;
    case PointerEventType.POINTER_MOVE:
      return TouchEventType.TOUCH_MOVE;
  }
}
