/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, NgModule, Pipe, Type, ɵReflectionCapabilities as ReflectionCapabilities} from '@angular/core';

import {MetadataOverride} from './metadata_override';
import {MetadataOverrider} from './metadata_overrider';

const reflection = new ReflectionCapabilities();

/**
 * Base interface to resolve `@Component`, `@Directive`, `@Pipe` and `@NgModule`.
 */
export interface Resolver<T> { resolve(type: Type<any>): T|null; }

/**
 * Allows to override ivy metadata for tests (via the `TestBed`).
 */
abstract class OverrideResolver<T> implements Resolver<T> {
  private overrides = new Map<Type<any>, MetadataOverride<T>[]>();
  private resolved = new Map<Type<any>, T|null>();

  abstract get type(): any;

  setOverrides(overrides: Array<[Type<any>, MetadataOverride<T>]>) {
    this.overrides.clear();
    overrides.forEach(([type, override]) => {
      const overrides = this.overrides.get(type) || [];
      overrides.push(override);
      this.overrides.set(type, overrides);
    });
  }

  getAnnotation(type: Type<any>): T|null {
    // We should always return the last match from filter(), or we may return superclass data by
    // mistake.
    return reflection.annotations(type).filter(a => a instanceof this.type).pop() || null;
  }

  resolve(type: Type<any>): T|null {
    let resolved = this.resolved.get(type) || null;

    if (!resolved) {
      resolved = this.getAnnotation(type);
      if (resolved) {
        const overrides = this.overrides.get(type);
        if (overrides) {
          const overrider = new MetadataOverrider();
          overrides.forEach(override => {
            resolved = overrider.overrideMetadata(this.type, resolved !, override);
          });
        }
      }
      this.resolved.set(type, resolved);
    }

    return resolved;
  }
}


export class DirectiveResolver extends OverrideResolver<Directive> {
  get type() { return Directive; }
}

export class ComponentResolver extends OverrideResolver<Component> {
  get type() { return Component; }
}

export class PipeResolver extends OverrideResolver<Pipe> {
  get type() { return Pipe; }
}

export class NgModuleResolver extends OverrideResolver<NgModule> {
  get type() { return NgModule; }
}
