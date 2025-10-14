/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Component, Directive, NgModule, Pipe, Type } from '../../src/core';
import { MetadataOverride } from './metadata_override';
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
declare abstract class OverrideResolver<T> implements Resolver<T> {
    private overrides;
    private resolved;
    abstract get type(): any;
    addOverride(type: Type<any>, override: MetadataOverride<T>): void;
    setOverrides(overrides: Array<[Type<any>, MetadataOverride<T>]>): void;
    getAnnotation(type: Type<any>): T | null;
    resolve(type: Type<any>): T | null;
}
export declare class DirectiveResolver extends OverrideResolver<Directive> {
    get type(): import("../../src/core").DirectiveDecorator;
}
export declare class ComponentResolver extends OverrideResolver<Component> {
    get type(): import("../../src/core").ComponentDecorator;
}
export declare class PipeResolver extends OverrideResolver<Pipe> {
    get type(): import("../../src/core").PipeDecorator;
}
export declare class NgModuleResolver extends OverrideResolver<NgModule> {
    get type(): import("../../src/core").NgModuleDecorator;
}
export {};
