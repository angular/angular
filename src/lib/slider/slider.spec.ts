import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule, FormControl} from '@angular/forms';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MdSlider, MdSliderModule} from './slider';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {TestGestureConfig} from './test-gesture-config';


describe('MdSlider', () => {
  let gestureConfig: TestGestureConfig;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdSliderModule.forRoot(), ReactiveFormsModule],
      declarations: [
        StandardSlider,
        DisabledSlider,
        SliderWithMinAndMax,
        SliderWithValue,
        SliderWithStep,
        SliderWithAutoTickInterval,
        SliderWithSetTickInterval,
        SliderWithThumbLabel,
        SliderWithOneWayBinding,
        SliderWithTwoWayBinding,
        SliderWithValueSmallerThanMin,
        SliderWithValueGreaterThanMax,
        SliderWithChangeHandler,
      ],
      providers: [
        {provide: HAMMER_GESTURE_CONFIG, useFactory: () => {
          gestureConfig = new TestGestureConfig();
          return gestureConfig;
        }}
      ],
    });

    TestBed.compileComponents();
  }));

  describe('standard slider', () => {
    let fixture: ComponentFixture<StandardSlider>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let trackFillElement: HTMLElement;
    let sliderTrackElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardSlider);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.componentInstance;

      trackFillElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track-fill');
      sliderTrackElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track');
    });

    it('should set the default values', () => {
      expect(sliderInstance.value).toBe(0);
      expect(sliderInstance.min).toBe(0);
      expect(sliderInstance.max).toBe(100);
    });

    it('should update the value on a click', () => {
      expect(sliderInstance.value).toBe(0);

      dispatchClickEventSequence(sliderNativeElement, 0.19);

      expect(sliderInstance.value).toBe(19);
    });

    it('should update the value on a slide', () => {
      expect(sliderInstance.value).toBe(0);

      dispatchSlideEventSequence(sliderNativeElement, 0, 0.89, gestureConfig);

      expect(sliderInstance.value).toBe(89);
    });

    it('should set the value as min when sliding before the track', () => {
      expect(sliderInstance.value).toBe(0);

      dispatchSlideEventSequence(sliderNativeElement, 0, -1.33, gestureConfig);

      expect(sliderInstance.value).toBe(0);
    });

    it('should set the value as max when sliding past the track', () => {
      expect(sliderInstance.value).toBe(0);

      dispatchSlideEventSequence(sliderNativeElement, 0, 1.75, gestureConfig);

      expect(sliderInstance.value).toBe(100);
    });

    it('should update the track fill on click', () => {
      expect(trackFillElement.style.flexBasis).toBe('0%');

      dispatchClickEventSequence(sliderNativeElement, 0.39);
      fixture.detectChanges();

      expect(trackFillElement.style.flexBasis).toBe('39%');
    });

    it('should update the track fill on slide', () => {
      expect(trackFillElement.style.flexBasis).toBe('0%');

      dispatchSlideEventSequence(sliderNativeElement, 0, 0.86, gestureConfig);
      fixture.detectChanges();

      expect(trackFillElement.style.flexBasis).toBe('86%');
    });

    it('should add the md-slider-active class on click', () => {
      expect(sliderNativeElement.classList).not.toContain('md-slider-active');

      dispatchClickEventSequence(sliderNativeElement, 0.23);
      fixture.detectChanges();

      expect(sliderNativeElement.classList).toContain('md-slider-active');
    });

    it('should remove the md-slider-active class on blur', () => {
      dispatchClickEventSequence(sliderNativeElement, 0.95);
      fixture.detectChanges();

      expect(sliderNativeElement.classList).toContain('md-slider-active');

      // Call the `onBlur` handler directly because we cannot simulate a focus event in unit tests.
      sliderInstance._onBlur();
      fixture.detectChanges();

      expect(sliderNativeElement.classList).not.toContain('md-slider-active');
    });

    it('should add and remove the md-slider-sliding class when sliding', () => {
      expect(sliderNativeElement.classList).not.toContain('md-slider-sliding');

      dispatchSlideStartEvent(sliderNativeElement, 0, gestureConfig);
      fixture.detectChanges();

      expect(sliderNativeElement.classList).toContain('md-slider-sliding');

      dispatchSlideEndEvent(sliderNativeElement, 0.34, gestureConfig);
      fixture.detectChanges();

      expect(sliderNativeElement.classList).not.toContain('md-slider-sliding');
    });
  });

  describe('disabled slider', () => {
    let fixture: ComponentFixture<StandardSlider>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderTrackElement: HTMLElement;
    let sliderInstance: MdSlider;

    beforeEach(() => {
      fixture = TestBed.createComponent(DisabledSlider);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderTrackElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track');
      sliderInstance = sliderDebugElement.componentInstance;
    });

    it('should be disabled', () => {
      expect(sliderInstance.disabled).toBeTruthy();
    });

    it('should not change the value on click when disabled', () => {
      expect(sliderInstance.value).toBe(0);

      dispatchClickEventSequence(sliderNativeElement, 0.63);

      expect(sliderInstance.value).toBe(0);
    });

    it('should not change the value on slide when disabled', () => {
      expect(sliderInstance.value).toBe(0);

      dispatchSlideEventSequence(sliderNativeElement, 0, 0.5, gestureConfig);

      expect(sliderInstance.value).toBe(0);
    });

    it('should not add the md-slider-active class on click when disabled', () => {
      expect(sliderNativeElement.classList).not.toContain('md-slider-active');

      dispatchClickEventSequence(sliderNativeElement, 0.43);
      fixture.detectChanges();

      expect(sliderNativeElement.classList).not.toContain('md-slider-active');
    });

    it('should not add the md-slider-sliding class on slide when disabled', () => {
      expect(sliderNativeElement.classList).not.toContain('md-slider-sliding');

      dispatchSlideStartEvent(sliderNativeElement, 0.46, gestureConfig);
      fixture.detectChanges();

      expect(sliderNativeElement.classList).not.toContain('md-slider-sliding');
    });
  });

  describe('slider with set min and max', () => {
    let fixture: ComponentFixture<SliderWithMinAndMax>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let sliderTrackElement: HTMLElement;
    let trackFillElement: HTMLElement;
    let ticksContainerElement: HTMLElement;
    let ticksElement: HTMLElement;
    let testComponent: SliderWithMinAndMax;

    beforeEach(() => {
      fixture = TestBed.createComponent(SliderWithMinAndMax);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
      testComponent = fixture.debugElement.componentInstance;
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.injector.get(MdSlider);
      sliderTrackElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track');
      trackFillElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track-fill');
      ticksContainerElement =
          <HTMLElement>sliderNativeElement.querySelector('.md-slider-ticks-container');
      ticksElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-ticks');
    });

    it('should set the default values from the attributes', () => {
      expect(sliderInstance.value).toBe(4);
      expect(sliderInstance.min).toBe(4);
      expect(sliderInstance.max).toBe(6);
    });

    it('should set the correct value on click', () => {
      dispatchClickEventSequence(sliderNativeElement, 0.09);
      fixture.detectChanges();

      // Computed by multiplying the difference between the min and the max by the percentage from
      // the click and adding that to the minimum.
      let value = Math.round(4 + (0.09 * (6 - 4)));
      expect(sliderInstance.value).toBe(value);
    });

    it('should set the correct value on slide', () => {
      dispatchSlideEventSequence(sliderNativeElement, 0, 0.62, gestureConfig);
      fixture.detectChanges();

      // Computed by multiplying the difference between the min and the max by the percentage from
      // the click and adding that to the minimum.
      let value = Math.round(4 + (0.62 * (6 - 4)));
      expect(sliderInstance.value).toBe(value);
    });

    it('should snap the fill to the nearest value on click', () => {
      dispatchClickEventSequence(sliderNativeElement, 0.68);
      fixture.detectChanges();

      // The closest snap is halfway on the slider.
      expect(trackFillElement.style.flexBasis).toBe('50%');
    });

    it('should snap the fill to the nearest value on slide', () => {
      dispatchSlideEventSequence(sliderNativeElement, 0, 0.74, gestureConfig);
      fixture.detectChanges();

      // The closest snap is at the halfway point on the slider.
      expect(trackFillElement.style.flexBasis).toBe('50%');
    });

    it('should adjust fill and ticks on mouse enter when min changes', () => {
      testComponent.min = -2;
      fixture.detectChanges();

      dispatchMouseenterEvent(sliderNativeElement);
      fixture.detectChanges();

      expect(trackFillElement.style.flexBasis).toBe('75%');
      expect(ticksElement.style.backgroundSize).toBe('75% 2px');
      // Make sure it cuts off the last half tick interval.
      expect(ticksElement.style.marginLeft).toBe('37.5%');
      expect(ticksContainerElement.style.marginLeft).toBe('-37.5%');
    });

    it('should adjust fill and ticks on mouse enter when max changes', () => {
      testComponent.min = -2;
      fixture.detectChanges();

      testComponent.max = 10;
      fixture.detectChanges();

      dispatchMouseenterEvent(sliderNativeElement);
      fixture.detectChanges();

      expect(trackFillElement.style.flexBasis).toBe('50%');
      expect(ticksElement.style.backgroundSize).toBe('50% 2px');
      // Make sure it cuts off the last half tick interval.
      expect(ticksElement.style.marginLeft).toBe('25%');
      expect(ticksContainerElement.style.marginLeft).toBe('-25%');
    });
  });

  describe('slider with set value', () => {
    let fixture: ComponentFixture<SliderWithValue>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let sliderTrackElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SliderWithValue);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.injector.get(MdSlider);
      sliderTrackElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track');
    });

    it('should set the default value from the attribute', () => {
      expect(sliderInstance.value).toBe(26);
    });

    it('should set the correct value on click', () => {
      dispatchClickEventSequence(sliderNativeElement, 0.92);
      fixture.detectChanges();

      // On a slider with default max and min the value should be approximately equal to the
      // percentage clicked. This should be the case regardless of what the original set value was.
      expect(sliderInstance.value).toBe(92);
    });

    it('should set the correct value on slide', () => {
      dispatchSlideEventSequence(sliderNativeElement, 0, 0.32, gestureConfig);
      fixture.detectChanges();

      expect(sliderInstance.value).toBe(32);
    });
  });

  describe('slider with set step', () => {
    let fixture: ComponentFixture<SliderWithStep>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let sliderTrackElement: HTMLElement;
    let trackFillElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SliderWithStep);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.injector.get(MdSlider);
      sliderTrackElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track');
      trackFillElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track-fill');
    });

    it('should set the correct step value on click', () => {
      expect(sliderInstance.value).toBe(0);

      dispatchClickEventSequence(sliderNativeElement, 0.13);
      fixture.detectChanges();

      expect(sliderInstance.value).toBe(25);
    });

    it('should snap the fill to a step on click', () => {
      dispatchClickEventSequence(sliderNativeElement, 0.66);
      fixture.detectChanges();

      // The closest step is at 75% of the slider.
      expect(trackFillElement.style.flexBasis).toBe('75%');
    });

    it('should set the correct step value on slide', () => {
      dispatchSlideEventSequence(sliderNativeElement, 0, 0.07, gestureConfig);
      fixture.detectChanges();

      expect(sliderInstance.value).toBe(0);
    });

    it('should snap the thumb and fill to a step on slide', () => {
      dispatchSlideEventSequence(sliderNativeElement, 0, 0.88, gestureConfig);
      fixture.detectChanges();

      // The closest snap is at the end of the slider.
      expect(trackFillElement.style.flexBasis).toBe('100%');
    });
  });

  describe('slider with auto ticks', () => {
    let fixture: ComponentFixture<SliderWithAutoTickInterval>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let ticksContainerElement: HTMLElement;
    let ticksElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SliderWithAutoTickInterval);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      ticksContainerElement =
          <HTMLElement>sliderNativeElement.querySelector('.md-slider-ticks-container');
      ticksElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-ticks');
    });

    it('should set the correct tick separation on mouse enter', () => {
      dispatchMouseenterEvent(sliderNativeElement);
      fixture.detectChanges();

      // Ticks should be 30px apart (therefore 30% for a 100px long slider).
      expect(ticksElement.style.backgroundSize).toBe('30% 2px');
      // Make sure it cuts off the last half tick interval.
      expect(ticksElement.style.marginLeft).toBe('15%');
      expect(ticksContainerElement.style.marginLeft).toBe('-15%');
    });
  });

  describe('slider with set tick interval', () => {
    let fixture: ComponentFixture<SliderWithSetTickInterval>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let ticksContainerElement: HTMLElement;
    let ticksElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SliderWithSetTickInterval);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      ticksContainerElement =
          <HTMLElement>sliderNativeElement.querySelector('.md-slider-ticks-container');
      ticksElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-ticks');
    });

    it('should set the correct tick separation on mouse enter', () => {
      dispatchMouseenterEvent(sliderNativeElement);
      fixture.detectChanges();

      // Ticks should be every 18 values (tickInterval of 6 * step size of 3). On a slider 100px
      // long with 100 values, this is 18%.
      expect(ticksElement.style.backgroundSize).toBe('18% 2px');
      // Make sure it cuts off the last half tick interval.
      expect(ticksElement.style.marginLeft).toBe('9%');
      expect(ticksContainerElement.style.marginLeft).toBe('-9%');
    });
  });

  describe('slider with thumb label', () => {
    let fixture: ComponentFixture<SliderWithThumbLabel>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let sliderTrackElement: HTMLElement;
    let thumbLabelTextElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(SliderWithThumbLabel);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.componentInstance;
      sliderTrackElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track');
      thumbLabelTextElement = sliderNativeElement.querySelector('.md-slider-thumb-label-text');
    });

    it('should add the thumb label class to the slider container', () => {
      expect(sliderNativeElement.classList).toContain('md-slider-thumb-label-showing');
    });

    it('should update the thumb label text on click', () => {
      expect(thumbLabelTextElement.textContent).toBe('0');

      dispatchClickEventSequence(sliderNativeElement, 0.13);
      fixture.detectChanges();

      // The thumb label text is set to the slider's value. These should always be the same.
      expect(thumbLabelTextElement.textContent).toBe('13');
    });

    it('should update the thumb label text on slide', () => {
      expect(thumbLabelTextElement.textContent).toBe('0');

      dispatchSlideEventSequence(sliderNativeElement, 0, 0.56, gestureConfig);
      fixture.detectChanges();

      // The thumb label text is set to the slider's value. These should always be the same.
      expect(thumbLabelTextElement.textContent).toBe(`${sliderInstance.value}`);
    });

    it('should show the thumb label on click', () => {
      expect(sliderNativeElement.classList).not.toContain('md-slider-active');
      expect(sliderNativeElement.classList).toContain('md-slider-thumb-label-showing');

      dispatchClickEventSequence(sliderNativeElement, 0.49);
      fixture.detectChanges();

      // The thumb label appears when the slider is active and the 'md-slider-thumb-label-showing'
      // class is applied.
      expect(sliderNativeElement.classList).toContain('md-slider-thumb-label-showing');
      expect(sliderNativeElement.classList).toContain('md-slider-active');
    });

    it('should show the thumb label on slide', () => {
      expect(sliderNativeElement.classList).not.toContain('md-slider-active');

      dispatchSlideEventSequence(sliderNativeElement, 0, 0.91, gestureConfig);
      fixture.detectChanges();

      expect(sliderNativeElement.classList).toContain('md-slider-thumb-label-showing');
      expect(sliderNativeElement.classList).toContain('md-slider-active');
    });
  });

  describe('slider as a custom form control', () => {
    let fixture: ComponentFixture<SliderWithTwoWayBinding>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let sliderTrackElement: HTMLElement;
    let testComponent: SliderWithTwoWayBinding;

    beforeEach(() => {
      fixture = TestBed.createComponent(SliderWithTwoWayBinding);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.injector.get(MdSlider);
      sliderTrackElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track');
    });

    it('should not update the control when the value is updated', () => {
      expect(testComponent.control.value).toBe(0);

      sliderInstance.value = 11;
      fixture.detectChanges();

      expect(testComponent.control.value).toBe(0);
    });

    it('should update the control on click', () => {
      expect(testComponent.control.value).toBe(0);

      dispatchClickEventSequence(sliderNativeElement, 0.76);
      fixture.detectChanges();

      expect(testComponent.control.value).toBe(76);
    });

    it('should update the control on slide', () => {
      expect(testComponent.control.value).toBe(0);

      dispatchSlideEventSequence(sliderNativeElement, 0, 0.19, gestureConfig);
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

    // TODO: Add tests for ng-pristine, ng-touched, ng-invalid.
  });

  describe('slider with value property binding', () => {
    let fixture: ComponentFixture<SliderWithOneWayBinding>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let sliderTrackElement: HTMLElement;
    let testComponent: SliderWithOneWayBinding;
    let trackFillElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SliderWithOneWayBinding);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;

      sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.injector.get(MdSlider);
      sliderTrackElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track');
      trackFillElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track-fill');
    });

    it('should initialize based on bound value', () => {
      expect(sliderInstance.value).toBe(50);
      expect(trackFillElement.style.flexBasis).toBe('50%');
    });

    it('should update when bound value changes', () => {
      testComponent.val = 75;
      fixture.detectChanges();

      expect(sliderInstance.value).toBe(75);
      expect(trackFillElement.style.flexBasis).toBe('75%');
    });
  });

  describe('slider with set min and max and a value smaller than min', () => {
    let fixture: ComponentFixture<SliderWithValueSmallerThanMin>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let sliderTrackElement: HTMLElement;
    let trackFillElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SliderWithValueSmallerThanMin);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.componentInstance;
      sliderTrackElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track');
      trackFillElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track-fill');
    });

    it('should set the value smaller than the min value', () => {
      expect(sliderInstance.value).toBe(3);
      expect(sliderInstance.min).toBe(4);
      expect(sliderInstance.max).toBe(6);
    });

    it('should set the fill to the min value', () => {
      expect(trackFillElement.style.flexBasis).toBe('0%');
    });
  });

  describe('slider with set min and max and a value greater than max', () => {
    let fixture: ComponentFixture<SliderWithValueSmallerThanMin>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderInstance: MdSlider;
    let sliderTrackElement: HTMLElement;
    let trackFillElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SliderWithValueGreaterThanMax);
      fixture.detectChanges();

      sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderInstance = sliderDebugElement.componentInstance;
      sliderTrackElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track');
      trackFillElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track-fill');
    });

    it('should set the value greater than the max value', () => {
      expect(sliderInstance.value).toBe(7);
      expect(sliderInstance.min).toBe(4);
      expect(sliderInstance.max).toBe(6);
    });

    it('should set the fill to the max value', () => {
      expect(trackFillElement.style.flexBasis).toBe('100%');
    });
  });

  describe('slider with change handler', () => {
    let fixture: ComponentFixture<SliderWithChangeHandler>;
    let sliderDebugElement: DebugElement;
    let sliderNativeElement: HTMLElement;
    let sliderTrackElement: HTMLElement;
    let testComponent: SliderWithChangeHandler;

    beforeEach(() => {
      fixture = TestBed.createComponent(SliderWithChangeHandler);
      fixture.detectChanges();

      testComponent = fixture.debugElement.componentInstance;
      spyOn(testComponent, 'onChange');

      sliderDebugElement = fixture.debugElement.query(By.directive(MdSlider));
      sliderNativeElement = sliderDebugElement.nativeElement;
      sliderTrackElement = <HTMLElement>sliderNativeElement.querySelector('.md-slider-track');
    });

    it('should emit change on click', () => {
      expect(testComponent.onChange).not.toHaveBeenCalled();

      dispatchClickEventSequence(sliderNativeElement, 0.2);
      fixture.detectChanges();

      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
    });

    it('should emit change on slide', () => {
      expect(testComponent.onChange).not.toHaveBeenCalled();

      dispatchSlideEventSequence(sliderNativeElement, 0, 0.4, gestureConfig);
      fixture.detectChanges();

      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
    });

    it('should not emit multiple changes for same value', () => {
      expect(testComponent.onChange).not.toHaveBeenCalled();

      dispatchClickEventSequence(sliderNativeElement, 0.6);
      dispatchSlideEventSequence(sliderNativeElement, 0.6, 0.6, gestureConfig);
      fixture.detectChanges();

      expect(testComponent.onChange).toHaveBeenCalledTimes(1);
    });
  });
});

// Disable animations and make the slider an even 100px (+ 8px padding on either side)
// so we get nice round values in tests.
const styles = `
  md-slider { min-width: 116px !important; }
  .md-slider-track-fill { transition: none !important; }
`;

@Component({
  template: `<md-slider></md-slider>`,
  styles: [styles],
})
class StandardSlider { }

@Component({
  template: `<md-slider disabled></md-slider>`,
  styles: [styles],
})
class DisabledSlider { }

@Component({
  template: `<md-slider [min]="min" [max]="max" tick-interval="6"></md-slider>`,
  styles: [styles],
})
class SliderWithMinAndMax {
  min = 4;
  max = 6;
}

@Component({
  template: `<md-slider value="26"></md-slider>`,
  styles: [styles],
})
class SliderWithValue { }

@Component({
  template: `<md-slider step="25"></md-slider>`,
  styles: [styles],
})
class SliderWithStep { }

@Component({
  template: `<md-slider step="5" tick-interval="auto"></md-slider>`,
  styles: [styles],
})
class SliderWithAutoTickInterval { }

@Component({
  template: `<md-slider step="3" tick-interval="6"></md-slider>`,
  styles: [styles],
})
class SliderWithSetTickInterval { }

@Component({
  template: `<md-slider thumb-label></md-slider>`,
  styles: [styles],
})
class SliderWithThumbLabel { }

@Component({
  template: `<md-slider [value]="val"></md-slider>`,
  styles: [styles],
})
class SliderWithOneWayBinding {
  val = 50;
}

@Component({
  template: `<md-slider [formControl]="control"></md-slider>`,
  styles: [styles],
})
class SliderWithTwoWayBinding {
  control = new FormControl(0);
}

@Component({
  template: `<md-slider value="3" min="4" max="6"></md-slider>`,
  styles: [styles],
})
class SliderWithValueSmallerThanMin { }

@Component({
  template: `<md-slider value="7" min="4" max="6"></md-slider>`,
  styles: [styles],
})
class SliderWithValueGreaterThanMax { }

@Component({
  template: `<md-slider (change)="onChange($event)"></md-slider>`,
  styles: [styles],
})
class SliderWithChangeHandler {
  onChange() { }
}

/**
 * Dispatches a click event from an element.
 * Note: The mouse event truncates the position for the click.
 * @param sliderElement The md-slider element from which the event will be dispatched.
 * @param percentage The percentage of the slider where the click should occur. Used to find the
 * physical location of the click.
 */
function dispatchClickEventSequence(sliderElement: HTMLElement, percentage: number): void {
  let trackElement = sliderElement.querySelector('.md-slider-track');
  let dimensions = trackElement.getBoundingClientRect();
  let y = dimensions.top;
  let x = dimensions.left + (dimensions.width * percentage);

  dispatchMouseenterEvent(sliderElement);

  let event = document.createEvent('MouseEvent');
  event.initMouseEvent(
      'click', true, true, window, 0, x, y, x, y, false, false, false, false, 0, null);
  sliderElement.dispatchEvent(event);
}

/**
 * Dispatches a slide event sequence (consisting of slidestart, slide, slideend) from an element.
 * @param sliderElement The md-slider element from which the event will be dispatched.
 * @param startPercent The percentage of the slider where the slide will begin.
 * @param endPercent The percentage of the slider where the slide will end.
 * @param gestureConfig The gesture config for the test to handle emitting the slide events.
 */
function dispatchSlideEventSequence(sliderElement: HTMLElement, startPercent: number,
                                    endPercent: number, gestureConfig: TestGestureConfig): void {
  dispatchMouseenterEvent(sliderElement);
  dispatchSlideStartEvent(sliderElement, startPercent, gestureConfig);
  dispatchSlideEvent(sliderElement, startPercent, gestureConfig);
  dispatchSlideEvent(sliderElement, endPercent, gestureConfig);
  dispatchSlideEndEvent(sliderElement, endPercent, gestureConfig);
}

/**
 * Dispatches a slide event from an element.
 * @param sliderElement The md-slider element from which the event will be dispatched.
 * @param percent The percentage of the slider where the slide will happen.
 * @param gestureConfig The gesture config for the test to handle emitting the slide events.
 */
function dispatchSlideEvent(sliderElement: HTMLElement, percent: number,
                            gestureConfig: TestGestureConfig): void {
  let trackElement = sliderElement.querySelector('.md-slider-track');
  let dimensions = trackElement.getBoundingClientRect();
  let x = dimensions.left + (dimensions.width * percent);

  gestureConfig.emitEventForElement('slide', sliderElement, {
    center: { x: x },
    srcEvent: { preventDefault: jasmine.createSpy('preventDefault') }
  });
}

/**
 * Dispatches a slidestart event from an element.
 * @param sliderElement The md-slider element from which the event will be dispatched.
 * @param percent The percentage of the slider where the slide will begin.
 * @param gestureConfig The gesture config for the test to handle emitting the slide events.
 */
function dispatchSlideStartEvent(sliderElement: HTMLElement, percent: number,
                                 gestureConfig: TestGestureConfig): void {
  let trackElement = sliderElement.querySelector('.md-slider-track');
  let dimensions = trackElement.getBoundingClientRect();
  let x = dimensions.left + (dimensions.width * percent);

  gestureConfig.emitEventForElement('slidestart', sliderElement, {
    center: { x: x },
    srcEvent: { preventDefault: jasmine.createSpy('preventDefault') }
  });
}

/**
 * Dispatches a slideend event from an element.
 * @param sliderElement The md-slider element from which the event will be dispatched.
 * @param percent The percentage of the slider where the slide will end.
 * @param gestureConfig The gesture config for the test to handle emitting the slide events.
 */
function dispatchSlideEndEvent(sliderElement: HTMLElement, percent: number,
                               gestureConfig: TestGestureConfig): void {
  let trackElement = sliderElement.querySelector('.md-slider-track');
  let dimensions = trackElement.getBoundingClientRect();
  let x = dimensions.left + (dimensions.width * percent);

  gestureConfig.emitEventForElement('slideend', sliderElement, {
    center: { x: x },
    srcEvent: { preventDefault: jasmine.createSpy('preventDefault') }
  });
}

/**
 * Dispatches a mouseenter event from an element.
 * Note: The mouse event truncates the position for the click.
 * @param trackElement The track element from which the event location will be calculated.
 * @param containerElement The container element from which the event will be dispatched.
 * @param percentage The percentage of the slider where the click should occur. Used to find the
 * physical location of the click.
 */
function dispatchMouseenterEvent(element: HTMLElement): void {
  let dimensions = element.getBoundingClientRect();
  let y = dimensions.top;
  let x = dimensions.left;

  let event = document.createEvent('MouseEvent');
  event.initMouseEvent(
      'mouseenter', true, true, window, 0, x, y, x, y, false, false, false, false, 0, null);
  element.dispatchEvent(event);
}
