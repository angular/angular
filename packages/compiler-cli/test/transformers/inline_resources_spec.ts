/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {isClassMetadata, MetadataCollector} from '../../src/metadata/index';
import {getInlineResourcesTransformFactory, InlineResourcesMetadataTransformer} from '../../src/transformers/inline_resources';
import {MetadataCache} from '../../src/transformers/metadata_cache';
import {MockAotContext, MockCompilerHost} from '../mocks';

describe('inline resources transformer', () => {
  describe('decorator input', () => {
    describe('should not touch unrecognized decorators', () => {
      it('Not from @angular/core', () => {
        expect(convert(`declare const Component: Function;
          @Component({templateUrl: './thing.html'}) class Foo {}`))
            .toContain('templateUrl');
      });
      it('missing @ sign', () => {
        expect(convert(`import {Component} from '@angular/core';
          Component({templateUrl: './thing.html'}) class Foo {}`))
            .toContain('templateUrl');
      });
      it('too many arguments to @Component', () => {
        expect(convert(`import {Component} from '@angular/core';
          @Component(1, {templateUrl: './thing.html'}) class Foo {}`))
            .toContain('templateUrl');
      });
      it('wrong argument type to @Component', () => {
        expect(convert(`import {Component} from '@angular/core';
          @Component([{templateUrl: './thing.html'}]) class Foo {}`))
            .toContain('templateUrl');
      });
    });

    it('should replace templateUrl', () => {
      const actual = convert(`import {Component} from '@angular/core';
        @Component({
          templateUrl: './thing.html',
	        otherProp: 3,
	      }) export class Foo {}`);
      expect(actual).not.toContain('templateUrl:');
      expect(actual.replace(/\s+/g, ' '))
          .toContain(
              'Foo = __decorate([ core_1.Component({ template: "Some template", otherProp: 3 }) ], Foo)');
    });
    it('should allow different quotes', () => {
      const actual = convert(`import {Component} from '@angular/core';
        @Component({"templateUrl": \`./thing.html\`}) export class Foo {}`);
      expect(actual).not.toContain('templateUrl:');
      expect(actual).toContain('{ template: "Some template" }');
    });
    it('should replace styleUrls', () => {
      const actual = convert(`import {Component} from '@angular/core';
        @Component({
          styleUrls: ['./thing1.css', './thing2.css'],
        })
        export class Foo {}`);
      expect(actual).not.toContain('styleUrls:');
      expect(actual).toContain('styles: [".some_style {}", ".some_other_style {}"]');
    });
    it('should preserve existing styles', () => {
      const actual = convert(`import {Component} from '@angular/core';
        @Component({
          styles: ['h1 { color: blue }'],
          styleUrls: ['./thing1.css'],
        })
        export class Foo {}`);
      expect(actual).not.toContain('styleUrls:');
      expect(actual).toContain(`styles: ['h1 { color: blue }', ".some_style {}"]`);
    });
    it('should handle empty styleUrls', () => {
      const actual = convert(`import {Component} from '@angular/core';
        @Component({styleUrls: [], styles: []}) export class Foo {}`);
      expect(actual).not.toContain('styleUrls:');
      expect(actual).not.toContain('styles:');
    });
  });
  describe('annotation input', () => {
    it('should replace templateUrl', () => {
      const actual = convert(`import {Component} from '@angular/core';
      declare const NotComponent: Function;

      export class Foo {
        static decorators: {type: Function, args?: any[]}[] = [
          {
            type: NotComponent,
            args: [],
          },{
            type: Component,
            args: [{
              templateUrl: './thing.html'
          }],
        }];
      }
    `);
      expect(actual).not.toContain('templateUrl:');
      expect(actual.replace(/\s+/g, ' '))
          .toMatch(
              /Foo\.decorators = [{ .*type: core_1\.Component, args: [{ template: "Some template" }]/);
    });
    it('should replace styleUrls', () => {
      const actual = convert(`import {Component} from '@angular/core';
      declare const NotComponent: Function;

      export class Foo {
        static decorators: {type: Function, args?: any[]}[] = [{
          type: Component,
          args: [{
            styleUrls: ['./thing1.css', './thing2.css'],
          }],
        }];
      }
    `);
      expect(actual).not.toContain('styleUrls:');
      expect(actual.replace(/\s+/g, ' '))
          .toMatch(
              /Foo\.decorators = [{ .*type: core_1\.Component, args: [{ style: "Some template" }]/);
    });
  });
});

describe('metadata transformer', () => {
  it('should transform decorators', () => {
    const source = `import {Component} from '@angular/core';
      @Component({
        templateUrl: './thing.html',
        styleUrls: ['./thing1.css', './thing2.css'],
        styles: ['h1 { color: red }'],
      })
      export class Foo {}
    `;
    const sourceFile = ts.createSourceFile(
        'someFile.ts', source, ts.ScriptTarget.Latest, /* setParentNodes */ true);
    const cache = new MetadataCache(
        new MetadataCollector(), /* strict */ true,
        [new InlineResourcesMetadataTransformer(
            {loadResource, resourceNameToFileName: (u: string) => u})]);
    const metadata = cache.getMetadata(sourceFile);
    expect(metadata).toBeDefined('Expected metadata from test source file');
    if (metadata) {
      const classData = metadata.metadata['Foo'];
      expect(classData && isClassMetadata(classData))
          .toBeDefined(`Expected metadata to contain data for Foo`);
      if (classData && isClassMetadata(classData)) {
        expect(JSON.stringify(classData)).not.toContain('templateUrl');
        expect(JSON.stringify(classData)).toContain('"template":"Some template"');
        expect(JSON.stringify(classData)).not.toContain('styleUrls');
        expect(JSON.stringify(classData))
            .toContain('"styles":["h1 { color: red }",".some_style {}",".some_other_style {}"]');
      }
    }
  });
});

function loadResource(path: string): Promise<string>|string {
  if (path === './thing.html') return 'Some template';
  if (path === './thing1.css') return '.some_style {}';
  if (path === './thing2.css') return '.some_other_style {}';
  throw new Error('No fake data for path ' + path);
}

function convert(source: string) {
  const baseFileName = 'someFile';
  const moduleName = '/' + baseFileName;
  const fileName = moduleName + '.ts';
  const context = new MockAotContext('/', {[baseFileName + '.ts']: source});
  const host = new MockCompilerHost(context);

  const sourceFile =
      ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, /* setParentNodes */ true);
  const program = ts.createProgram(
      [fileName], {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2017,
      },
      host);
  const moduleSourceFile = program.getSourceFile(fileName);
  const transformers: ts.CustomTransformers = {
    before: [getInlineResourcesTransformFactory(
        program, {loadResource, resourceNameToFileName: (u: string) => u})]
  };
  let result = '';
  const emitResult = program.emit(
      moduleSourceFile, (emittedFileName, data, writeByteOrderMark, onError, sourceFiles) => {
        if (fileName.startsWith(moduleName)) {
          result = data;
        }
      }, undefined, undefined, transformers);
  return result;
}
