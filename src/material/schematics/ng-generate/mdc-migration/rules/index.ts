/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ButtonStylesMigrator} from './components/button/button-styles';
import {CardStylesMigrator} from './components/card/card-styles';
import {CheckboxStylesMigrator} from './components/checkbox/checkbox-styles';
import {DialogStylesMigrator} from './components/dialog/dialog-styles';
import {PaginatorStylesMigrator} from './components/paginator/paginator-styles';
import {ProgressBarStylesMigrator} from './components/progress-bar/progress-bar-styles';
import {ProgressSpinnerStylesMigrator} from './components/progress-spinner/progress-spinner-styles';
import {RadioStylesMigrator} from './components/radio/radio-styles';
import {SlideToggleStylesMigrator} from './components/slide-toggle/slide-toggle-styles';
import {SliderStylesMigrator} from './components/slider/slider-styles';
import {TableStylesMigrator} from './components/table/table-styles';
import {StyleMigrator} from './style-migrator';

export const MIGRATORS: StyleMigrator[] = [
  new ButtonStylesMigrator(),
  new CardStylesMigrator(),
  new CheckboxStylesMigrator(),
  new DialogStylesMigrator(),
  new PaginatorStylesMigrator(),
  new ProgressBarStylesMigrator(),
  new ProgressSpinnerStylesMigrator(),
  new RadioStylesMigrator(),
  new SlideToggleStylesMigrator(),
  new SliderStylesMigrator(),
  new TableStylesMigrator(),
];
