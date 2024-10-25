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
  inject,
  Input,
  OnInit,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {from} from 'rxjs';

import {EmbeddedEditor, EmbeddedTutorialManager, NodeRuntimeSandbox} from '../../../editor';

@Component({
  selector: 'adev-code-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [EmbeddedEditor],
  template: `
    <embedded-editor />
  `,
})
export class CodeEditorComponent implements OnInit {
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly embeddedTutorialManager = inject(EmbeddedTutorialManager);
  private readonly nodeRuntimeSandbox = inject(NodeRuntimeSandbox);
  private readonly destroyRef = inject(DestroyRef);

  @Input({required: true}) tutorialFiles!: string;

  ngOnInit(): void {
    this.loadEmbeddedEditor();
  }

  private loadEmbeddedEditor() {
    // If using `async-await`, `this` will be captured until the function is executed
    // and completed, which can lead to a memory leak if the user navigates away from
    // this component to another page.
    from(this.embeddedTutorialManager.fetchAndSetTutorialFiles(this.tutorialFiles))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.cdRef.markForCheck();
        this.nodeRuntimeSandbox.init();
      });
  }
}
