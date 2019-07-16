/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ParseSourceFile} from '@angular/compiler';
import {runInEachFileSystem} from '../../file_system/testing';
import {IndexingContext} from '../src/context';
import {getTemplateIdentifiers} from '../src/template';
import {generateAnalysis} from '../src/transform';
import * as util from './util';

runInEachFileSystem(() => {
  describe('generateAnalysis', () => {
    it('should emit component and template analysis information', () => {
      const context = new IndexingContext();
      const decl = util.getClassDeclaration('class C {}', 'C');
      const template = '<div>{{foo}}</div>';
      context.addComponent({
        declaration: decl,
        selector: 'c-selector',
        boundTemplate: util.getBoundTemplate(template),
        templateMeta: {
          isInline: false,
          file: new ParseSourceFile(template, util.getTestFilePath()),
        },
        owningModule: undefined,
        importedModules: new Set(),
      });
      const analysis = generateAnalysis(context);

      expect(analysis.size).toBe(1);

      const info = analysis.get(decl);
      expect(info).toEqual({
        name: 'C',
        selector: 'c-selector',
        file: new ParseSourceFile('class C {}', util.getTestFilePath()),
        template: {
          identifiers: getTemplateIdentifiers(util.getBoundTemplate('<div>{{foo}}</div>')),
          usedComponents: new Set(),
          isInline: false,
          file: new ParseSourceFile('<div>{{foo}}</div>', util.getTestFilePath()),
        },
        owningModule: undefined,
        importedModules: new Set(),
      });
    });

    it('should give inline templates the component source file', () => {
      const context = new IndexingContext();
      const decl = util.getClassDeclaration('class C {}', 'C');
      const template = '<div>{{foo}}</div>';
      context.addComponent({
        declaration: decl,
        selector: 'c-selector',
        boundTemplate: util.getBoundTemplate(template),
        templateMeta: {
          isInline: true,
          file: new ParseSourceFile(decl.getText(), util.getTestFilePath()),
        },
        owningModule: undefined,
        importedModules: new Set(),
      });
      const analysis = generateAnalysis(context);

      expect(analysis.size).toBe(1);

      const info = analysis.get(decl);
      expect(info).toBeDefined();
      expect(info !.template.file)
          .toEqual(new ParseSourceFile('class C {}', util.getTestFilePath()));
    });

    it('should give external templates their own source file', () => {
      const context = new IndexingContext();
      const decl = util.getClassDeclaration('class C {}', 'C');
      const template = '<div>{{foo}}</div>';
      context.addComponent({
        declaration: decl,
        selector: 'c-selector',
        boundTemplate: util.getBoundTemplate(template),
        templateMeta: {
          isInline: false,
          file: new ParseSourceFile(template, util.getTestFilePath()),
        },
        owningModule: undefined,
        importedModules: new Set(),
      });
      const analysis = generateAnalysis(context);

      expect(analysis.size).toBe(1);

      const info = analysis.get(decl);
      expect(info).toBeDefined();
      expect(info !.template.file)
          .toEqual(new ParseSourceFile('<div>{{foo}}</div>', util.getTestFilePath()));
    });

    it('should emit used components', () => {
      const context = new IndexingContext();

      const templateA = '<b-selector></b-selector>';
      const declA = util.getClassDeclaration('class A {}', 'A');

      const templateB = '<a-selector></a-selector>';
      const declB = util.getClassDeclaration('class B {}', 'B');

      const boundA =
          util.getBoundTemplate(templateA, {}, [{selector: 'b-selector', declaration: declB}]);
      const boundB =
          util.getBoundTemplate(templateB, {}, [{selector: 'a-selector', declaration: declA}]);

      context.addComponent({
        declaration: declA,
        selector: 'a-selector',
        boundTemplate: boundA,
        templateMeta: {
          isInline: false,
          file: new ParseSourceFile(templateA, util.getTestFilePath()),
        },
        owningModule: undefined,
        importedModules: new Set(),
      });
      context.addComponent({
        declaration: declB,
        selector: 'b-selector',
        boundTemplate: boundB,
        templateMeta: {
          isInline: false,
          file: new ParseSourceFile(templateB, util.getTestFilePath()),
        },
        owningModule: undefined,
        importedModules: new Set(),
      });

      const analysis = generateAnalysis(context);

      expect(analysis.size).toBe(2);

      const infoA = analysis.get(declA);
      expect(infoA).toBeDefined();
      expect(infoA !.template.usedComponents).toEqual(new Set([declB]));

      const infoB = analysis.get(declB);
      expect(infoB).toBeDefined();
      expect(infoB !.template.usedComponents).toEqual(new Set([declA]));
    });

    it('should emit owning and imported NgModule', () => {
      const context = new IndexingContext();
      const decl = util.getClassDeclaration('class A {}', 'A');
      const owner = util.getClassDeclaration('class Owner {}', 'Owner');
      const imports = new Set([util.getClassDeclaration('class Import {}', 'Import')]);

      context.addComponent({
        declaration: decl,
        selector: 'a-selector',
        boundTemplate: util.getBoundTemplate(''),
        templateMeta: {
          isInline: false,
          file: new ParseSourceFile('', util.getTestFilePath()),
        },
        owningModule: owner,
        importedModules: imports,
      });

      const analysis = generateAnalysis(context);

      expect(analysis.size).toBe(1);

      const info = analysis.get(decl);
      expect(info).toBeDefined();
      expect(info !.owningModule).toEqual(owner);
      expect(info !.importedModules).toEqual(imports);
    });
  });
});
