/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ReadonlyFileSystem} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';
import {SourceFileLoader} from '../../../src/ngtsc/sourcemaps';
import {AstFactory} from '../../../src/ngtsc/translator';

import {AstHost} from '../ast/ast_host';
import {DEFAULT_LINKER_OPTIONS, LinkerOptions} from './linker_options';
import {Translator} from './translator';

export class LinkerEnvironment<TStatement, TExpression> {
  readonly translator = new Translator<TStatement, TExpression>(this.factory);
  readonly sourceFileLoader =
      this.options.sourceMapping ? new SourceFileLoader(this.fileSystem, this.logger, {}) : null;

  private constructor(
      readonly fileSystem: ReadonlyFileSystem, readonly logger: Logger,
      readonly host: AstHost<TExpression>, readonly factory: AstFactory<TStatement, TExpression>,
      readonly options: LinkerOptions) {}

  static create<TStatement, TExpression>(
      fileSystem: ReadonlyFileSystem, logger: Logger, host: AstHost<TExpression>,
      factory: AstFactory<TStatement, TExpression>,
      options: Partial<LinkerOptions>): LinkerEnvironment<TStatement, TExpression> {
    return new LinkerEnvironment(fileSystem, logger, host, factory, {
      enableI18nLegacyMessageIdFormat: options.enableI18nLegacyMessageIdFormat ??
          DEFAULT_LINKER_OPTIONS.enableI18nLegacyMessageIdFormat,
      i18nNormalizeLineEndingsInICUs: options.i18nNormalizeLineEndingsInICUs ??
          DEFAULT_LINKER_OPTIONS.i18nNormalizeLineEndingsInICUs,
      i18nUseExternalIds: options.i18nUseExternalIds ?? DEFAULT_LINKER_OPTIONS.i18nUseExternalIds,
      sourceMapping: options.sourceMapping ?? DEFAULT_LINKER_OPTIONS.sourceMapping,
      linkerJitMode: options.linkerJitMode ?? DEFAULT_LINKER_OPTIONS.linkerJitMode,
    });
  }
}
