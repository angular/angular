/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {core} from '@angular/compiler';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  forwardRef,
  Pipe,
  Type,
  ViewEncapsulation,
  ɵɵngDeclareComponent,
} from '../../../src/core';

import {
  AttributeMarker,
  ComponentDef,
  ɵɵInheritDefinitionFeature,
  ɵɵNgOnChangesFeature,
} from '../../../src/render3';

import {functionContaining} from './matcher';

describe('component declaration jit compilation', () => {
  it('should compile a minimal component declaration', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: `<div></div>`,
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      template: functionContaining([/element[^(]*\(0,'div'\)/]),
    });
  });

  it('should compile a selector', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: '<div></div>',
      selector: '[dir], test',
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      selectors: [['', 'dir', ''], ['test']],
    });
  });

  it('should compile inputs and outputs', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: '<div></div>',
      inputs: {
        minifiedProperty: 'property',
        minifiedClassProperty: ['bindingName', 'classProperty'],
      },
      outputs: {
        minifiedEventName: 'eventBindingName',
      },
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      inputs: {
        'property': ['minifiedProperty', core.InputFlags.None, null],
        'bindingName': ['minifiedClassProperty', core.InputFlags.None, null],
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

  it('should compile input with a transform function', () => {
    const transformFn = () => 1;
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: '<div></div>',
      inputs: {
        minifiedClassProperty: ['bindingName', 'classProperty', transformFn],
      },
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      inputs: {
        'bindingName': [
          'minifiedClassProperty',
          core.InputFlags.HasDecoratorInputTransform,
          transformFn,
        ],
      },
      declaredInputs: {
        'bindingName': 'classProperty',
      },
    });
  });

  it('should compile exportAs', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: '<div></div>',
      exportAs: ['a', 'b'],
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      exportAs: ['a', 'b'],
    });
  });

  it('should compile providers', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: '<div></div>',
      providers: [{provide: 'token', useValue: 123}],
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      features: [jasmine.any(Function)],
      providersResolver: jasmine.any(Function),
    });
  });

  it('should compile view providers', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: '<div></div>',
      viewProviders: [{provide: 'token', useValue: 123}],
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      features: [jasmine.any(Function)],
      providersResolver: jasmine.any(Function),
    });
  });

  it('should compile content queries', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
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
        },
      ],
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      contentQueries: functionContaining([
        // "byRef" should use `contentQuery` with `0` (`QueryFlags.none`) for query flag
        // without a read token, and bind to the full query result.
        // "byToken" should use `staticContentQuery` with `3`
        // (`QueryFlags.descendants|QueryFlags.isStatic`) for query flag and `ElementRef` as
        // read token, and bind to the first result in the query result.
        /contentQuery[^(]*\(dirIndex,_c0,4\)[^(]*\(dirIndex,[^,]*String[^,]*,\s*3,[^)]*ElementRef[^)]*\)/,
        '(ctx.byRef = _t)',
        '(ctx.byToken = _t.first)',
      ]),
    });
  });

  it('should compile view queries', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
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
        },
      ],
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      viewQuery: functionContaining([
        // "byRef" should use `viewQuery` with `0` (`QueryFlags.none`) for query flag without a read
        // token, and bind to the full query result.
        // "byToken" should use `viewQuery` with `3`
        // (`QueryFlags.descendants|QueryFlags.isStatic`) for query flag and `ElementRef` as
        // read token, and bind to the first result in the query result.
        /viewQuery[^(]*\(_c0,4\)[^(]*\([^,]*String[^,]*,3,[^)]*ElementRef[^)]*\)/,
        '(ctx.byRef = _t)',
        '(ctx.byToken = _t.first)',
      ]),
    });
  });

  it('should compile host bindings', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
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
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      hostAttrs: [
        'attr',
        'value',
        AttributeMarker.Classes,
        'foo',
        'bar',
        AttributeMarker.Styles,
        'width',
        '100px',
      ],
      hostBindings: functionContaining([
        'return ctx.handleEvent($event)',
        /domProperty[^(]*\('foo',ctx\.foo\.prop\)/,
        /attribute[^(]*\('bar',ctx\.bar\.prop\)/,
      ]),
      hostVars: 2,
    });
  });

  it('should compile components with inheritance', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: '<div></div>',
      usesInheritance: true,
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      features: [ɵɵInheritDefinitionFeature],
    });
  });

  it('should compile components with onChanges lifecycle hook', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: '<div></div>',
      usesOnChanges: true,
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      features: [ɵɵNgOnChangesFeature],
    });
  });

  it('should compile components with OnPush change detection strategy', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
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
      version: '18.0.0',
      type: TestClass,
      template: '<div></div>',
      styles: ['div {}'],
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      styles: ['div[_ngcontent-%COMP%] {}'],
      encapsulation: ViewEncapsulation.Emulated,
    });
  });

  it('should compile components with view encapsulation', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: '<div></div>',
      styles: ['div {}'],
      encapsulation: ViewEncapsulation.ShadowDom,
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      styles: ['div {}'],
      encapsulation: ViewEncapsulation.ShadowDom,
    });
  });

  it('should compile components with animations', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: '<div></div>',
      animations: [{type: 'trigger'}],
      changeDetection: ChangeDetectionStrategy.Eager,
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
      version: '18.0.0',
      type: TestClass,
      template,
      preserveWhitespaces: true,
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;
    const whenOmitted = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template,
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(whenTrue, {
      template: functionContaining([
        /elementStart[^(]*\(0,'div'\)/,
        /text[^(]*\(1,'    Foo    '\)/,
      ]),
    });
    expectComponentDef(whenOmitted, {
      template: functionContaining([/elementStart[^(]*\(0,'div'\)/, /text[^(]*\(1,' Foo '\)/]),
    });
  });

  it('should bind directive inputs as regular property (not DOM property) in the presence of pipes', () => {
    // https://github.com/angular/angular/issues/62573
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      isStandalone: true,
      dependencies: [
        {
          kind: 'directive',
          type: TestDir,
          selector: '[dir]',
          inputs: ['dir'],
        },
        {
          kind: 'pipe',
          type: TestPipe,
          name: 'test',
        },
      ],
      template: `<div [dir]="'test' | test"></div>`,
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      template: functionContaining([/property[^(]*\('dir',/]),
      directives: [TestDir],
      pipes: [TestPipe],
    });
  });

  it('should compile used components', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: '<cmp></cmp>',
      components: [
        {
          type: TestCmp,
          selector: 'cmp',
        },
      ],
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      directives: [TestCmp],
    });
  });

  it('should compile used directives', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: '<div dir></div>',
      directives: [
        {
          type: TestDir,
          selector: '[dir]',
        },
      ],
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      directives: [TestDir],
    });
  });

  it('should compile used directives together with used components', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: '<cmp dir></cmp>',
      components: [
        {
          type: TestCmp,
          selector: 'cmp',
        },
      ],
      directives: [
        {
          type: TestDir,
          selector: '[dir]',
        },
      ],
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      directives: [TestCmp, TestDir],
    });
  });

  it('should compile forward declared directives', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: '<div forward></div>',
      directives: [
        {
          type: forwardRef(function () {
            return ForwardDir;
          }),
          selector: '[forward]',
        },
      ],
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    @Directive({
      selector: '[forward]',
      standalone: false,
    })
    class ForwardDir {}

    expectComponentDef(def, {
      directives: [ForwardDir],
    });
  });

  it('should compile mixed forward and direct declared directives', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: '<div dir forward></div>',
      directives: [
        {
          type: TestDir,
          selector: '[dir]',
        },
        {
          type: forwardRef(function () {
            return ForwardDir;
          }),
          selector: '[forward]',
        },
      ],
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    @Directive({
      selector: '[forward]',
      standalone: false,
    })
    class ForwardDir {}

    expectComponentDef(def, {
      directives: [TestDir, ForwardDir],
    });
  });

  it('should compile used pipes', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: '{{ expr | test }}',
      pipes: {
        'test': TestPipe,
      },
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    expectComponentDef(def, {
      pipes: [TestPipe],
    });
  });

  it('should compile forward declared pipes', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: '{{ expr | forward }}',
      pipes: {
        'forward': forwardRef(function () {
          return ForwardPipe;
        }),
      },
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    @Pipe({
      name: 'forward',
      standalone: false,
    })
    class ForwardPipe {}

    expectComponentDef(def, {
      pipes: [ForwardPipe],
    });
  });

  it('should compile mixed forward and direct declared pipes', () => {
    const def = ɵɵngDeclareComponent({
      version: '18.0.0',
      type: TestClass,
      template: '{{ expr | forward | test }}',
      pipes: {
        'test': TestPipe,
        'forward': forwardRef(function () {
          return ForwardPipe;
        }),
      },
      changeDetection: ChangeDetectionStrategy.Eager,
    }) as ComponentDef<TestClass>;

    @Pipe({
      name: 'forward',
      standalone: false,
    })
    class ForwardPipe {}

    expectComponentDef(def, {
      pipes: [TestPipe, ForwardPipe],
    });
  });
});

type ComponentDefExpectations = jasmine.Expected<
  Pick<
    ComponentDef<unknown>,
    | 'selectors'
    | 'template'
    | 'inputs'
    | 'declaredInputs'
    | 'outputs'
    | 'features'
    | 'hostAttrs'
    | 'hostBindings'
    | 'hostVars'
    | 'contentQueries'
    | 'viewQuery'
    | 'exportAs'
    | 'providersResolver'
    | 'encapsulation'
    | 'onPush'
    | 'styles'
    | 'data'
  >
> & {
  directives: Type<unknown>[] | null;
  pipes: Type<unknown>[] | null;
};

/**
 * Asserts that the provided component definition is according to the provided expectation.
 * Definition fields for which no expectation is present are verified to be initialized to their
 * default value.
 */
function expectComponentDef(
  actual: ComponentDef<unknown>,
  expected: Partial<ComponentDefExpectations>,
): void {
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
    directives: [],
    pipes: [],
    data: {},
    ...expected,
  };

  expect(actual.type).toBe(TestClass);
  expect(actual.selectors).withContext('selectors').toEqual(expectation.selectors);
  expect(actual.template).withContext('template').toEqual(expectation.template);
  expect(actual.inputs).withContext('inputs').toEqual(expectation.inputs);
  expect(actual.declaredInputs).withContext('declaredInputs').toEqual(expectation.declaredInputs);
  expect(actual.outputs).withContext('outputs').toEqual(expectation.outputs);
  expect(actual.features).withContext('features').toEqual(expectation.features);
  expect(actual.hostAttrs).withContext('hostAttrs').toEqual(expectation.hostAttrs);
  expect(actual.hostBindings).withContext('hostBindings').toEqual(expectation.hostBindings);
  expect(actual.hostVars).withContext('hostVars').toEqual(expectation.hostVars);
  expect(actual.contentQueries).withContext('contentQueries').toEqual(expectation.contentQueries);
  expect(actual.viewQuery).withContext('viewQuery').toEqual(expectation.viewQuery);
  expect(actual.exportAs).withContext('exportAs').toEqual(expectation.exportAs);
  expect(actual.providersResolver)
    .withContext('providersResolver')
    .toEqual(expectation.providersResolver);
  expect(actual.encapsulation).withContext('encapsulation').toEqual(expectation.encapsulation);
  expect(actual.onPush).withContext('onPush').toEqual(expectation.onPush);
  expect(actual.styles).withContext('styles').toEqual(expectation.styles);
  expect(actual.data).withContext('data').toEqual(expectation.data);

  const convertNullToEmptyArray = <T extends Type<any>[] | null>(arr: T): T =>
    arr ?? ([] as unknown as T);

  const directiveDefs =
    typeof actual.directiveDefs === 'function' ? actual.directiveDefs() : actual.directiveDefs;
  const directiveTypes = directiveDefs !== null ? directiveDefs.map((def) => def.type) : null;
  expect(convertNullToEmptyArray(directiveTypes)).toEqual(expectation.directives);

  const pipeDefs = typeof actual.pipeDefs === 'function' ? actual.pipeDefs() : actual.pipeDefs;
  const pipeTypes = pipeDefs !== null ? pipeDefs.map((def) => def.type) : null;
  expect(convertNullToEmptyArray(pipeTypes)).toEqual(expectation.pipes);
}

class TestClass {}

@Directive({
  selector: '[dir]',
  standalone: false,
})
class TestDir {}

@Component({
  selector: 'cmp',
  template: '',
  standalone: false,
})
class TestCmp {}

@Pipe({
  name: 'test',
  standalone: false,
})
class TestPipe {}
