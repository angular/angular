/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  AbstractBoundTemplate,
  generateIndexerAnalysis,
  getIndexerTemplateIdentifiers,
  IndexingContext,
  NodeAdapter,
  ParseSourceFile,
} from '@angular/compiler';
import {runInEachFileSystem} from '../../file_system/testing';
import {ClassDeclaration, DeclarationNode} from '../../reflection';
import {getBoundTemplate, getComponentDeclaration} from './util';
import ts from 'typescript';

/**
 * Adds information about a component to a context.
 */
function populateContext(
  context: IndexingContext<DeclarationNode>,
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
};

runInEachFileSystem(() => {
  describe('generateIndexerAnalysis', () => {
    it('should emit component and template analysis information', () => {
      const context = new IndexingContext<DeclarationNode>();
      const decl = getComponentDeclaration('class C {}', 'C');
      const template = '<div>{{foo}}</div>';
      populateContext(context, decl, 'c-selector', template, getBoundTemplate(template));
      const analysis = generateIndexerAnalysis(context, adapter);

      expect(analysis.size).toBe(1);

      const info = analysis.get(decl);
      expect(info).toEqual({
        name: 'C',
        selector: 'c-selector',
        fileUrl: decl.getSourceFile().fileName,
        template: {
          identifiers: getIndexerTemplateIdentifiers(getBoundTemplate('<div>{{foo}}</div>'))
            .identifiers,
          fileUrl: decl.getSourceFile().fileName,
        },
        errors: [],
      });
    });

    it('should give inline templates the component source file', () => {
      const context = new IndexingContext<DeclarationNode>();
      const decl = getComponentDeclaration('class C {}', 'C');
      const template = '<div>{{foo}}</div>';
      populateContext(
        context,
        decl,
        'c-selector',
        '<div>{{foo}}</div>',
        getBoundTemplate(template),
        /* inline template */ true,
      );
      const analysis = generateIndexerAnalysis(context, adapter);

      expect(analysis.size).toBe(1);

      const info = analysis.get(decl);
      expect(info).toBeDefined();
      expect(info!.template.fileUrl).toEqual(decl.getSourceFile().fileName);
    });

    it('should give external templates their own source file', () => {
      const context = new IndexingContext<DeclarationNode>();
      const decl = getComponentDeclaration('class C {}', 'C');
      const template = '<div>{{foo}}</div>';
      populateContext(context, decl, 'c-selector', template, getBoundTemplate(template));
      const analysis = generateIndexerAnalysis(context, adapter);

      expect(analysis.size).toBe(1);

      const info = analysis.get(decl);
      expect(info).toBeDefined();
      expect(info!.template.fileUrl).toEqual(decl.getSourceFile().fileName);
    });
  });
});
