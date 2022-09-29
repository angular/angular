/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export const COMPONENTS = [
  'autocomplete',
  'button',
  'core',
  'card',
  'checkbox',
  'chips',
  'dialog',
  'form-field',
  'input',
  'list',
  'menu',
  'paginator',
  'progress-bar',
  'progress-spinner',
  'radio',
  'select',
  'slide-toggle',
  'snack-bar',
  'slider',
  'table',
  'tabs',
  'tooltip',
];

export const MAT_IMPORT_CHANGES = COMPONENTS.flatMap(component => [
  {
    old: `@angular/material/${component}`,
    new: `@angular/material/legacy-${component}`,
  },
  {
    old: `@angular/material/${component}/testing`,
    new: `@angular/material/legacy-${component}/testing`,
  },
]);

export const MDC_IMPORT_CHANGES = COMPONENTS.flatMap(component => [
  {
    old: `@angular/material-experimental/mdc-${component}`,
    new: `@angular/material/${component}`,
  },
  {
    old: `@angular/material-experimental/mdc-${component}/testing`,
    new: `@angular/material/${component}/testing`,
  },
]);

export const CUSTOM_TS_SYMBOL_RENAMINGS = [
  {old: 'getMatAutocompleteMissingPanelError', new: 'getMatLegacyAutocompleteMissingPanelError'},
  {old: 'TransitionCheckState', new: 'LegacyTransitionCheckState'},
  {old: 'MatTestDialogOpener', new: 'MatTestLegacyDialogOpener'},
  {old: 'AutoFocusTarget', new: 'LegacyAutoFocusTarget'},
  {old: 'DialogRole', new: 'LegacyDialogRole'},
  {old: 'DialogPosition', new: 'LegacyDialogPosition'},
  {old: '_closeDialogVia', new: '_closeLegacyDialogVia'},
  {old: 'FormFieldControlHarness', new: 'LegacyFormFieldControlHarness'},
  {old: 'LegacyFloatLabelType', new: 'LegacyFloatLabelType'},
  {old: 'getMatFormFieldDuplicatedHintError', new: 'getMatLegacyFormFieldDuplicatedHintError'},
  {old: 'getMatFormFieldMissingControlError', new: 'getMatLegacyFormFieldMissingControlError'},
  {
    old: 'getMatFormFieldPlaceholderConflictError',
    new: 'getMatLegacyFormFieldPlaceholderConflictError',
  },
  {old: 'getMatInputUnsupportedTypeError', new: 'getMatLegacyInputUnsupportedTypeError'},
  {old: 'fadeInItems', new: 'fadeInLegacyItems'},
  {old: 'MenuPositionX', new: 'LegacyMenuPositionX'},
  {old: 'MenuPositionY', new: 'LegacyMenuPositionY'},
  {old: 'transformMenu', new: 'transformLegacyMenu'},
  {old: 'PageEvent', new: 'LegacyPageEvent'},
  {old: 'ProgressAnimationEnd', new: 'LegacyProgressAnimationEnd'},
  {old: 'ProgressBarMode', new: 'LegacyProgressBarMode'},
  {old: 'ProgressSpinnerMode', new: 'LegacyProgressSpinnerMode'},
  {old: 'SimpleSnackBar', new: 'LegacySimpleSnackBar'},
  {old: 'TextOnlySnackBar', new: 'LegacyTextOnlySnackBar'},
  {old: 'ScrollDirection', new: 'LegacyScrollDirection'},
  {old: 'TooltipComponent', new: 'LegacyTooltipComponent'},
  {old: 'getMatTooltipInvalidPositionError', new: 'getMatLegacyTooltipInvalidPositionError'},
  {old: 'TooltipPosition', new: 'LegacyTooltipPosition'},
  {old: 'TooltipTouchGestures', new: 'LegacyTooltipTouchGestures'},
  {old: 'TooltipVisibility', new: 'LegacyTooltipVisibility'},
  {old: 'SCROLL_THROTTLE_MS', new: 'LEGACY_SCROLL_THROTTLE_MS'},
];

export const COMPONENT_THEME_MIXINS = COMPONENTS.concat(['option', 'optgroup']).flatMap(
  component => [
    `${component}-theme`,
    `${component}-color`,
    `${component}-density`,
    `${component}-typography`,
  ],
);

export const CUSTOM_SASS_MIXIN_RENAMINGS: {[key: string]: string} = {
  'all-component-themes': 'all-legacy-component-themes',
  'all-component-colors': 'all-legacy-component-colors',
  'all-component-typographies': 'all-legacy-component-typographies',
  'private-all-component-densities': 'private-all-legacy-component-densities',
};

export const CUSTOM_SASS_FUNCTION_RENAMINGS: {[key: string]: string} = {
  'define-typography-config': 'define-legacy-typography-config',
};

export const MIGRATED_CORE_SYMBOLS: {[key: string]: string} = {
  'MAT_OPTGROUP': 'MAT_LEGACY_OPTGROUP',
  'MatOptionSelectionChange': 'MatLegacyOptionSelectionChange',
  'MatOptionParentComponent': 'MatLegacyOptionParentComponent',
  'MAT_OPTION_PARENT_COMPONENT': 'MAT_LEGACY_OPTION_PARENT_COMPONENT',
  '_countGroupLabelsBeforeOption': '_countGroupLabelsBeforeLegacyOption',
  '_getOptionScrollPosition': '_getLegacyOptionScrollPosition',
  '_MatOptionBase': '_MatLegacyOptionBase',
  '_MatOptgroupBase': '_MatLegacyOptgroupBase',
  'MatOptionModule': 'MatLegacyOptionModule',
  'MatOption': 'MatLegacyOption',
  'MatOptgroup': 'MatLegacyOptgroup',
  'MatOptionHarness': 'MatLegacyOptionHarness',
  'OptionHarnessFilters': 'LegacyOptionHarnessFilters',
  'MatOptgroupHarness': 'MatLegacyOptgroupHarness',
  'OptgroupHarnessFilters': 'LegacyOptgroupHarnessFilters',
};
