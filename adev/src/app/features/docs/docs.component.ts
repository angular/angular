/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocContent, DocViewer} from '@angular/docs';
import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'docs-docs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocViewer],
  styleUrls: ['./docs.component.scss'],
  templateUrl: './docs.component.html',
})
export default class DocsComponent {
  // Based on current route, proper static content for doc page is fetched.
  // In case when exists example-viewer placeholders, then ExampleViewer
  // components are going to be rendered.

  protected readonly docContent = input<DocContent>();
}
