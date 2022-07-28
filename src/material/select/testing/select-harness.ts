/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  HarnessPredicate,
  parallel,
  ComponentHarness,
  BaseHarnessFilters,
  ComponentHarnessConstructor,
} from '@angular/cdk/testing';
import {MatFormFieldControlHarness} from '@angular/material/form-field/testing/control';
import {
  MatLegacyOptionHarness,
  MatLegacyOptgroupHarness,
  OptionHarnessFilters,
  OptgroupHarnessFilters,
} from '@angular/material/legacy-core/testing';
import {SelectHarnessFilters} from './select-harness-filters';

export abstract class _MatSelectHarnessBase<
  OptionType extends ComponentHarnessConstructor<Option> & {
    with: (options?: OptionFilters) => HarnessPredicate<Option>;
  },
  Option extends ComponentHarness & {click(): Promise<void>},
  OptionFilters extends BaseHarnessFilters,
  OptionGroupType extends ComponentHarnessConstructor<OptionGroup> & {
    with: (options?: OptionGroupFilters) => HarnessPredicate<OptionGroup>;
  },
  OptionGroup extends ComponentHarness,
  OptionGroupFilters extends BaseHarnessFilters,
> extends MatFormFieldControlHarness {
  protected abstract _prefix: string;
  protected abstract _optionClass: OptionType;
  protected abstract _optionGroupClass: OptionGroupType;
  private _documentRootLocator = this.documentRootLocatorFactory();
  private _backdrop = this._documentRootLocator.locatorFor('.cdk-overlay-backdrop');

  /** Gets a boolean promise indicating if the select is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).hasClass(`${this._prefix}-select-disabled`);
  }

  /** Gets a boolean promise indicating if the select is valid. */
  async isValid(): Promise<boolean> {
    return !(await (await this.host()).hasClass('ng-invalid'));
  }

  /** Gets a boolean promise indicating if the select is required. */
  async isRequired(): Promise<boolean> {
    return (await this.host()).hasClass(`${this._prefix}-select-required`);
  }

  /** Gets a boolean promise indicating if the select is empty (no value is selected). */
  async isEmpty(): Promise<boolean> {
    return (await this.host()).hasClass(`${this._prefix}-select-empty`);
  }

  /** Gets a boolean promise indicating if the select is in multi-selection mode. */
  async isMultiple(): Promise<boolean> {
    return (await this.host()).hasClass(`${this._prefix}-select-multiple`);
  }

  /** Gets a promise for the select's value text. */
  async getValueText(): Promise<string> {
    const value = await this.locatorFor(`.${this._prefix}-select-value`)();
    return value.text();
  }

  /** Focuses the select and returns a void promise that indicates when the action is complete. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the select and returns a void promise that indicates when the action is complete. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Whether the select is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }

  /** Gets the options inside the select panel. */
  async getOptions(filter?: Omit<OptionFilters, 'ancestor'>): Promise<Option[]> {
    return this._documentRootLocator.locatorForAll(
      this._optionClass.with({
        ...(filter || {}),
        ancestor: await this._getPanelSelector(),
      } as OptionFilters),
    )();
  }

  /** Gets the groups of options inside the panel. */
  async getOptionGroups(filter?: Omit<OptionGroupFilters, 'ancestor'>): Promise<OptionGroup[]> {
    return this._documentRootLocator.locatorForAll(
      this._optionGroupClass.with({
        ...(filter || {}),
        ancestor: await this._getPanelSelector(),
      } as OptionGroupFilters),
    )() as Promise<OptionGroup[]>;
  }

  /** Gets whether the select is open. */
  async isOpen(): Promise<boolean> {
    return !!(await this._documentRootLocator.locatorForOptional(await this._getPanelSelector())());
  }

  /** Opens the select's panel. */
  async open(): Promise<void> {
    if (!(await this.isOpen())) {
      const trigger = await this.locatorFor(`.${this._prefix}-select-trigger`)();
      return trigger.click();
    }
  }

  /**
   * Clicks the options that match the passed-in filter. If the select is in multi-selection
   * mode all options will be clicked, otherwise the harness will pick the first matching option.
   */
  async clickOptions(filter?: OptionFilters): Promise<void> {
    await this.open();

    const [isMultiple, options] = await parallel(() => [
      this.isMultiple(),
      this.getOptions(filter),
    ]);

    if (options.length === 0) {
      throw Error('Select does not have options matching the specified filter');
    }

    if (isMultiple) {
      await parallel(() => options.map(option => option.click()));
    } else {
      await options[0].click();
    }
  }

  /** Closes the select's panel. */
  async close(): Promise<void> {
    if (await this.isOpen()) {
      // This is the most consistent way that works both in both single and multi-select modes,
      // but it assumes that only one overlay is open at a time. We should be able to make it
      // a bit more precise after #16645 where we can dispatch an ESCAPE press to the host instead.
      return (await this._backdrop()).click();
    }
  }

  /** Gets the selector that should be used to find this select's panel. */
  private async _getPanelSelector(): Promise<string> {
    const id = await (await this.host()).getAttribute('id');
    return `#${id}-panel`;
  }
}

/** Harness for interacting with a standard mat-select in tests. */
export class MatSelectHarness extends _MatSelectHarnessBase<
  typeof MatLegacyOptionHarness,
  MatLegacyOptionHarness,
  OptionHarnessFilters,
  typeof MatLegacyOptgroupHarness,
  MatLegacyOptgroupHarness,
  OptgroupHarnessFilters
> {
  static hostSelector = '.mat-select';
  protected _prefix = 'mat';
  protected _optionClass = MatLegacyOptionHarness;
  protected _optionGroupClass = MatLegacyOptgroupHarness;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatSelectHarness` that meets
   * certain criteria.
   * @param options Options for filtering which select instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: SelectHarnessFilters = {}): HarnessPredicate<MatSelectHarness> {
    return new HarnessPredicate(MatSelectHarness, options);
  }
}
