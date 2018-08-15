/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({
  selector: 'use-third-party',
  template: '<third-party-comp [thirdParty]="title"></third-party-comp>' +
      '<another-third-party-comp></another-third-party-comp>',
})
export class ComponentUsingThirdParty {
  title: string = 'from 3rd party';
}
