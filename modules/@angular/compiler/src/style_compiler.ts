/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, ViewEncapsulation} from '@angular/core';
import {CompileDirectiveMetadata, CompileIdentifierMetadata, CompileStylesheetMetadata} from './compile_metadata';
import * as o from './output/output_ast';
import {ShadowCss} from './shadow_css';
import {UrlResolver} from './url_resolver';

const COMPONENT_VARIABLE = '%COMP%';
const HOST_ATTR = `_nghost-${COMPONENT_VARIABLE}`;
const CONTENT_ATTR = `_ngcontent-${COMPONENT_VARIABLE}`;

export class StylesCompileDependency {
  constructor(
      public moduleUrl: string, public isShimmed: boolean,
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

@Injectable()
export class StyleCompiler {
  private _shadowCss: ShadowCss = new ShadowCss();

  constructor(private _urlResolver: UrlResolver) {}

  compileComponent(comp: CompileDirectiveMetadata): StylesCompileResult {
    const externalStylesheets: CompiledStylesheet[] = [];
    const componentStylesheet: CompiledStylesheet = this._compileStyles(
        comp, new CompileStylesheetMetadata({
          styles: comp.template.styles,
          styleUrls: comp.template.styleUrls,
          moduleUrl: comp.type.moduleUrl
        }),
        true);
    comp.template.externalStylesheets.forEach((stylesheetMeta) => {
      const compiledStylesheet = this._compileStyles(comp, stylesheetMeta, false);
      externalStylesheets.push(compiledStylesheet);
    });
    return new StylesCompileResult(componentStylesheet, externalStylesheets);
  }

  private _compileStyles(
      comp: CompileDirectiveMetadata, stylesheet: CompileStylesheetMetadata,
      isComponentStylesheet: boolean): CompiledStylesheet {
    const shim = comp.template.encapsulation === ViewEncapsulation.Emulated;
    const styleExpressions =
        stylesheet.styles.map(plainStyle => o.literal(this._shimIfNeeded(plainStyle, shim)));
    const dependencies: StylesCompileDependency[] = [];
    for (let i = 0; i < stylesheet.styleUrls.length; i++) {
      const identifier = new CompileIdentifierMetadata({name: getStylesVarName(null)});
      dependencies.push(new StylesCompileDependency(stylesheet.styleUrls[i], shim, identifier));
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

function getStylesVarName(component: CompileDirectiveMetadata): string {
  let result = `styles`;
  if (component) {
    result += `_${component.type.name}`;
  }
  return result;
}
