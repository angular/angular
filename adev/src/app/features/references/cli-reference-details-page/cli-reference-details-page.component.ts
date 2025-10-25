/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {DocContent, DocViewer} from '@angular/docs';

@Component({
  selector: 'adev-cli-reference-page',
  imports: [DocViewer],
  templateUrl: './cli-reference-details-page.component.html',
  styleUrls: ['./cli-reference-details-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CliReferenceDetailsPage {
  readonly docContent = input<DocContent | undefined>();
}
