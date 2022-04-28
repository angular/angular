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
import {RuntimeMigrator} from './ts-migration/runtime-migrator';
import {SelectStylesMigrator} from './components/select/select-styles';
import {SlideToggleStylesMigrator} from './components/slide-toggle/slide-toggle-styles';
import {SliderStylesMigrator} from './components/slider/slider-styles';
import {SnackBarMigrator} from './components/snack-bar/snack-bar-styles';
import {TableStylesMigrator} from './components/table/table-styles';
import {TabsStylesMigrator} from './components/tabs/tabs-styles';
import {TooltipStylesMigrator} from './components/tooltip/tooltip-styles';

/** Contains the migrators to migrate a single component. */
export interface ComponentMigrator {
  component: string;
  styles: StyleMigrator;
  template?: TemplateMigrator;
  runtime?: RuntimeMigrator;
}

export const MIGRATORS: ComponentMigrator[] = [
  {
    component: 'autocomplete',
    styles: new AutocompleteStylesMigrator(),
    runtime: new RuntimeMigrator('autocomplete'),
  },
  {
    component: 'button',
    styles: new ButtonStylesMigrator(),
    runtime: new RuntimeMigrator('button'),
  },
  {
    component: 'card',
    styles: new CardStylesMigrator(),
    runtime: new RuntimeMigrator('card'),
    template: new CardTemplateMigrator(),
  },
  {
    component: 'checkbox',
    styles: new CheckboxStylesMigrator(),
    runtime: new RuntimeMigrator('checkbox'),
  },
  {
    component: 'chips',
    styles: new ChipsStylesMigrator(),
    runtime: new RuntimeMigrator('chips'),
    template: new ChipsTemplateMigrator(),
  },
  {
    component: 'dialog',
    styles: new DialogStylesMigrator(),
    runtime: new RuntimeMigrator('dialog'),
  },
  {
    component: 'form-field',
    styles: new FormFieldStylesMigrator(),
    runtime: new RuntimeMigrator('form-field'),
  },
  {
    component: 'input',
    styles: new InputStylesMigrator(),
    runtime: new RuntimeMigrator('input'),
  },
  {
    component: 'list',
    styles: new ListStylesMigrator(),
    runtime: new RuntimeMigrator('list'),
  },
  {
    component: 'menu',
    styles: new MenuStylesMigrator(),
    runtime: new RuntimeMigrator('menu'),
  },
  {
    component: 'paginator',
    styles: new PaginatorStylesMigrator(),
    runtime: new RuntimeMigrator('paginator'),
  },
  {
    component: 'progress-bar',
    styles: new ProgressBarStylesMigrator(),
    runtime: new RuntimeMigrator('progress-bar'),
  },
  {
    component: 'progress-spinner',
    styles: new ProgressSpinnerStylesMigrator(),
    runtime: new RuntimeMigrator('progress-spinner'),
  },
  {
    component: 'radio',
    styles: new RadioStylesMigrator(),
    runtime: new RuntimeMigrator('radio'),
  },
  {
    component: 'select',
    styles: new SelectStylesMigrator(),
    runtime: new RuntimeMigrator('select'),
  },
  {
    component: 'slide-toggle',
    styles: new SlideToggleStylesMigrator(),
    runtime: new RuntimeMigrator('slide-toggle'),
  },
  {
    component: 'slider',
    styles: new SliderStylesMigrator(),
    runtime: new RuntimeMigrator('slider'),
  },
  {
    component: 'snack-bar',
    styles: new SnackBarMigrator(),
  },
  {
    component: 'table',
    styles: new TableStylesMigrator(),
    runtime: new RuntimeMigrator('table'),
  },
  {
    component: 'tabs',
    styles: new TabsStylesMigrator(),
    runtime: new RuntimeMigrator('tabs'),
  },
  {
    component: 'tooltip',
    styles: new TooltipStylesMigrator(),
    runtime: new RuntimeMigrator('tooltip'),
  },
];
