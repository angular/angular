/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilePipeSummary} from '../compile_metadata';
import {Node} from '../ml_parser/ast';
import {ParseError} from '../parse_util';
import {TemplateAst} from '../template_parser/template_ast';

import {StaticSymbol} from './static_symbol';
import {StaticSymbolResolverHost} from './static_symbol_resolver';
import {AotSummaryResolverHost} from './summary_resolver';

/**
 * The host of the AotCompiler disconnects the implementation from TypeScript / other language
 * services and from underlying file systems.
 */
export interface AotCompilerHost extends StaticSymbolResolverHost, AotSummaryResolverHost {
  /**
   * Loads a resource (e.g. html / css)
   */
  loadResource(path: string): Promise<string>;

  /**
   * Optionally check the given template for additional diagnostic errors.
   */
  checkTemplate?
      (component: StaticSymbol, htmlAst: Node[], templateAst: TemplateAst[],
       pipes: CompilePipeSummary[]): ParseError[];
}
