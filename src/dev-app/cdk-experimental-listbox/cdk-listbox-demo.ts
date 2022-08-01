/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CdkListboxExamplesModule} from '@angular/components-examples/cdk-experimental/listbox';

@Component({
  templateUrl: 'cdk-listbox-demo.html',
  standalone: true,
  imports: [CdkListboxExamplesModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkListboxDemo {}
