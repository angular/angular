/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {MetadataReader} from '../../../src/ngtsc/metadata';
import {PartialEvaluator} from '../../../src/ngtsc/partial_evaluator';
import {ClassDeclaration, Decorator} from '../../../src/ngtsc/reflection';
import {NgccReflectionHost} from '../host/ngcc_host';

/**
 * Implement this interface and add it to the `DecorationAnalyzer.migrations` collection to get ngcc
 * to modify the analysis of the decorators in the program in order to migrate older code to work
 * with Ivy.
 *
 * `Migration.apply()` is called for every class in the program being compiled by ngcc.
 *
 * Note that the underlying program could be in a variety of different formats, e.g. ES2015, ES5,
 * UMD, CommonJS etc. This means that an author of a `Migration` should not attempt to navigate and
 * manipulate the AST nodes directly. Instead, the `MigrationHost` interface, passed to the
 * `Migration`, provides access to a `MetadataReader`, `ReflectionHost` and `PartialEvaluator`
 * interfaces, which should be used.
 */
export interface Migration {
  apply(clazz: ClassDeclaration, host: MigrationHost): ts.Diagnostic|null;
}

export interface MigrationHost {
  /** Provides access to the decorator information associated with classes. */
  readonly metadata: MetadataReader;
  /** Provides access to navigate the AST in a format-agnostic manner. */
  readonly reflectionHost: NgccReflectionHost;
  /** Enables expressions to be statically evaluated in the context of the program. */
  readonly evaluator: PartialEvaluator;
  /**
   * Associate a new synthesized decorator, which did not appear in the original source, with a
   * given class.
   * @param clazz the class to receive the new decorator.
   * @param decorator the decorator to inject.
   */
  injectSyntheticDecorator(clazz: ClassDeclaration, decorator: Decorator): void;
}
