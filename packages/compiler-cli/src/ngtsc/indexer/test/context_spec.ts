/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ParseSourceFile} from '@angular/compiler';
import {runInEachFileSystem} from '../../file_system/testing';
import {IndexingContext} from '../src/context';
import * as util from './util';

runInEachFileSystem(() => {
  describe('ComponentAnalysisContext', () => {
    it('should store and return information about components', () => {
      const context = new IndexingContext();
      const declaration = util.getComponentDeclaration('class C {};', 'C');
      const boundTemplate = util.getBoundTemplate('<div></div>');

      context.addComponent({
        declaration,
        selector: 'c-selector',
        boundTemplate,
        templateMeta: {
          isInline: false,
          file: new ParseSourceFile('<div></div>', declaration.getSourceFile().fileName),
        },
      });

      expect(context.components).toEqual(new Set([
        {
          declaration,
          selector: 'c-selector',
          boundTemplate,
          templateMeta: {
            isInline: false,
            file: new ParseSourceFile('<div></div>', declaration.getSourceFile().fileName),
          },
        },
      ]));
    });
  });
});
