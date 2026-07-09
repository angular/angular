/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  DomSchemaChecker,
  generateTypeCheckBlock,
  OutOfBandDiagnosticRecorder,
  TcbExpr,
  TcbGenericContextBehavior,
  TypeCheckingConfig,
} from '@angular/compiler';
import ts from 'typescript';

import {AbsoluteFsPath} from '../../file_system';
import {Reference, ReferenceEmitter} from '../../imports';
import {ClassDeclaration, ReflectionHost} from '../../reflection';
import {ImportManager} from '../../translator';
import {TypeCheckBlockMetadata} from '../api';

import {Environment} from './environment';
import {ensureTypeCheckFilePreparationImports} from './tcb_util';
import {adaptTypeCheckBlockMetadata} from './tcb_adapter';

export const TCB_FUNCTION_PREFIX = '_tcb';

/**
 * An `Environment` representing the single type-checking file into which most (if not all) Type
 * Check Blocks (TCBs) will be generated.
 *
 * The `TypeCheckFile` hosts multiple TCBs and allows the sharing of declarations (e.g. type
 * constructors) between them. Rather than return such declarations via `getPreludeStatements()`, it
 * hoists them to the top of the generated `ts.SourceFile`.
 */
export class TypeCheckFile extends Environment {
  readonly isTypeCheckFile = true;
  private nextTcbId = 1;
  private tcbStatements: string[] = [];
  private sourceContent: string = '';
  get hasCopiedSource() {
    return this.copiedSourceOriginPath !== undefined;
  }

  setSourceContent(text: string) {
    this.sourceContent = text;
  }

  constructor(
    readonly fileName: AbsoluteFsPath,
    config: TypeCheckingConfig,
    refEmitter: ReferenceEmitter,
    compilerHost: Pick<ts.CompilerHost, 'getCanonicalFileName'>,
  ) {
    super(
      config,
      new ImportManager({
        // This minimizes noticeable changes with older versions of `ImportManager`.
        forceGenerateNamespacesForNewImports: true,
        // Type check block code affects code completion and fix suggestions.
        // We want to encourage single quotes for now, like we always did.
        shouldUseSingleQuotes: () => true,
      }),
      refEmitter,
      ts.createSourceFile(
        compilerHost.getCanonicalFileName(fileName),
        '',
        ts.ScriptTarget.Latest,
        true,
      ),
    );
  }

  addTypeCheckBlock(
    ref: Reference<ClassDeclaration<ts.ClassDeclaration>>,
    meta: TypeCheckBlockMetadata,
    domSchemaChecker: DomSchemaChecker<unknown>,
    oobRecorder: OutOfBandDiagnosticRecorder<unknown>,
    genericContextBehavior: TcbGenericContextBehavior,
    reflector: ReflectionHost,
  ): void {
    const fnId = `${TCB_FUNCTION_PREFIX}${this.nextTcbId++}`;
    const {tcbMeta, component} = adaptTypeCheckBlockMetadata(
      ref,
      meta,
      this,
      reflector,
      genericContextBehavior,
    );
    const fn = generateTypeCheckBlock(
      this,
      component,
      fnId,
      tcbMeta,
      domSchemaChecker,
      oobRecorder,
    );
    this.tcbStatements.push(fn);
  }

  render(): string {
    // NOTE: We are conditionally adding imports whenever we discover signal inputs. This has a
    // risk of changing the import graph of the TypeScript program, degrading incremental program
    // re-use due to program structure changes. For type check block files, we are ensuring an
    // import to e.g. `@angular/core` always exists to guarantee a stable graph.
    ensureTypeCheckFilePreparationImports(this);

    const importChanges = this.importManager.finalize();
    if (importChanges.updatedImports.size > 0) {
      throw new Error(
        'AssertionError: Expected no imports to be updated for a new type check file.',
      );
    }

    const printer = ts.createPrinter();
    let source = this.sourceContent;

    const newImports = importChanges.newImports.get(this.contextFile.fileName);
    if (newImports !== undefined) {
      if (source.length > 0 && !source.endsWith('\n')) {
        source += '\n';
      }
      source += newImports
        .map((i) => printer.printNode(ts.EmitHint.Unspecified, i, this.contextFile))
        .join('\n');
    }

    source += '\n';

    for (const expr of this.pipeInstStatements) {
      source += `${expr.print()};\n`;
    }

    for (const expr of this.typeCtorStatements) {
      source += `${expr.print()};\n`;
    }

    source += '\n';

    for (const stmt of this.tcbStatements) {
      source += stmt + '\n';
    }

    // Ensure the template type-checking file is an ES module. Otherwise, it's interpreted as some
    // kind of global namespace in TS, which forces a full re-typecheck of the user's program that
    // is somehow more expensive than the initial parse.
    source += '\nexport const IS_A_MODULE = true;\n';

    return source;
  }

  override getPreludeStatements(): TcbExpr[] {
    return [];
  }
}
