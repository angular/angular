/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
} from '@angular/cdk/testing';
import {coerceNumberProperty} from '@angular/cdk/coercion';
import {SliderHarnessFilters, ThumbPosition} from './slider-harness-filters';
import {MatSliderThumbHarness} from './slider-thumb-harness';

/** Harness for interacting with a MDC mat-slider in tests. */
export class MatSliderHarness extends ComponentHarness {
  static hostSelector = '.mat-mdc-slider';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a slider with specific attributes.
   * @param options Options for filtering which input instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatSliderHarness>(
    this: ComponentHarnessConstructor<T>,
    options: SliderHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options).addOption(
      'isRange',
      options.isRange,
      async (harness, value) => {
        return (await harness.isRange()) === value;
      },
    );
  }

  /** Gets the start thumb of the slider (only applicable for range sliders). */
  async getStartThumb(): Promise<MatSliderThumbHarness> {
    if (!(await this.isRange())) {
      throw Error(
        '`getStartThumb` is only applicable for range sliders. ' +
          'Did you mean to use `getEndThumb`?',
      );
    }
    return this.locatorFor(MatSliderThumbHarness.with({position: ThumbPosition.START}))();
  }

  /** Gets the thumb (for single point sliders), or the end thumb (for range sliders). */
  async getEndThumb(): Promise<MatSliderThumbHarness> {
    return this.locatorFor(MatSliderThumbHarness.with({position: ThumbPosition.END}))();
  }

  /** Gets whether the slider is a range slider. */
  async isRange(): Promise<boolean> {
    return await (await this.host()).hasClass('mdc-slider--range');
  }

  /** Gets whether the slider is disabled. */
  async isDisabled(): Promise<boolean> {
    return await (await this.host()).hasClass('mdc-slider--disabled');
  }

  /** Gets the value step increments of the slider. */
  async getStep(): Promise<number> {
    // The same step value is forwarded to both thumbs.
    const startHost = await (await this.getEndThumb()).host();
    return coerceNumberProperty(await startHost.getProperty<string>('step'));
  }

  /** Gets the maximum value of the slider. */
  async getMaxValue(): Promise<number> {
    return (await this.getEndThumb()).getMaxValue();
  }

  /** Gets the minimum value of the slider. */
  async getMinValue(): Promise<number> {
    const startThumb = (await this.isRange())
      ? await this.getStartThumb()
      : await this.getEndThumb();
    return startThumb.getMinValue();
  }
}
