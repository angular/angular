/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({selector: 'comp-with-proj', template: '<ng-content></ng-content>'})
export class CompWithNgContent {
}

@Component({
  selector: 'main',
  template: '<comp-with-proj><span greeting="Hello world!"></span></comp-with-proj>'
})
export class ProjectingComp {
}
