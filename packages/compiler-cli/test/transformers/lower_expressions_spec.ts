/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ModuleMetadata} from '@angular/tsc-wrapped';
import * as ts from 'typescript';

import {LowerMetadataCache, LoweringRequest, RequestLocationMap, getExpressionLoweringTransformFactory} from '../../src/transformers/lower_expressions';
import {Directory, MockAotContext, MockCompilerHost} from '../mocks';

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
  const moduleSourceFile = program.getSourceFile(fileName);
  const transformers: ts.CustomTransformers = {
    before: [getExpressionLoweringTransformFactory({
      getRequests(sourceFile: ts.SourceFile): RequestLocationMap{
        if (sourceFile.fileName == moduleSourceFile.fileName) {
          return requests;
        } else {return new Map();}
      }
    })]
  };
  let result: string = '';
  const emitResult = program.emit(
      moduleSourceFile, (emittedFileName, data, writeByteOrderMark, onError, sourceFiles) => {
        if (fileName.startsWith(moduleName)) {
          result = data;
        }
      }, undefined, undefined, transformers);
  return normalizeResult(result);
};

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
  const cache = new LowerMetadataCache({});
  const sourceFile = ts.createSourceFile(
      'someName.ts', unannotatedSource, ts.ScriptTarget.Latest, /* setParentNodes */ true);
  return {
    metadata: cache.getMetadata(sourceFile),
    requests: cache.getRequests(sourceFile), annotations
  };
}