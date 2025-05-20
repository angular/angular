/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentInjector, inject, Injectable} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {filter, from, map, switchMap} from 'rxjs';

import {TutorialMetadata} from '@angular/docs';

import {injectEmbeddedTutorialManager} from './inject-embedded-tutorial-manager';

@Injectable()
export class EditorUiState {
  private readonly environmentInjector = inject(EnvironmentInjector);

  tutorialType = toSignal(
    from(injectEmbeddedTutorialManager(this.environmentInjector)).pipe(
      switchMap((embeddedTutorialManager) =>
        embeddedTutorialManager.tutorialChanged$.pipe(map(() => embeddedTutorialManager.type())),
      ),
      filter((tutorialType): tutorialType is TutorialMetadata['type'] => Boolean(tutorialType)),
    ),
  );
}
