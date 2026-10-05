/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="chrome"/>

import {Injectable, inject, signal, computed} from '@angular/core';
import {Events, MessageBus} from '../../../../protocol';

import {Frame, TOP_LEVEL_FRAME_ID} from '../application-environment';

@Injectable()
export class FrameManager {
  private selectedFrameId = signal<number | null>(null);
  private framesMap = signal(new Map<number, Frame>());
  private inspectedWindowTabId: number | null = null;
  private frameUrlToFrameIds = new Map<string, Set<number>>();
  private messageBus = inject<MessageBus<Events>>(MessageBus);

  readonly frames = computed(() => Array.from(this.framesMap().values()));

  readonly selectedFrame = computed(() => {
    const selectedFrameId = this.selectedFrameId();
    if (selectedFrameId === null) {
      return null;
    }

    return this.framesMap().get(selectedFrameId) ?? null;
  });

  readonly topLevelFrameIsActive = computed(() => {
    return this.selectedFrameId() === TOP_LEVEL_FRAME_ID;
  });

  readonly activeFrameHasUniqueUrl = computed(() => {
    return this.frameHasUniqueUrl(this.selectedFrame());
  });

  static initialize(inspectedWindowTabIdTestOnly?: number | null) {
    const manager = new FrameManager();
    manager.initialize(inspectedWindowTabIdTestOnly);
    return manager;
  }

  private initialize(inspectedWindowTabIdTestOnly?: number | null): void {
    if (inspectedWindowTabIdTestOnly === undefined) {
      this.inspectedWindowTabId = globalThis.chrome.devtools.inspectedWindow.tabId;
    } else {
      this.inspectedWindowTabId = inspectedWindowTabIdTestOnly;
    }

    this.messageBus.on('frameConnected', (frameId: number) => {
      if (this.framesMap().has(frameId)) {
        this.selectedFrameId.set(frameId);
      }
    });

    this.messageBus.on('contentScriptConnected', (frameId: number, name: string, url: string) => {
      // fragments are not considered when doing URL matching on a page
      // https://bugs.chromium.org/p/chromium/issues/detail?id=841429
      const urlWithoutHash = new URL(url);
      urlWithoutHash.hash = '';

      this.addFrame({name, id: frameId, url: urlWithoutHash});

      if (this.frames().length === 1) {
        this.inspectFrame(this.framesMap().get(frameId)!);
      }
    });

    this.messageBus.on('contentScriptDisconnected', (frameId: number) => {
      const frame = this.framesMap().get(frameId);
      if (!frame) {
        return;
      }

      this.removeFrame(frame);

      // Defensive check. This case should never happen, since we're always connected to at least
      // the top level frame.
      if (this.frames().length === 0) {
        this.selectedFrameId.set(null);
        console.error('Angular DevTools is not connected to any frames.');
        return;
      }

      const selectedFrameId = this.selectedFrameId();
      if (frameId === selectedFrameId) {
        this.selectedFrameId.set(TOP_LEVEL_FRAME_ID);
        this.inspectFrame(this.framesMap().get(TOP_LEVEL_FRAME_ID)!);
        return;
      }
    });
  }

  isSelectedFrame(frame: Frame): boolean {
    return this.selectedFrameId() === frame.id;
  }

  inspectFrame(frame: Frame): void {
    if (this.inspectedWindowTabId === null) {
      return;
    }

    if (!this.framesMap().has(frame.id)) {
      throw new Error('Attempted to inspect a frame that is not connected to Angular DevTools.');
    }

    this.selectedFrameId.set(null);
    this.messageBus.emit('enableFrameConnection', [frame.id, this.inspectedWindowTabId]);
  }

  private frameHasUniqueUrl(frame: Frame | null): boolean {
    if (frame === null) {
      return false;
    }
    const frameUrl = frame.url.toString();
    const frameIds = this.frameUrlToFrameIds.get(frameUrl) ?? new Set<number>();
    return frameIds.size === 1;
  }

  private addFrame(frame: Frame): void {
    this.framesMap.update((frames) => {
      frames.set(frame.id, frame);
      const frameUrl = frame.url.toString();
      const frameIdSet = this.frameUrlToFrameIds.get(frameUrl) ?? new Set<number>();
      frameIdSet.add(frame.id);
      this.frameUrlToFrameIds.set(frameUrl, frameIdSet);
      return new Map(frames);
    });
  }

  private removeFrame(frame: Frame): void {
    const frameId = frame.id;
    const frameUrl = frame.url.toString();
    const urlFrameIds = this.frameUrlToFrameIds.get(frameUrl) ?? new Set<number>();
    urlFrameIds.delete(frameId);
    if (urlFrameIds.size === 0) {
      this.frameUrlToFrameIds.delete(frameUrl);
    }
    this.framesMap.update((frames) => {
      frames.delete(frameId);
      return new Map(frames);
    });
  }
}
