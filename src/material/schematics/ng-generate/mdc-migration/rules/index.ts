/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ButtonRuntimeMigrator} from './components/button/button-runtime';
import {ButtonStylesMigrator} from './components/button/button-styles';
import {CardStylesMigrator} from './components/card/card-styles';
import {CardTemplateMigrator} from './components/card/card-template';
import {CheckboxStylesMigrator} from './components/checkbox/checkbox-styles';
import {ChipsStylesMigrator} from './components/chips/chips-styles';
import {DialogStylesMigrator} from './components/dialog/dialog-styles';
import {ListStylesMigrator} from './components/list/list-styles';
import {PaginatorStylesMigrator} from './components/paginator/paginator-styles';
import {ProgressBarStylesMigrator} from './components/progress-bar/progress-bar-styles';
import {ProgressSpinnerStylesMigrator} from './components/progress-spinner/progress-spinner-styles';
import {RadioStylesMigrator} from './components/radio/radio-styles';
import {RuntimeMigrator} from './runtime-migrator';
import {SlideToggleStylesMigrator} from './components/slide-toggle/slide-toggle-styles';
import {SliderStylesMigrator} from './components/slider/slider-styles';
import {StyleMigrator} from './style-migrator';
import {TableStylesMigrator} from './components/table/table-styles';
import {TemplateMigrator} from './template-migrator';

/** Contains the migrators to migrate a single component. */
export interface ComponentMigrator {
  component: string;
  styles: StyleMigrator;
  template?: TemplateMigrator;
  runtime?: RuntimeMigrator;
}

export const MIGRATORS: ComponentMigrator[] = [
  {
    component: 'button',
    styles: new ButtonStylesMigrator(),
    runtime: new ButtonRuntimeMigrator(),
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
  },
  {
    component: 'dialog',
    styles: new DialogStylesMigrator(),
  },
  {
    component: 'list',
    styles: new ListStylesMigrator(),
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
    component: 'slide-toggle',
    styles: new SlideToggleStylesMigrator(),
  },
  {
    component: 'slider',
    styles: new SliderStylesMigrator(),
  },
  {
    component: 'table',
    styles: new TableStylesMigrator(),
  },
];
