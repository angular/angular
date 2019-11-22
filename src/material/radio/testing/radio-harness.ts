/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {RadioButtonHarnessFilters, RadioGroupHarnessFilters} from './radio-harness-filters';

/** Harness for interacting with a standard mat-radio-group in tests. */
export class MatRadioGroupHarness extends ComponentHarness {
  /** The selector for the host element of a `MatRadioGroup` instance. */
  static hostSelector = 'mat-radio-group';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatRadioGroupHarness` that meets
   * certain criteria.
   * @param options Options for filtering which radio group instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: RadioGroupHarnessFilters = {}): HarnessPredicate<MatRadioGroupHarness> {
    return new HarnessPredicate(MatRadioGroupHarness, options)
        .addOption('name', options.name, this._checkRadioGroupName);
  }

  /** Gets the name of the radio-group. */
  async getName(): Promise<string|null> {
    const hostName = await this._getGroupNameFromHost();
    // It's not possible to always determine the "name" of a radio-group by reading
    // the attribute. This is because the radio-group does not set the "name" as an
    // element attribute if the "name" value is set through a binding.
    if (hostName !== null) {
      return hostName;
    }
    // In case we couldn't determine the "name" of a radio-group by reading the
    // "name" attribute, we try to determine the "name" of the group by going
    // through all radio buttons.
    const radioNames = await this._getNamesFromRadioButtons();
    if (!radioNames.length) {
      return null;
    }
    if (!this._checkRadioNamesInGroupEqual(radioNames)) {
      throw Error('Radio buttons in radio-group have mismatching names.');
    }
    return radioNames[0]!;
  }

  /** Gets the id of the radio-group. */
  async getId(): Promise<string|null> {
    return (await this.host()).getProperty('id');
  }

  /** Gets the checked radio-button in a radio-group. */
  async getCheckedRadioButton(): Promise<MatRadioButtonHarness|null> {
    for (let radioButton of await this.getRadioButtons()) {
      if (await radioButton.isChecked()) {
        return radioButton;
      }
    }
    return null;
  }

  /** Gets the checked value of the radio-group. */
  async getCheckedValue(): Promise<string|null> {
    const checkedRadio = await this.getCheckedRadioButton();
    if (!checkedRadio) {
      return null;
    }
    return checkedRadio.getValue();
  }

  /**
   * Gets a list of radio buttons which are part of the radio-group.
   * @param filter Optionally filters which radio buttons are included.
   */
  async getRadioButtons(filter: RadioButtonHarnessFilters = {}): Promise<MatRadioButtonHarness[]> {
    return this.locatorForAll(MatRadioButtonHarness.with(filter))();
  }

  /**
   * Checks a radio button in this group.
   * @param filter An optional filter to apply to the child radio buttons. The first tab matching
   *     the filter will be selected.
   */
  async checkRadioButton(filter: RadioButtonHarnessFilters = {}): Promise<void> {
    const radioButtons = await this.getRadioButtons(filter);
    if (!radioButtons.length) {
      throw Error(`Could not find radio button matching ${JSON.stringify(filter)}`);
    }
    return radioButtons[0].check();
  }

  /** Gets the name attribute of the host element. */
  private async _getGroupNameFromHost() {
    return (await this.host()).getAttribute('name');
  }

  /** Gets a list of the name attributes of all child radio buttons. */
  private async _getNamesFromRadioButtons(): Promise<string[]> {
    const groupNames: string[] = [];
    for (let radio of await this.getRadioButtons()) {
      const radioName = await radio.getName();
      if (radioName !== null) {
        groupNames.push(radioName);
      }
    }
    return groupNames;
  }

  /** Checks if the specified radio names are all equal. */
  private _checkRadioNamesInGroupEqual(radioNames: string[]): boolean {
    let groupName: string|null = null;
    for (let radioName of radioNames) {
      if (groupName === null) {
        groupName = radioName;
      } else if (groupName !== radioName) {
        return false;
      }
    }
    return true;
  }

  /**
   * Checks if a radio-group harness has the given name. Throws if a radio-group with
   * matching name could be found but has mismatching radio-button names.
   */
  private static async _checkRadioGroupName(harness: MatRadioGroupHarness, name: string) {
    // Check if there is a radio-group which has the "name" attribute set
    // to the expected group name. It's not possible to always determine
    // the "name" of a radio-group by reading the attribute. This is because
    // the radio-group does not set the "name" as an element attribute if the
    // "name" value is set through a binding.
    if (await harness._getGroupNameFromHost() === name) {
      return true;
    }
    // Check if there is a group with radio-buttons that all have the same
    // expected name. This implies that the group has the given name. It's
    // not possible to always determine the name of a radio-group through
    // the attribute because there is
    const radioNames = await harness._getNamesFromRadioButtons();
    if (radioNames.indexOf(name) === -1) {
      return false;
    }
    if (!harness._checkRadioNamesInGroupEqual(radioNames)) {
      throw Error(
          `The locator found a radio-group with name "${name}", but some ` +
          `radio-button's within the group have mismatching names, which is invalid.`);
    }
    return true;
  }
}

/** Harness for interacting with a standard mat-radio-button in tests. */
export class MatRadioButtonHarness extends ComponentHarness {
  /** The selector for the host element of a `MatRadioButton` instance. */
  static hostSelector = 'mat-radio-button';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatRadioButtonHarness` that meets
   * certain criteria.
   * @param options Options for filtering which radio button instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: RadioButtonHarnessFilters = {}): HarnessPredicate<MatRadioButtonHarness> {
    return new HarnessPredicate(MatRadioButtonHarness, options)
        .addOption(
            'label', options.label,
            (harness, label) => HarnessPredicate.stringMatches(harness.getLabelText(), label))
        .addOption(
            'name', options.name, async (harness, name) => (await harness.getName()) === name);
  }

  private _textLabel = this.locatorFor('.mat-radio-label-content');
  private _clickLabel = this.locatorFor('.mat-radio-label');
  private _input = this.locatorFor('input');

  /** Whether the radio-button is checked. */
  async isChecked(): Promise<boolean> {
    const checked = (await this._input()).getProperty('checked');
    return coerceBooleanProperty(await checked);
  }

  /** Whether the radio-button is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this._input()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  /** Whether the radio-button is required. */
  async isRequired(): Promise<boolean> {
    const required = (await this._input()).getAttribute('required');
    return coerceBooleanProperty(await required);
  }

  /** Gets the radio-button's name. */
  async getName(): Promise<string|null> {
    return (await this._input()).getAttribute('name');
  }

  /** Gets the radio-button's id. */
  async getId(): Promise<string|null> {
    return (await this.host()).getProperty('id');
  }

  /**
   * Gets the value of the radio-button. The radio-button value will be converted to a string.
   *
   * Note: This means that for radio-button's with an object as a value `[object Object]` is
   * intentionally returned.
   */
  async getValue(): Promise<string|null> {
    return (await this._input()).getProperty('value');
  }

  /** Gets the radio-button's label text. */
  async getLabelText(): Promise<string> {
    return (await this._textLabel()).text();
  }

  /** Focuses the radio-button. */
  async focus(): Promise<void> {
    return (await this._input()).focus();
  }

  /** Blurs the radio-button. */
  async blur(): Promise<void> {
    return (await this._input()).blur();
  }

  /**
   * Puts the radio-button in a checked state by clicking it if it is currently unchecked,
   * or doing nothing if it is already checked.
   */
  async check(): Promise<void> {
    if (!(await this.isChecked())) {
      return (await this._clickLabel()).click();
    }
  }
}
