/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewEncapsulation} from '@angular/core';

import {CompileDirectiveMetadata, CompileIdentifierMetadata, CompileStylesheetMetadata, identifierModuleUrl, identifierName} from './compile_metadata';
import {CompilerInjectable} from './injectable';
import * as o from './output/output_ast';
import {ShadowCss} from './shadow_css';
import {UrlResolver} from './url_resolver';
import {OutputContext} from './util';

const COMPONENT_VARIABLE = '%COMP%';
const HOST_ATTR = `_nghost-${COMPONENT_VARIABLE}`;
const CONTENT_ATTR = `_ngcontent-${COMPONENT_VARIABLE}`;

export class StylesCompileDependency {
  constructor(
      public name: string, public moduleUrl: string, public setValue: (value: any) => void) {}
}

export class CompiledStylesheet {
  constructor(
      public outputCtx: OutputContext, public stylesVar: string,
      public dependencies: StylesCompileDependency[], public isShimmed: boolean,
      public meta: CompileStylesheetMetadata) {}
}

@CompilerInjectable()
export class StyleCompiler {
  private _shadowCss: ShadowCss = new ShadowCss();

  constructor(private _urlResolver: UrlResolver) {}

  compileComponent(outputCtx: OutputContext, comp: CompileDirectiveMetadata): CompiledStylesheet {
    const template = comp.template !;
    return this._compileStyles(
        outputCtx, comp, new CompileStylesheetMetadata({
          styles: template.styles,
          styleUrls: template.styleUrls,
          moduleUrl: identifierModuleUrl(comp.type)
        }),
        true);
  }

  compileStyles(
      outputCtx: OutputContext, comp: CompileDirectiveMetadata,
      stylesheet: CompileStylesheetMetadata): CompiledStylesheet {
    return this._compileStyles(outputCtx, comp, stylesheet, false);
  }

  needsStyleShim(comp: CompileDirectiveMetadata): boolean {
    return comp.template !.encapsulation === ViewEncapsulation.Emulated;
  }

  private _compileStyles(
      outputCtx: OutputContext, comp: CompileDirectiveMetadata,
      stylesheet: CompileStylesheetMetadata, isComponentStylesheet: boolean): CompiledStylesheet {
    const shim = this.needsStyleShim(comp);
    const styleExpressions: o.Expression[] =
        stylesheet.styles.map(plainStyle => o.literal(this._shimIfNeeded(plainStyle, shim)));
    const dependencies: StylesCompileDependency[] = [];
    stylesheet.styleUrls.forEach((styleUrl) => {
      const exprIndex = styleExpressions.length;
      // Note: This placeholder will be filled later.
      styleExpressions.push(null !);
      dependencies.push(new StylesCompileDependency(
          getStylesVarName(null), styleUrl,
          (value) => styleExpressions[exprIndex] = outputCtx.importExpr(value)));
    });
    // styles variable contains plain strings and arrays of other styles arrays (recursive),
    // so we set its type to dynamic.
    const stylesVar = getStylesVarName(isComponentStylesheet ? comp : null);
    const stmt = o.variable(stylesVar)
                     .set(o.literalArr(
                         styleExpressions, new o.ArrayType(o.DYNAMIC_TYPE, [o.TypeModifier.Const])))
                     .toDeclStmt(null, isComponentStylesheet ? [o.StmtModifier.Final] : [
                       o.StmtModifier.Final, o.StmtModifier.Exported
                     ]);
    outputCtx.statements.push(stmt);
    return new CompiledStylesheet(outputCtx, stylesVar, dependencies, shim, stylesheet);
  }

  private _shimIfNeeded(style: string, shim: boolean): string {
    return shim ? this._shadowCss.shimCssText(style, CONTENT_ATTR, HOST_ATTR) : style;
  }
}

function getStylesVarName(component: CompileDirectiveMetadata | null): string {
  let result = `styles`;
  if (component) {
    result += `_${identifierName(component.type)}`;
  }
  return result;
}
