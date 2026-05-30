/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ParseSourceFile} from '@angular/compiler';

import {runInEachFileSystem} from '../../file_system/testing';
import {ClassDeclaration, DeclarationNode} from '../../reflection';
import {IndexingContext} from '../src/context';
import {getTemplateIdentifiers} from '../src/template';
import {generateAnalysis} from '../src/transform';

import * as util from './util';
import {AbstractBoundTemplate, NodeAdapter} from '../src/api';
import ts from 'typescript';

/**
 * Adds information about a component to a context.
 */
function populateContext(
  context: IndexingContext,
  component: ClassDeclaration,
  selector: string,
  template: string,
  boundTemplate: AbstractBoundTemplate<DeclarationNode>,
  isInline: boolean = false,
) {
  context.addComponent({
    declaration: component,
    selector,
    boundTemplate,
    templateMeta: {
      isInline,
      file: new ParseSourceFile(template, component.getSourceFile().fileName),
    },
  });
}

const adapter: NodeAdapter<DeclarationNode> = {
  getName(node: DeclarationNode): string {
    return ts.isClassDeclaration(node) && node.name ? node.name.getText() : '';
  },
  getFileName(node: DeclarationNode): string {
    return node.getSourceFile().fileName;
  },
  getContent(node: DeclarationNode): string {
    return node.getSourceFile().getFullText();
  },
};

runInEachFileSystem(() => {
  describe('generateAnalysis', () => {
    it('should emit component and template analysis information', () => {
      const context = new IndexingContext();
      const decl = util.getComponentDeclaration('class C {}', 'C');
      const template = '<div>{{foo}}</div>';
      populateContext(context, decl, 'c-selector', template, util.getBoundTemplate(template));
      const analysis = generateAnalysis(context, adapter);

      expect(analysis.size).toBe(1);

      const info = analysis.get(decl);
      expect(info).toEqual({
        name: 'C',
        selector: 'c-selector',
        file: new ParseSourceFile('class C {}', decl.getSourceFile().fileName),
        template: {
          identifiers: getTemplateIdentifiers(util.getBoundTemplate('<div>{{foo}}</div>'))
            .identifiers,
          file: new ParseSourceFile('<div>{{foo}}</div>', decl.getSourceFile().fileName),
        },
        errors: [],
      });
    });

    it('should give inline templates the component source file', () => {
      const context = new IndexingContext();
      const decl = util.getComponentDeclaration('class C {}', 'C');
      const template = '<div>{{foo}}</div>';
      populateContext(
        context,
        decl,
        'c-selector',
        '<div>{{foo}}</div>',
        util.getBoundTemplate(template),
        /* inline template */ true,
      );
      const analysis = generateAnalysis(context, adapter);

      expect(analysis.size).toBe(1);

      const info = analysis.get(decl);
      expect(info).toBeDefined();
      expect(info!.template.file).toEqual(
        new ParseSourceFile('class C {}', decl.getSourceFile().fileName),
      );
    });

    it('should give external templates their own source file', () => {
      const context = new IndexingContext();
      const decl = util.getComponentDeclaration('class C {}', 'C');
      const template = '<div>{{foo}}</div>';
      populateContext(context, decl, 'c-selector', template, util.getBoundTemplate(template));
      const analysis = generateAnalysis(context, adapter);

      expect(analysis.size).toBe(1);

      const info = analysis.get(decl);
      expect(info).toBeDefined();
      expect(info!.template.file).toEqual(
        new ParseSourceFile('<div>{{foo}}</div>', decl.getSourceFile().fileName),
      );
    });
  });
});
