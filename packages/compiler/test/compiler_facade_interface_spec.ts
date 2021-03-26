/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as core from '../../core/src/compiler/compiler_facade_interface';
import {FactoryTarget} from '../public_api';
import * as compiler from '../src/compiler_facade_interface';

/**
 * This file is compiler level file which asserts that the set of interfaces in `@angular/core` and
 * `@angular/compiler` match. (Build time failure.)
 *
 * If this file fails to compile it means these two files when out of sync:
 *  - packages/compiler/src/compiler_facade_interface.ts             (master)
 *  - packages/core/src/render3/jit/compiler_facade_interface.ts     (copy)
 *
 * Please ensure that the two files are in sync using this command:
 * ```
 * cp packages/compiler/src/compiler_facade_interface.ts \
 *    packages/core/src/render3/jit/compiler_facade_interface.ts
 * ```
 */

const coreExportedCompilerFacade1: core.ExportedCompilerFacade =
    null! as compiler.ExportedCompilerFacade;
const compilerExportedCompilerFacade2: compiler.ExportedCompilerFacade =
    null! as core.ExportedCompilerFacade;

const coreCompilerFacade: core.CompilerFacade = null! as compiler.CompilerFacade;
const compilerCompilerFacade: compiler.CompilerFacade = null! as core.CompilerFacade;

const coreCoreEnvironment: core.CoreEnvironment = null! as compiler.CoreEnvironment;
const compilerCoreEnvironment: compiler.CoreEnvironment = null! as core.CoreEnvironment;

const coreResourceLoader: core.ResourceLoader = null! as compiler.ResourceLoader;
const compilerResourceLoader: compiler.ResourceLoader = null! as core.ResourceLoader;

const coreStringMap: core.StringMap = null! as compiler.StringMap;
const compilerStringMap: compiler.StringMap = null! as core.StringMap;

const coreProvider: core.Provider = null! as compiler.Provider;
const compilerProvider: compiler.Provider = null! as core.Provider;

const coreR3FactoryTarget: core.FactoryTarget = null! as compiler.FactoryTarget;
const compilerR3FactoryTarget: compiler.FactoryTarget = null! as core.FactoryTarget;

const coreR3FactoryTarget2: FactoryTarget = null! as core.FactoryTarget;
const compilerR3FactoryTarget2: FactoryTarget = null! as core.FactoryTarget;

const coreR3FactoryTarget3: core.FactoryTarget = null! as FactoryTarget;
const compilerR3FactoryTarget3: compiler.FactoryTarget = null! as FactoryTarget;

const coreR3DependencyMetadataFacade: core.R3DependencyMetadataFacade =
    null! as compiler.R3DependencyMetadataFacade;
const compilerR3DependencyMetadataFacade: compiler.R3DependencyMetadataFacade =
    null! as core.R3DependencyMetadataFacade;

const coreR3DeclareDependencyMetadataFacade: core.R3DeclareDependencyMetadataFacade =
    null! as compiler.R3DeclareDependencyMetadataFacade;
const compilerR3DeclareDependencyMetadataFacade: compiler.R3DeclareDependencyMetadataFacade =
    null! as core.R3DeclareDependencyMetadataFacade;

const coreR3PipeMetadataFacade: core.R3PipeMetadataFacade = null! as compiler.R3PipeMetadataFacade;
const compilerR3PipeMetadataFacade: compiler.R3PipeMetadataFacade =
    null! as core.R3PipeMetadataFacade;

const coreR3DeclarePipeFacade: core.R3DeclarePipeFacade = null! as compiler.R3DeclarePipeFacade;
const compilerR3DeclarePipeFacade: compiler.R3DeclarePipeFacade = null! as core.R3DeclarePipeFacade;

const coreR3InjectableMetadataFacade: core.R3InjectableMetadataFacade =
    null! as compiler.R3InjectableMetadataFacade;
const compilerR3InjectableMetadataFacade: compiler.R3InjectableMetadataFacade =
    null! as core.R3InjectableMetadataFacade;

const coreR3NgModuleMetadataFacade: core.R3NgModuleMetadataFacade =
    null! as compiler.R3NgModuleMetadataFacade;
const compilerR3NgModuleMetadataFacade: compiler.R3NgModuleMetadataFacade =
    null! as core.R3NgModuleMetadataFacade;

const coreR3DeclareNgModuleFacade: core.R3DeclareNgModuleFacade =
    null! as compiler.R3DeclareNgModuleFacade;
const compilerR3DeclareNgModuleFacade: compiler.R3DeclareNgModuleFacade =
    null! as core.R3DeclareNgModuleFacade;

const coreR3InjectorMetadataFacade: core.R3InjectorMetadataFacade =
    null! as compiler.R3InjectorMetadataFacade;
const compilerR3InjectorMetadataFacade: compiler.R3InjectorMetadataFacade =
    null! as core.R3InjectorMetadataFacade;

const coreR3DeclareInjectorFacade: core.R3DeclareInjectorFacade =
    null! as compiler.R3DeclareInjectorFacade;
const compilerR3DeclareInjectorFacade: compiler.R3DeclareInjectorFacade =
    null! as core.R3DeclareInjectorFacade;

const coreR3DirectiveMetadataFacade: core.R3DirectiveMetadataFacade =
    null! as compiler.R3DirectiveMetadataFacade;
const compilerR3DirectiveMetadataFacade: compiler.R3DirectiveMetadataFacade =
    null! as core.R3DirectiveMetadataFacade;

const coreR3DeclareDirectiveFacade: core.R3DeclareDirectiveFacade =
    null! as compiler.R3DeclareDirectiveFacade;
const compilerR3DeclareDirectiveFacade: compiler.R3DeclareDirectiveFacade =
    null! as core.R3DeclareDirectiveFacade;

const coreR3ComponentMetadataFacade: core.R3ComponentMetadataFacade =
    null! as compiler.R3ComponentMetadataFacade;
const compilerR3ComponentMetadataFacade: compiler.R3ComponentMetadataFacade =
    null! as core.R3ComponentMetadataFacade;

const coreR3DeclareComponentFacade: core.R3DeclareComponentFacade =
    null! as compiler.R3DeclareComponentFacade;
const compilerR3DeclareComponentFacade: compiler.R3DeclareComponentFacade =
    null! as core.R3DeclareComponentFacade;

const coreR3DeclareUsedDirectiveFacade: core.R3DeclareUsedDirectiveFacade =
    null! as compiler.R3DeclareUsedDirectiveFacade;
const compilerR3DeclareUsedDirectiveFacade: compiler.R3DeclareUsedDirectiveFacade =
    null! as core.R3DeclareUsedDirectiveFacade;

const coreR3UsedDirectiveMetadata: core.R3UsedDirectiveMetadata =
    null! as compiler.R3UsedDirectiveMetadata;
const compilerR3UsedDirectiveMetadata: compiler.R3UsedDirectiveMetadata =
    null! as core.R3UsedDirectiveMetadata;

const coreViewEncapsulation: core.ViewEncapsulation = null! as compiler.ViewEncapsulation;
const compilerViewEncapsulation: compiler.ViewEncapsulation = null! as core.ViewEncapsulation;

const coreR3QueryMetadataFacade: core.R3QueryMetadataFacade =
    null! as compiler.R3QueryMetadataFacade;
const compilerR3QueryMetadataFacade: compiler.R3QueryMetadataFacade =
    null! as core.R3QueryMetadataFacade;

const coreR3DeclareQueryMetadataFacade: core.R3DeclareQueryMetadataFacade =
    null! as compiler.R3DeclareQueryMetadataFacade;
const compilerR3DeclareQueryMetadataFacade: compiler.R3DeclareQueryMetadataFacade =
    null! as core.R3DeclareQueryMetadataFacade;
