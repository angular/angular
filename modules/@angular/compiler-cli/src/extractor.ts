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
import * as path from 'path';
import * as ts from 'typescript';

import {Console} from './private_import_core';
import {ReflectorHost, ReflectorHostContext} from './reflector_host';
import {StaticAndDynamicReflectionCapabilities} from './static_reflection_capabilities';
import {StaticReflector, StaticSymbol} from './static_reflector';

const GENERATED_FILES = /\.ngfactory\.ts$|\.css\.ts$|\.css\.shim\.ts$/;
const GENERATED_OR_DTS_FILES = /\.d\.ts$|\.ngfactory\.ts$|\.css\.ts$|\.css\.shim\.ts$/;

export class Extractor {
  constructor(
      private options: tsc.AngularCompilerOptions, private program: ts.Program,
      public host: ts.CompilerHost, private staticReflector: StaticReflector,
      private messageBundle: compiler.MessageBundle, private reflectorHost: ReflectorHost,
      private metadataResolver: compiler.CompileMetadataResolver,
      private directiveNormalizer: compiler.DirectiveNormalizer) {}

  private readFileMetadata(absSourcePath: string): FileMetadata {
    const moduleMetadata = this.staticReflector.getModuleMetadata(absSourcePath);
    const result: FileMetadata = {components: [], ngModules: [], fileUrl: absSourcePath};
    if (!moduleMetadata) {
      console.log(`WARNING: no metadata found for ${absSourcePath}`);
      return result;
    }
    const metadata = moduleMetadata['metadata'];
    const symbols = metadata && Object.keys(metadata);
    if (!symbols || !symbols.length) {
      return result;
    }
    for (const symbol of symbols) {
      if (metadata[symbol] && metadata[symbol].__symbolic == 'error') {
        // Ignore symbols that are only included to record error information.
        continue;
      }
      const staticType = this.reflectorHost.findDeclaration(absSourcePath, symbol, absSourcePath);
      const annotations = this.staticReflector.annotations(staticType);
      annotations.forEach((annotation) => {
        if (annotation instanceof NgModule) {
          result.ngModules.push(staticType);
        } else if (annotation instanceof Component) {
          result.components.push(staticType);
        }
      });
    }
    return result;
  }

  extract(): Promise<compiler.MessageBundle> {
    const skipFileNames = (this.options.generateCodeForLibraries === false) ?
        GENERATED_OR_DTS_FILES :
        GENERATED_FILES;
    const filePaths =
        this.program.getSourceFiles().map(sf => sf.fileName).filter(f => !skipFileNames.test(f));
    const fileMetas = filePaths.map((filePath) => this.readFileMetadata(filePath));
    const ngModules = fileMetas.reduce((ngModules, fileMeta) => {
      ngModules.push(...fileMeta.ngModules);
      return ngModules;
    }, <StaticSymbol[]>[]);
    const analyzedNgModules = compiler.analyzeModules(ngModules, this.metadataResolver);
    const errors: compiler.ParseError[] = [];

    let bundlePromise =
        Promise
            .all(fileMetas.map((fileMeta) => {
              const url = fileMeta.fileUrl;
              return Promise.all(fileMeta.components.map(compType => {
                const compMeta = this.metadataResolver.getDirectiveMetadata(<any>compType);
                const ngModule = analyzedNgModules.ngModuleByDirective.get(compType);
                if (!ngModule) {
                  throw new Error(
                      `Cannot determine the module for component ${compMeta.type.name}!`);
                }
                return Promise
                    .all([compMeta, ...ngModule.transitiveModule.directives].map(
                        dirMeta =>
                            this.directiveNormalizer.normalizeDirective(dirMeta).asyncResult))
                    .then((normalizedCompWithDirectives) => {
                      const compMeta = normalizedCompWithDirectives[0];
                      const html = compMeta.template.template;
                      const interpolationConfig =
                          compiler.InterpolationConfig.fromArray(compMeta.template.interpolation);
                      errors.push(
                          ...this.messageBundle.updateFromTemplate(html, url, interpolationConfig));
                    });
              }));
            }))
            .then(_ => this.messageBundle);

    if (errors.length) {
      throw new Error(errors.map(e => e.toString()).join('\n'));
    }

    return bundlePromise;
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

interface FileMetadata {
  fileUrl: string;
  components: StaticSymbol[];
  ngModules: StaticSymbol[];
}
