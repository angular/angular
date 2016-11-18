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
import {ViewEncapsulation} from '@angular/core';

import {analyzeAndValidateNgModules, extractProgramSymbols, loadNgModuleDirectives} from '../aot/compiler';
import {StaticAndDynamicReflectionCapabilities} from '../aot/static_reflection_capabilities';
import {StaticReflector, StaticReflectorHost} from '../aot/static_reflector';
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
import {Console} from '../private_import_core';
import {DomElementSchemaRegistry} from '../schema/dom_element_schema_registry';
import {createOfflineCompileUrlResolver} from '../url_resolver';

import {I18NHtmlParser} from './i18n_html_parser';
import {MessageBundle} from './message_bundle';

export interface ExtractorOptions {
  includeFilePattern?: RegExp;
  excludeFilePattern?: RegExp;
}

/**
 * The host of the Extractor disconnects the implementation from TypeScript / other language
 * services and from underlying file systems.
 */
export interface ExtractorHost extends StaticReflectorHost {
  /**
   * Loads a resource (e.g. html / css)
   */
  loadResource(path: string): Promise<string>;
}

export class Extractor {
  constructor(
      private options: ExtractorOptions, public host: ExtractorHost,
      private staticReflector: StaticReflector, private messageBundle: MessageBundle,
      private metadataResolver: CompileMetadataResolver) {}

  extract(rootFiles: string[]): Promise<MessageBundle> {
    const programSymbols = extractProgramSymbols(this.staticReflector, rootFiles, this.options);
    const {ngModuleByPipeOrDirective, files, ngModules} =
        analyzeAndValidateNgModules(programSymbols, this.options, this.metadataResolver);
    return loadNgModuleDirectives(ngModules).then(() => {
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
          const html = compMeta.template.template;
          const interpolationConfig =
              InterpolationConfig.fromArray(compMeta.template.interpolation);
          errors.push(
              ...this.messageBundle.updateFromTemplate(html, file.srcUrl, interpolationConfig));
        });
      });

      if (errors.length) {
        throw new Error(errors.map(e => e.toString()).join('\n'));
      }

      return this.messageBundle;
    });
  }

  static create(host: ExtractorHost, options: ExtractorOptions):
      {extractor: Extractor, staticReflector: StaticReflector} {
    const htmlParser = new I18NHtmlParser(new HtmlParser());

    const urlResolver = createOfflineCompileUrlResolver();
    const staticReflector = new StaticReflector(host);
    StaticAndDynamicReflectionCapabilities.install(staticReflector);

    const config = new CompilerConfig({
      genDebugInfo: false,
      defaultEncapsulation: ViewEncapsulation.Emulated,
      logBindingUpdate: false,
      useJit: false
    });

    const normalizer = new DirectiveNormalizer(
        {get: (url: string) => host.loadResource(url)}, urlResolver, htmlParser, config);
    const elementSchemaRegistry = new DomElementSchemaRegistry();
    const resolver = new CompileMetadataResolver(
        new NgModuleResolver(staticReflector), new DirectiveResolver(staticReflector),
        new PipeResolver(staticReflector), elementSchemaRegistry, normalizer, staticReflector);

    // TODO(vicb): implicit tags & attributes
    const messageBundle = new MessageBundle(htmlParser, [], {});

    const extractor = new Extractor(options, host, staticReflector, messageBundle, resolver);
    return {extractor, staticReflector};
  }
}
