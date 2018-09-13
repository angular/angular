/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgLocaleLocalization} from '@angular/common';
import {Component} from '../../src/core';
import {icu, icuBinding1, icuBinding2, icuBindingApply} from '../../src/render3/icu';
import {defineComponent, element, elementProperty, i18nAttrMapping, i18nInterpolation1, i18nMapping} from '../../src/render3/index';
import {elementEnd, elementStart, projection, projectionDef, text} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {ComponentFixture} from '../../test/render3/render_util';

describe('ICU expressions', () => {
  let ngLocalization: NgLocaleLocalization;

  beforeAll(() => { ngLocalization = new NgLocaleLocalization('en-US'); });

  it('should generate the templates', () => {
    const ICU_1 = '{VAR_PLURAL, plural, =0 {zero} =1 {one} other {multiple}}';
    class MyApp {
      count = 0;

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        consts: 2,
        vars: 1,
        // <div>{count, plural, =0 {zero} =1 {one} other {multiple}}</div>
        template: (rf: RenderFlags, myApp: MyApp) => {
          if (rf & RenderFlags.Create) {
            i18nMapping(0, ICU_1, null, null, ['VAR_PLURAL']);
            elementStart(0, 'div');
            icu(1, 0);
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            icuBinding1(myApp.count);
            icuBindingApply(0);
          }
        }
      });
    }

    const fixture = new ComponentFixture(MyApp, {ngLocalization});
    expect(fixture.html).toEqual('<div>zero</div>');

    // Change detection cycle, no model changes
    fixture.update();
    expect(fixture.html).toEqual('<div>zero</div>');

    // Change the value
    fixture.component.count = 1;
    fixture.update();
    expect(fixture.html).toEqual('<div>one</div>');

    // Change the value again
    fixture.component.count = 2;
    fixture.update();
    expect(fixture.html).toEqual('<div>multiple</div>');
  });

  it('should generate html', () => {
    const ICU_1 =
        '{VAR_PLURAL, plural, =0 {<b title="zero">zero</b>} other {<span><i>multiple</i></span>}}';
    class MyApp {
      count = 0;

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        consts: 2,
        vars: 1,
        // <div>{count, plural, =0 {<b title="zero">zero</b>} other
        // {<span><i>multiple</i></span>}}</div>
        template: (rf: RenderFlags, myApp: MyApp) => {
          if (rf & RenderFlags.Create) {
            i18nMapping(0, ICU_1, null, null, ['VAR_PLURAL']);
            elementStart(0, 'div');
            icu(1, 0);
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            icuBinding1(myApp.count);
            icuBindingApply(0);
          }
        }
      });
    }

    const fixture = new ComponentFixture(MyApp, {ngLocalization});
    expect(fixture.html).toEqual('<div><b title="zero">zero</b></div>');

    // Change detection cycle, no model changes
    fixture.update();
    expect(fixture.html).toEqual('<div><b title="zero">zero</b></div>');

    // Change the value
    fixture.component.count = 2;
    fixture.update();
    expect(fixture.html).toEqual('<div><span><i>multiple</i></span></div>');
  });

  it('should throw when there is no "other" case', () => {
    const ICU_1 = '{VAR_PLURAL, plural, =0 {zero}';
    class MyApp {
      count = 0;

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        consts: 2,
        vars: 1,
        // <div>{count, plural, =0 {zero}}</div>
        template: (rf: RenderFlags, myApp: MyApp) => {
          if (rf & RenderFlags.Create) {
            i18nMapping(0, ICU_1, null, null, ['VAR_PLURAL']);
            elementStart(0, 'div');
            icu(1, 0);
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            icuBinding1(myApp.count);
            icuBindingApply(0);
          }
        }
      });
    }

    expect(() => new ComponentFixture(MyApp, {ngLocalization}))
        .toThrowError(
            'ASSERTION ERROR: icuMapping should be defined before calling icuBindingApply');
  });

  it('should work with other elements', () => {
    const ICU_1 = '{VAR_PLURAL, plural, =0 {zero} other {other}}';
    class MyApp {
      count = 1;

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        consts: 6,
        vars: 1,
        // <div><p>Value: {count, plural, =0 {zero} other {other}}<i>!</i></p></div>
        template: (rf: RenderFlags, myApp: MyApp) => {
          if (rf & RenderFlags.Create) {
            i18nMapping(0, ICU_1, null, null, ['VAR_PLURAL']);
            elementStart(0, 'div');
            {
              elementStart(1, 'p');
              {
                text(2, 'Value: ');
                icu(3, 0);
                elementStart(4, 'i');
                { text(5, '!'); }
                elementEnd();
              }
              elementEnd();
            }
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            icuBinding1(myApp.count);
            icuBindingApply(0);
          }
        }
      });
    }

    const fixture = new ComponentFixture(MyApp, {ngLocalization});
    expect(fixture.html).toEqual('<div><p>Value: other<i>!</i></p></div>');

    // Change detection cycle, no model changes
    fixture.update();
    expect(fixture.html).toEqual('<div><p>Value: other<i>!</i></p></div>');

    // Change the value
    fixture.component.count = 0;
    fixture.update();
    expect(fixture.html).toEqual('<div><p>Value: zero<i>!</i></p></div>');

    // Change the value again
    fixture.component.count = 1;
    fixture.update();
    expect(fixture.html).toEqual('<div><p>Value: other<i>!</i></p></div>');
  });

  // TODO(ocombe): support ICU expressions in attributes
  xit('should work in attributes', () => {
    const ICU_1 = '{VAR_PLURAL, plural, =0 {zero} =1 {one} other {multiple}}';
    class MyApp {
      count = 0;

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        consts: 1,
        vars: 1,
        // <div title="{count, plural, =0 {zero} =1 {one} other {multiple}}"></div>
        template: (rf: RenderFlags, myApp: MyApp) => {
          if (rf & RenderFlags.Create) {
            i18nAttrMapping(0, ICU_1, ['VAR_PLURAL']);
            element(0, 'div');
          }
          if (rf & RenderFlags.Update) {
            elementProperty(0, 'title', i18nInterpolation1(0, myApp.count));
          }
        }
      });
    }

    const fixture = new ComponentFixture(MyApp, {ngLocalization});
    expect(fixture.html).toEqual('<div title="zero"></div>');

    // Change detection cycle, no model changes
    fixture.update();
    expect(fixture.html).toEqual('<div title="zero"></div>');

    // Change the value
    fixture.component.count = 1;
    fixture.update();
    expect(fixture.html).toEqual('<div title="one"></div>');

    // Change the value again
    fixture.component.count = 2;
    fixture.update();
    expect(fixture.html).toEqual('<div title="multiple"></div>');
  });

  it('should support bindings', () => {
    const ICU_1 = '{count, plural, =0 {{$zero}} one {1 value} other {{$count} values}}';
    class MyApp {
      count = 0;
      zero = 'nothing';

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        consts: 2,
        vars: 2,
        // <div>{count, plural, =0 {{{zero}}} one {1 value} other {{{count}} values}</div>
        template: (rf: RenderFlags, myApp: MyApp) => {
          if (rf & RenderFlags.Create) {
            i18nMapping(0, ICU_1, null, null, ['count', 'zero']);
            elementStart(0, 'div');
            icu(1, 0);
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            icuBinding2(myApp.count, myApp.zero);
            icuBindingApply(0);
          }
        }
      });
    }

    const fixture = new ComponentFixture(MyApp, {ngLocalization});
    expect(fixture.html).toEqual('<div>nothing</div>');

    // Change detection cycle, no model changes
    fixture.update();
    expect(fixture.html).toEqual('<div>nothing</div>');

    // Change the value
    fixture.component.count = 1;
    fixture.update();
    expect(fixture.html).toEqual('<div>1 value</div>');

    // Change the value again
    fixture.component.count = 2;
    fixture.update();
    expect(fixture.html).toEqual('<div>2 values</div>');

    // Change the value again
    fixture.component.count = 5;
    fixture.update();
    expect(fixture.html).toEqual('<div>5 values</div>');
  });

  it('should support bindings in html attributes', () => {
    const ICU_1 = '{count, plural, =0 {<b title="{$zero}">zero</b>} other {multiple}}';
    class MyApp {
      count = 0;
      zero = 'nothing';

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        consts: 2,
        vars: 2,
        // <div>{count, plural, =0 {<b title="{{zero}}">zero</b>} other {multiple}}</div>
        template: (rf: RenderFlags, myApp: MyApp) => {
          if (rf & RenderFlags.Create) {
            i18nMapping(0, ICU_1, null, null, ['count', 'zero']);
            elementStart(0, 'div');
            icu(1, 0);
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            icuBinding2(myApp.count, myApp.zero);
            icuBindingApply(0);
          }
        }
      });
    }

    const fixture = new ComponentFixture(MyApp, {ngLocalization});
    expect(fixture.html).toEqual('<div><b title="nothing">zero</b></div>');

    // Change detection cycle, no model changes
    fixture.update();
    expect(fixture.html).toEqual('<div><b title="nothing">zero</b></div>');
  });

  it('should support embedded ICU expressions', () => {
    const ICU_1 =
        '{count, plural, =0 {zero} other {{$count} {animal, select, cat {cats} dog {dogs} other {animals}}!}}';
    class MyApp {
      count = 0;
      animal = 'cat';

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        consts: 2,
        vars: 2,
        // <div>{count, plural, =0 {zero} other {{{count}} {animal, select, cat {cats} dog {dogs}
        // other {animals}}!}}</div>
        template: (rf: RenderFlags, myApp: MyApp) => {
          if (rf & RenderFlags.Create) {
            i18nMapping(0, ICU_1, null, null, ['count', 'animal']);
            elementStart(0, 'div');
            icu(1, 0);
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            icuBinding2(myApp.count, myApp.animal);
            icuBindingApply(0);
          }
        }
      });
    }

    const fixture = new ComponentFixture(MyApp, {ngLocalization});
    expect(fixture.html).toEqual('<div>zero</div>');

    // Change detection cycle, no model changes
    fixture.update();
    expect(fixture.html).toEqual('<div>zero</div>');

    // Change the value
    fixture.component.count = 2;
    fixture.update();
    expect(fixture.html).toEqual('<div>2 cats!</div>');

    // Change the value again
    fixture.component.count = 5;
    fixture.update();
    expect(fixture.html).toEqual('<div>5 cats!</div>');

    // Change the value of the embedded ICU only
    fixture.component.animal = 'dog';
    fixture.update();
    expect(fixture.html).toEqual('<div>5 dogs!</div>');
  });

  it('should support embedded ICU expressions with html', () => {
    const ICU_1 =
        '{count, plural, =0 {zero} other {{$count} <b>{animal, select, cat {cats} dog {dogs} other {animals ({$animal})}}</b>!}}';
    class MyApp {
      count = 0;
      animal = 'cat';

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        consts: 2,
        vars: 2,
        // <div>{count, plural, =0 {zero} other {{{count}} <b>{animal, select, cat {cats} dog {dogs}
        // other {animals}}</b>!}}</div>
        template: (rf: RenderFlags, myApp: MyApp) => {
          if (rf & RenderFlags.Create) {
            i18nMapping(0, ICU_1, null, null, ['count', 'animal']);
            elementStart(0, 'div');
            icu(1, 0);
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            icuBinding2(myApp.count, myApp.animal);
            icuBindingApply(0);
          }
        }
      });
    }

    const fixture = new ComponentFixture(MyApp, {ngLocalization});
    expect(fixture.html).toEqual('<div>zero</div>');

    // Change detection cycle, no model changes
    fixture.update();
    expect(fixture.html).toEqual('<div>zero</div>');

    // Change the value
    fixture.component.count = 2;
    fixture.update();
    expect(fixture.html).toEqual('<div>2 <b>cats</b>!</div>');

    // Change the value again
    fixture.component.count = 5;
    fixture.update();
    expect(fixture.html).toEqual('<div>5 <b>cats</b>!</div>');

    // Change the value of the embedded ICU only
    fixture.component.animal = 'dog';
    fixture.update();
    expect(fixture.html).toEqual('<div>5 <b>dogs</b>!</div>');

    // Change the value of the embedded ICU only
    fixture.component.animal = 'squirrel';
    fixture.update();
    expect(fixture.html).toEqual('<div>5 <b>animals (squirrel)</b>!</div>');

    // Change the value of the embedded ICU only
    fixture.component.animal = 'raccoon';
    fixture.update();
    expect(fixture.html).toEqual('<div>5 <b>animals (raccoon)</b>!</div>');
  });

  it('should sanitize html', () => {
    const ICU_1 = `{count, plural,
        =0 {<b style="color: red;">none</b><script>console.log("bad");</script>}
        =1 {<b style="color: {$color};" title="{$count}!">one</b>}
        other {<img src="{$count}"> There are: {$count}.}
      }`;
    class MyApp {
      count = 0;
      color = 'blue';

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        consts: 2,
        vars: 2,
        // {count, plural,
        //   =0 {<b style="color: red;">none</b><script>console.log("bad");</script>}
        //   =1 {<b style="color: {$color};" title="{$count}!">one</b>}
        //   other {<img src="{$count}"> There are: {$count}.}
        // }
        template: (rf: RenderFlags, myApp: MyApp) => {
          if (rf & RenderFlags.Create) {
            i18nMapping(0, ICU_1, null, null, ['count', 'color']);
            elementStart(0, 'div');
            icu(1, 0);
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            icuBinding2(myApp.count, myApp.color);
            icuBindingApply(0);
          }
        }
      });
    }

    const fixture = new ComponentFixture(MyApp, {ngLocalization});
    expect(fixture.html).toEqual('<div><b style="color: red;">none</b></div>');

    // Change detection cycle, no model changes
    fixture.update();
    expect(fixture.html).toEqual('<div><b style="color: red;">none</b></div>');

    // Change the value
    fixture.component.count = 1;
    fixture.update();
    expect(fixture.html).toEqual('<div><b title="1!">one</b></div>');

    // Change the value to trigger the "other" condition
    fixture.component.count = 3;
    fixture.update();
    expect(fixture.html).toEqual('<div><img src="3"></img> There are: 3.</div>');
  });

  it('should throw if you use a plural ICU without NgLocalization', () => {
    const ICU_1 = '{count, plural, =0 {zero} =1 {one} other {multiple}}';
    class MyApp {
      count = 0;

      static ngComponentDef = defineComponent({
        type: MyApp,
        factory: () => new MyApp(),
        selectors: [['my-app']],
        consts: 2,
        vars: 1,
        // <div>{count, plural, =0 {zero} =1 {one} other {multiple}}</div>
        template: (rf: RenderFlags, myApp: MyApp) => {
          if (rf & RenderFlags.Create) {
            i18nMapping(0, ICU_1, null, null, ['count']);
            elementStart(0, 'div');
            icu(1, 0);
            elementEnd();
          }
          if (rf & RenderFlags.Update) {
            icuBinding1(myApp.count);
            icuBindingApply(0);
          }
        }
      });
    }

    const fixture = new ComponentFixture(MyApp);
    expect(fixture.html).toEqual('<div>zero</div>');

    // Change detection cycle, no model changes
    fixture.update();
    expect(fixture.html).toEqual('<div>zero</div>');

    // Change the value to trigger the "other" condition
    fixture.component.count = 2;
    expect(() => fixture.update())
        .toThrowError('An instance of NgLocalization is required for plural ICU expressions');
  });

  describe('projection', () => {
    it('should project ICU expressions', () => {
      @Component({selector: 'child', template: '<p><ng-content></ng-content></p>'})
      class Child {
        static ngComponentDef = defineComponent({
          type: Child,
          selectors: [['child']],
          consts: 2,
          vars: 0,
          factory: () => new Child(),
          template: (rf: RenderFlags, cmp: Child) => {
            if (rf & RenderFlags.Create) {
              projectionDef();
              elementStart(0, 'p');
              { projection(1); }
              elementEnd();
            }
          }
        });
      }

      const ICU_1 = '{name, select, other {from {$name}}}';

      @Component({
        selector: 'parent',
        template: `
        <div>
          <child>{name, select, other {from {{name}}}}</child>
        </div>`
      })
      class Parent {
        name = 'Parent';
        static ngComponentDef = defineComponent({
          type: Parent,
          selectors: [['parent']],
          directives: [Child],
          consts: 5,
          vars: 1,
          factory: () => new Parent(),
          template: (rf: RenderFlags, cmp: Parent) => {
            if (rf & RenderFlags.Create) {
              i18nMapping(0, ICU_1, null, null, ['name']);
              elementStart(0, 'div');
              {
                elementStart(1, 'child');  // START_CHILD
                {
                  text(2, '[');
                  icu(3, 0);
                  text(4, ']');
                }
                elementEnd();
              }
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              icuBinding1(cmp.name);
              icuBindingApply(0);
            }
          }
        });
      }

      const fixture = new ComponentFixture(Parent);
      expect(fixture.html).toEqual('<div><child><p>[from Parent]</p></child></div>');

      // Change detection cycle, no model changes
      fixture.update();
      expect(fixture.html).toEqual('<div><child><p>[from Parent]</p></child></div>');

      // Change the value
      fixture.component.name = 'Other';
      fixture.update();
      expect(fixture.html).toEqual('<div><child><p>[from Other]</p></child></div>');
    });

    it('should re-project ICU expressions when multiple projections', () => {
      @Component({selector: 'grand-child', template: '<div><ng-content></ng-content></div>'})
      class GrandChild {
        static ngComponentDef = defineComponent({
          type: GrandChild,
          selectors: [['grand-child']],
          consts: 2,
          vars: 0,
          factory: () => new GrandChild(),
          template: (rf: RenderFlags, cmp: Child) => {
            if (rf & RenderFlags.Create) {
              projectionDef();
              elementStart(0, 'div');
              { projection(1); }
              elementEnd();
            }
          }
        });
      }

      @Component(
          {selector: 'child', template: '<grand-child><ng-content></ng-content></grand-child>'})
      class Child {
        static ngComponentDef = defineComponent({
          type: Child,
          selectors: [['child']],
          directives: [GrandChild],
          consts: 2,
          vars: 0,
          factory: () => new Child(),
          template: (rf: RenderFlags, cmp: Child) => {
            if (rf & RenderFlags.Create) {
              projectionDef();
              elementStart(0, 'grand-child');
              { projection(1); }
              elementEnd();
            }
          }
        });
      }

      const ICU_1 = '{name, select, other {from {$name}}}';

      @Component(
          {selector: 'parent', template: `<child>{name, select, other {from {{name}}}}</child>`})
      class Parent {
        name = 'Parent';
        static ngComponentDef = defineComponent({
          type: Parent,
          selectors: [['parent']],
          directives: [Child],
          consts: 2,
          vars: 1,
          factory: () => new Parent(),
          template: (rf: RenderFlags, cmp: Parent) => {
            if (rf & RenderFlags.Create) {
              i18nMapping(0, ICU_1, null, null, ['name']);
              elementStart(0, 'child');
              { icu(1, 0); }
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              icuBinding1(cmp.name);
              icuBindingApply(0);
            }
          }
        });
      }

      const fixture = new ComponentFixture(Parent);
      expect(fixture.html)
          .toEqual('<child><grand-child><div>from Parent</div></grand-child></child>');

      // Change detection cycle, no model changes
      fixture.update();
      expect(fixture.html)
          .toEqual('<child><grand-child><div>from Parent</div></grand-child></child>');

      // Change the value
      fixture.component.name = 'Other';
      fixture.update();
      expect(fixture.html)
          .toEqual('<child><grand-child><div>from Other</div></grand-child></child>');
    });

    it('should project ICU expressions with selectors', () => {
      @Component({
        selector: 'child',
        template: `
          <ng-content select="span"></ng-content>
        `
      })
      class Child {
        static ngComponentDef = defineComponent({
          type: Child,
          selectors: [['child']],
          consts: 1,
          vars: 0,
          factory: () => new Child(),
          template: (rf: RenderFlags, cmp: Child) => {
            if (rf & RenderFlags.Create) {
              projectionDef([[['span']]], ['span']);
              projection(0, 1);
            }
          }
        });
      }

      const ICU_1 = '{name, select, other {from {$name}}}';

      @Component({
        selector: 'parent',
        template: `
          <child>
            <span>{name, select, other {from {{name}}}}</span>
          </child>
        `
      })
      class Parent {
        name = 'Parent';
        static ngComponentDef = defineComponent({
          type: Parent,
          selectors: [['parent']],
          directives: [Child],
          consts: 3,
          vars: 1,
          factory: () => new Parent(),
          template: (rf: RenderFlags, cmp: Parent) => {
            if (rf & RenderFlags.Create) {
              i18nMapping(0, ICU_1, null, null, ['name']);
              elementStart(0, 'child');
              {
                elementStart(1, 'span');
                icu(2, 0);
                elementEnd();
              }
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              icuBinding1(cmp.name);
              icuBindingApply(0);
            }
          }
        });
      }

      const fixture = new ComponentFixture(Parent);
      expect(fixture.html).toEqual('<child><span>from Parent</span></child>');

      // Change detection cycle, no model changes
      fixture.update();
      expect(fixture.html).toEqual('<child><span>from Parent</span></child>');

      // Change the value
      fixture.component.name = 'Other';
      fixture.update();
      expect(fixture.html).toEqual('<child><span>from Other</span></child>');
    });
  });
});
