/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DocContent, DocViewer} from '@angular/docs';
import {ActivatedRoute} from '@angular/router';
import {map} from 'rxjs/operators';

@Component({
  selector: 'adev-cli-reference-page',
  imports: [DocViewer],
  templateUrl: './cli-reference-details-page.component.html',
  styleUrls: ['./cli-reference-details-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CliReferenceDetailsPage implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  docContent = signal<DocContent | undefined>(undefined);

  ngOnInit(): void {
    this.setPageContent();
  }

  // Fetch the content for CLI Reference page based on the active route.
  private setPageContent(): void {
    this.activatedRoute.data
      .pipe(
        map((data) => data['docContent']),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((doc: DocContent | undefined) => {
        this.docContent.set(doc);
      });
  }
}
