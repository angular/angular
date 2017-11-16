/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationDebugger} from '@angular/animations';

export class MockAnimationDebugger extends AnimationDebugger {
  debugFlagRequired = true;

  log: any[] = [];

  debug(element: any, phase: string, data: {[key: string]: any}, debugFlagValue?: any): void {
    this.log.push({element, phase, data, debugFlagValue});
  }
}
