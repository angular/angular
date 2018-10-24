/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as core from '../../core/src/render3/jit/compiler_facade_interface';
import {R3ResolvedDependencyType} from '../public_api';
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
    null !as compiler.ExportedCompilerFacade;
const compilerExportedCompilerFacade2: compiler.ExportedCompilerFacade =
    null !as core.ExportedCompilerFacade;

const coreCompilerFacade: core.CompilerFacade = null !as compiler.CompilerFacade;
const compilerCompilerFacade: compiler.CompilerFacade = null !as core.CompilerFacade;

const coreCoreEnvironment: core.CoreEnvironment = null !as compiler.CoreEnvironment;
const compilerCoreEnvironment: compiler.CoreEnvironment = null !as core.CoreEnvironment;

const coreStringMap: core.StringMap = null !as compiler.StringMap;
const compilerStringMap: compiler.StringMap = null !as core.StringMap;

const coreProvider: core.Provider = null !as compiler.Provider;
const compilerProvider: compiler.Provider = null !as core.Provider;

const coreR3ResolvedDependencyType: core.R3ResolvedDependencyType =
    null !as compiler.R3ResolvedDependencyType;
const compilerR3ResolvedDependencyType: compiler.R3ResolvedDependencyType =
    null !as core.R3ResolvedDependencyType;

const coreR3ResolvedDependencyType2: R3ResolvedDependencyType =
    null !as core.R3ResolvedDependencyType;
const compilerR3ResolvedDependencyType2: R3ResolvedDependencyType =
    null !as core.R3ResolvedDependencyType;

const coreR3ResolvedDependencyType3: core.R3ResolvedDependencyType =
    null !as R3ResolvedDependencyType;
const compilerR3ResolvedDependencyType3: compiler.R3ResolvedDependencyType =
    null !as R3ResolvedDependencyType;

const coreR3DependencyMetadataFacade: core.R3DependencyMetadataFacade =
    null !as compiler.R3DependencyMetadataFacade;
const compilerR3DependencyMetadataFacade: compiler.R3DependencyMetadataFacade =
    null !as core.R3DependencyMetadataFacade;

const coreR3PipeMetadataFacade: core.R3PipeMetadataFacade = null !as compiler.R3PipeMetadataFacade;
const compilerR3PipeMetadataFacade: compiler.R3PipeMetadataFacade =
    null !as core.R3PipeMetadataFacade;

const coreR3InjectableMetadataFacade: core.R3InjectableMetadataFacade =
    null !as compiler.R3InjectableMetadataFacade;
const compilerR3InjectableMetadataFacade: compiler.R3InjectableMetadataFacade =
    null !as core.R3InjectableMetadataFacade;

const coreR3NgModuleMetadataFacade: core.R3NgModuleMetadataFacade =
    null !as compiler.R3NgModuleMetadataFacade;
const compilerR3NgModuleMetadataFacade: compiler.R3NgModuleMetadataFacade =
    null !as core.R3NgModuleMetadataFacade;

const coreR3InjectorMetadataFacade: core.R3InjectorMetadataFacade =
    null !as compiler.R3InjectorMetadataFacade;
const compilerR3InjectorMetadataFacade: compiler.R3InjectorMetadataFacade =
    null !as core.R3InjectorMetadataFacade;

const coreR3DirectiveMetadataFacade: core.R3DirectiveMetadataFacade =
    null !as compiler.R3DirectiveMetadataFacade;
const compilerR3DirectiveMetadataFacade: compiler.R3DirectiveMetadataFacade =
    null !as core.R3DirectiveMetadataFacade;

const coreR3ComponentMetadataFacade: core.R3ComponentMetadataFacade =
    null !as compiler.R3ComponentMetadataFacade;
const compilerR3ComponentMetadataFacade: compiler.R3ComponentMetadataFacade =
    null !as core.R3ComponentMetadataFacade;

const coreViewEncapsulation: core.ViewEncapsulation = null !as compiler.ViewEncapsulation;
const compilerViewEncapsulation: compiler.ViewEncapsulation = null !as core.ViewEncapsulation;

const coreR3QueryMetadataFacade: core.R3QueryMetadataFacade =
    null !as compiler.R3QueryMetadataFacade;
const compilerR3QueryMetadataFacade: compiler.R3QueryMetadataFacade =
    null !as core.R3QueryMetadataFacade;
