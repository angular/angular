/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, Component, Directive, ElementRef, forwardRef, Pipe, Type, ViewEncapsulation, ɵɵngDeclareComponent} from '@angular/core';
import {AttributeMarker, ComponentDef} from '../../../src/render3';
import {functionContaining} from './matcher';

describe('component declaration jit compilation', () => {
  it('should compile a minimal component declaration', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: `<div></div>`,
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      template: functionContaining([
        // NOTE: the `anonymous` match is to support IE11, as functions don't have a name there.
        /(?:element|anonymous)[^(]*\(0,'div'\)/,
      ]),
    });
  });

  it('should compile a selector', () => {
    const def =
        ɵɵngDeclareComponent({type: TestClass, template: '<div></div>', selector: '[dir], test'}) as
        ComponentDef<TestClass>;

    expectComponentDef(def, {
      selectors: [['', 'dir', ''], ['test']],
    });
  });

  it('should compile inputs and outputs', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '<div></div>',
                  inputs: {
                    minifiedProperty: 'property',
                    minifiedClassProperty: ['bindingName', 'classProperty'],
                  },
                  outputs: {
                    minifiedEventName: 'eventBindingName',
                  },
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
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
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '<div></div>',
                  exportAs: ['a', 'b'],
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      exportAs: ['a', 'b'],
    });
  });

  it('should compile providers', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '<div></div>',
                  providers: [
                    {provide: 'token', useValue: 123},
                  ],
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      features: [jasmine.any(Function)],
      providersResolver: jasmine.any(Function),
    });
  });

  it('should compile view providers', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '<div></div>',
                  viewProviders: [
                    {provide: 'token', useValue: 123},
                  ],
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      features: [jasmine.any(Function)],
      providersResolver: jasmine.any(Function),
    });
  });

  it('should compile content queries', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '<div></div>',
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
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      contentQueries: functionContaining([
        // "byRef" should use `contentQuery` with `0` (`QueryFlags.none`) for query flag
        // without a read token, and bind to the full query result.
        // NOTE: the `anonymous` match is to support IE11, as functions don't have a name there.
        /(?:contentQuery|anonymous)[^(]*\(dirIndex,_c0,4\)/,
        '(ctx.byRef = _t)',

        // "byToken" should use `staticContentQuery` with `3`
        // (`QueryFlags.descendants|QueryFlags.isStatic`) for query flag and `ElementRef` as
        // read token, and bind to the first result in the query result.
        // NOTE: the `anonymous` match is to support IE11, as functions don't have a name there.
        /(?:contentQuery|anonymous)[^(]*\(dirIndex,[^,]*String[^,]*,3,[^)]*ElementRef[^)]*\)/,
        '(ctx.byToken = _t.first)',
      ]),
    });
  });

  it('should compile view queries', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '<div></div>',
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
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      viewQuery: functionContaining([
        // "byRef" should use `viewQuery` with `0` (`QueryFlags.none`) for query flag without a read
        // token, and bind to the full query result. NOTE: the `anonymous` match is to support IE11,
        // as functions don't have a name there.
        /(?:viewQuery|anonymous)[^(]*\(_c0,4\)/,
        '(ctx.byRef = _t)',

        // "byToken" should use `viewQuery` with `3`
        // (`QueryFlags.descendants|QueryFlags.isStatic`) for query flag and `ElementRef` as
        // read token, and bind to the first result in the query result.
        // NOTE: the `anonymous` match is to support IE11, as functions don't have a name there.
        /(?:viewQuery|anonymous)[^(]*\([^,]*String[^,]*,3,[^)]*ElementRef[^)]*\)/,
        '(ctx.byToken = _t.first)',
      ]),
    });
  });

  it('should compile host bindings', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '<div></div>',
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
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
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

  it('should compile components with inheritance', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '<div></div>',
                  usesInheritance: true,
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      features: [functionContaining(['ɵɵInheritDefinitionFeature'])],
    });
  });

  it('should compile components with onChanges lifecycle hook', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '<div></div>',
                  usesOnChanges: true,
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      features: [functionContaining(['ɵɵNgOnChangesFeature'])],
    });
  });

  it('should compile components with OnPush change detection strategy', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '<div></div>',
                  changeDetection: ChangeDetectionStrategy.OnPush,
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      onPush: true,
    });
  });

  it('should compile components with styles', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '<div></div>',
                  styles: ['div {}'],
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      styles: ['div[_ngcontent-%COMP%] {}'],
      encapsulation: ViewEncapsulation.Emulated,
    });
  });

  it('should compile components with view encapsulation', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '<div></div>',
                  styles: ['div {}'],
                  encapsulation: ViewEncapsulation.ShadowDom,
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      styles: ['div {}'],
      encapsulation: ViewEncapsulation.ShadowDom,
    });
  });

  it('should compile components with animations', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '<div></div>',
                  animations: [{type: 'trigger'}],
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      data: {
        animation: [{type: 'trigger'}],
      },
    });
  });

  it('should honor preserveWhitespaces', () => {
    const template = '<div>    Foo    </div>';
    const whenTrue = ɵɵngDeclareComponent({
                       type: TestClass,
                       template,
                       preserveWhitespaces: true,
                     }) as ComponentDef<TestClass>;
    const whenOmitted = ɵɵngDeclareComponent({
                          type: TestClass,
                          template,
                        }) as ComponentDef<TestClass>;

    expectComponentDef(whenTrue, {
      template: functionContaining([
        // NOTE: the `anonymous` match is to support IE11, as functions don't have a name there.
        /(?:elementStart|anonymous)[^(]*\(0,'div'\)/,
        /(?:text|anonymous)[^(]*\(1,'    Foo    '\)/,
      ]),
    });
    expectComponentDef(whenOmitted, {
      template: functionContaining([
        // NOTE: the `anonymous` match is to support IE11, as functions don't have a name there.
        /(?:elementStart|anonymous)[^(]*\(0,'div'\)/,
        /(?:text|anonymous)[^(]*\(1,' Foo '\)/,
      ]),
    });
  });

  it('should honor custom interpolation config', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '{% foo %}',
                  interpolation: ['{%', '%}'],
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      template: functionContaining([
        // NOTE: the `anonymous` match is to support IE11, as functions don't have a name there.
        /(?:textInterpolate|anonymous)[^(]*\(ctx.foo\)/,
      ]),
    });
  });

  it('should compile used components', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '<cmp></cmp>',
                  components: [{
                    type: TestCmp,
                    selector: 'cmp',
                  }],
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      directives: [TestCmp],
    });
  });

  it('should compile used directives', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '<div dir></div>',
                  directives: [{
                    type: TestDir,
                    selector: '[dir]',
                  }],
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      directives: [TestDir],
    });
  });

  it('should compile used directives together with used components', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '<cmp dir></cmp>',
                  components: [{
                    type: TestCmp,
                    selector: 'cmp',
                  }],
                  directives: [{
                    type: TestDir,
                    selector: '[dir]',
                  }],
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      directives: [TestCmp, TestDir],
    });
  });

  it('should compile forward declared directives', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '<div forward></div>',
                  directives: [{
                    type: forwardRef(function() {
                      return ForwardDir;
                    }),
                    selector: '[forward]',
                  }],
                }) as ComponentDef<TestClass>;

    @Directive({selector: '[forward]'})
    class ForwardDir {
    }

    expectComponentDef(def, {
      directives: [ForwardDir],
    });
  });

  it('should compile mixed forward and direct declared directives', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '<div dir forward></div>',
                  directives: [
                    {
                      type: TestDir,
                      selector: '[dir]',
                    },
                    {
                      type: forwardRef(function() {
                        return ForwardDir;
                      }),
                      selector: '[forward]',
                    }
                  ],
                }) as ComponentDef<TestClass>;

    @Directive({selector: '[forward]'})
    class ForwardDir {
    }

    expectComponentDef(def, {
      directives: [TestDir, ForwardDir],
    });
  });

  it('should compile used pipes', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '{{ expr | test }}',
                  pipes: {
                    'test': TestPipe,
                  },
                }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      pipes: [TestPipe],
    });
  });

  it('should compile forward declared pipes', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '{{ expr | forward }}',
                  pipes: {
                    'forward': forwardRef(function() {
                      return ForwardPipe;
                    }),
                  },
                }) as ComponentDef<TestClass>;

    @Pipe({name: 'forward'})
    class ForwardPipe {
    }

    expectComponentDef(def, {
      pipes: [ForwardPipe],
    });
  });

  it('should compile mixed forward and direct declared pipes', () => {
    const def = ɵɵngDeclareComponent({
                  type: TestClass,
                  template: '{{ expr | forward | test }}',
                  pipes: {
                    'test': TestPipe,
                    'forward': forwardRef(function() {
                      return ForwardPipe;
                    }),
                  },
                }) as ComponentDef<TestClass>;

    @Pipe({name: 'forward'})
    class ForwardPipe {
    }

    expectComponentDef(def, {
      pipes: [TestPipe, ForwardPipe],
    });
  });
});

type ComponentDefExpectations = jasmine.Expected<Pick<
    ComponentDef<unknown>,
    'selectors'|'template'|'inputs'|'declaredInputs'|'outputs'|'features'|'hostAttrs'|
    'hostBindings'|'hostVars'|'contentQueries'|'viewQuery'|'exportAs'|'providersResolver'|
    'encapsulation'|'onPush'|'styles'|'data'>>&{
  directives: Type<unknown>[]|null;
  pipes: Type<unknown>[]|null;
};


/**
 * Asserts that the provided component definition is according to the provided expectation.
 * Definition fields for which no expectation is present are verified to be initialized to their
 * default value.
 */
function expectComponentDef(
    actual: ComponentDef<unknown>, expected: Partial<ComponentDefExpectations>): void {
  const expectation: ComponentDefExpectations = {
    selectors: [],
    template: jasmine.any(Function),
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
    // Although the default view encapsulation is `Emulated`, the default expected view
    // encapsulation is `None` as this is chosen when no styles are present.
    encapsulation: ViewEncapsulation.None,
    onPush: false,
    styles: [],
    directives: null,
    pipes: null,
    data: {},
    ...expected,
  };

  expect(actual.type).toBe(TestClass);
  expect(actual.selectors).toEqual(expectation.selectors);
  expect(actual.template).toEqual(expectation.template);
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
  expect(actual.encapsulation).toEqual(expectation.encapsulation);
  expect(actual.onPush).toEqual(expectation.onPush);
  expect(actual.styles).toEqual(expectation.styles);
  expect(actual.data).toEqual(expectation.data);

  const directiveDefs =
      typeof actual.directiveDefs === 'function' ? actual.directiveDefs() : actual.directiveDefs;
  const directiveTypes = directiveDefs !== null ? directiveDefs.map(def => def.type) : null;
  expect(directiveTypes).toEqual(expectation.directives);

  const pipeDefs = typeof actual.pipeDefs === 'function' ? actual.pipeDefs() : actual.pipeDefs;
  const pipeTypes = pipeDefs !== null ? pipeDefs.map(def => def.type) : null;
  expect(pipeTypes).toEqual(expectation.pipes);
}

class TestClass {}

@Directive({selector: '[dir]'})
class TestDir {
}

@Component({selector: 'cmp', template: ''})
class TestCmp {
}

@Pipe({name: 'test'})
class TestPipe {
}
