/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {BoundTarget, ParseSourceFile} from '@angular/compiler';

import {runInEachFileSystem} from '../../file_system/testing';
import {ClassDeclaration} from '../../reflection';
import {ComponentMeta, IndexingContext} from '../src/context';
import {getTemplateIdentifiers} from '../src/template';
import {generateAnalysis} from '../src/transform';

import * as util from './util';

/**
 * Adds information about a component to a context.
 */
function populateContext(
    context: IndexingContext, component: ClassDeclaration, selector: string, template: string,
    boundTemplate: BoundTarget<ComponentMeta>, isInline: boolean = false) {
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

runInEachFileSystem(() => {
  describe('generateAnalysis', () => {
    it('should emit component and template analysis information', () => {
      const context = new IndexingContext();
      const decl = util.getComponentDeclaration('class C {}', 'C');
      const template = '<div>{{foo}}</div>';
      populateContext(context, decl, 'c-selector', template, util.getBoundTemplate(template));
      const analysis = generateAnalysis(context);

      expect(analysis.size).toBe(1);

      const info = analysis.get(decl);
      expect(info).toEqual({
        name: 'C',
        selector: 'c-selector',
        file: new ParseSourceFile('class C {}', decl.getSourceFile().fileName),
        template: {
          identifiers:
              getTemplateIdentifiers(util.getBoundTemplate('<div>{{foo}}</div>')).identifiers,
          usedComponents: new Set(),
          isInline: false,
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
          context, decl, 'c-selector', '<div>{{foo}}</div>', util.getBoundTemplate(template),
          /* inline template */ true);
      const analysis = generateAnalysis(context);

      expect(analysis.size).toBe(1);

      const info = analysis.get(decl);
      expect(info).toBeDefined();
      expect(info!.template.file)
          .toEqual(new ParseSourceFile('class C {}', decl.getSourceFile().fileName));
    });

    it('should give external templates their own source file', () => {
      const context = new IndexingContext();
      const decl = util.getComponentDeclaration('class C {}', 'C');
      const template = '<div>{{foo}}</div>';
      populateContext(context, decl, 'c-selector', template, util.getBoundTemplate(template));
      const analysis = generateAnalysis(context);

      expect(analysis.size).toBe(1);

      const info = analysis.get(decl);
      expect(info).toBeDefined();
      expect(info!.template.file)
          .toEqual(new ParseSourceFile('<div>{{foo}}</div>', decl.getSourceFile().fileName));
    });

    it('should emit used components', () => {
      const context = new IndexingContext();

      const templateA = '<b-selector></b-selector>';
      const declA = util.getComponentDeclaration('class A {}', 'A');

      const templateB = '<a-selector></a-selector>';
      const declB = util.getComponentDeclaration('class B {}', 'B');

      const boundA =
          util.getBoundTemplate(templateA, {}, [{selector: 'b-selector', declaration: declB}]);
      const boundB =
          util.getBoundTemplate(templateB, {}, [{selector: 'a-selector', declaration: declA}]);

      populateContext(context, declA, 'a-selector', templateA, boundA);
      populateContext(context, declB, 'b-selector', templateB, boundB);

      const analysis = generateAnalysis(context);

      expect(analysis.size).toBe(2);

      const infoA = analysis.get(declA);
      expect(infoA).toBeDefined();
      expect(infoA!.template.usedComponents).toEqual(new Set([declB]));

      const infoB = analysis.get(declB);
      expect(infoB).toBeDefined();
      expect(infoB!.template.usedComponents).toEqual(new Set([declA]));
    });
  });
});
