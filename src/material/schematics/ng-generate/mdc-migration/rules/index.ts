/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ButtonStylesMigrator} from './components/button/button-styles';
import {CheckboxStylesMigrator} from './components/checkbox/checkbox-styles';
import {ProgressBarStylesMigrator} from './components/progress-bar/progress-bar-styles';
import {RadioStylesMigrator} from './components/radio/radio-styles';
import {SlideToggleStylesMigrator} from './components/slide-toggle/slide-toggle-styles';
import {StyleMigrator} from './style-migrator';

export const MIGRATORS: StyleMigrator[] = [
  new ButtonStylesMigrator(),
  new CheckboxStylesMigrator(),
  new ProgressBarStylesMigrator(),
  new RadioStylesMigrator(),
  new SlideToggleStylesMigrator(),
];
