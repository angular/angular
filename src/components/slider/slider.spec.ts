import {
    addProviders,
    inject,
    async,
} from '@angular/core/testing';
import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';
import {Component, DebugElement, ViewEncapsulation} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdSlider, MD_SLIDER_DIRECTIVES} from './slider';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {TestGestureConfig} from './test-gesture-config';

describe('MdSlider', () => {
  let builder: TestComponentBuilder;
  let gestureConfig: TestGestureConfig;

  beforeEach(() => {
    addProviders([
      {provide: HAMMER_GESTURE_CONFIG, useFactory: () => {
        gestureConfig = new TestGestureConfig();
        return gestureConfig;
      }}
    ]);
  });

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  describe('standard slider', () => {
    let fixture: ComponentFixture<StandardSlider>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let trackFillElement: HTMLElement;
    let trackFillDimensions: ClientRect;
    let sliderTrackElement: HTMLElement;
    let sliderDimensions: ClientRect;
    let thumbElement: HTMLElement;
    let thumbDimensions: ClientRect;
    let thumbWidth: number;

    beforeEach(async(() => {
      builder.createAsync(StandardSlider).then(f => {
        fixture = f;
        fixture.detectChanges();

        sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
        sliderNativeElement = sliderDebugElement.nativeElement;
        sliderInstance = sliderDebugElement.componentInstance;

        trackFillElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track-fill');
        trackFillDimensions = trackFillElement.getBoundingClientRect();
        sliderTrackElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track');
        sliderDimensions = sliderTrackElement.getBoundingClientRect();

        thumbElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-thumb-position');
        thumbDimensions = thumbElement.getBoundingClientRect();
        thumbWidth =
            sliderNativeElement.querySelector('.md-slider-thumb').getBoundingClientRect().width;
      });
    }));

    it('should set the default values', () => {
      expect(sliderInstance.value).toBe(0);
      expect(sliderInstance.min).toBe(0);
      expect(sliderInstance.max).toBe(100);
    });

    it('should update the value on a click', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchClickEvent(sliderTrackElement, 0.19);
      // The expected value is 19 from: percentage * difference of max and min.
      let difference = Math.abs(sliderInstance.value - 19);
      expect(difference).toBeLessThan(1);
    });

    it('should update the value on a drag', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchDragEvent(sliderTrackElement, sliderNativeElement, 0, 0.89, gestureConfig);
      // The expected value is 89 from: percentage * difference of max and min.
      let difference = Math.abs(sliderInstance.value - 89);
      expect(difference).toBeLessThan(1);
    });

    it('should set the value as min when dragging before the track', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchDragEvent(sliderTrackElement, sliderNativeElement, 0, -1.33, gestureConfig);
      expect(sliderInstance.value).toBe(0);
    });

    it('should set the value as max when dragging past the track', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchDragEvent(sliderTrackElement, sliderNativeElement, 0, 1.75, gestureConfig);
      expect(sliderInstance.value).toBe(100);
    });

    it('should update the track fill on click', () => {
      expect(trackFillDimensions.width).toBe(0);
      dispatchClickEvent(sliderTrackElement, 0.39);

      trackFillDimensions = trackFillElement.getBoundingClientRect();
      // The fill should be close to the slider's width * the percentage from the click.
      let difference = Math.abs(trackFillDimensions.width - (sliderDimensions.width * 0.39));
      expect(difference).toBeLessThan(1);
    });

    it('should update the thumb position on click', () => {
      expect(thumbDimensions.left).toBe(sliderDimensions.left - (thumbWidth / 2));
      dispatchClickEvent(sliderTrackElement, 0.16);

      thumbDimensions = thumbElement.getBoundingClientRect();
      // The thumb's offset is expected to be equal to the slider's offset + 0.16 * the slider's
      // width - half the thumb width (to center the thumb).
      let offset = sliderDimensions.left + (sliderDimensions.width * 0.16) - (thumbWidth / 2);
      let difference = Math.abs(thumbDimensions.left - offset);
      expect(difference).toBeLessThan(1);
    });

    it('should update the track fill on drag', () => {
      expect(trackFillDimensions.width).toBe(0);
      dispatchDragEvent(sliderTrackElement, sliderNativeElement, 0, 0.86, gestureConfig);

      trackFillDimensions = trackFillElement.getBoundingClientRect();
      let difference = Math.abs(trackFillDimensions.width - (sliderDimensions.width * 0.86));
      expect(difference).toBeLessThan(1);
    });

    it('should update the thumb position on drag', () => {
      expect(thumbDimensions.left).toBe(sliderDimensions.left - (thumbWidth / 2));
      dispatchDragEvent(sliderTrackElement, sliderNativeElement, 0, 0.27, gestureConfig);

      thumbDimensions = thumbElement.getBoundingClientRect();
      let offset = sliderDimensions.left + (sliderDimensions.width * 0.27) - (thumbWidth / 2);
      let difference = Math.abs(thumbDimensions.left - offset);
      expect(difference).toBeLessThan(1);
    });

    it('should add the md-slider-active class on click', () => {
      let containerElement = sliderNativeElement.querySelector('.md-slider-container');
      expect(containerElement.classList).not.toContain('md-slider-active');

      dispatchClickEvent(sliderNativeElement, 0.23);
      fixture.detectChanges();

      expect(containerElement.classList).toContain('md-slider-active');
    });

    it('should remove the md-slider-active class on blur', () => {
      let containerElement = sliderNativeElement.querySelector('.md-slider-container');

      dispatchClickEvent(sliderNativeElement, 0.95);
      fixture.detectChanges();

      expect(containerElement.classList).toContain('md-slider-active');

      // Call the `onBlur` handler directly because we cannot simulate a focus event in unit tests.
      sliderInstance.onBlur();
      fixture.detectChanges();

      expect(containerElement.classList).not.toContain('md-slider-active');
    });

    it('should add and remove the md-slider-dragging class when dragging', () => {
      let containerElement = sliderNativeElement.querySelector('.md-slider-container');
      expect(containerElement.classList).not.toContain('md-slider-dragging');

      dispatchDragStartEvent(sliderNativeElement, 0, gestureConfig);
      fixture.detectChanges();

      expect(containerElement.classList).toContain('md-slider-dragging');

      dispatchDragEndEvent(sliderNativeElement, 0.34, gestureConfig);
      fixture.detectChanges();

      expect(containerElement.classList).not.toContain('md-slider-dragging');
    });
  });

  describe('disabled slider', () => {
    let fixture: ComponentFixture<StandardSlider>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;

    beforeEach(async(() => {
      builder.createAsync(DisabledSlider).then(f => {
        fixture = f;
        fixture.detectChanges();

        sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
        sliderNativeElement = sliderDebugElement.nativeElement;
        sliderInstance = sliderDebugElement.componentInstance;
      });
    }));

    it('should be disabled', () => {
      expect(sliderInstance.disabled).toBeTruthy();
    });

    it('should not change the value on click when disabled', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchClickEvent(sliderNativeElement, 0.63);
      expect(sliderInstance.value).toBe(0);
    });

    it('should not change the value on drag when disabled', () => {
      expect(sliderInstance.value).toBe(0);
      dispatchDragEvent(sliderNativeElement, sliderNativeElement, 0, 0.5, gestureConfig);
      expect(sliderInstance.value).toBe(0);
    });

    it('should not add the md-slider-active class on click when disabled', () => {
      let containerElement = sliderNativeElement.querySelector('.md-slider-container');
      expect(containerElement.classList).not.toContain('md-slider-active');

      dispatchClickEvent(sliderNativeElement, 0.43);
      fixture.detectChanges();

      expect(containerElement.classList).not.toContain('md-slider-active');
    });

    it('should not add the md-slider-dragging class on drag when disabled', () => {
      let containerElement = sliderNativeElement.querySelector('.md-slider-container');
      expect(containerElement.classList).not.toContain('md-slider-dragging');

      dispatchDragStartEvent(sliderNativeElement, 0.46, gestureConfig);
      fixture.detectChanges();

      expect(containerElement.classList).not.toContain('md-slider-dragging');
    });
  });

  describe('slider with set min and max', () => {
    let fixture: ComponentFixture<SliderWithMinAndMax>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let sliderTrackElement: HTMLElement;

    beforeEach(async(() => {
      builder.createAsync(SliderWithMinAndMax).then(f => {
        fixture = f;
        fixture.detectChanges();

        sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
        sliderNativeElement = sliderDebugElement.nativeElement;
        sliderInstance = sliderDebugElement.injector.get(MdSlider);
        sliderTrackElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track');
      });
    }));

    it('should set the default values from the attributes', () => {
      expect(sliderInstance.value).toBe(5);
      expect(sliderInstance.min).toBe(5);
      expect(sliderInstance.max).toBe(15);
    });

    it('should set the correct value on click', () => {
      dispatchClickEvent(sliderTrackElement, 0.09);
      // Computed by multiplying the difference between the min and the max by the percentage from
      // the click and adding that to the minimum.
      let value = 5 + (0.09 * (15 - 5));
      let difference = Math.abs(sliderInstance.value - value);
      expect(difference).toBeLessThan(1);
    });

    it('should set the correct value on drag', () => {
      dispatchDragEvent(sliderTrackElement, sliderNativeElement, 0, 0.62, gestureConfig);
      // Computed by multiplying the difference between the min and the max by the percentage from
      // the click and adding that to the minimum.
      let value = 5 + (0.62 * (15 - 5));
      let difference = Math.abs(sliderInstance.value - value);
      expect(difference).toBeLessThan(1);
    });
  });

  describe('slider with set value', () => {
    let fixture: ComponentFixture<SliderWithValue>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let sliderTrackElement: HTMLElement;

    beforeEach(async(() => {
      builder.createAsync(SliderWithValue).then(f => {
        fixture = f;
        fixture.detectChanges();

        sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
        sliderNativeElement = sliderDebugElement.nativeElement;
        sliderInstance = sliderDebugElement.injector.get(MdSlider);
        sliderTrackElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track');
      });
    }));

    it('should set the default value from the attribute', () => {
      expect(sliderInstance.value).toBe(26);
    });

    it('should set the correct value on click', () => {
      dispatchClickEvent(sliderTrackElement, 0.92);
      // On a slider with default max and min the value should be approximately equal to the
      // percentage clicked. This should be the case regardless of what the original set value was.
      let value = 92;
      let difference = Math.abs(sliderInstance.value - value);
      expect(difference).toBeLessThan(1);
    });

    it('should set the correct value on drag', () => {
      dispatchDragEvent(sliderTrackElement, sliderNativeElement, 0, 0.32, gestureConfig);
      expect(sliderInstance.value).toBe(32);
    });
  });
});

// The transition has to be removed in order to test the updated positions without setTimeout.
@Component({
  directives: [MD_SLIDER_DIRECTIVES],
  template: `<md-slider></md-slider>`,
  styles: [`
    .md-slider-track-fill, .md-slider-thumb-position {
        transition: none !important;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
class StandardSlider { }

@Component({
  directives: [MD_SLIDER_DIRECTIVES],
  template: `<md-slider disabled></md-slider>`
})
class DisabledSlider { }

@Component({
  directives: [MD_SLIDER_DIRECTIVES],
  template: `<md-slider min="5" max="15"></md-slider>`
})
class SliderWithMinAndMax { }

@Component({
  directives: [MD_SLIDER_DIRECTIVES],
  template: `<md-slider value="26"></md-slider>`
})
class SliderWithValue { }

/**
 * Dispatches a click event from an element.
 * @param element The element from which the event will be dispatched.
 * @param percentage The percentage of the slider where the click should occur. Used to find the
 * physical location of the click.
 */
function dispatchClickEvent(element: HTMLElement, percentage: number): void {
  let dimensions = element.getBoundingClientRect();
  let y = dimensions.top;
  let x = dimensions.left + (dimensions.width * percentage);

  let event = document.createEvent('MouseEvent');
  event.initMouseEvent(
      'click', true, true, window, 0, x, y, x, y, false, false, false, false, 0, null);
  element.dispatchEvent(event);
}

/**
 * Dispatches a drag event from an element.
 * @param trackElement The track element from which the event location will be calculated.
 * @param containerElement The container element from which the event will be dispatched.
 * @param startPercent The percentage of the slider where the drag will begin.
 * @param endPercent The percentage of the slider where the drag will end.
 * @param gestureConfig The gesture config for the test to handle emitting the drag events.
 */
function dispatchDragEvent(trackElement: HTMLElement, containerElement: HTMLElement,
                           startPercent: number, endPercent: number,
                           gestureConfig: TestGestureConfig): void {
  let dimensions = trackElement.getBoundingClientRect();
  let startX = dimensions.left + (dimensions.width * startPercent);
  let endX = dimensions.left + (dimensions.width * endPercent);

  gestureConfig.emitEventForElement('dragstart', containerElement, {
    // The actual event has a center with an x value that the drag listener is looking for.
    center: { x: startX },
    // The event needs a source event with a prevent default so we fake one.
    srcEvent: { preventDefault: jasmine.createSpy('preventDefault') }
  });

  gestureConfig.emitEventForElement('drag', containerElement, {
    center: { x: endX },
    srcEvent: { preventDefault: jasmine.createSpy('preventDefault') }
  });
}

/**
 * Dispatches a dragstart event from an element.
 * @param element The element from which the event will be dispatched.
 * @param startPercent The percentage of the slider where the drag will begin.
 * @param gestureConfig The gesture config for the test to handle emitting the drag events.
 */
function dispatchDragStartEvent(element: HTMLElement, startPercent: number,
                                gestureConfig: TestGestureConfig): void {
  let dimensions = element.getBoundingClientRect();
  let x = dimensions.left + (dimensions.width * startPercent);

  gestureConfig.emitEventForElement('dragstart', element, {
    center: { x: x },
    srcEvent: { preventDefault: jasmine.createSpy('preventDefault') }
  });
}

/**
 * Dispatches a dragend event from an element.
 * @param element The element from which the event will be dispatched.
 * @param endPercent The percentage of the slider where the drag will end.
 * @param gestureConfig The gesture config for the test to handle emitting the drag events.
 */
function dispatchDragEndEvent(element: HTMLElement, endPercent: number,
                                gestureConfig: TestGestureConfig): void {
  let dimensions = element.getBoundingClientRect();
  let x = dimensions.left + (dimensions.width * endPercent);

  gestureConfig.emitEventForElement('dragend', element, {
    center: { x: x },
    srcEvent: { preventDefault: jasmine.createSpy('preventDefault') }
  });
}
