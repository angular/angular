/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, inject, computed} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {toSignal} from '@angular/core/rxjs-interop';

import {LoadingStep} from '../enums/loading-steps';
import {NodeRuntimeSandbox} from '../node-runtime-sandbox.service';
import {NodeRuntimeState} from '../node-runtime-state.service';

import {PreviewError} from './preview-error.component';

@Component({
  selector: 'docs-tutorial-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PreviewError],
})
export class Preview {
  private readonly domSanitizer = inject(DomSanitizer);
  private readonly nodeRuntimeSandbox = inject(NodeRuntimeSandbox);
  private readonly nodeRuntimeState = inject(NodeRuntimeState);

  loadingProgressValue = this.nodeRuntimeState.loadingStep;
  loadingEnum = LoadingStep;

  previewUrl = toSignal(this.nodeRuntimeSandbox.previewUrl$, {initialValue: null});
  previewUrlForIFrame = computed(() => {
    const url = this.previewUrl();
    return url !== null ? this.domSanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });
}
