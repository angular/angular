/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StyleMigrator} from './style-migrator';
import {TemplateMigrator} from './template-migrator';

import {AutocompleteStylesMigrator} from './components/autocomplete/autocomplete-styles';
import {ButtonStylesMigrator} from './components/button/button-styles';
import {CardStylesMigrator} from './components/card/card-styles';
import {CardTemplateMigrator} from './components/card/card-template';
import {CheckboxStylesMigrator} from './components/checkbox/checkbox-styles';
import {ChipsStylesMigrator} from './components/chips/chips-styles';
import {ChipsTemplateMigrator} from './components/chips/chips-template';
import {DialogStylesMigrator} from './components/dialog/dialog-styles';
import {FormFieldStylesMigrator} from './components/form-field/form-field-styles';
import {InputStylesMigrator} from './components/input/input-styles';
import {ListStylesMigrator} from './components/list/list-styles';
import {MenuStylesMigrator} from './components/menu/menu-styles';
import {PaginatorStylesMigrator} from './components/paginator/paginator-styles';
import {ProgressBarStylesMigrator} from './components/progress-bar/progress-bar-styles';
import {ProgressSpinnerStylesMigrator} from './components/progress-spinner/progress-spinner-styles';
import {RadioStylesMigrator} from './components/radio/radio-styles';
import {SelectStylesMigrator} from './components/select/select-styles';
import {SlideToggleStylesMigrator} from './components/slide-toggle/slide-toggle-styles';
import {SliderStylesMigrator} from './components/slider/slider-styles';
import {SnackBarMigrator} from './components/snack-bar/snack-bar-styles';
import {TableStylesMigrator} from './components/table/table-styles';
import {TabsStylesMigrator} from './components/tabs/tabs-styles';
import {TooltipStylesMigrator} from './components/tooltip/tooltip-styles';
import {OptgroupStylesMigrator} from './components/optgroup/optgroup-styles';
import {OptionStylesMigrator} from './components/option/option-styles';

/** Contains the migrators to migrate a single component. */
export interface ComponentMigrator {
  component: string;
  styles: StyleMigrator;
  template?: TemplateMigrator;
}

export const LEGACY_MODULES = new Set(
  [
    'legacy-autocomplete',
    'legacy-autocomplete/testing',
    'legacy-button',
    'legacy-button/testing',
    'legacy-card',
    'legacy-card/testing',
    'legacy-checkbox',
    'legacy-checkbox/testing',
    'legacy-chips',
    'legacy-chips/testing',
    'legacy-core',
    'legacy-core/testing',
    'legacy-dialog',
    'legacy-dialog/testing',
    'legacy-form-field',
    'legacy-form-field/testing',
    'legacy-input',
    'legacy-input/testing',
    'legacy-list',
    'legacy-list/testing',
    'legacy-menu',
    'legacy-menu/testing',
    'legacy-paginator',
    'legacy-paginator/testing',
    'legacy-progress-bar',
    'legacy-progress-bar/testing',
    'legacy-progress-spinner',
    'legacy-progress-spinner/testing',
    'legacy-radio',
    'legacy-radio/testing',
    'legacy-select',
    'legacy-select/testing',
    'legacy-slide-toggle',
    'legacy-slide-toggle/testing',
    'legacy-slider',
    'legacy-slider/testing',
    'legacy-snack-bar',
    'legacy-snack-bar/testing',
    'legacy-table',
    'legacy-table/testing',
    'legacy-tabs',
    'legacy-tabs/testing',
    'legacy-tooltip',
    'legacy-tooltip/testing',
  ].map(name => `@angular/material/${name}`),
);

export const MIGRATORS: ComponentMigrator[] = [
  {
    component: 'autocomplete',
    styles: new AutocompleteStylesMigrator(),
  },
  {
    component: 'button',
    styles: new ButtonStylesMigrator(),
  },
  {
    component: 'card',
    styles: new CardStylesMigrator(),
    template: new CardTemplateMigrator(),
  },
  {
    component: 'checkbox',
    styles: new CheckboxStylesMigrator(),
  },
  {
    component: 'chips',
    styles: new ChipsStylesMigrator(),
    template: new ChipsTemplateMigrator(),
  },
  {
    component: 'dialog',
    styles: new DialogStylesMigrator(),
  },
  {
    component: 'form-field',
    styles: new FormFieldStylesMigrator(),
  },
  {
    component: 'input',
    styles: new InputStylesMigrator(),
  },
  {
    component: 'list',
    styles: new ListStylesMigrator(),
  },
  {
    component: 'menu',
    styles: new MenuStylesMigrator(),
  },
  {
    component: 'optgroup',
    styles: new OptgroupStylesMigrator(),
  },
  {
    component: 'option',
    styles: new OptionStylesMigrator(),
  },
  {
    component: 'paginator',
    styles: new PaginatorStylesMigrator(),
  },
  {
    component: 'progress-bar',
    styles: new ProgressBarStylesMigrator(),
  },
  {
    component: 'progress-spinner',
    styles: new ProgressSpinnerStylesMigrator(),
  },
  {
    component: 'radio',
    styles: new RadioStylesMigrator(),
  },
  {
    component: 'select',
    styles: new SelectStylesMigrator(),
  },
  {
    component: 'slide-toggle',
    styles: new SlideToggleStylesMigrator(),
  },
  {
    component: 'slider',
    styles: new SliderStylesMigrator(),
  },
  {
    component: 'snack-bar',
    styles: new SnackBarMigrator(),
  },
  {
    component: 'table',
    styles: new TableStylesMigrator(),
  },
  {
    component: 'tabs',
    styles: new TabsStylesMigrator(),
  },
  {
    component: 'tooltip',
    styles: new TooltipStylesMigrator(),
  },
];
