/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceNumberProperty} from '@angular/cdk/coercion';
import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
  parallel,
} from '@angular/cdk/testing';
import {SliderThumbHarnessFilters, ThumbPosition} from './slider-harness-filters';

/** Harness for interacting with a thumb inside of a Material slider in tests. */
export class MatSliderThumbHarness extends ComponentHarness {
  static hostSelector =
    'input[matSliderThumb], input[matSliderStartThumb], input[matSliderEndThumb]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a slider thumb with specific attributes.
   * @param options Options for filtering which thumb instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatSliderThumbHarness>(
    this: ComponentHarnessConstructor<T>,
    options: SliderThumbHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options).addOption(
      'position',
      options.position,
      async (harness, value) => {
        return (await harness.getPosition()) === value;
      },
    );
  }

  /** Gets the position of the thumb inside the slider. */
  async getPosition(): Promise<ThumbPosition> {
    // Meant to mimic MDC's logic where `matSliderThumb` is treated as END.
    const isStart = (await (await this.host()).getAttribute('matSliderStartThumb')) != null;
    return isStart ? ThumbPosition.START : ThumbPosition.END;
  }

  /** Gets the value of the thumb. */
  async getValue(): Promise<number> {
    return await (await this.host()).getProperty<number>('valueAsNumber');
  }

  /** Sets the value of the thumb. */
  async setValue(newValue: number): Promise<void> {
    const input = await this.host();

    // Since this is a range input, we can't simulate the user interacting with it so we set the
    // value directly and dispatch a couple of fake events to ensure that everything fires.
    await input.setInputValue(newValue + '');
    await input.dispatchEvent('input');
    await input.dispatchEvent('change');
  }

  /** Gets the current percentage value of the slider. */
  async getPercentage(): Promise<number> {
    const [value, min, max] = await parallel(() => [
      this.getValue(),
      this.getMinValue(),
      this.getMaxValue(),
    ]);

    return (value - min) / (max - min);
  }

  /** Gets the maximum value of the thumb. */
  async getMaxValue(): Promise<number> {
    return coerceNumberProperty(await (await this.host()).getProperty<number>('max'));
  }

  /** Gets the minimum value of the thumb. */
  async getMinValue(): Promise<number> {
    return coerceNumberProperty(await (await this.host()).getProperty<number>('min'));
  }

  /** Gets the text representation of the slider's value. */
  async getDisplayValue(): Promise<string> {
    return (await (await this.host()).getAttribute('aria-valuetext')) || '';
  }

  /** Whether the thumb is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).getProperty<boolean>('disabled');
  }

  /** Gets the name of the thumb. */
  async getName(): Promise<string> {
    return await (await this.host()).getProperty<string>('name');
  }

  /** Gets the id of the thumb. */
  async getId(): Promise<string> {
    return await (await this.host()).getProperty<string>('id');
  }

  /**
   * Focuses the thumb and returns a promise that indicates when the
   * action is complete.
   */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /**
   * Blurs the thumb and returns a promise that indicates when the
   * action is complete.
   */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Whether the thumb is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }
}
