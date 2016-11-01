/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileIdentifierMetadata} from '../../src/compile_metadata';
import * as o from '../../src/output/output_ast';
import {CompileView} from '../../src/view_compiler/compile_view';
import {getPropertyInView} from '../../src/view_compiler/util';

export function main() {
  describe('getPropertyInView', () => {
    it('should return the expression if it is the same view', () => {
      const expr = o.THIS_EXPR.prop('someProp');
      const callingView = createCompileView({className: 'view'});
      expect(getPropertyInView(expr, callingView, callingView)).toBe(expr);
    });

    it('should access an unknown property in a parent view', () => {
      const expr = o.THIS_EXPR.prop('someProp');
      const definedView = createCompileView({className: 'parentView'});
      const callingView = createCompileView({className: 'childView', parent: definedView});
      expect(getPropertyInView(expr, callingView, definedView))
          .toEqual(o.THIS_EXPR.prop('parentView').prop('someProp'));
    });

    it('should access a known property in a parent view with cast', () => {
      const expr = o.THIS_EXPR.prop('someProp');
      const definedView = createCompileView({className: 'parentView', fields: ['someProp']});
      const callingView = createCompileView({className: 'childView', parent: definedView});
      expect(getPropertyInView(expr, callingView, definedView))
          .toEqual(o.THIS_EXPR.prop('parentView').cast(definedView.classType).prop('someProp'));
    });

    it('should access a known property in a parent view with cast also for property chain expressions',
       () => {
         const expr = o.THIS_EXPR.prop('someProp').prop('context');
         const definedView = createCompileView({className: 'parentView', fields: ['someProp']});
         const callingView = createCompileView({className: 'childView', parent: definedView});
         expect(getPropertyInView(expr, callingView, definedView))
             .toEqual(o.THIS_EXPR.prop('parentView')
                          .cast(definedView.classType)
                          .prop('someProp')
                          .prop('context'));
       });
  });
}

function createCompileView(config: {className: string, parent?: CompileView, fields?: string[]}):
    CompileView {
  const declarationElement: any = config.parent ? {view: config.parent} : {view: null};
  const fields: o.ClassField[] = [];
  if (config.fields) {
    config.fields.forEach((fieldName) => { fields.push(new o.ClassField(fieldName)); });
  }
  return <any>{
    classType: o.importType(new CompileIdentifierMetadata({name: config.className})),
    fields: fields,
    getters: [],
    declarationElement: declarationElement
  };
}
