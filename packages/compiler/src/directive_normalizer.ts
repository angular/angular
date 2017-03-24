/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewEncapsulation, ɵstringify as stringify} from '@angular/core';

import {CompileAnimationEntryMetadata, CompileDirectiveMetadata, CompileStylesheetMetadata, CompileTemplateMetadata, templateSourceUrl} from './compile_metadata';
import {CompilerConfig} from './config';
import {CompilerInjectable} from './injectable';
import * as html from './ml_parser/ast';
import {HtmlParser} from './ml_parser/html_parser';
import {InterpolationConfig} from './ml_parser/interpolation_config';
import {ResourceLoader} from './resource_loader';
import {extractStyleUrls, isStyleUrlResolvable} from './style_url_resolver';
import {PreparsedElementType, preparseElement} from './template_parser/template_preparser';
import {UrlResolver} from './url_resolver';
import {SyncAsyncResult, isDefined, syntaxError} from './util';

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
  animations: CompileAnimationEntryMetadata[];
}

@CompilerInjectable()
export class DirectiveNormalizer {
  private _resourceLoaderCache = new Map<string, Promise<string>>();

  constructor(
      private _resourceLoader: ResourceLoader, private _urlResolver: UrlResolver,
      private _htmlParser: HtmlParser, private _config: CompilerConfig) {}

  clearCache(): void { this._resourceLoaderCache.clear(); }

  clearCacheFor(normalizedDirective: CompileDirectiveMetadata): void {
    if (!normalizedDirective.isComponent) {
      return;
    }
    const template = normalizedDirective.template !;
    this._resourceLoaderCache.delete(template.templateUrl !);
    template.externalStylesheets.forEach(
        (stylesheet) => { this._resourceLoaderCache.delete(stylesheet.moduleUrl !); });
  }

  private _fetch(url: string): Promise<string> {
    let result = this._resourceLoaderCache.get(url);
    if (!result) {
      result = this._resourceLoader.get(url) !;
      this._resourceLoaderCache.set(url, result);
    }
    return result;
  }

  normalizeTemplate(prenormData: PrenormalizedTemplateMetadata):
      SyncAsyncResult<CompileTemplateMetadata> {
    let normalizedTemplateSync: CompileTemplateMetadata = null !;
    let normalizedTemplateAsync: Promise<CompileTemplateMetadata> = undefined !;
    if (isDefined(prenormData.template)) {
      if (isDefined(prenormData.templateUrl)) {
        throw syntaxError(
            `'${stringify(prenormData.componentType)}' component cannot define both template and templateUrl`);
      }
      if (typeof prenormData.template !== 'string') {
        throw syntaxError(
            `The template specified for component ${stringify(prenormData.componentType)} is not a string`);
      }
      normalizedTemplateSync = this.normalizeTemplateSync(prenormData);
      normalizedTemplateAsync = Promise.resolve(normalizedTemplateSync !);
    } else if (isDefined(prenormData.templateUrl)) {
      if (typeof prenormData.templateUrl !== 'string') {
        throw syntaxError(
            `The templateUrl specified for component ${stringify(prenormData.componentType)} is not a string`);
      }
      normalizedTemplateAsync = this.normalizeTemplateAsync(prenormData);
    } else {
      throw syntaxError(
          `No template specified for component ${stringify(prenormData.componentType)}`);
    }

    if (normalizedTemplateSync && normalizedTemplateSync.styleUrls.length === 0) {
      // sync case
      return new SyncAsyncResult(normalizedTemplateSync);
    } else {
      // async case
      return new SyncAsyncResult(
          null, normalizedTemplateAsync.then(
                    (normalizedTemplate) => this.normalizeExternalStylesheets(normalizedTemplate)));
    }
  }

  normalizeTemplateSync(prenomData: PrenormalizedTemplateMetadata): CompileTemplateMetadata {
    return this.normalizeLoadedTemplate(prenomData, prenomData.template !, prenomData.moduleUrl);
  }

  normalizeTemplateAsync(prenomData: PrenormalizedTemplateMetadata):
      Promise<CompileTemplateMetadata> {
    const templateUrl = this._urlResolver.resolve(prenomData.moduleUrl, prenomData.templateUrl !);
    return this._fetch(templateUrl)
        .then((value) => this.normalizeLoadedTemplate(prenomData, value, templateUrl));
  }

  normalizeLoadedTemplate(
      prenormData: PrenormalizedTemplateMetadata, template: string,
      templateAbsUrl: string): CompileTemplateMetadata {
    const isInline = !!prenormData.template;
    const interpolationConfig = InterpolationConfig.fromArray(prenormData.interpolation !);
    const rootNodesAndErrors = this._htmlParser.parse(
        template,
        templateSourceUrl(
            {reference: prenormData.ngModuleType}, {type: {reference: prenormData.componentType}},
            {isInline, templateUrl: templateAbsUrl}),
        true, interpolationConfig);
    if (rootNodesAndErrors.errors.length > 0) {
      const errorString = rootNodesAndErrors.errors.join('\n');
      throw syntaxError(`Template parse errors:\n${errorString}`);
    }

    const templateMetadataStyles = this.normalizeStylesheet(new CompileStylesheetMetadata({
      styles: prenormData.styles,
      styleUrls: prenormData.styleUrls,
      moduleUrl: prenormData.moduleUrl
    }));

    const visitor = new TemplatePreparseVisitor();
    html.visitAll(visitor, rootNodesAndErrors.rootNodes);
    const templateStyles = this.normalizeStylesheet(new CompileStylesheetMetadata(
        {styles: visitor.styles, styleUrls: visitor.styleUrls, moduleUrl: templateAbsUrl}));

    let encapsulation = prenormData.encapsulation;
    if (encapsulation == null) {
      encapsulation = this._config.defaultEncapsulation;
    }

    const styles = templateMetadataStyles.styles.concat(templateStyles.styles);
    const styleUrls = templateMetadataStyles.styleUrls.concat(templateStyles.styleUrls);

    if (encapsulation === ViewEncapsulation.Emulated && styles.length === 0 &&
        styleUrls.length === 0) {
      encapsulation = ViewEncapsulation.None;
    }

    return new CompileTemplateMetadata({
      encapsulation,
      template,
      templateUrl: templateAbsUrl, styles, styleUrls,
      ngContentSelectors: visitor.ngContentSelectors,
      animations: prenormData.animations,
      interpolation: prenormData.interpolation, isInline,
      externalStylesheets: []
    });
  }

  normalizeExternalStylesheets(templateMeta: CompileTemplateMetadata):
      Promise<CompileTemplateMetadata> {
    return this._loadMissingExternalStylesheets(templateMeta.styleUrls)
        .then((externalStylesheets) => new CompileTemplateMetadata({
                encapsulation: templateMeta.encapsulation,
                template: templateMeta.template,
                templateUrl: templateMeta.templateUrl,
                styles: templateMeta.styles,
                styleUrls: templateMeta.styleUrls,
                externalStylesheets: externalStylesheets,
                ngContentSelectors: templateMeta.ngContentSelectors,
                animations: templateMeta.animations,
                interpolation: templateMeta.interpolation,
                isInline: templateMeta.isInline,
              }));
  }

  private _loadMissingExternalStylesheets(
      styleUrls: string[],
      loadedStylesheets:
          Map<string, CompileStylesheetMetadata> = new Map<string, CompileStylesheetMetadata>()):
      Promise<CompileStylesheetMetadata[]> {
    return Promise
        .all(styleUrls.filter((styleUrl) => !loadedStylesheets.has(styleUrl))
                 .map(styleUrl => this._fetch(styleUrl).then((loadedStyle) => {
                   const stylesheet = this.normalizeStylesheet(
                       new CompileStylesheetMetadata({styles: [loadedStyle], moduleUrl: styleUrl}));
                   loadedStylesheets.set(styleUrl, stylesheet);
                   return this._loadMissingExternalStylesheets(
                       stylesheet.styleUrls, loadedStylesheets);
                 })))
        .then((_) => Array.from(loadedStylesheets.values()));
  }

  normalizeStylesheet(stylesheet: CompileStylesheetMetadata): CompileStylesheetMetadata {
    const moduleUrl = stylesheet.moduleUrl !;
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

  visitExpansion(ast: html.Expansion, context: any): any { html.visitAll(this, ast.cases); }

  visitExpansionCase(ast: html.ExpansionCase, context: any): any {
    html.visitAll(this, ast.expression);
  }

  visitComment(ast: html.Comment, context: any): any { return null; }
  visitAttribute(ast: html.Attribute, context: any): any { return null; }
  visitText(ast: html.Text, context: any): any { return null; }
}
