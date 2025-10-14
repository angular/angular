/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export { ɵɵinject } from './di/injector_compatibility';
export { ɵɵdefineInjectable, ɵɵdefineInjector, ɵɵInjectableDeclaration } from './di/interface/defs';
export { NgModuleDef } from './metadata/ng_module_def';
export { ɵɵdefineNgModule } from './render3/definition';
export { ɵɵFactoryDeclaration, ɵɵInjectorDeclaration, ɵɵNgModuleDeclaration, } from './render3/interfaces/public_definitions';
export { setClassMetadata, setClassMetadataAsync } from './render3/metadata';
export { NgModuleFactory } from './render3/ng_module_ref';
export { noSideEffects as ɵnoSideEffects } from './util/closure';
/**
 * The existence of this constant (in this particular file) informs the Angular compiler that the
 * current program is actually @angular/core, which needs to be compiled specially.
 */
export declare const ITS_JUST_ANGULAR = true;
