/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { R3DirectiveMetadataFacade } from '../../compiler/compiler_facade';
import { R3QueryMetadataFacade } from '../../compiler/compiler_facade_interface';
import { Type } from '../../interface/type';
import type { Query } from '../../metadata/di';
import type { Component, Directive } from '../../metadata/directives';
/**
 * Compile an Angular component according to its decorator metadata, and patch the resulting
 * component def (ɵcmp) onto the component type.
 *
 * Compilation may be asynchronous (due to the need to resolve URLs for the component template or
 * other resources, for example). In the event that compilation is not immediate, `compileComponent`
 * will enqueue resource resolution into a global queue and will fail to return the `ɵcmp`
 * until the global queue has been resolved with a call to `resolveComponentResources`.
 */
export declare function compileComponent(type: Type<any>, metadata: Component): void;
/**
 * Compile an Angular directive according to its decorator metadata, and patch the resulting
 * directive def onto the component type.
 *
 * In the event that compilation is not immediate, `compileDirective` will return a `Promise` which
 * will resolve when compilation completes and the directive becomes usable.
 */
export declare function compileDirective(type: Type<any>, directive: Directive | null): void;
export declare function extendsDirectlyFromObject(type: Type<any>): boolean;
/**
 * Extract the `R3DirectiveMetadata` for a particular directive (either a `Directive` or a
 * `Component`).
 */
export declare function directiveMetadata(type: Type<any>, metadata: Directive): R3DirectiveMetadataFacade;
export declare function convertToR3QueryMetadata(propertyName: string, ann: Query): R3QueryMetadataFacade;
