/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
 * Extract i18n messages from source code
 *
 * TODO(vicb): factorize code with the CodeGenerator
 */
// Must be imported first, because angular2 decorators throws on load.
import 'reflect-metadata';

import * as compiler from '@angular/compiler';
import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import * as tsc from '@angular/tsc-wrapped';
import * as ts from 'typescript';

import {ReflectorHost, ReflectorHostContext} from './reflector_host';
import {StaticAndDynamicReflectionCapabilities} from './static_reflection_capabilities';
import {StaticReflector, StaticSymbol} from './static_reflector';

const GENERATED_FILES = /\.ngfactory\.ts$|\.css\.ts$|\.css\.shim\.ts$/;

export class Extractor {
  constructor(
      private options: tsc.AngularCompilerOptions, private program: ts.Program,
      public host: ts.CompilerHost, private staticReflector: StaticReflector,
      private messageBundle: compiler.MessageBundle, private reflectorHost: ReflectorHost,
      private metadataResolver: compiler.CompileMetadataResolver,
      private directiveNormalizer: compiler.DirectiveNormalizer) {}

  private readModuleSymbols(absSourcePath: string): StaticSymbol[] {
    const moduleMetadata = this.staticReflector.getModuleMetadata(absSourcePath);
    const modSymbols: StaticSymbol[] = [];
    if (!moduleMetadata) {
      console.log(`WARNING: no metadata found for ${absSourcePath}`);
      return modSymbols;
    }

    const metadata = moduleMetadata['metadata'];
    const symbols = metadata && Object.keys(metadata);
    if (!symbols || !symbols.length) {
      return modSymbols;
    }

    for (const symbol of symbols) {
      if (metadata[symbol] && metadata[symbol].__symbolic == 'error') {
        // Ignore symbols that are only included to record error information.
        continue;
      }

      const staticType = this.reflectorHost.findDeclaration(absSourcePath, symbol, absSourcePath);
      const annotations = this.staticReflector.annotations(staticType);

      annotations.some(a => {
        if (a instanceof NgModule) {
          modSymbols.push(staticType);
          return true;
        }
      });
    }

    return modSymbols;
  }

  extract(): Promise<compiler.MessageBundle> {
    const filePaths =
        this.program.getSourceFiles().map(sf => sf.fileName).filter(f => !GENERATED_FILES.test(f));
    const ngModules: StaticSymbol[] = [];

    filePaths.forEach((filePath) => ngModules.push(...this.readModuleSymbols(filePath)));

    const files = compiler.analyzeNgModules(ngModules, this.metadataResolver).files;
    const errors: compiler.ParseError[] = [];
    const filePromises: Promise<any>[] = [];

    files.forEach(file => {
      const cmpPromises: Promise<compiler.CompileDirectiveMetadata>[] = [];
      file.directives.forEach(directiveType => {
        const dirMeta = this.metadataResolver.getDirectiveMetadata(directiveType);
        if (dirMeta.isComponent) {
          cmpPromises.push(this.directiveNormalizer.normalizeDirective(dirMeta).asyncResult);
        }
      });

      if (cmpPromises.length) {
        const done =
            Promise.all(cmpPromises).then((compMetas: compiler.CompileDirectiveMetadata[]) => {
              compMetas.forEach(compMeta => {
                const html = compMeta.template.template;
                const interpolationConfig =
                    compiler.InterpolationConfig.fromArray(compMeta.template.interpolation);
                errors.push(...this.messageBundle.updateFromTemplate(
                    html, file.srcUrl, interpolationConfig));
              });
            });

        filePromises.push(done);
      }
    });


    if (errors.length) {
      throw new Error(errors.map(e => e.toString()).join('\n'));
    }

    return Promise.all(filePromises).then(_ => this.messageBundle);
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
        elementSchemaRegistry, staticReflector);

    // TODO(vicb): implicit tags & attributes
    let messageBundle = new compiler.MessageBundle(htmlParser, [], {});

    return new Extractor(
        options, program, compilerHost, staticReflector, messageBundle, reflectorHost, resolver,
        normalizer);
  }
}