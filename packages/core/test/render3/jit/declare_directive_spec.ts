/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, ɵɵngDeclareDirective} from '@angular/core';
import {AttributeMarker, DirectiveDef} from '../../../src/render3';
import {functionContaining} from './matcher';

describe('directive declaration jit compilation', () => {
  it('should compile a minimal directive declaration', () => {
    const def = ɵɵngDeclareDirective({
                  type: TestClass,
                }) as DirectiveDef<TestClass>;

    expectDirectiveDef(def, {});
  });

  it('should compile a selector', () => {
    const def =
        ɵɵngDeclareDirective({type: TestClass, selector: '[dir], test'}) as DirectiveDef<TestClass>;

    expectDirectiveDef(def, {
      selectors: [['', 'dir', ''], ['test']],
    });
  });

  it('should compile inputs and outputs', () => {
    const def = ɵɵngDeclareDirective({
                  type: TestClass,
                  inputs: {
                    minifiedProperty: 'property',
                    minifiedClassProperty: ['bindingName', 'classProperty'],
                  },
                  outputs: {
                    minifiedEventName: 'eventBindingName',
                  },
                }) as DirectiveDef<TestClass>;

    expectDirectiveDef(def, {
      inputs: {
        'property': 'minifiedProperty',
        'bindingName': 'minifiedClassProperty',
      },
      declaredInputs: {
        'property': 'property',
        'bindingName': 'classProperty',
      },
      outputs: {
        'eventBindingName': 'minifiedEventName',
      },
    });
  });

  it('should compile exportAs', () => {
    const def = ɵɵngDeclareDirective({
                  type: TestClass,
                  exportAs: ['a', 'b'],
                }) as DirectiveDef<TestClass>;

    expectDirectiveDef(def, {
      exportAs: ['a', 'b'],
    });
  });

  it('should compile providers', () => {
    const def = ɵɵngDeclareDirective({
                  type: TestClass,
                  providers: [
                    {provide: 'token', useValue: 123},
                  ],
                }) as DirectiveDef<TestClass>;

    expectDirectiveDef(def, {
      features: [jasmine.any(Function)],
      providersResolver: jasmine.any(Function),
    });
  });

  it('should compile content queries', () => {
    const def = ɵɵngDeclareDirective({
                  type: TestClass,
                  queries: [
                    {
                      propertyName: 'byRef',
                      predicate: ['ref'],
                    },
                    {
                      propertyName: 'byToken',
                      predicate: String,
                      descendants: true,
                      static: true,
                      first: true,
                      read: ElementRef,
                      emitDistinctChangesOnly: false,
                    }
                  ],
                }) as DirectiveDef<TestClass>;

    expectDirectiveDef(def, {
      contentQueries: functionContaining([
        // "byRef" should use `contentQuery` with `0` (`QueryFlags.descendants|QueryFlags.isStatic`)
        // for query flag without a read token, and bind to the full query result.
        // NOTE: the `anonymous` match is to support IE11, as functions don't have a name there.
        /(?:contentQuery|anonymous)[^(]*\(dirIndex,_c0,4\)/,
        '(ctx.byRef = _t)',

        // "byToken" should use `viewQuery` with `3` (`QueryFlags.static|QueryFlags.descendants`)
        // for query flag and `ElementRef` as read token, and bind to the first result in the
        // query result.
        // NOTE: the `anonymous` match is to support IE11, as functions don't have a name there.
        /(?:contentQuery|anonymous)[^(]*\([^,]*dirIndex,[^,]*String[^,]*,3,[^)]*ElementRef[^)]*\)/,
        '(ctx.byToken = _t.first)',
      ]),
    });
  });

  it('should compile view queries', () => {
    const def = ɵɵngDeclareDirective({
                  type: TestClass,
                  viewQueries: [
                    {
                      propertyName: 'byRef',
                      predicate: ['ref'],
                    },
                    {
                      propertyName: 'byToken',
                      predicate: String,
                      descendants: true,
                      static: true,
                      first: true,
                      read: ElementRef,
                      emitDistinctChangesOnly: false,
                    }
                  ],
                }) as DirectiveDef<TestClass>;

    expectDirectiveDef(def, {
      viewQuery: functionContaining([
        // "byRef" should use `viewQuery` with`0` (`QueryFlags.none`) for query flag without a read
        // token, and bind to the full query result.
        // NOTE: the `anonymous` match is to support IE11, as functions don't have a name there.
        /(?:viewQuery|anonymous)[^(]*\(_c0,4\)/,
        '(ctx.byRef = _t)',

        // "byToken" should use `viewQuery` with `3` (`QueryFlags.static|QueryFlags.descendants`)
        // for query flag and `ElementRef` as read token, and bind to the first result in the
        // query result.
        // NOTE: the `anonymous` match is to support IE11, as functions don't have a name there.
        /(?:viewQuery|anonymous)[^(]*\([^,]*String[^,]*,3,[^)]*ElementRef[^)]*\)/,
        '(ctx.byToken = _t.first)',
      ]),
    });
  });

  it('should compile host bindings', () => {
    const def = ɵɵngDeclareDirective({
                  type: TestClass,
                  host: {
                    attributes: {
                      'attr': 'value',
                    },
                    listeners: {
                      'event': 'handleEvent($event)',
                    },
                    properties: {
                      'foo': 'foo.prop',
                      'attr.bar': 'bar.prop',
                    },
                    classAttribute: 'foo bar',
                    styleAttribute: 'width: 100px;',
                  },
                }) as DirectiveDef<TestClass>;

    expectDirectiveDef(def, {
      hostAttrs: [
        'attr', 'value', AttributeMarker.Classes, 'foo', 'bar', AttributeMarker.Styles, 'width',
        '100px'
      ],
      hostBindings: functionContaining([
        'return ctx.handleEvent($event)',
        // NOTE: the `anonymous` match is to support IE11, as functions don't have a name there.
        /(?:hostProperty|anonymous)[^(]*\('foo',ctx\.foo\.prop\)/,
        /(?:attribute|anonymous)[^(]*\('bar',ctx\.bar\.prop\)/,
      ]),
      hostVars: 2,
    });
  });

  it('should compile directives with inheritance', () => {
    const def = ɵɵngDeclareDirective({
                  type: TestClass,
                  usesInheritance: true,
                }) as DirectiveDef<TestClass>;

    expectDirectiveDef(def, {
      features: [functionContaining(['ɵɵInheritDefinitionFeature'])],
    });
  });

  it('should compile directives with onChanges lifecycle hook', () => {
    const def = ɵɵngDeclareDirective({
                  type: TestClass,
                  usesOnChanges: true,
                }) as DirectiveDef<TestClass>;

    expectDirectiveDef(def, {
      features: [functionContaining(['ɵɵNgOnChangesFeature'])],
    });
  });
});

type DirectiveDefExpectations = jasmine.Expected<Pick<
    DirectiveDef<unknown>,
    'selectors'|'inputs'|'declaredInputs'|'outputs'|'features'|'hostAttrs'|'hostBindings'|
    'hostVars'|'contentQueries'|'viewQuery'|'exportAs'|'providersResolver'>>;

/**
 * Asserts that the provided directive definition is according to the provided expectation.
 * Definition fields for which no expectation is present are verified to be initialized to their
 * default value.
 */
function expectDirectiveDef(
    actual: DirectiveDef<unknown>, expected: Partial<DirectiveDefExpectations>): void {
  const expectation: DirectiveDefExpectations = {
    selectors: [],
    inputs: {},
    declaredInputs: {},
    outputs: {},
    features: null,
    hostAttrs: null,
    hostBindings: null,
    hostVars: 0,
    contentQueries: null,
    viewQuery: null,
    exportAs: null,
    providersResolver: null,
    ...expected,
  };

  expect(actual.type).toBe(TestClass);
  expect(actual.selectors).toEqual(expectation.selectors);
  expect(actual.inputs).toEqual(expectation.inputs);
  expect(actual.declaredInputs).toEqual(expectation.declaredInputs);
  expect(actual.outputs).toEqual(expectation.outputs);
  expect(actual.features).toEqual(expectation.features);
  expect(actual.hostAttrs).toEqual(expectation.hostAttrs);
  expect(actual.hostBindings).toEqual(expectation.hostBindings);
  expect(actual.hostVars).toEqual(expectation.hostVars);
  expect(actual.contentQueries).toEqual(expectation.contentQueries);
  expect(actual.viewQuery).toEqual(expectation.viewQuery);
  expect(actual.exportAs).toEqual(expectation.exportAs);
  expect(actual.providersResolver).toEqual(expectation.providersResolver);
}

class TestClass {}
