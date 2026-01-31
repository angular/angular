/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {CodeBlock} from '../code-block/code-block';

@Component({
  selector: 'adev-hydration-example',
  imports: [RouterLink, CodeBlock],
  templateUrl: './hydration-example.html',
  styleUrls: ['./hydration-example.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HydrationExample {
  exampleHtml = exampleHtml;
  exampleTs = exampleTs;
}

const exampleTs = `

`.trim();

const exampleHtml = `

`.trim();
