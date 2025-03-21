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
  Type,
  ɵReflectionCapabilities as ReflectionCapabilities,
} from '../../src/core';

import {MetadataOverride} from './metadata_override';
import {MetadataOverrider} from './metadata_overrider';

const reflection = new ReflectionCapabilities();

/**
 * Base interface to resolve `@Component`, `@Directive`, `@Pipe` and `@NgModule`.
 */
export interface Resolver<T> {
  addOverride(type: Type<any>, override: MetadataOverride<T>): void;
  setOverrides(overrides: Array<[Type<any>, MetadataOverride<T>]>): void;
  resolve(type: Type<any>): T | null;
}

/**
 * Allows to override ivy metadata for tests (via the `TestBed`).
 */
abstract class OverrideResolver<T> implements Resolver<T> {
  private overrides = new Map<Type<any>, MetadataOverride<T>[]>();
  private resolved = new Map<Type<any>, T | null>();

  abstract get type(): any;

  addOverride(type: Type<any>, override: MetadataOverride<T>) {
    const overrides = this.overrides.get(type) || [];
    overrides.push(override);
    this.overrides.set(type, overrides);
    this.resolved.delete(type);
  }

  setOverrides(overrides: Array<[Type<any>, MetadataOverride<T>]>) {
    this.overrides.clear();
    overrides.forEach(([type, override]) => {
      this.addOverride(type, override);
    });
  }

  getAnnotation(type: Type<any>): T | null {
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
        return annotation instanceof this.type ? (annotation as unknown as T) : null;
      }
    }
    return null;
  }

  resolve(type: Type<any>): T | null {
    let resolved: T | null = this.resolved.get(type) || null;

    if (!resolved) {
      resolved = this.getAnnotation(type);
      if (resolved) {
        const overrides = this.overrides.get(type);
        if (overrides) {
          const overrider = new MetadataOverrider();
          overrides.forEach((override) => {
            resolved = overrider.overrideMetadata(this.type, resolved!, override);
          });
        }
      }
      this.resolved.set(type, resolved);
    }

    return resolved;
  }
}

export class DirectiveResolver extends OverrideResolver<Directive> {
  override get type() {
    return Directive;
  }
}

export class ComponentResolver extends OverrideResolver<Component> {
  override get type() {
    return Component;
  }
}

export class PipeResolver extends OverrideResolver<Pipe> {
  override get type() {
    return Pipe;
  }
}

export class NgModuleResolver extends OverrideResolver<NgModule> {
  override get type() {
    return NgModule;
  }
}
