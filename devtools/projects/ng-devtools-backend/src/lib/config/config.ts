/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DevtoolsConfig} from '../../../../protocol';

// Global config state instance
let instance: DevtoolsConfigState;

class DevtoolsConfigState implements DevtoolsConfig {
  private config: DevtoolsConfig = {
    performanceTrack: false,
    hydrationOverlays: false,
    cdHighlighting: false,
    cdDataStream: false,
  };
  private readonly listeners = new Map<keyof DevtoolsConfig, ((v: any) => void)[]>();

  get performanceTrack() {
    return this.config.performanceTrack;
  }

  get hydrationOverlays() {
    return this.config.hydrationOverlays;
  }

  get cdHighlighting() {
    return this.config.cdHighlighting;
  }

  get cdDataStream() {
    return this.config.cdDataStream;
  }

  set(cfg: Partial<DevtoolsConfig>) {
    // We save a copy of the current config, since we want to
    // apply the update before notifying the listeners.
    const currCfg = {...this.config};
    this.config = {
      ...this.config,
      ...cfg,
    };

    for (const prop of Object.keys(cfg) as (keyof DevtoolsConfig)[]) {
      if (cfg[prop] !== currCfg[prop]) {
        const propListeners = this.listeners.get(prop);

        if (propListeners) {
          for (const cb of propListeners) {
            cb(cfg[prop]);
          }
        }
      }
    }
  }

  /** Listen for property changes. */
  onChange<T extends keyof DevtoolsConfig = keyof DevtoolsConfig>(
    prop: T,
    cb: (value: DevtoolsConfig[T]) => void,
  ): () => void {
    let propListeners = this.listeners.get(prop);
    if (!propListeners) {
      propListeners = [];
      this.listeners.set(prop, propListeners);
    }

    propListeners.push(cb);

    return () => {
      const idx = propListeners.indexOf(cb);
      if (idx > -1) {
        propListeners.splice(idx, 1);
      }
    };
  }
}

/** Get DevTools backend configuration. */
export function getConfig() {
  if (!instance) {
    instance = new DevtoolsConfigState();
  }
  return instance;
}
