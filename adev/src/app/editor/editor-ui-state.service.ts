/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter, map, Subject} from 'rxjs';

import {TutorialMetadata} from '@angular/docs';
import {TutorialType} from '@angular/docs';

import {EmbeddedTutorialManager} from './embedded-tutorial-manager.service';

export interface EditorUiStateConfig {
  displayOnlyInteractiveTerminal: boolean;
}
export const DEFAULT_EDITOR_UI_STATE: EditorUiStateConfig = {
  displayOnlyInteractiveTerminal: false,
};

@Injectable()
export class EditorUiState {
  private readonly embeddedTutorialManager = inject(EmbeddedTutorialManager);
  private readonly destroyRef = inject(DestroyRef);

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
    this.embeddedTutorialManager.tutorialChanged$
      .pipe(
        map(() => this.embeddedTutorialManager.type()),
        filter((tutorialType): tutorialType is TutorialMetadata['type'] => Boolean(tutorialType)),
        takeUntilDestroyed(this.destroyRef),
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
