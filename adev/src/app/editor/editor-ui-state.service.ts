/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentInjector, inject, Injectable, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter, from, map, Subject, switchMap} from 'rxjs';

import {TutorialMetadata, TutorialType} from '@angular/docs';

import {injectEmbeddedTutorialManager} from './inject-embedded-tutorial-manager';

export interface EditorUiStateConfig {
  displayOnlyInteractiveTerminal: boolean;
}
export const DEFAULT_EDITOR_UI_STATE: EditorUiStateConfig = {
  displayOnlyInteractiveTerminal: false,
};

@Injectable()
export class EditorUiState {
  private readonly environmentInjector = inject(EnvironmentInjector);

  private readonly stateChanged = new Subject<void>();

  stateChanged$ = this.stateChanged.asObservable();
  uiState = signal<EditorUiStateConfig>(DEFAULT_EDITOR_UI_STATE);

  constructor() {
    this.handleTutorialChange();
  }

  patchState(patch: Partial<EditorUiStateConfig>): void {
    this.uiState.update((state) => ({...state, ...patch}));
    this.stateChanged.next();
  }

  private handleTutorialChange() {
    from(injectEmbeddedTutorialManager(this.environmentInjector))
      .pipe(
        switchMap((embeddedTutorialManager) =>
          embeddedTutorialManager.tutorialChanged$.pipe(map(() => embeddedTutorialManager.type())),
        ),
        filter((tutorialType): tutorialType is TutorialMetadata['type'] => Boolean(tutorialType)),
        takeUntilDestroyed(),
      )
      .subscribe((tutorialType) => {
        if (tutorialType === TutorialType.CLI) {
          this.patchState({displayOnlyInteractiveTerminal: true});
        } else {
          this.patchState(DEFAULT_EDITOR_UI_STATE);
        }
      });
  }
}
