/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {ClassDeclaration} from '../../reflection/src/host';

/** Base information required for a detected feature. */
interface BaseDetectedFeature {
  /** To which type of Angular declaration the feature is specific to. */
  specificTo: 'directive'|null;
}

/** Describes a discovered Angular decorator that is applied to an field. */
export interface KnownFieldDecoratorFeature extends BaseDetectedFeature {
  /** Distinct type of feature this interface describes. */
  type: 'known-field-decorator';
  /** Decorator node that indicated the use of an Angular feature. */
  trigger: ts.Node;
}

/** Describes a discovered Angular lifecycle hook feature. */
export interface KnownLifecycleHookFeature extends BaseDetectedFeature {
  /** Distinct type of feature this interface describes. */
  type: 'known-lifecycle-hook';
  /**
   * Member node that indicated the use of an Angular feature. Can be `null` as class
   * members do not necessarily have a corresponding TypeScript node. This can be the
   * case when ngcc captures class members only through `__decorate` calls.
   */
  trigger: ts.Node|null;
}

/** Describes a discovered usage of dependency injection. */
export interface DependencyInjectionFeature extends BaseDetectedFeature {
  /** Distinct type of feature this interface describes. */
  type: 'dependency-injection';
  /** Derived Angular class that inherits the constructor. */
  derived: ClassDeclaration;
}

/** Type that describes possible detected Angular features. */
export type DetectedAngularFeature =
    KnownFieldDecoratorFeature|KnownLifecycleHookFeature|DependencyInjectionFeature;
