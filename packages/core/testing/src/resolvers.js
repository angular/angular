/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  Component,
  Directive,
  NgModule,
  Pipe,
  ɵReflectionCapabilities as ReflectionCapabilities,
} from '../../src/core';
import {MetadataOverrider} from './metadata_overrider';
const reflection = new ReflectionCapabilities();
/**
 * Allows to override ivy metadata for tests (via the `TestBed`).
 */
class OverrideResolver {
  constructor() {
    this.overrides = new Map();
    this.resolved = new Map();
  }
  addOverride(type, override) {
    const overrides = this.overrides.get(type) || [];
    overrides.push(override);
    this.overrides.set(type, overrides);
    this.resolved.delete(type);
  }
  setOverrides(overrides) {
    this.overrides.clear();
    overrides.forEach(([type, override]) => {
      this.addOverride(type, override);
    });
  }
  getAnnotation(type) {
    const annotations = reflection.annotations(type);
    // Try to find the nearest known Type annotation and make sure that this annotation is an
    // instance of the type we are looking for, so we can use it for resolution. Note: there might
    // be multiple known annotations found due to the fact that Components can extend Directives (so
    // both Directive and Component annotations would be present), so we always check if the known
    // annotation has the right type.
    for (let i = annotations.length - 1; i >= 0; i--) {
      const annotation = annotations[i];
      const isKnownType =
        annotation instanceof Directive ||
        annotation instanceof Component ||
        annotation instanceof Pipe ||
        annotation instanceof NgModule;
      if (isKnownType) {
        return annotation instanceof this.type ? annotation : null;
      }
    }
    return null;
  }
  resolve(type) {
    let resolved = this.resolved.get(type) || null;
    if (!resolved) {
      resolved = this.getAnnotation(type);
      if (resolved) {
        const overrides = this.overrides.get(type);
        if (overrides) {
          const overrider = new MetadataOverrider();
          overrides.forEach((override) => {
            resolved = overrider.overrideMetadata(this.type, resolved, override);
          });
        }
      }
      this.resolved.set(type, resolved);
    }
    return resolved;
  }
}
export class DirectiveResolver extends OverrideResolver {
  get type() {
    return Directive;
  }
}
export class ComponentResolver extends OverrideResolver {
  get type() {
    return Component;
  }
}
export class PipeResolver extends OverrideResolver {
  get type() {
    return Pipe;
  }
}
export class NgModuleResolver extends OverrideResolver {
  get type() {
    return NgModule;
  }
}
//# sourceMappingURL=resolvers.js.map
