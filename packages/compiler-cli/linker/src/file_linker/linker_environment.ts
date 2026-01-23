/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ReadonlyFileSystem} from '../../../src/ngtsc/file_system/src/types';
import {Logger} from '../../../src/ngtsc/logging';
import {SourceFileLoader} from '../../../src/ngtsc/sourcemaps';
import {AstFactory} from '../../../src/ngtsc/translator';

import {AstHost} from '../ast/ast_host';
import {DEFAULT_LINKER_OPTIONS, LinkerOptions} from './linker_options';
import {Translator} from './translator';

export class LinkerEnvironment<TStatement, TExpression> {
  readonly translator: Translator<TStatement, TExpression>;
  readonly sourceFileLoader: SourceFileLoader | null;

  private constructor(
    readonly fileSystem: ReadonlyFileSystem,
    readonly logger: Logger,
    readonly host: AstHost<TExpression>,
    readonly factory: AstFactory<TStatement, TExpression>,
    readonly options: LinkerOptions,
  ) {
    this.translator = new Translator<TStatement, TExpression>(this.factory);
    this.sourceFileLoader = this.options.sourceMapping
      ? new SourceFileLoader(this.fileSystem, this.logger, {})
      : null;
  }

  static create<TStatement, TExpression>(
    fileSystem: ReadonlyFileSystem,
    logger: Logger,
    host: AstHost<TExpression>,
    factory: AstFactory<TStatement, TExpression>,
    options: Partial<LinkerOptions>,
  ): LinkerEnvironment<TStatement, TExpression> {
    return new LinkerEnvironment(fileSystem, logger, host, factory, {
      sourceMapping: options.sourceMapping ?? DEFAULT_LINKER_OPTIONS.sourceMapping,
      linkerJitMode: options.linkerJitMode ?? DEFAULT_LINKER_OPTIONS.linkerJitMode,
      unknownDeclarationVersionHandling:
        options.unknownDeclarationVersionHandling ??
        DEFAULT_LINKER_OPTIONS.unknownDeclarationVersionHandling,
    });
  }
}
