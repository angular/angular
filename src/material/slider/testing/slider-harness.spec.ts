/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatSliderModule} from '@angular/material/slider';
import {MatSliderHarness} from './slider-harness';
import {MatSliderThumbHarness} from './slider-thumb-harness';
import {ThumbPosition} from './slider-harness-filters';

describe('MDC-based MatSliderHarness', () => {
  let fixture: ComponentFixture<SliderHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatSliderModule],
      declarations: [SliderHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(SliderHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load all slider harnesses', async () => {
    const sliders = await loader.getAllHarnesses(MatSliderHarness);
    expect(sliders.length).toBe(2);
  });

  it('should get whether is a range slider', async () => {
    const sliders = await loader.getAllHarnesses(MatSliderHarness);
    expect(await parallel(() => sliders.map(slider => slider.isRange()))).toEqual([false, true]);
  });

  it('should get whether a slider is disabled', async () => {
    const slider = await loader.getHarness(MatSliderHarness);
    expect(await slider.isDisabled()).toBe(false);
    fixture.componentInstance.singleSliderDisabled = true;
    expect(await slider.isDisabled()).toBe(true);
  });

  it('should get the min/max values of a single-thumb slider', async () => {
    const slider = await loader.getHarness(MatSliderHarness);
    const [min, max] = await parallel(() => [slider.getMinValue(), slider.getMaxValue()]);
    expect(min).toBe(0);
    expect(max).toBe(100);
  });

  it('should get the min/max values of a range slider', async () => {
    const slider = await loader.getHarness(MatSliderHarness.with({isRange: true}));
    const [min, max] = await parallel(() => [slider.getMinValue(), slider.getMaxValue()]);
    expect(min).toBe(fixture.componentInstance.rangeSliderMin);
    expect(max).toBe(fixture.componentInstance.rangeSliderMax);
  });

  it('should get the thumbs within a slider', async () => {
    const sliders = await loader.getAllHarnesses(MatSliderHarness);
    expect(await sliders[0].getEndThumb()).toBeTruthy();
    expect(await sliders[1].getStartThumb()).toBeTruthy();
    expect(await sliders[1].getEndThumb()).toBeTruthy();
  });

  it('should throw when trying to get the start thumb from a single point slider', async () => {
    const slider = await loader.getHarness(MatSliderHarness.with({isRange: false}));
    await expectAsync(slider.getStartThumb()).toBeRejectedWithError(
      '`getStartThumb` is only applicable for range sliders. ' +
        'Did you mean to use `getEndThumb`?',
    );
  });

  it('should get the step of a slider', async () => {
    const sliders = await loader.getAllHarnesses(MatSliderHarness);
    expect(
      await parallel(() => {
        return sliders.map(slider => slider.getStep());
      }),
    ).toEqual([1, fixture.componentInstance.rangeSliderStep]);
  });

  it('should get the position of a slider thumb in a range slider', async () => {
    const slider = await loader.getHarness(MatSliderHarness.with({selector: '#range'}));
    const [start, end] = await parallel(() => [slider.getStartThumb(), slider.getEndThumb()]);
    expect(await start.getPosition()).toBe(ThumbPosition.START);
    expect(await end.getPosition()).toBe(ThumbPosition.END);
  });

  it('should get the position of a slider thumb in a non-range slider', async () => {
    const thumb = await loader.getHarness(MatSliderThumbHarness.with({ancestor: '#single'}));
    expect(await thumb.getPosition()).toBe(ThumbPosition.END);
  });

  it('should get and set the value of a slider thumb', async () => {
    const slider = await loader.getHarness(MatSliderHarness);
    const thumb = await slider.getEndThumb();
    expect(await thumb.getValue()).toBe(0);
    await thumb.setValue(73);
    expect(await thumb.getValue()).toBe(73);
  });

  it('should dispatch input and change events when setting the value', async () => {
    const slider = await loader.getHarness(MatSliderHarness);
    const thumb = await slider.getEndThumb();
    const changeSpy = spyOn(fixture.componentInstance, 'changeListener');
    const inputSpy = spyOn(fixture.componentInstance, 'inputListener');
    await thumb.setValue(73);
    expect(changeSpy).toHaveBeenCalledTimes(1);
    expect(inputSpy).toHaveBeenCalledTimes(1);
    expect(await thumb.getValue()).toBe(73);
  });

  it('should get the value of a thumb as a percentage', async () => {
    const sliders = await loader.getAllHarnesses(MatSliderHarness);
    expect(await (await sliders[0].getEndThumb()).getPercentage()).toBe(0);
    expect(await (await sliders[1].getStartThumb()).getPercentage()).toBe(0.4);
    expect(await (await sliders[1].getEndThumb()).getPercentage()).toBe(0.5);
  });

  it('should get the display value of a slider thumb', async () => {
    const slider = await loader.getHarness(MatSliderHarness);
    const thumb = await slider.getEndThumb();
    fixture.componentInstance.displayFn = value => `#${value}`;
    await thumb.setValue(73);
    expect(await thumb.getDisplayValue()).toBe('#73');
  });

  it('should get the min/max values of a slider thumb', async () => {
    const instance = fixture.componentInstance;
    const slider = await loader.getHarness(MatSliderHarness.with({selector: '#range'}));
    const [start, end] = await parallel(() => [slider.getStartThumb(), slider.getEndThumb()]);

    expect(await start.getMinValue()).toBe(instance.rangeSliderMin);
    expect(await start.getMaxValue()).toBe(instance.rangeSliderEndValue);
    expect(await end.getMinValue()).toBe(instance.rangeSliderStartValue);
    expect(await end.getMaxValue()).toBe(instance.rangeSliderMax);
  });

  it('should get the disabled state of a slider thumb', async () => {
    const slider = await loader.getHarness(MatSliderHarness);
    const thumb = await slider.getEndThumb();

    expect(await thumb.isDisabled()).toBe(false);
    fixture.componentInstance.singleSliderDisabled = true;
    expect(await thumb.isDisabled()).toBe(true);
  });

  it('should get the name of a slider thumb', async () => {
    const slider = await loader.getHarness(MatSliderHarness);
    expect(await (await slider.getEndThumb()).getName()).toBe('price');
  });

  it('should get the id of a slider thumb', async () => {
    const slider = await loader.getHarness(MatSliderHarness);
    expect(await (await slider.getEndThumb()).getId()).toBe('price-input');
  });

  it('should be able to focus and blur a slider thumb', async () => {
    const slider = await loader.getHarness(MatSliderHarness);
    const thumb = await slider.getEndThumb();

    expect(await thumb.isFocused()).toBe(false);
    await thumb.focus();
    expect(await thumb.isFocused()).toBe(true);
    await thumb.blur();
    expect(await thumb.isFocused()).toBe(false);
  });
});

@Component({
  template: `
    <mat-slider id="single" [displayWith]="displayFn" [disabled]="singleSliderDisabled">
      <input
        name="price"
        id="price-input"
        matSliderThumb
        (input)="inputListener()"
        (change)="changeListener()">
    </mat-slider>

    <mat-slider id="range" [min]="rangeSliderMin" [max]="rangeSliderMax" [step]="rangeSliderStep">
      <input [value]="rangeSliderStartValue" matSliderStartThumb>
      <input [value]="rangeSliderEndValue" matSliderEndThumb>
    </mat-slider>
  `,
})
class SliderHarnessTest {
  singleSliderDisabled = false;
  rangeSliderMin = 100;
  rangeSliderMax = 500;
  rangeSliderStep = 50;
  rangeSliderStartValue = 200;
  rangeSliderEndValue = 350;
  displayFn = (value: number) => value + '';
  inputListener() {}
  changeListener() {}
}
