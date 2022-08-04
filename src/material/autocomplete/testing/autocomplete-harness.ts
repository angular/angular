/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  BaseHarnessFilters,
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
  TestElement,
} from '@angular/cdk/testing';
import {
  MatOptgroupHarness,
  MatOptionHarness,
  OptgroupHarnessFilters,
  OptionHarnessFilters,
} from '@angular/material/core/testing';
import {AutocompleteHarnessFilters} from './autocomplete-harness-filters';

export abstract class _MatAutocompleteHarnessBase<
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
> extends ComponentHarness {
  private _documentRootLocator = this.documentRootLocatorFactory();
  protected abstract _prefix: string;
  protected abstract _optionClass: OptionType;
  protected abstract _optionGroupClass: OptionGroupType;

  /** Gets the value of the autocomplete input. */
  async getValue(): Promise<string> {
    return (await this.host()).getProperty<string>('value');
  }

  /** Whether the autocomplete input is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  /** Focuses the autocomplete input. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the autocomplete input. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Whether the autocomplete input is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }

  /** Enters text into the autocomplete. */
  async enterText(value: string): Promise<void> {
    return (await this.host()).sendKeys(value);
  }

  /** Clears the input value. */
  async clear(): Promise<void> {
    return (await this.host()).clear();
  }

  /** Gets the options inside the autocomplete panel. */
  async getOptions(filters?: Omit<OptionFilters, 'ancestor'>): Promise<Option[]> {
    if (!(await this.isOpen())) {
      throw new Error('Unable to retrieve options for autocomplete. Autocomplete panel is closed.');
    }

    return this._documentRootLocator.locatorForAll(
      this._optionClass.with({
        ...(filters || {}),
        ancestor: await this._getPanelSelector(),
      } as OptionFilters),
    )();
  }

  /** Gets the option groups inside the autocomplete panel. */
  async getOptionGroups(filters?: Omit<OptionGroupFilters, 'ancestor'>): Promise<OptionGroup[]> {
    if (!(await this.isOpen())) {
      throw new Error(
        'Unable to retrieve option groups for autocomplete. Autocomplete panel is closed.',
      );
    }

    return this._documentRootLocator.locatorForAll(
      this._optionGroupClass.with({
        ...(filters || {}),
        ancestor: await this._getPanelSelector(),
      } as OptionGroupFilters),
    )();
  }

  /** Selects the first option matching the given filters. */
  async selectOption(filters: OptionFilters): Promise<void> {
    await this.focus(); // Focus the input to make sure the autocomplete panel is shown.
    const options = await this.getOptions(filters);
    if (!options.length) {
      throw Error(`Could not find a mat-option matching ${JSON.stringify(filters)}`);
    }
    await options[0].click();
  }

  /** Whether the autocomplete is open. */
  async isOpen(): Promise<boolean> {
    const panel = await this._getPanel();
    return !!panel && (await panel.hasClass(`${this._prefix}-autocomplete-visible`));
  }

  /** Gets the panel associated with this autocomplete trigger. */
  private async _getPanel(): Promise<TestElement | null> {
    // Technically this is static, but it needs to be in a
    // function, because the autocomplete's panel ID can changed.
    return this._documentRootLocator.locatorForOptional(await this._getPanelSelector())();
  }

  /** Gets the selector that can be used to find the autocomplete trigger's panel. */
  private async _getPanelSelector(): Promise<string> {
    return `#${await (await this.host()).getAttribute('aria-owns')}`;
  }
}

/** Harness for interacting with an MDC-based mat-autocomplete in tests. */
export class MatAutocompleteHarness extends _MatAutocompleteHarnessBase<
  typeof MatOptionHarness,
  MatOptionHarness,
  OptionHarnessFilters,
  typeof MatOptgroupHarness,
  MatOptgroupHarness,
  OptgroupHarnessFilters
> {
  protected _prefix = 'mat-mdc';
  protected _optionClass = MatOptionHarness;
  protected _optionGroupClass = MatOptgroupHarness;

  /** The selector for the host element of a `MatAutocomplete` instance. */
  static hostSelector = '.mat-mdc-autocomplete-trigger';

  /**
   * Gets a `HarnessPredicate` that can be used to search for an autocomplete with specific
   * attributes.
   * @param options Options for filtering which autocomplete instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatAutocompleteHarness>(
    this: ComponentHarnessConstructor<T>,
    options: AutocompleteHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options).addOption('value', options.value, (harness, value) =>
      HarnessPredicate.stringMatches(harness.getValue(), value),
    );
  }
}
