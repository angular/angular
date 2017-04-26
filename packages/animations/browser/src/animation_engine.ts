/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer, AnimationTriggerMetadata} from '@angular/animations';

export abstract class AnimationEngine {
  abstract registerTrigger(
      componentId: string, namespaceId: string, hostElement: any, name: string,
      metadata: AnimationTriggerMetadata): void;
  abstract onInsert(namespaceId: string, element: any, parent: any, insertBefore: boolean): void;
  abstract onRemove(namespaceId: string, element: any, context: any): void;
  abstract setProperty(namespaceId: string, element: any, property: string, value: any): void;
  abstract listen(
      namespaceId: string, element: any, eventName: string, eventPhase: string,
      callback: (event: any) => any): () => any;
  abstract flush(): void;
  abstract destroy(namespaceId: string, context: any): void;

  onRemovalComplete: (delegate: any, element: any) => void;

  public players: AnimationPlayer[];
}
