/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, ViewEncapsulation} from '@angular/core';

import {CompileDirectiveMetadata, CompileStylesheetMetadata, CompileTemplateMetadata, CompileTypeMetadata} from './compile_metadata';
import {CompilerConfig} from './config';
import {MapWrapper} from './facade/collection';
import {isBlank, isPresent} from './facade/lang';
import * as html from './ml_parser/ast';
import {HtmlParser} from './ml_parser/html_parser';
import {InterpolationConfig} from './ml_parser/interpolation_config';
import {ResourceLoader} from './resource_loader';
import {extractStyleUrls, isStyleUrlResolvable} from './style_url_resolver';
import {PreparsedElementType, preparseElement} from './template_parser/template_preparser';
import {UrlResolver} from './url_resolver';
import {SyncAsyncResult} from './util';

@Injectable()
export class DirectiveNormalizer {
  private _resourceLoaderCache = new Map<string, Promise<string>>();

  constructor(
      private _resourceLoader: ResourceLoader, private _urlResolver: UrlResolver,
      private _htmlParser: HtmlParser, private _config: CompilerConfig) {}

  clearCache() { this._resourceLoaderCache.clear(); }

  clearCacheFor(normalizedDirective: CompileDirectiveMetadata) {
    if (!normalizedDirective.isComponent) {
      return;
    }
    this._resourceLoaderCache.delete(normalizedDirective.template.templateUrl);
    normalizedDirective.template.externalStylesheets.forEach(
        (stylesheet) => { this._resourceLoaderCache.delete(stylesheet.moduleUrl); });
  }

  private _fetch(url: string): Promise<string> {
    var result = this._resourceLoaderCache.get(url);
    if (!result) {
      result = this._resourceLoader.get(url);
      this._resourceLoaderCache.set(url, result);
    }
    return result;
  }

  normalizeDirective(directive: CompileDirectiveMetadata):
      SyncAsyncResult<CompileDirectiveMetadata> {
    if (!directive.isComponent) {
      // For non components there is nothing to be normalized yet.
      return new SyncAsyncResult(directive, Promise.resolve(directive));
    }
    let normalizedTemplateSync: CompileTemplateMetadata = null;
    let normalizedTemplateAsync: Promise<CompileTemplateMetadata>;
    if (isPresent(directive.template.template)) {
      normalizedTemplateSync = this.normalizeTemplateSync(directive.type, directive.template);
      normalizedTemplateAsync = Promise.resolve(normalizedTemplateSync);
    } else if (directive.template.templateUrl) {
      normalizedTemplateAsync = this.normalizeTemplateAsync(directive.type, directive.template);
    } else {
      throw new Error(`No template specified for component ${directive.type.name}`);
    }
    if (normalizedTemplateSync && normalizedTemplateSync.styleUrls.length === 0) {
      // sync case
      let normalizedDirective = _cloneDirectiveWithTemplate(directive, normalizedTemplateSync);
      return new SyncAsyncResult(normalizedDirective, Promise.resolve(normalizedDirective));
    } else {
      // async case
      return new SyncAsyncResult(
          null,
          normalizedTemplateAsync
              .then((normalizedTemplate) => this.normalizeExternalStylesheets(normalizedTemplate))
              .then(
                  (normalizedTemplate) =>
                      _cloneDirectiveWithTemplate(directive, normalizedTemplate)));
    }
  }

  normalizeTemplateSync(directiveType: CompileTypeMetadata, template: CompileTemplateMetadata):
      CompileTemplateMetadata {
    return this.normalizeLoadedTemplate(
        directiveType, template, template.template, directiveType.moduleUrl);
  }

  normalizeTemplateAsync(directiveType: CompileTypeMetadata, template: CompileTemplateMetadata):
      Promise<CompileTemplateMetadata> {
    let templateUrl = this._urlResolver.resolve(directiveType.moduleUrl, template.templateUrl);
    return this._fetch(templateUrl)
        .then((value) => this.normalizeLoadedTemplate(directiveType, template, value, templateUrl));
  }

  normalizeLoadedTemplate(
      directiveType: CompileTypeMetadata, templateMeta: CompileTemplateMetadata, template: string,
      templateAbsUrl: string): CompileTemplateMetadata {
    const interpolationConfig = InterpolationConfig.fromArray(templateMeta.interpolation);
    const rootNodesAndErrors =
        this._htmlParser.parse(template, directiveType.name, false, interpolationConfig);
    if (rootNodesAndErrors.errors.length > 0) {
      const errorString = rootNodesAndErrors.errors.join('\n');
      throw new Error(`Template parse errors:\n${errorString}`);
    }
    const templateMetadataStyles = this.normalizeStylesheet(new CompileStylesheetMetadata({
      styles: templateMeta.styles,
      styleUrls: templateMeta.styleUrls,
      moduleUrl: directiveType.moduleUrl
    }));

    const visitor = new TemplatePreparseVisitor();
    html.visitAll(visitor, rootNodesAndErrors.rootNodes);
    const templateStyles = this.normalizeStylesheet(new CompileStylesheetMetadata(
        {styles: visitor.styles, styleUrls: visitor.styleUrls, moduleUrl: templateAbsUrl}));

    let encapsulation = templateMeta.encapsulation;
    if (isBlank(encapsulation)) {
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
      externalStylesheets: templateMeta.externalStylesheets,
      ngContentSelectors: visitor.ngContentSelectors,
      animations: templateMeta.animations,
      interpolation: templateMeta.interpolation,
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
                interpolation: templateMeta.interpolation
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
                   var stylesheet = this.normalizeStylesheet(
                       new CompileStylesheetMetadata({styles: [loadedStyle], moduleUrl: styleUrl}));
                   loadedStylesheets.set(styleUrl, stylesheet);
                   return this._loadMissingExternalStylesheets(
                       stylesheet.styleUrls, loadedStylesheets);
                 })))
        .then((_) => MapWrapper.values(loadedStylesheets));
  }

  normalizeStylesheet(stylesheet: CompileStylesheetMetadata): CompileStylesheetMetadata {
    var allStyleUrls = stylesheet.styleUrls.filter(isStyleUrlResolvable)
                           .map(url => this._urlResolver.resolve(stylesheet.moduleUrl, url));

    var allStyles = stylesheet.styles.map(style => {
      var styleWithImports = extractStyleUrls(this._urlResolver, stylesheet.moduleUrl, style);
      allStyleUrls.push(...styleWithImports.styleUrls);
      return styleWithImports.style;
    });

    return new CompileStylesheetMetadata(
        {styles: allStyles, styleUrls: allStyleUrls, moduleUrl: stylesheet.moduleUrl});
  }
}

class TemplatePreparseVisitor implements html.Visitor {
  ngContentSelectors: string[] = [];
  styles: string[] = [];
  styleUrls: string[] = [];
  ngNonBindableStackCount: number = 0;

  visitElement(ast: html.Element, context: any): any {
    var preparsedElement = preparseElement(ast);
    switch (preparsedElement.type) {
      case PreparsedElementType.NG_CONTENT:
        if (this.ngNonBindableStackCount === 0) {
          this.ngContentSelectors.push(preparsedElement.selectAttr);
        }
        break;
      case PreparsedElementType.STYLE:
        var textContent = '';
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

  visitComment(ast: html.Comment, context: any): any { return null; }
  visitAttribute(ast: html.Attribute, context: any): any { return null; }
  visitText(ast: html.Text, context: any): any { return null; }
  visitExpansion(ast: html.Expansion, context: any): any { return null; }
  visitExpansionCase(ast: html.ExpansionCase, context: any): any { return null; }
}

function _cloneDirectiveWithTemplate(
    directive: CompileDirectiveMetadata,
    template: CompileTemplateMetadata): CompileDirectiveMetadata {
  return new CompileDirectiveMetadata({
    type: directive.type,
    isComponent: directive.isComponent,
    selector: directive.selector,
    exportAs: directive.exportAs,
    changeDetection: directive.changeDetection,
    inputs: directive.inputs,
    outputs: directive.outputs,
    hostListeners: directive.hostListeners,
    hostProperties: directive.hostProperties,
    hostAttributes: directive.hostAttributes,
    providers: directive.providers,
    viewProviders: directive.viewProviders,
    queries: directive.queries,
    viewQueries: directive.viewQueries,
    entryComponents: directive.entryComponents, template,
  });
}
