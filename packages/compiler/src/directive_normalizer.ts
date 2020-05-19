/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveMetadata, CompileStylesheetMetadata, CompileTemplateMetadata, templateSourceUrl} from './compile_metadata';
import {CompilerConfig, preserveWhitespacesDefault} from './config';
import {ViewEncapsulation} from './core';
import * as html from './ml_parser/ast';
import {HtmlParser} from './ml_parser/html_parser';
import {InterpolationConfig} from './ml_parser/interpolation_config';
import {ParseTreeResult as HtmlParseTreeResult} from './ml_parser/parser';
import {ResourceLoader} from './resource_loader';
import {extractStyleUrls, isStyleUrlResolvable} from './style_url_resolver';
import {PreparsedElementType, preparseElement} from './template_parser/template_preparser';
import {UrlResolver} from './url_resolver';
import {isDefined, stringify, SyncAsync, syntaxError} from './util';

export interface PrenormalizedTemplateMetadata {
  ngModuleType: any;
  componentType: any;
  moduleUrl: string;
  template: string|null;
  templateUrl: string|null;
  styles: string[];
  styleUrls: string[];
  interpolation: [string, string]|null;
  encapsulation: ViewEncapsulation|null;
  animations: any[];
  preserveWhitespaces: boolean|null;
}

export class DirectiveNormalizer {
  private _resourceLoaderCache = new Map<string, SyncAsync<string>>();

  constructor(
      private _resourceLoader: ResourceLoader, private _urlResolver: UrlResolver,
      private _htmlParser: HtmlParser, private _config: CompilerConfig) {}

  clearCache(): void {
    this._resourceLoaderCache.clear();
  }

  clearCacheFor(normalizedDirective: CompileDirectiveMetadata): void {
    if (!normalizedDirective.isComponent) {
      return;
    }
    const template = normalizedDirective.template !;
    this._resourceLoaderCache.delete(template.templateUrl!);
    template.externalStylesheets.forEach((stylesheet) => {
      this._resourceLoaderCache.delete(stylesheet.moduleUrl!);
    });
  }

  private _fetch(url: string): SyncAsync<string> {
    let result = this._resourceLoaderCache.get(url);
    if (!result) {
      result = this._resourceLoader.get(url);
      this._resourceLoaderCache.set(url, result);
    }
    return result;
  }

  normalizeTemplate(prenormData: PrenormalizedTemplateMetadata):
      SyncAsync<CompileTemplateMetadata> {
    if (isDefined(prenormData.template)) {
      if (isDefined(prenormData.templateUrl)) {
        throw syntaxError(`'${
            stringify(prenormData
                          .componentType)}' component cannot define both template and templateUrl`);
      }
      if (typeof prenormData.template !== 'string') {
        throw syntaxError(`The template specified for component ${
            stringify(prenormData.componentType)} is not a string`);
      }
    } else if (isDefined(prenormData.templateUrl)) {
      if (typeof prenormData.templateUrl !== 'string') {
        throw syntaxError(`The templateUrl specified for component ${
            stringify(prenormData.componentType)} is not a string`);
      }
    } else {
      throw syntaxError(
          `No template specified for component ${stringify(prenormData.componentType)}`);
    }

    if (isDefined(prenormData.preserveWhitespaces) &&
        typeof prenormData.preserveWhitespaces !== 'boolean') {
      throw syntaxError(`The preserveWhitespaces option for component ${
          stringify(prenormData.componentType)} must be a boolean`);
    }

    return SyncAsync.then(
        this._preParseTemplate(prenormData),
        (preparsedTemplate) => this._normalizeTemplateMetadata(prenormData, preparsedTemplate));
  }

  private _preParseTemplate(prenomData: PrenormalizedTemplateMetadata):
      SyncAsync<PreparsedTemplate> {
    let template: SyncAsync<string>;
    let templateUrl: string;
    if (prenomData.template != null) {
      template = prenomData.template;
      templateUrl = prenomData.moduleUrl;
    } else {
      templateUrl = this._urlResolver.resolve(prenomData.moduleUrl, prenomData.templateUrl!);
      template = this._fetch(templateUrl);
    }
    return SyncAsync.then(
        template, (template) => this._preparseLoadedTemplate(prenomData, template, templateUrl));
  }

  private _preparseLoadedTemplate(
      prenormData: PrenormalizedTemplateMetadata, template: string,
      templateAbsUrl: string): PreparsedTemplate {
    const isInline = !!prenormData.template;
    const interpolationConfig = InterpolationConfig.fromArray(prenormData.interpolation!);
    const templateUrl = templateSourceUrl(
        {reference: prenormData.ngModuleType}, {type: {reference: prenormData.componentType}},
        {isInline, templateUrl: templateAbsUrl});
    const rootNodesAndErrors = this._htmlParser.parse(
        template, templateUrl, {tokenizeExpansionForms: true, interpolationConfig});
    if (rootNodesAndErrors.errors.length > 0) {
      const errorString = rootNodesAndErrors.errors.join('\n');
      throw syntaxError(`Template parse errors:\n${errorString}`);
    }

    const templateMetadataStyles = this._normalizeStylesheet(new CompileStylesheetMetadata(
        {styles: prenormData.styles, moduleUrl: prenormData.moduleUrl}));

    const visitor = new TemplatePreparseVisitor();
    html.visitAll(visitor, rootNodesAndErrors.rootNodes);
    const templateStyles = this._normalizeStylesheet(new CompileStylesheetMetadata(
        {styles: visitor.styles, styleUrls: visitor.styleUrls, moduleUrl: templateAbsUrl}));

    const styles = templateMetadataStyles.styles.concat(templateStyles.styles);

    const inlineStyleUrls = templateMetadataStyles.styleUrls.concat(templateStyles.styleUrls);
    const styleUrls = this
                          ._normalizeStylesheet(new CompileStylesheetMetadata(
                              {styleUrls: prenormData.styleUrls, moduleUrl: prenormData.moduleUrl}))
                          .styleUrls;
    return {
      template,
      templateUrl: templateAbsUrl,
      isInline,
      htmlAst: rootNodesAndErrors,
      styles,
      inlineStyleUrls,
      styleUrls,
      ngContentSelectors: visitor.ngContentSelectors,
    };
  }

  private _normalizeTemplateMetadata(
      prenormData: PrenormalizedTemplateMetadata,
      preparsedTemplate: PreparsedTemplate): SyncAsync<CompileTemplateMetadata> {
    return SyncAsync.then(
        this._loadMissingExternalStylesheets(
            preparsedTemplate.styleUrls.concat(preparsedTemplate.inlineStyleUrls)),
        (externalStylesheets) => this._normalizeLoadedTemplateMetadata(
            prenormData, preparsedTemplate, externalStylesheets));
  }

  private _normalizeLoadedTemplateMetadata(
      prenormData: PrenormalizedTemplateMetadata, preparsedTemplate: PreparsedTemplate,
      stylesheets: Map<string, CompileStylesheetMetadata>): CompileTemplateMetadata {
    // Algorithm:
    // - produce exactly 1 entry per original styleUrl in
    // CompileTemplateMetadata.externalStylesheets with all styles inlined
    // - inline all styles that are referenced by the template into CompileTemplateMetadata.styles.
    // Reason: be able to determine how many stylesheets there are even without loading
    // the template nor the stylesheets, so we can create a stub for TypeScript always synchronously
    // (as resource loading may be async)

    const styles = [...preparsedTemplate.styles];
    this._inlineStyles(preparsedTemplate.inlineStyleUrls, stylesheets, styles);
    const styleUrls = preparsedTemplate.styleUrls;

    const externalStylesheets = styleUrls.map(styleUrl => {
      const stylesheet = stylesheets.get(styleUrl)!;
      const styles = [...stylesheet.styles];
      this._inlineStyles(stylesheet.styleUrls, stylesheets, styles);
      return new CompileStylesheetMetadata({moduleUrl: styleUrl, styles: styles});
    });

    let encapsulation = prenormData.encapsulation;
    if (encapsulation == null) {
      encapsulation = this._config.defaultEncapsulation;
    }
    if (encapsulation === ViewEncapsulation.Emulated && styles.length === 0 &&
        styleUrls.length === 0) {
      encapsulation = ViewEncapsulation.None;
    }
    return new CompileTemplateMetadata({
      encapsulation,
      template: preparsedTemplate.template,
      templateUrl: preparsedTemplate.templateUrl,
      htmlAst: preparsedTemplate.htmlAst,
      styles,
      styleUrls,
      ngContentSelectors: preparsedTemplate.ngContentSelectors,
      animations: prenormData.animations,
      interpolation: prenormData.interpolation,
      isInline: preparsedTemplate.isInline,
      externalStylesheets,
      preserveWhitespaces: preserveWhitespacesDefault(
          prenormData.preserveWhitespaces, this._config.preserveWhitespaces),
    });
  }

  private _inlineStyles(
      styleUrls: string[], stylesheets: Map<string, CompileStylesheetMetadata>,
      targetStyles: string[]) {
    styleUrls.forEach(styleUrl => {
      const stylesheet = stylesheets.get(styleUrl)!;
      stylesheet.styles.forEach(style => targetStyles.push(style));
      this._inlineStyles(stylesheet.styleUrls, stylesheets, targetStyles);
    });
  }

  private _loadMissingExternalStylesheets(
      styleUrls: string[],
      loadedStylesheets:
          Map<string, CompileStylesheetMetadata> = new Map<string, CompileStylesheetMetadata>()):
      SyncAsync<Map<string, CompileStylesheetMetadata>> {
    return SyncAsync.then(
        SyncAsync.all(styleUrls.filter((styleUrl) => !loadedStylesheets.has(styleUrl))
                          .map(
                              styleUrl => SyncAsync.then(
                                  this._fetch(styleUrl),
                                  (loadedStyle) => {
                                    const stylesheet =
                                        this._normalizeStylesheet(new CompileStylesheetMetadata(
                                            {styles: [loadedStyle], moduleUrl: styleUrl}));
                                    loadedStylesheets.set(styleUrl, stylesheet);
                                    return this._loadMissingExternalStylesheets(
                                        stylesheet.styleUrls, loadedStylesheets);
                                  }))),
        (_) => loadedStylesheets);
  }

  private _normalizeStylesheet(stylesheet: CompileStylesheetMetadata): CompileStylesheetMetadata {
    const moduleUrl = stylesheet.moduleUrl!;
    const allStyleUrls = stylesheet.styleUrls.filter(isStyleUrlResolvable)
                             .map(url => this._urlResolver.resolve(moduleUrl, url));

    const allStyles = stylesheet.styles.map(style => {
      const styleWithImports = extractStyleUrls(this._urlResolver, moduleUrl, style);
      allStyleUrls.push(...styleWithImports.styleUrls);
      return styleWithImports.style;
    });

    return new CompileStylesheetMetadata(
        {styles: allStyles, styleUrls: allStyleUrls, moduleUrl: moduleUrl});
  }
}

interface PreparsedTemplate {
  template: string;
  templateUrl: string;
  isInline: boolean;
  htmlAst: HtmlParseTreeResult;
  styles: string[];
  inlineStyleUrls: string[];
  styleUrls: string[];
  ngContentSelectors: string[];
}

class TemplatePreparseVisitor implements html.Visitor {
  ngContentSelectors: string[] = [];
  styles: string[] = [];
  styleUrls: string[] = [];
  ngNonBindableStackCount: number = 0;

  visitElement(ast: html.Element, context: any): any {
    const preparsedElement = preparseElement(ast);
    switch (preparsedElement.type) {
      case PreparsedElementType.NG_CONTENT:
        if (this.ngNonBindableStackCount === 0) {
          this.ngContentSelectors.push(preparsedElement.selectAttr);
        }
        break;
      case PreparsedElementType.STYLE:
        let textContent = '';
        ast.children.forEach(child => {
          if (child instanceof html.Text) {
            textContent += child.value;
          }
        });
        this.styles.push(textContent);
        break;
      case PreparsedElementType.STYLESHEET:
        this.styleUrls.push(preparsedElement.hrefAttr);
        break;
      default:
        break;
    }
    if (preparsedElement.nonBindable) {
      this.ngNonBindableStackCount++;
    }
    html.visitAll(this, ast.children);
    if (preparsedElement.nonBindable) {
      this.ngNonBindableStackCount--;
    }
    return null;
  }

  visitExpansion(ast: html.Expansion, context: any): any {
    html.visitAll(this, ast.cases);
  }

  visitExpansionCase(ast: html.ExpansionCase, context: any): any {
    html.visitAll(this, ast.expression);
  }

  visitComment(ast: html.Comment, context: any): any {
    return null;
  }
  visitAttribute(ast: html.Attribute, context: any): any {
    return null;
  }
  visitText(ast: html.Text, context: any): any {
    return null;
  }
}
