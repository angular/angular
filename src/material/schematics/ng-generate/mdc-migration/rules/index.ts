/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ButtonStylesMigrator} from './components/button/button-styles';
import {StyleMigrator} from './style-migrator';

export const MIGRATORS: StyleMigrator[] = [new ButtonStylesMigrator()];
