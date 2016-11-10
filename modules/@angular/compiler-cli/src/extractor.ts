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
// Must be imported first, because angular2 decorators throws on load.
import 'reflect-metadata';

import * as compiler from '@angular/compiler';
import {ViewEncapsulation} from '@angular/core';
import * as tsc from '@angular/tsc-wrapped';
import * as ts from 'typescript';

import {extractProgramSymbols} from './codegen';
import {ReflectorHost} from './reflector_host';
import {StaticAndDynamicReflectionCapabilities} from './static_reflection_capabilities';
import {StaticReflector, StaticSymbol} from './static_reflector';

export class Extractor {
  constructor(
      private options: tsc.AngularCompilerOptions, private program: ts.Program,
      public host: ts.CompilerHost, private staticReflector: StaticReflector,
      private messageBundle: compiler.MessageBundle, private reflectorHost: ReflectorHost,
      private metadataResolver: compiler.CompileMetadataResolver) {}

  extract(): Promise<compiler.MessageBundle> {
    const programSymbols: StaticSymbol[] =
        extractProgramSymbols(this.program, this.staticReflector, this.reflectorHost, this.options);

    return compiler
        .analyzeNgModules(programSymbols, {transitiveModules: true}, this.metadataResolver)
        .then(({files}) => {
          const errors: compiler.ParseError[] = [];

          files.forEach(file => {
            const compMetas: compiler.CompileDirectiveMetadata[] = [];
            file.directives.forEach(directiveType => {
              const dirMeta = this.metadataResolver.getDirectiveMetadata(directiveType);
              if (dirMeta && dirMeta.isComponent) {
                compMetas.push(dirMeta);
              }
            });
            compMetas.forEach(compMeta => {
              const html = compMeta.template.template;
              const interpolationConfig =
                  compiler.InterpolationConfig.fromArray(compMeta.template.interpolation);
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

  static create(
      options: tsc.AngularCompilerOptions, translationsFormat: string, program: ts.Program,
      compilerHost: ts.CompilerHost, resourceLoader: compiler.ResourceLoader,
      reflectorHost?: ReflectorHost): Extractor {
    const htmlParser = new compiler.I18NHtmlParser(new compiler.HtmlParser());

    const urlResolver: compiler.UrlResolver = compiler.createOfflineCompileUrlResolver();
    if (!reflectorHost) reflectorHost = new ReflectorHost(program, compilerHost, options);
    const staticReflector = new StaticReflector(reflectorHost);
    StaticAndDynamicReflectionCapabilities.install(staticReflector);

    const config = new compiler.CompilerConfig({
      genDebugInfo: options.debug === true,
      defaultEncapsulation: ViewEncapsulation.Emulated,
      logBindingUpdate: false,
      useJit: false
    });

    const normalizer =
        new compiler.DirectiveNormalizer(resourceLoader, urlResolver, htmlParser, config);
    const elementSchemaRegistry = new compiler.DomElementSchemaRegistry();
    const resolver = new compiler.CompileMetadataResolver(
        new compiler.NgModuleResolver(staticReflector),
        new compiler.DirectiveResolver(staticReflector), new compiler.PipeResolver(staticReflector),
        elementSchemaRegistry, normalizer, staticReflector);

    // TODO(vicb): implicit tags & attributes
    let messageBundle = new compiler.MessageBundle(htmlParser, [], {});

    return new Extractor(
        options, program, compilerHost, staticReflector, messageBundle, reflectorHost, resolver);
  }
}