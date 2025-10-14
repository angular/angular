/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
var FrameManager_1;
import {__decorate} from 'tslib';
/// <reference types="chrome"/>
import {Injectable, inject, signal, computed} from '@angular/core';
import {MessageBus} from '../../../../protocol';
import {TOP_LEVEL_FRAME_ID} from '../application-environment';
let FrameManager = (FrameManager_1 = class FrameManager {
  constructor() {
    this._selectedFrameId = signal(null);
    this._frames = signal(new Map());
    this._inspectedWindowTabId = null;
    this._frameUrlToFrameIds = new Map();
    this._messageBus = inject(MessageBus);
    this.frames = computed(() => Array.from(this._frames().values()));
    this.selectedFrame = computed(() => {
      const selectedFrameId = this._selectedFrameId();
      if (selectedFrameId === null) {
        return null;
      }
      return this._frames().get(selectedFrameId) ?? null;
    });
    this.topLevelFrameIsActive = computed(() => {
      return this._selectedFrameId() === TOP_LEVEL_FRAME_ID;
    });
    this.activeFrameHasUniqueUrl = computed(() => {
      return this.frameHasUniqueUrl(this.selectedFrame());
    });
  }
  static initialize(inspectedWindowTabIdTestOnly) {
    const manager = new FrameManager_1();
    manager.initialize(inspectedWindowTabIdTestOnly);
    return manager;
  }
  initialize(inspectedWindowTabIdTestOnly) {
    if (inspectedWindowTabIdTestOnly === undefined) {
      this._inspectedWindowTabId = globalThis.chrome.devtools.inspectedWindow.tabId;
    } else {
      this._inspectedWindowTabId = inspectedWindowTabIdTestOnly;
    }
    this._messageBus.on('frameConnected', (frameId) => {
      if (this._frames().has(frameId)) {
        this._selectedFrameId.set(frameId);
      }
    });
    this._messageBus.on('contentScriptConnected', (frameId, name, url) => {
      // fragments are not considered when doing URL matching on a page
      // https://bugs.chromium.org/p/chromium/issues/detail?id=841429
      const urlWithoutHash = new URL(url);
      urlWithoutHash.hash = '';
      this.addFrame({name, id: frameId, url: urlWithoutHash});
      if (this.frames().length === 1) {
        this.inspectFrame(this._frames().get(frameId));
      }
    });
    this._messageBus.on('contentScriptDisconnected', (frameId) => {
      const frame = this._frames().get(frameId);
      if (!frame) {
        return;
      }
      this.removeFrame(frame);
      // Defensive check. This case should never happen, since we're always connected to at least
      // the top level frame.
      if (this.frames().length === 0) {
        this._selectedFrameId.set(null);
        console.error('Angular DevTools is not connected to any frames.');
        return;
      }
      const selectedFrameId = this._selectedFrameId();
      if (frameId === selectedFrameId) {
        this._selectedFrameId.set(TOP_LEVEL_FRAME_ID);
        this.inspectFrame(this._frames().get(TOP_LEVEL_FRAME_ID));
        return;
      }
    });
  }
  isSelectedFrame(frame) {
    return this._selectedFrameId() === frame.id;
  }
  inspectFrame(frame) {
    if (this._inspectedWindowTabId === null) {
      return;
    }
    if (!this._frames().has(frame.id)) {
      throw new Error('Attempted to inspect a frame that is not connected to Angular DevTools.');
    }
    this._selectedFrameId.set(null);
    this._messageBus.emit('enableFrameConnection', [frame.id, this._inspectedWindowTabId]);
  }
  frameHasUniqueUrl(frame) {
    if (frame === null) {
      return false;
    }
    const frameUrl = frame.url.toString();
    const frameIds = this._frameUrlToFrameIds.get(frameUrl) ?? new Set();
    return frameIds.size === 1;
  }
  addFrame(frame) {
    this._frames.update((frames) => {
      frames.set(frame.id, frame);
      const frameUrl = frame.url.toString();
      const frameIdSet = this._frameUrlToFrameIds.get(frameUrl) ?? new Set();
      frameIdSet.add(frame.id);
      this._frameUrlToFrameIds.set(frameUrl, frameIdSet);
      return new Map(frames);
    });
  }
  removeFrame(frame) {
    const frameId = frame.id;
    const frameUrl = frame.url.toString();
    const urlFrameIds = this._frameUrlToFrameIds.get(frameUrl) ?? new Set();
    urlFrameIds.delete(frameId);
    if (urlFrameIds.size === 0) {
      this._frameUrlToFrameIds.delete(frameUrl);
    }
    this._frames.update((frames) => {
      frames.delete(frameId);
      return new Map(frames);
    });
  }
});
FrameManager = FrameManager_1 = __decorate([Injectable()], FrameManager);
export {FrameManager};
//# sourceMappingURL=frame_manager.js.map
