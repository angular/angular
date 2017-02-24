/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer, AnimationTriggerMetadata} from '@angular/animations';

export abstract class AnimationEngine {
  abstract registerTrigger(trigger: AnimationTriggerMetadata, name?: string): void;
  abstract onInsert(element: any, domFn: () => any): void;
  abstract onRemove(element: any, domFn: () => any): void;
  abstract setProperty(element: any, property: string, value: any): void;
  abstract listen(
      element: any, eventName: string, eventPhase: string,
      callback: (event: any) => any): () => any;
  abstract flush(): void;

  get activePlayers(): AnimationPlayer[] { throw new Error('...'); }
  get queuedPlayers(): AnimationPlayer[] { throw new Error('...'); }
}
