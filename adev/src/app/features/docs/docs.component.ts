/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocContent, DocViewer} from '@angular/docs';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {ActivatedRoute} from '@angular/router';
import {map} from 'rxjs/operators';

@Component({
  selector: 'docs-docs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocViewer],
  styleUrls: ['./docs.component.scss'],
  templateUrl: './docs.component.html',
})
export default class DocsComponent {
  private readonly activatedRoute = inject(ActivatedRoute);

  // Based on current route, proper static content for doc page is fetched.
  // In case when exists example-viewer placeholders, then ExampleViewer
  // components are going to be rendered.
  private readonly documentContent$ = this.activatedRoute.data.pipe(
    map((data) => data['docContent'] as DocContent),
  );

  documentContent = toSignal(this.documentContent$);
}
