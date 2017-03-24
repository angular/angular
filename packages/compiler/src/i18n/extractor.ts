/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
 * Extract i18n messages from source code
 */
import {ViewEncapsulation, ɵConsole as Console} from '@angular/core';

import {analyzeAndValidateNgModules, extractProgramSymbols} from '../aot/compiler';
import {StaticAndDynamicReflectionCapabilities} from '../aot/static_reflection_capabilities';
import {StaticReflector} from '../aot/static_reflector';
import {StaticSymbolCache} from '../aot/static_symbol';
import {StaticSymbolResolver, StaticSymbolResolverHost} from '../aot/static_symbol_resolver';
import {AotSummaryResolver, AotSummaryResolverHost} from '../aot/summary_resolver';
import {CompileDirectiveMetadata} from '../compile_metadata';
import {CompilerConfig} from '../config';
import {DirectiveNormalizer} from '../directive_normalizer';
import {DirectiveResolver} from '../directive_resolver';
import {CompileMetadataResolver} from '../metadata_resolver';
import {HtmlParser} from '../ml_parser/html_parser';
import {InterpolationConfig} from '../ml_parser/interpolation_config';
import {NgModuleResolver} from '../ng_module_resolver';
import {ParseError} from '../parse_util';
import {PipeResolver} from '../pipe_resolver';
import {DomElementSchemaRegistry} from '../schema/dom_element_schema_registry';
import {createOfflineCompileUrlResolver} from '../url_resolver';

import {I18NHtmlParser} from './i18n_html_parser';
import {MessageBundle} from './message_bundle';

/**
 * The host of the Extractor disconnects the implementation from TypeScript / other language
 * services and from underlying file systems.
 */
export interface ExtractorHost extends StaticSymbolResolverHost, AotSummaryResolverHost {
  /**
   * Loads a resource (e.g. html / css)
   */
  loadResource(path: string): Promise<string>;
}

export class Extractor {
  constructor(
      public host: ExtractorHost, private staticSymbolResolver: StaticSymbolResolver,
      private messageBundle: MessageBundle, private metadataResolver: CompileMetadataResolver) {}

  extract(rootFiles: string[]): Promise<MessageBundle> {
    const programSymbols = extractProgramSymbols(this.staticSymbolResolver, rootFiles, this.host);
    const {files, ngModules} =
        analyzeAndValidateNgModules(programSymbols, this.host, this.metadataResolver);
    return Promise
        .all(ngModules.map(
            ngModule => this.metadataResolver.loadNgModuleDirectiveAndPipeMetadata(
                ngModule.type.reference, false)))
        .then(() => {
          const errors: ParseError[] = [];

          files.forEach(file => {
            const compMetas: CompileDirectiveMetadata[] = [];
            file.directives.forEach(directiveType => {
              const dirMeta = this.metadataResolver.getDirectiveMetadata(directiveType);
              if (dirMeta && dirMeta.isComponent) {
                compMetas.push(dirMeta);
              }
            });
            compMetas.forEach(compMeta => {
              const html = compMeta.template !.template !;
              const interpolationConfig =
                  InterpolationConfig.fromArray(compMeta.template !.interpolation);
              errors.push(...this.messageBundle.updateFromTemplate(
                  html, file.srcUrl, interpolationConfig) !);
            });
          });

          if (errors.length) {
            throw new Error(errors.map(e => e.toString()).join('\n'));
          }

          return this.messageBundle;
        });
  }

  static create(host: ExtractorHost, locale: string|null):
      {extractor: Extractor, staticReflector: StaticReflector} {
    const htmlParser = new I18NHtmlParser(new HtmlParser());

    const urlResolver = createOfflineCompileUrlResolver();
    const symbolCache = new StaticSymbolCache();
    const summaryResolver = new AotSummaryResolver(host, symbolCache);
    const staticSymbolResolver = new StaticSymbolResolver(host, symbolCache, summaryResolver);
    const staticReflector = new StaticReflector(summaryResolver, staticSymbolResolver);
    StaticAndDynamicReflectionCapabilities.install(staticReflector);

    const config =
        new CompilerConfig({defaultEncapsulation: ViewEncapsulation.Emulated, useJit: false});

    const normalizer = new DirectiveNormalizer(
        {get: (url: string) => host.loadResource(url)}, urlResolver, htmlParser, config);
    const elementSchemaRegistry = new DomElementSchemaRegistry();
    const resolver = new CompileMetadataResolver(
        config, new NgModuleResolver(staticReflector), new DirectiveResolver(staticReflector),
        new PipeResolver(staticReflector), summaryResolver, elementSchemaRegistry, normalizer,
        new Console(), symbolCache, staticReflector);

    // TODO(vicb): implicit tags & attributes
    const messageBundle = new MessageBundle(htmlParser, [], {}, locale);

    const extractor = new Extractor(host, staticSymbolResolver, messageBundle, resolver);
    return {extractor, staticReflector};
  }
}
