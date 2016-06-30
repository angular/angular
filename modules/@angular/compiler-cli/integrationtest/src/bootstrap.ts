/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browserPlatform} from '@angular/platform-browser';
import {BasicComp} from './basic';
import {MainModuleNgFactory} from './module.ngfactory';

MainModuleNgFactory.create().instance.appRef.bootstrap(BasicComp);
