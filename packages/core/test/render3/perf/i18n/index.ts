/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵɵadvance, ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵi18n, ɵɵi18nApply, ɵɵi18nAttributes, ɵɵi18nExp, ɵɵpropertyInterpolate1, ɵɵtext, ɵɵtextInterpolate1} from '../../../../src/render3/instructions/all';
import {ComponentTemplate, RenderFlags} from '../../../../src/render3/interfaces/definition';
import {AttributeMarker, TAttributes} from '../../../../src/render3/interfaces/node';
import {Benchmark, createBenchmark} from '../micro_bench';
import {MicroBenchmarkRenderNode} from '../noop_renderer';
import {setupTestHarness} from '../setup';

type ComponentDef = {
  consts: (string|TAttributes)[],
  vars: number,
  decls: number,
  template: ComponentTemplate<any>,
  beforeCD?: Function,
  DOMParserMockFn?: Function,
};

const enum NodeTypes {
  ELEMENT_NODE = 1,
  TEXT_NODE = 2,
  COMMENT_NODE = 8
}

function createElement(nodeType: number, tagName?: string): any {
  const element = new MicroBenchmarkRenderNode();
  element.nodeType = nodeType;
  element.tagName = tagName;
  return element;
}

// Mock function that is invoked when the string should be parsed.
function defaultDOMParserMockFn(content: string) {
  const element = createElement(NodeTypes.TEXT_NODE);
  element.textContent = content;
  return element;
}

function createDOMParserMock(mockFn: Function) {
  return {
    parseFromString: (content: string) => {
      const body = createElement(NodeTypes.ELEMENT_NODE, 'body');
      content = content.replace(/<body><remove><\/remove>/, '');
      body.firstChild = mockFn(content);
      return {body};
    },
  };
}

function setupDOMParserMock(mockFn?: Function): Function {
  const glob = global as any;
  if (!glob.window) {
    glob.window = {};
  }
  const origDOMParser = glob.window.DOMParser;
  glob.window.DOMParser = function() {
    return createDOMParserMock(mockFn || defaultDOMParserMockFn);
  };

  // Return a function that would restore DOMParser to its original state.
  return () => glob.window.DOMParser = origDOMParser;
}


const PROFILE_CREATE = true;
const PROFILE_UPDATE = true;
const NUM_OF_VIEWS_PER_RUN = 1000;
const DEFAULT_CONTEXT: any = {
  title: 'Test title',
  interpolation: 'Test interpolation',
  count: 0
};

let context = DEFAULT_CONTEXT;
const benchmarks: Benchmark[] = [];

function benchmark(name: string, def: ComponentDef, baselineDef?: ComponentDef) {
  // Reset context in case it was changed in `beforeCD` function during the previous benchmark.
  context = DEFAULT_CONTEXT;

  const teardownDOMParserMock = setupDOMParserMock(def.DOMParserMockFn);

  const ivyHarness = setupTestHarness(
      def.template, def.decls, def.vars, NUM_OF_VIEWS_PER_RUN, context,
      def.consts as TAttributes[]);

  let baseHarness;
  if (baselineDef) {
    baseHarness = setupTestHarness(
        baselineDef.template, baselineDef.decls, baselineDef.vars, NUM_OF_VIEWS_PER_RUN, context,
        baselineDef.consts as TAttributes[]);
  }

  if (PROFILE_CREATE) {
    const benchmark = createBenchmark('i18n [create]: ' + name);
    benchmarks.push(benchmark);
    const ivyProfile = benchmark('(i18n)');
    console.profile(benchmark.name + ':' + ivyProfile.name);
    while (ivyProfile()) {
      ivyHarness.createEmbeddedLView();
    }
    console.profileEnd();

    if (baseHarness) {
      const baseProfile = benchmark('(baseline)');
      console.profile(benchmark.name + ':' + baseProfile.name);
      while (baseProfile()) {
        baseHarness.createEmbeddedLView();
      }
      console.profileEnd();
    }
  }

  if (PROFILE_UPDATE) {
    const benchmark = createBenchmark('i18n [update]: : ' + name);
    benchmarks.push(benchmark);
    const ivyProfile = benchmark('(i18n)');
    console.profile(benchmark.name + ':' + ivyProfile.name);
    while (ivyProfile()) {
      if (def.beforeCD) {
        def.beforeCD(context);
      }
      ivyHarness.detectChanges();
    }
    console.profileEnd();

    if (baseHarness) {
      const baseProfile = benchmark('(baseline)');
      console.profile(benchmark.name + ':' + baseProfile.name);
      while (baseProfile()) {
        if (baselineDef && baselineDef.beforeCD) {
          baselineDef.beforeCD(context);
        }
        baseHarness.detectChanges();
      }
      console.profileEnd();
    }
  }

  teardownDOMParserMock();
}

benchmark(
    `Static attributes`,

    // <div i18n-title title="Test Title"></div>
    {
      decls: 2,
      vars: 0,
      consts: [[AttributeMarker.I18n, 'title'], ['title', 'Test Title']],
      template: function(rf: RenderFlags, ctx: any) {
        if (rf & 1) {
          ɵɵelementStart(0, 'div', 0);
          ɵɵi18nAttributes(1, 1);
          ɵɵelementEnd();
        }
      }
    },

    // <div title="Test Title"></div>
    {
      decls: 2,
      vars: 0,
      consts: [['title', 'Test Title']],
      template: function(rf: RenderFlags, ctx: any) {
        if (rf & 1) {
          ɵɵelement(0, 'div', 0);
        }
      }
    });

benchmark(
    `Attributes with interpolations`,

    // <div i18n-title title="Test {{ title }}"></div>
    {
      decls: 2,
      vars: 1,
      consts: [[AttributeMarker.I18n, 'title'], ['title', 'Test �0�']],
      template: function(rf: RenderFlags, ctx: any) {
        if (rf & 1) {
          ɵɵelementStart(0, 'div', 0);
          ɵɵi18nAttributes(1, 1);
          ɵɵelementEnd();
        }
        if (rf & 2) {
          ɵɵi18nExp(ctx.title);
          ɵɵi18nApply(1);
        }
      }
    },

    // <div title="Test {{ title }}"></div>
    {
      decls: 2,
      vars: 1,
      consts: [[AttributeMarker.Bindings, 'title']],
      template: function(rf: RenderFlags, ctx: any) {
        if (rf & 1) {
          ɵɵelement(0, 'div', 0);
        }
        if (rf & 2) {
          ɵɵpropertyInterpolate1('title', 'Test ', ctx.title, '');
        }
      }
    });

benchmark(
    `Block of static text`,

    // <div i18n>Some text content</div>
    {
      decls: 2,
      vars: 0,
      consts: ['Some text content'],
      template: function(rf: RenderFlags, ctx: any) {
        if (rf & 1) {
          ɵɵelementStart(0, 'div');
          ɵɵi18n(1, 0);
          ɵɵelementEnd();
        }
      }
    },

    // <div>Some text content</div>
    {
      decls: 2,
      vars: 0,
      consts: [],
      template: function(rf: RenderFlags, ctx: any) {
        if (rf & 1) {
          ɵɵelementStart(0, 'div');
          ɵɵtext(1, 'Some text content');
          ɵɵelementEnd();
        }
      }
    });

benchmark(
    `Block of text with interpolation`,

    // <div i18n>Some text content with {{ interpolation }}</div>
    {
      decls: 2,
      vars: 1,
      consts: ['Some text content with �0�'],
      template: function(rf: RenderFlags, ctx: any) {
        if (rf & 1) {
          ɵɵelementStart(0, 'div');
          ɵɵi18n(1, 0);
          ɵɵelementEnd();
        }
        if (rf & 2) {
          ɵɵadvance(1);
          ɵɵi18nExp(ctx.interpolation);
          ɵɵi18nApply(1);
        }
      }
    },

    // <div>Some text content with {{ interpolation }}</div>
    {
      decls: 2,
      vars: 1,
      consts: [],
      template: function(rf: RenderFlags, ctx: any) {
        if (rf & 1) {
          ɵɵelementStart(0, 'div');
          ɵɵtext(1);
          ɵɵelementEnd();
        }
        if (rf & 2) {
          ɵɵadvance(1);
          ɵɵtextInterpolate1('Some text content with ', ctx.interpolation, '');
        }
      }
    });

benchmark(
    `Simple ICU`,

    // {count, plural, =1 {one} =2 {two} other {other}}
    {
      decls: 1,
      vars: 1,
      consts: ['{�0�, plural, =1 {one} =2 {two} other {other}}'],
      template: function(rf: RenderFlags, ctx: any) {
        if (rf & 1) {
          ɵɵi18n(0, 0);
        }
        if (rf & 2) {
          ɵɵi18nExp(ctx.count);
          ɵɵi18nApply(0);
        }
      },
      beforeCD: function(ctx: any) {
        // Switch values between [0, 1, 2] to trigger different ICU cases.
        ctx.count = (ctx.count + 1) % 3;
      },
    });

benchmark(
    `Nested ICUs`,

    // {count, plural,
    //    =1 {one}
    //    =2 {two}
    //    other { {count, plural, =0 {zero} other {other}} }}
    {
      decls: 1,
      vars: 2,
      consts: ['{�0�, plural, =1 {one} =2 {two} other { {�0�, plural, =0 {zero} other {other}} }}'],
      template: function(rf: RenderFlags, ctx: any) {
        if (rf & 1) {
          ɵɵi18n(0, 0);
        }
        if (rf & 2) {
          ɵɵi18nExp(ctx.count)(ctx.count);
          ɵɵi18nApply(0);
        }
      },
      beforeCD: function(ctx: any) {
        // Switch values between [0, 1, 2] to trigger different ICU cases.
        ctx.count = (ctx.count + 1) % 3;
      },
      DOMParserMockFn: (content: string) => {
        content = content.trim();
        // Nested ICUs are represented as comment nodes. If we come across one - create an element
        // with correct node type, otherwise - call default mock fn.
        if (content.startsWith('<!--')) {
          const element = createElement(NodeTypes.COMMENT_NODE);
          element.textContent = content;
          return element;
        }
        return defaultDOMParserMockFn(content);
      }
    });

benchmarks.forEach(b => b.report());
