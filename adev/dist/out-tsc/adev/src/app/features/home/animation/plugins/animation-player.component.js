/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ChangeDetectionStrategy, Component, computed, signal} from '@angular/core';
// In milliseconds. Used for going forward or back through the animation.
const TIMESTEP = 100;
/**
 * Animation player component.
 */
let AnimationPlayerComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'adev-animation-player',
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
    @if (animation(); as anim) {
      <div class="deck" [class]="[alignment()]">
        <div class="progress-bar" (click)="seek($event)" title="Seek">
          <div class="progress" [style.width]="progressPerc()"></div>
        </div>
        <div class="controls">
          <button (click)="anim.back(TIMESTEP)" title="Go back">⏪</button>
          <button
            (click)="playPause()"
            [attr.title]="!anim.isPlaying() ? 'Play' : 'Pause'"
            [style.background-color]="anim.isPlaying() ? '#666' : null"
          >
            {{ !anim.isPlaying() ? '▶️' : '⏸️' }}
          </button>
          <button (click)="anim.stop()" title="Stop">⏹️</button>
          <button (click)="anim.forward(TIMESTEP)" title="Go forward">⏩</button>
        </div>
      </div>
    }
  `,
      styles: `
    .deck {
      position: fixed;
      left: 50%;
      transform: translateX(-50%);
      bottom: 30px;
      padding: 10px;
      border-radius: 12px;
      background: rgba(0,0,0, 0.7);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 999999;
    }
    .deck.left {
      left: 130px;
      transform: initial;
    }
    .deck.right {
      right: 30px;
      left: initial;
      transform: initial;
    }
    .progress-bar {
      position: relative;
      width: 400px;
      height: 6px;
      border-radius: 3px;
      background-color: #444;
      overflow: hidden;
      margin-bottom: 10px;
      cursor: pointer;
    }
    .progress {
      position: absolute;
      top: 0;
      left: 0;
      height: inherit;
      background-color: #ba2391;
      pointer-events: none;
    }
    .controls {
      display: flex;
      justify-content: center;
      gap: 10px;
    }
    button {
      width: 3Opx;
      height: 30px;
      border-radius: 7px;
      background-color: #333;
      font-size: 20px;
    }
    button:hover {
      background-color: #444;
    }
  `,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AnimationPlayerComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      AnimationPlayerComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    animation = signal(null);
    alignment = signal('center');
    TIMESTEP = TIMESTEP;
    progressPerc = computed(() => this.animation().progress() * 100 + '%');
    playPause() {
      const anim = this.animation();
      if (!anim.isPlaying()) {
        anim.play();
      } else {
        anim.pause();
      }
    }
    seek(e) {
      const target = e.target;
      const progress = e.offsetX / target.clientWidth;
      this.animation().seek(progress);
    }
  };
  return (AnimationPlayerComponent = _classThis);
})();
export {AnimationPlayerComponent};
//# sourceMappingURL=animation-player.component.js.map
