/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from './di/decorators';
import {print, warn} from './facade/lang';


// Note: Need to rename warn as in Dart
// class members and imports can't use the same name.
let _warnImpl = warn;

@Injectable()
export class Console {
  log(message: string): void { print(message); }
  // Note: for reporting errors use `DOM.logError()` as it is platform specific
  warn(message: string): void { _warnImpl(message); }
}
