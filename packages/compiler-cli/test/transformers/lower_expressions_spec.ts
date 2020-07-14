/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {MetadataCollector, ModuleMetadata} from '../../src/metadata/index';
import {getExpressionLoweringTransformFactory, LoweringRequest, LowerMetadataTransform, RequestLocationMap} from '../../src/transformers/lower_expressions';
import {MetadataCache} from '../../src/transformers/metadata_cache';
import {Directory, MockAotContext, MockCompilerHost} from '../mocks';

const DEFAULT_FIELDS_TO_LOWER = ['useFactory', 'useValue', 'data'];

describe('Expression lowering', () => {
  describe('transform', () => {
    it('should be able to lower a simple expression', () => {
      expect(convert('const a = 1 +◊b: 2◊;')).toBe('const b = 2; const a = 1 + b; export { b };');
    });

    it('should be able to lower an expression in a decorator', () => {
      expect(convert(`
          import {Component} from '@angular/core';

          @Component({
            provider: [{provide: 'someToken', useFactory:◊l: () => null◊}]
          })
          class MyClass {}
      `)).toContain('const l = () => null; exports.l = l;');
    });

    it('should be able to export a variable if the whole value is lowered', () => {
      expect(convert('/*a*/ const a =◊b: () => null◊;'))
          .toBe('/*a*/ const a = () => null; const b = a; export { b };');
    });
  });

  describe('collector', () => {
    it('should request a lowering for useValue', () => {
      const collected = collect(`
        import {Component} from '@angular/core';

        enum SomeEnum {
          OK,
          NotOK
        }

        @Component({
          provider: [{provide: 'someToken', useValue:◊enum: SomeEnum.OK◊}]
        })
        export class MyClass {}
      `);
      expect(collected.requests.has(collected.annotations[0].start))
          .toBeTruthy('did not find the useValue');
    });

    it('should not request a lowering for useValue with a reference to a static property', () => {
      const collected = collect(`
        import {Component} from '@angular/core';

        @Component({
          provider: [{provide: 'someToken', useValue:◊value: MyClass.someMethod◊}]
        })
        export class MyClass {
          static someMethod() {}
        }
      `);
      expect(collected.requests.size).toBe(0);
    });

    it('should request a lowering for useFactory', () => {
      const collected = collect(`
        import {Component} from '@angular/core';

        @Component({
          provider: [{provide: 'someToken', useFactory:◊lambda: () => null◊}]
        })
        export class MyClass {}
      `);
      expect(collected.requests.has(collected.annotations[0].start))
          .toBeTruthy('did not find the useFactory');
    });

    it('should request a lowering for data', () => {
      const collected = collect(`
        import {Component} from '@angular/core';

        enum SomeEnum {
          OK,
          NotOK
        }

        @Component({
          provider: [{provide: 'someToken', data:◊enum: SomeEnum.OK◊}]
        })
        export class MyClass {}
      `);
      expect(collected.requests.has(collected.annotations[0].start))
          .toBeTruthy('did not find the data field');
    });

    it('should not lower a non-module', () => {
      const collected = collect(`
          declare const global: any;
          const ngDevMode: boolean = (function(global: any) {
            return global.ngDevMode = true;
          })(typeof window != 'undefined' && window || typeof self != 'undefined' && self || typeof global != 'undefined' && global);
       `);
      expect(collected.requests.size).toBe(0, 'unexpected rewriting');
    });

    it('should throw a validation exception for invalid files', () => {
      const cache = new MetadataCache(
          new MetadataCollector({}), /* strict */ true,
          [new LowerMetadataTransform(DEFAULT_FIELDS_TO_LOWER)]);
      const sourceFile = ts.createSourceFile(
          'foo.ts', `
        import {Injectable} from '@angular/core';

        class SomeLocalClass {}
        @Injectable()
        export class SomeClass {
          constructor(a: SomeLocalClass) {}
        }
      `,
          ts.ScriptTarget.Latest, true);
      expect(() => cache.getMetadata(sourceFile)).toThrow();
    });

    it('should not report validation errors on a .d.ts file', () => {
      const cache = new MetadataCache(
          new MetadataCollector({}), /* strict */ true,
          [new LowerMetadataTransform(DEFAULT_FIELDS_TO_LOWER)]);
      const dtsFile = ts.createSourceFile(
          'foo.d.ts', `
        import {Injectable} from '@angular/core';

        class SomeLocalClass {}
        @Injectable()
        export class SomeClass {
          constructor(a: SomeLocalClass) {}
        }
      `,
          ts.ScriptTarget.Latest, true);
      expect(() => cache.getMetadata(dtsFile)).not.toThrow();
    });
  });
});

// Helpers

interface Annotation {
  start: number;
  length: number;
  name: string;
}

function getAnnotations(annotatedSource: string):
    {unannotatedSource: string, annotations: Annotation[]} {
  const annotations: {start: number, length: number, name: string}[] = [];
  let adjustment = 0;
  const unannotatedSource = annotatedSource.replace(
      /◊([a-zA-Z]+):(.*)◊/g,
      (text: string, name: string, source: string, index: number): string => {
        annotations.push({start: index + adjustment, length: source.length, name});
        adjustment -= text.length - source.length;
        return source;
      });
  return {unannotatedSource, annotations};
}

// Transform helpers

function convert(annotatedSource: string) {
  const {annotations, unannotatedSource} = getAnnotations(annotatedSource);

  const baseFileName = 'someFile';
  const moduleName = '/' + baseFileName;
  const fileName = moduleName + '.ts';
  const context = new MockAotContext('/', {[baseFileName + '.ts']: unannotatedSource});
  const host = new MockCompilerHost(context);

  const sourceFile = ts.createSourceFile(
      fileName, unannotatedSource, ts.ScriptTarget.Latest, /* setParentNodes */ true);
  const requests = new Map<number, LoweringRequest>();

  for (const annotation of annotations) {
    const node = findNode(sourceFile, annotation.start, annotation.length);
    if (!node) throw new Error('Invalid test specification. Could not find the node to substitute');
    const location = node.pos;
    requests.set(location, {name: annotation.name, kind: node.kind, location, end: node.end});
  }

  const program = ts.createProgram(
      [fileName], {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017}, host);
  const moduleSourceFile = program.getSourceFile(fileName)!;
  const transformers: ts.CustomTransformers = {
    before: [getExpressionLoweringTransformFactory(
        {
          getRequests(sourceFile: ts.SourceFile): RequestLocationMap {
            if (sourceFile.fileName == moduleSourceFile.fileName) {
              return requests;
            } else {
              return new Map();
            }
          }
        },
        program)]
  };
  let result: string = '';
  const emitResult = program.emit(
      moduleSourceFile, (emittedFileName, data, writeByteOrderMark, onError, sourceFiles) => {
        if (fileName.startsWith(moduleName)) {
          result = data;
        }
      }, undefined, undefined, transformers);
  return normalizeResult(result);
}

function findNode(node: ts.Node, start: number, length: number): ts.Node|undefined {
  function find(node: ts.Node): ts.Node|undefined {
    if (node.getFullStart() == start && node.getEnd() == start + length) {
      return node;
    }
    if (node.getFullStart() <= start && node.getEnd() >= start + length) {
      return ts.forEachChild(node, find);
    }
  }
  return ts.forEachChild(node, find);
}

function normalizeResult(result: string): string {
  // Remove TypeScript prefixes
  // Remove new lines
  // Squish adjacent spaces
  // Remove prefix and postfix spaces
  return result.replace('"use strict";', ' ')
      .replace('exports.__esModule = true;', ' ')
      .replace('Object.defineProperty(exports, "__esModule", { value: true });', ' ')
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ')
      .replace(/^ /g, '')
      .replace(/ $/g, '');
}

// Collector helpers

function collect(annotatedSource: string) {
  const {annotations, unannotatedSource} = getAnnotations(annotatedSource);
  const transformer = new LowerMetadataTransform(DEFAULT_FIELDS_TO_LOWER);
  const cache = new MetadataCache(new MetadataCollector({}), false, [transformer]);
  const sourceFile = ts.createSourceFile(
      'someName.ts', unannotatedSource, ts.ScriptTarget.Latest, /* setParentNodes */ true);
  return {
    metadata: cache.getMetadata(sourceFile),
    requests: transformer.getRequests(sourceFile),
    annotations
  };
}
