/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate, parallel} from '@angular/cdk/testing';
import {coerceBooleanProperty, coerceNumberProperty} from '@angular/cdk/coercion';
import {LegacySliderHarnessFilters} from './slider-harness-filters';

/**
 * Harness for interacting with a standard mat-slider in tests.
 * @deprecated Use `MatSliderHarness` from `@angular/material/slider/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export class MatLegacySliderHarness extends ComponentHarness {
  /** The selector for the host element of a `MatSlider` instance. */
  static hostSelector = '.mat-slider';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatSliderHarness` that meets
   * certain criteria.
   * @param options Options for filtering which slider instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: LegacySliderHarnessFilters = {}): HarnessPredicate<MatLegacySliderHarness> {
    return new HarnessPredicate(MatLegacySliderHarness, options);
  }

  private _textLabel = this.locatorFor('.mat-slider-thumb-label-text');
  private _wrapper = this.locatorFor('.mat-slider-wrapper');

  /** Gets the slider's id. */
  async getId(): Promise<string | null> {
    const id = await (await this.host()).getAttribute('id');
    // In case no id has been specified, the "id" property always returns
    // an empty string. To make this method more explicit, we return null.
    return id !== '' ? id : null;
  }

  /**
   * Gets the current display value of the slider. Returns a null promise if the thumb label is
   * disabled.
   */
  async getDisplayValue(): Promise<string | null> {
    const [host, textLabel] = await parallel(() => [this.host(), this._textLabel()]);
    if (await host.hasClass('mat-slider-thumb-label-showing')) {
      return textLabel.text();
    }
    return null;
  }

  /** Gets the current percentage value of the slider. */
  async getPercentage(): Promise<number> {
    return this._calculatePercentage(await this.getValue());
  }

  /** Gets the current value of the slider. */
  async getValue(): Promise<number> {
    return coerceNumberProperty(await (await this.host()).getAttribute('aria-valuenow'));
  }

  /** Gets the maximum value of the slider. */
  async getMaxValue(): Promise<number> {
    return coerceNumberProperty(await (await this.host()).getAttribute('aria-valuemax'));
  }

  /** Gets the minimum value of the slider. */
  async getMinValue(): Promise<number> {
    return coerceNumberProperty(await (await this.host()).getAttribute('aria-valuemin'));
  }

  /** Whether the slider is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('aria-disabled');
    return coerceBooleanProperty(await disabled);
  }

  /** Gets the orientation of the slider. */
  async getOrientation(): Promise<'horizontal' | 'vertical'> {
    // "aria-orientation" will always be set to either "horizontal" or "vertical".
    return (await this.host()).getAttribute('aria-orientation') as any;
  }

  /**
   * Sets the value of the slider by clicking on the slider track.
   *
   * Note that in rare cases the value cannot be set to the exact specified value. This
   * can happen if not every value of the slider maps to a single pixel that could be
   * clicked using mouse interaction. In such cases consider using the keyboard to
   * select the given value or expand the slider's size for a better user experience.
   */
  async setValue(value: number): Promise<void> {
    const [sliderEl, wrapperEl, orientation] = await parallel(() => [
      this.host(),
      this._wrapper(),
      this.getOrientation(),
    ]);
    let percentage = await this._calculatePercentage(value);
    const {height, width} = await wrapperEl.getDimensions();
    const isVertical = orientation === 'vertical';

    // In case the slider is inverted in LTR mode or not inverted in RTL mode,
    // we need to invert the percentage so that the proper value is set.
    if (await sliderEl.hasClass('mat-slider-invert-mouse-coords')) {
      percentage = 1 - percentage;
    }

    // We need to round the new coordinates because creating fake DOM
    // events will cause the coordinates to be rounded down.
    const relativeX = isVertical ? 0 : Math.round(width * percentage);
    const relativeY = isVertical ? Math.round(height * percentage) : 0;

    await wrapperEl.click(relativeX, relativeY);
  }

  /** Focuses the slider. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the slider. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Whether the slider is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }

  /** Calculates the percentage of the given value. */
  private async _calculatePercentage(value: number) {
    const [min, max] = await parallel(() => [this.getMinValue(), this.getMaxValue()]);
    return (value - min) / (max - min);
  }
}
