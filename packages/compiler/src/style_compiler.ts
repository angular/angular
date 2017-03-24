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

const COMPONENT_VARIABLE = '%COMP%';
const HOST_ATTR = `_nghost-${COMPONENT_VARIABLE}`;
const CONTENT_ATTR = `_ngcontent-${COMPONENT_VARIABLE}`;

export class StylesCompileDependency {
  constructor(
      public name: string, public moduleUrl: string, public isShimmed: boolean,
      public valuePlaceholder: CompileIdentifierMetadata) {}
}

export class StylesCompileResult {
  constructor(
      public componentStylesheet: CompiledStylesheet,
      public externalStylesheets: CompiledStylesheet[]) {}
}

export class CompiledStylesheet {
  constructor(
      public statements: o.Statement[], public stylesVar: string,
      public dependencies: StylesCompileDependency[], public isShimmed: boolean,
      public meta: CompileStylesheetMetadata) {}
}

@CompilerInjectable()
export class StyleCompiler {
  private _shadowCss: ShadowCss = new ShadowCss();

  constructor(private _urlResolver: UrlResolver) {}

  compileComponent(comp: CompileDirectiveMetadata): StylesCompileResult {
    const template = comp.template !;
    const externalStylesheets: CompiledStylesheet[] = [];
    const componentStylesheet: CompiledStylesheet = this._compileStyles(
        comp, new CompileStylesheetMetadata({
          styles: template.styles,
          styleUrls: template.styleUrls,
          moduleUrl: identifierModuleUrl(comp.type)
        }),
        true);
    template.externalStylesheets.forEach((stylesheetMeta) => {
      const compiledStylesheet = this._compileStyles(comp, stylesheetMeta, false);
      externalStylesheets.push(compiledStylesheet);
    });
    return new StylesCompileResult(componentStylesheet, externalStylesheets);
  }

  private _compileStyles(
      comp: CompileDirectiveMetadata, stylesheet: CompileStylesheetMetadata,
      isComponentStylesheet: boolean): CompiledStylesheet {
    const shim = comp.template !.encapsulation === ViewEncapsulation.Emulated;
    const styleExpressions =
        stylesheet.styles.map(plainStyle => o.literal(this._shimIfNeeded(plainStyle, shim)));
    const dependencies: StylesCompileDependency[] = [];
    for (let i = 0; i < stylesheet.styleUrls.length; i++) {
      const identifier: CompileIdentifierMetadata = {reference: null};
      dependencies.push(new StylesCompileDependency(
          getStylesVarName(null), stylesheet.styleUrls[i], shim, identifier));
      styleExpressions.push(new o.ExternalExpr(identifier));
    }
    // styles variable contains plain strings and arrays of other styles arrays (recursive),
    // so we set its type to dynamic.
    const stylesVar = getStylesVarName(isComponentStylesheet ? comp : null);
    const stmt = o.variable(stylesVar)
                     .set(o.literalArr(
                         styleExpressions, new o.ArrayType(o.DYNAMIC_TYPE, [o.TypeModifier.Const])))
                     .toDeclStmt(null, [o.StmtModifier.Final]);
    return new CompiledStylesheet([stmt], stylesVar, dependencies, shim, stylesheet);
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
