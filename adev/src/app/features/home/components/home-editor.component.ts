/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EnvironmentInjector,
  inject,
  input,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {forkJoin, switchMap} from 'rxjs';

import {
  EmbeddedEditor,
  injectEmbeddedTutorialManager,
  injectNodeRuntimeSandbox,
} from '../../../editor';

@Component({
  selector: 'adev-code-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmbeddedEditor],
  template: `<embedded-editor />`,
})
export class CodeEditorComponent {
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);

  tutorialFiles = input.required<string>();

  constructor() {
    this.loadEmbeddedEditor();
  }

  private loadEmbeddedEditor() {
    // If using `async-await`, `this` will be captured until the function is executed
    // and completed, which can lead to a memory leak if the user navigates away from
    // this component to another page.
    forkJoin([
      injectNodeRuntimeSandbox(this.environmentInjector),
      injectEmbeddedTutorialManager(this.environmentInjector),
    ])
      .pipe(
        switchMap(([nodeRuntimeSandbox, embeddedTutorialManager]) =>
          embeddedTutorialManager
            .fetchAndSetTutorialFiles(this.tutorialFiles())
            .then(() => nodeRuntimeSandbox),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((nodeRuntimeSandbox) => {
        this.cdRef.markForCheck();
        nodeRuntimeSandbox.init();
      });
  }
}
