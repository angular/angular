/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassField, ClassMethod, ClassStmt, PartialModule, Statement, StmtModifier} from '@angular/compiler';
import * as ts from 'typescript';

import {isClassMetadata, MetadataCollector} from '../../src/metadata/index';
import {MetadataCache} from '../../src/transformers/metadata_cache';
import {PartialModuleMetadataTransformer} from '../../src/transformers/r3_metadata_transform';

describe('r3_transform_spec', () => {
  it('should add a static method to collected metadata', () => {
    const fileName = '/some/directory/someFileName.ts';
    const className = 'SomeClass';
    const newFieldName = 'newStaticField';
    const source = `
      export class ${className} {
        myMethod(): void {}
      }
    `;

    const sourceFile =
        ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, /* setParentNodes */ true);
    const partialModule: PartialModule = {
      fileName,
      statements: [new ClassStmt(
          className, /* parent */ null, /* fields */[new ClassField(
              /* name */ newFieldName, /* type */ null, /* modifiers */[StmtModifier.Static])],
          /* getters */[],
          /* constructorMethod */ new ClassMethod(/* name */ null, /* params */[], /* body */[]),
          /* methods */[])]
    };

    const cache = new MetadataCache(
        new MetadataCollector(), /* strict */ true,
        [new PartialModuleMetadataTransformer([partialModule])]);
    const metadata = cache.getMetadata(sourceFile);
    expect(metadata).toBeDefined('Expected metadata from test source file');
    if (metadata) {
      const classData = metadata.metadata[className];
      expect(classData && isClassMetadata(classData))
          .toBeDefined(`Expected metadata to contain data for "${className}"`);
      if (classData && isClassMetadata(classData)) {
        const statics = classData.statics;
        expect(statics).toBeDefined(`Expected "${className}" metadata to contain statics`);
        if (statics) {
          expect(statics[newFieldName]).toEqual({}, 'Expected new field to recorded as a function');
        }
      }
    }
  });
});
