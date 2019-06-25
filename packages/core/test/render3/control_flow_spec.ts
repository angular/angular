/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵɵdefineComponent} from '../../src/render3/definition';
import {ɵɵcontainer, ɵɵcontainerRefreshEnd, ɵɵcontainerRefreshStart, ɵɵelement, ɵɵelementEnd, ɵɵelementStart, ɵɵembeddedViewEnd, ɵɵembeddedViewStart, ɵɵselect, ɵɵtext, ɵɵtextBinding} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {ComponentFixture, TemplateFixture, createComponent} from './render_util';

describe('JS control flow', () => {
  it('should work with if block', () => {
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelementStart(0, 'div');
        { ɵɵcontainer(1); }
        ɵɵelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(1);
        {
          if (ctx.condition) {
            let rf1 = ɵɵembeddedViewStart(1, 2, 1);
            {
              if (rf1 & RenderFlags.Create) {
                ɵɵelementStart(0, 'span');
                { ɵɵtext(1); }
                ɵɵelementEnd();
              }
              if (rf1 & RenderFlags.Update) {
                ɵɵselect(1);
                ɵɵtextBinding(ctx.message);
              }
            }
            ɵɵembeddedViewEnd();
          }
        }
        ɵɵcontainerRefreshEnd();
      }
    }, 2);

    const fixture = new ComponentFixture(App);
    fixture.component.condition = true;
    fixture.component.message = 'Hello';
    fixture.update();
    expect(fixture.html).toEqual('<div><span>Hello</span></div>');

    fixture.component.condition = false;
    fixture.component.message = 'Hi!';
    fixture.update();
    expect(fixture.html).toEqual('<div></div>');

    fixture.component.condition = true;
    fixture.update();
    expect(fixture.html).toEqual('<div><span>Hi!</span></div>');
  });

  it('should work with nested if blocks', () => {
    /**
     * <div>
     *   % if(ctx.condition) {
     *     <span>
     *       % if(ctx.condition2) {
     *          Hello
     *       % }
     *     </span>
     *   % }
     * </div>
     */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelementStart(0, 'div');
        { ɵɵcontainer(1); }
        ɵɵelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(1);
        {
          if (ctx.condition) {
            let rf1 = ɵɵembeddedViewStart(1, 2, 0);
            {
              if (rf1 & RenderFlags.Create) {
                ɵɵelementStart(0, 'span');
                { ɵɵcontainer(1); }
                ɵɵelementEnd();
              }
              if (rf1 & RenderFlags.Update) {
                ɵɵcontainerRefreshStart(1);
                {
                  if (ctx.condition2) {
                    let rf2 = ɵɵembeddedViewStart(2, 1, 0);
                    {
                      if (rf2 & RenderFlags.Create) {
                        ɵɵtext(0, 'Hello');
                      }
                    }
                    ɵɵembeddedViewEnd();
                  }
                }
                ɵɵcontainerRefreshEnd();
              }
            }
            ɵɵembeddedViewEnd();
          }
        }
        ɵɵcontainerRefreshEnd();
      }
    }, 2);

    const fixture = new ComponentFixture(App);
    fixture.component.condition = true;
    fixture.component.condition2 = true;
    fixture.update();
    expect(fixture.html).toEqual('<div><span>Hello</span></div>');

    fixture.component.condition = false;
    fixture.update();
    expect(fixture.html).toEqual('<div></div>');

    fixture.component.condition = true;
    fixture.update();
    expect(fixture.html).toEqual('<div><span>Hello</span></div>');

    fixture.component.condition2 = false;
    fixture.update();
    expect(fixture.html).toEqual('<div><span></span></div>');

    fixture.component.condition2 = true;
    fixture.update();
    expect(fixture.html).toEqual('<div><span>Hello</span></div>');

    fixture.component.condition2 = false;
    fixture.update();
    expect(fixture.html).toEqual('<div><span></span></div>');

    fixture.component.condition = false;
    fixture.update();
    expect(fixture.html).toEqual('<div></div>');

    fixture.component.condition = true;
    fixture.update();
    expect(fixture.html).toEqual('<div><span></span></div>');

    fixture.component.condition2 = true;
    fixture.update();
    expect(fixture.html).toEqual('<div><span>Hello</span></div>');
  });

  it('should work with nested adjacent if blocks', () => {
    const ctx: {condition: boolean,
                condition2: boolean,
                condition3: boolean} = {condition: true, condition2: false, condition3: true};

    /**
     * % if(ctx.condition) {
     *   % if(ctx.condition2) {
     *     Hello
     *   % }
     *   % if(ctx.condition3) {
     *     World
     *   % }
     * % }
     */
    function createTemplate() { ɵɵcontainer(0); }

    function updateTemplate() {
      ɵɵcontainerRefreshStart(0);
      {
        if (ctx.condition) {
          let rf1 = ɵɵembeddedViewStart(1, 2, 0);
          {
            if (rf1 & RenderFlags.Create) {
              { ɵɵcontainer(0); }
              { ɵɵcontainer(1); }
            }
            if (rf1 & RenderFlags.Update) {
              ɵɵcontainerRefreshStart(0);
              {
                if (ctx.condition2) {
                  let rf2 = ɵɵembeddedViewStart(2, 1, 0);
                  {
                    if (rf2 & RenderFlags.Create) {
                      ɵɵtext(0, 'Hello');
                    }
                  }
                  ɵɵembeddedViewEnd();
                }
              }
              ɵɵcontainerRefreshEnd();
              ɵɵcontainerRefreshStart(1);
              {
                if (ctx.condition3) {
                  let rf2 = ɵɵembeddedViewStart(2, 1, 0);
                  {
                    if (rf2 & RenderFlags.Create) {
                      ɵɵtext(0, 'World');
                    }
                  }
                  ɵɵembeddedViewEnd();
                }
              }
              ɵɵcontainerRefreshEnd();
            }
          }
          ɵɵembeddedViewEnd();
        }
      }
      ɵɵcontainerRefreshEnd();
    }

    const fixture = new TemplateFixture(createTemplate, updateTemplate, 1);
    expect(fixture.html).toEqual('World');

    ctx.condition2 = true;
    fixture.update();
    expect(fixture.html).toEqual('HelloWorld');
  });

  it('should work with adjacent if blocks managing views in the same container', () => {
    /**
    *   % if(ctx.condition1) {
    *     1
    *   % }; if(ctx.condition2) {
    *     2
    *   % }; if(ctx.condition3) {
    *     3
    *   % }
    */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵcontainer(0);
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(0);
        if (ctx.condition1) {
          const rf1 = ɵɵembeddedViewStart(1, 1, 0);
          if (rf1 & RenderFlags.Create) {
            ɵɵtext(0, '1');
          }
          ɵɵembeddedViewEnd();
        }  // can't have ; here due linting rules
        if (ctx.condition2) {
          const rf2 = ɵɵembeddedViewStart(2, 1, 0);
          if (rf2 & RenderFlags.Create) {
            ɵɵtext(0, '2');
          }
          ɵɵembeddedViewEnd();
        }  // can't have ; here due linting rules
        if (ctx.condition3) {
          const rf3 = ɵɵembeddedViewStart(3, 1, 0);
          if (rf3 & RenderFlags.Create) {
            ɵɵtext(0, '3');
          }
          ɵɵembeddedViewEnd();
        }
        ɵɵcontainerRefreshEnd();
      }
    }, 1);

    const fixture = new ComponentFixture(App);
    fixture.component.condition1 = true;
    fixture.component.condition2 = true;
    fixture.component.condition3 = true;
    fixture.update();
    expect(fixture.html).toEqual('123');

    fixture.component.condition2 = false;
    fixture.update();
    expect(fixture.html).toEqual('13');
  });

  it('should work with containers with views as parents', () => {
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelementStart(0, 'div');
        { ɵɵtext(1, 'hello'); }
        ɵɵelementEnd();
        ɵɵcontainer(2);
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(2);
        {
          if (ctx.condition1) {
            let rf0 = ɵɵembeddedViewStart(0, 1, 0);
            {
              if (rf0 & RenderFlags.Create) {
                ɵɵcontainer(0);
              }
              if (rf0 & RenderFlags.Update) {
                ɵɵcontainerRefreshStart(0);
                {
                  if (ctx.condition2) {
                    let rf0 = ɵɵembeddedViewStart(0, 1, 0);
                    {
                      if (rf0 & RenderFlags.Create) {
                        ɵɵtext(0, 'world');
                      }
                    }
                    ɵɵembeddedViewEnd();
                  }
                }
                ɵɵcontainerRefreshEnd();
              }
            }
            ɵɵembeddedViewEnd();
          }
        }
        ɵɵcontainerRefreshEnd();
      }
    }, 3);

    const fixture = new ComponentFixture(App);
    fixture.component.condition1 = true;
    fixture.component.condition2 = true;
    fixture.update();
    expect(fixture.html).toEqual('<div>hello</div>world');

    fixture.component.condition1 = false;
    fixture.component.condition2 = false;
    fixture.update();
    expect(fixture.html).toEqual('<div>hello</div>');
  });

  it('should work with loop block', () => {
    let data: string[] = ['a', 'b', 'c'];
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelementStart(0, 'ul');
        { ɵɵcontainer(1); }
        ɵɵelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(1);
        {
          for (let i = 0; i < data.length; i++) {
            let rf1 = ɵɵembeddedViewStart(1, 2, 1);
            {
              if (rf1 & RenderFlags.Create) {
                ɵɵelementStart(0, 'li');
                { ɵɵtext(1); }
                ɵɵelementEnd();
              }
              if (rf1 & RenderFlags.Update) {
                ɵɵselect(1);
                ɵɵtextBinding(data[i]);
              }
            }
            ɵɵembeddedViewEnd();
          }
        }
        ɵɵcontainerRefreshEnd();
      }
    }, 2);

    const fixture = new ComponentFixture(App);
    fixture.update();
    expect(fixture.html).toEqual('<ul><li>a</li><li>b</li><li>c</li></ul>');

    data = ['e', 'f'];
    fixture.update();
    expect(fixture.html).toEqual('<ul><li>e</li><li>f</li></ul>');

    data = [];
    fixture.update();
    expect(fixture.html).toEqual('<ul></ul>');

    data = ['a', 'b', 'c'];
    fixture.update();
    expect(fixture.html).toEqual('<ul><li>a</li><li>b</li><li>c</li></ul>');

    data.push('d');
    fixture.update();
    expect(fixture.html).toEqual('<ul><li>a</li><li>b</li><li>c</li><li>d</li></ul>');

    data = ['e'];
    fixture.update();
    expect(fixture.html).toEqual('<ul><li>e</li></ul>');
  });

  it('should work with nested loop blocks', () => {
    let data: string[][] = [['a', 'b', 'c'], ['m', 'n']];

    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelementStart(0, 'ul');
        { ɵɵcontainer(1); }
        ɵɵelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(1);
        {
          for (let i = 0; i < data[0].length; i++) {
            let rf1 = ɵɵembeddedViewStart(1, 2, 0);
            {
              if (rf1 & RenderFlags.Create) {
                ɵɵelementStart(0, 'li');
                { ɵɵcontainer(1); }
                ɵɵelementEnd();
              }
              if (rf1 & RenderFlags.Update) {
                ɵɵcontainerRefreshStart(1);
                {
                  data[1].forEach((value: string, ind: number) => {
                    let rf2 = ɵɵembeddedViewStart(2, 1, 1);
                    if (rf2 & RenderFlags.Create) {
                      ɵɵtext(0);
                    }
                    if (rf2 & RenderFlags.Update) {
                      ɵɵselect(0);
                      ɵɵtextBinding(data[0][i] + value);
                    }
                    ɵɵembeddedViewEnd();
                  });
                }
                ɵɵcontainerRefreshEnd();
              }
            }
            ɵɵembeddedViewEnd();
          }
        }
        ɵɵcontainerRefreshEnd();
      }
    }, 2);

    const fixture = new ComponentFixture(App);
    fixture.update();
    expect(fixture.html).toEqual('<ul><li>aman</li><li>bmbn</li><li>cmcn</li></ul>');

    data = [[], []];
    fixture.update();
    expect(fixture.html).toEqual('<ul></ul>');
  });

  it('should work with nested loop blocks where nested container is a root node', () => {
    let cafes = [
      {name: '1', entrees: ['a', 'b', 'c']}, {name: '2', entrees: ['d', 'e', 'f']},
      {name: '3', entrees: ['g', 'h', 'i']}
    ];

    /**
     * <div>
     *   Before
     *   % for (let i = 0; i < cafes.length; i++) {
     *      <h2> {{ cafes[i].name }} </h2>
     *      % for (let j = 0; j < cafes[i].entrees; j++) {
     *        {{ cafes[i].entrees[j] }}
     *      % }
     *      -
     *   % }
     *   After
     * <div>
     */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelementStart(0, 'div');
        {
          ɵɵtext(1, 'Before');
          ɵɵcontainer(2);
          ɵɵtext(3, 'After');
        }
        ɵɵelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(2);
        {
          for (let i = 0; i < cafes.length; i++) {
            let rf1 = ɵɵembeddedViewStart(1, 4, 1);
            {
              if (rf1 & RenderFlags.Create) {
                ɵɵelementStart(0, 'h2');
                { ɵɵtext(1); }
                ɵɵelementEnd();
                ɵɵcontainer(2);
                ɵɵtext(3, '-');
              }
              if (rf1 & RenderFlags.Update) {
                ɵɵselect(1);
                ɵɵtextBinding(cafes[i].name);
                ɵɵcontainerRefreshStart(2);
                {
                  for (let j = 0; j < cafes[i].entrees.length; j++) {
                    let rf2 = ɵɵembeddedViewStart(2, 1, 1);
                    if (rf2 & RenderFlags.Create) {
                      ɵɵtext(0);
                    }
                    if (rf2 & RenderFlags.Update) {
                      ɵɵselect(0);
                      ɵɵtextBinding(cafes[i].entrees[j]);
                    }
                    ɵɵembeddedViewEnd();
                  }
                }
                ɵɵcontainerRefreshEnd();
              }
            }
            ɵɵembeddedViewEnd();
          }
        }
        ɵɵcontainerRefreshEnd();
      }
    }, 4);

    const fixture = new ComponentFixture(App);
    fixture.update();
    expect(fixture.html)
        .toEqual('<div>Before<h2>1</h2>abc-<h2>2</h2>def-<h2>3</h2>ghi-After</div>');

    cafes = [];
    fixture.update();
    expect(fixture.html).toEqual('<div>BeforeAfter</div>');

    cafes = [
      {name: '1', entrees: ['a', 'c']},
      {name: '2', entrees: ['d', 'e']},
    ];
    fixture.update();
    expect(fixture.html).toEqual('<div>Before<h2>1</h2>ac-<h2>2</h2>de-After</div>');
  });

  it('should work with loop blocks nested three deep', () => {
    let cafes = [
      {
        name: '1',
        entrees:
            [{name: 'a', foods: [1, 2]}, {name: 'b', foods: [3, 4]}, {name: 'c', foods: [5, 6]}]
      },
      {
        name: '2',
        entrees:
            [{name: 'd', foods: [1, 2]}, {name: 'e', foods: [3, 4]}, {name: 'f', foods: [5, 6]}]
      }
    ];

    /**
     * <div>
     *   Before
     *   % for (let i = 0; i < cafes.length; i++) {
       *      <h2> {{ cafes[i].name }} </h2>
       *      % for (let j = 0; j < cafes[i].entrees.length; j++) {
       *        <h3>  {{ cafes[i].entrees[j].name }} </h3>
       *        % for (let k = 0; k < cafes[i].entrees[j].foods.length; k++) {
       *          {{ cafes[i].entrees[j].foods[k] }}
       *        % }
       *      % }
       *      -
       *   % }
     *   After
     * <div>
     */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelementStart(0, 'div');
        {
          ɵɵtext(1, 'Before');
          ɵɵcontainer(2);
          ɵɵtext(3, 'After');
        }
        ɵɵelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(2);
        {
          for (let i = 0; i < cafes.length; i++) {
            let rf1 = ɵɵembeddedViewStart(1, 4, 1);
            {
              if (rf1 & RenderFlags.Create) {
                ɵɵelementStart(0, 'h2');
                { ɵɵtext(1); }
                ɵɵelementEnd();
                ɵɵcontainer(2);
                ɵɵtext(3, '-');
              }
              if (rf1 & RenderFlags.Update) {
                ɵɵselect(1);
                ɵɵtextBinding(cafes[i].name);
                ɵɵcontainerRefreshStart(2);
                {
                  for (let j = 0; j < cafes[i].entrees.length; j++) {
                    let rf1 = ɵɵembeddedViewStart(1, 3, 1);
                    {
                      if (rf1 & RenderFlags.Create) {
                        ɵɵelementStart(0, 'h3');
                        { ɵɵtext(1); }
                        ɵɵelementEnd();
                        ɵɵcontainer(2);
                      }
                      if (rf1 & RenderFlags.Update) {
                        ɵɵselect(1);
                        ɵɵtextBinding(cafes[i].entrees[j].name);
                        ɵɵcontainerRefreshStart(2);
                        {
                          for (let k = 0; k < cafes[i].entrees[j].foods.length; k++) {
                            let rf2 = ɵɵembeddedViewStart(1, 1, 1);
                            if (rf2 & RenderFlags.Create) {
                              ɵɵtext(0);
                            }
                            if (rf2 & RenderFlags.Update) {
                              ɵɵselect(0);
                              ɵɵtextBinding(cafes[i].entrees[j].foods[k]);
                            }
                            ɵɵembeddedViewEnd();
                          }
                        }
                        ɵɵcontainerRefreshEnd();
                      }
                    }
                    ɵɵembeddedViewEnd();
                  }
                }
                ɵɵcontainerRefreshEnd();
              }
            }
            ɵɵembeddedViewEnd();
          }
        }
        ɵɵcontainerRefreshEnd();
      }
    }, 4);

    const fixture = new ComponentFixture(App);
    fixture.update();
    expect(fixture.html)
        .toEqual(
            '<div>' +
            'Before' +
            '<h2>1</h2><h3>a</h3>12<h3>b</h3>34<h3>c</h3>56-' +
            '<h2>2</h2><h3>d</h3>12<h3>e</h3>34<h3>f</h3>56-' +
            'After' +
            '</div>');

    cafes = [];
    fixture.update();
    expect(fixture.html).toEqual('<div>BeforeAfter</div>');
  });

  it('should work with if/else blocks', () => {
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelementStart(0, 'div');
        { ɵɵcontainer(1); }
        ɵɵelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(1);
        {
          if (ctx.condition) {
            let rf1 = ɵɵembeddedViewStart(1, 2, 0);
            {
              if (rf1 & RenderFlags.Create) {
                ɵɵelementStart(0, 'span');
                { ɵɵtext(1, 'Hello'); }
                ɵɵelementEnd();
              }
            }
            ɵɵembeddedViewEnd();
          } else {
            let rf2 = ɵɵembeddedViewStart(2, 2, 0);
            {
              if (rf2) {
                ɵɵelementStart(0, 'div');
                { ɵɵtext(1, 'Goodbye'); }
                ɵɵelementEnd();
              }
            }
            ɵɵembeddedViewEnd();
          }
        }
        ɵɵcontainerRefreshEnd();
      }
    }, 2);

    const fixture = new ComponentFixture(App);
    fixture.component.condition = true;
    fixture.update();
    expect(fixture.html).toEqual('<div><span>Hello</span></div>');

    fixture.component.condition = false;
    fixture.update();
    expect(fixture.html).toEqual('<div><div>Goodbye</div></div>');

    fixture.component.condition = true;
    fixture.update();
    expect(fixture.html).toEqual('<div><span>Hello</span></div>');
  });

  it('should work with sibling if blocks with children', () => {
    let log: string[] = [];

    // Intentionally duplicating the templates in test below so we are
    // testing the behavior on firstTemplatePass for each of these tests
    class Comp {
      static ngComponentDef = ɵɵdefineComponent({
        type: Comp,
        selectors: [['comp']],
        consts: 0,
        vars: 0,
        factory: () => {
          log.push('comp!');
          return new Comp();
        },
        template: function(rf: RenderFlags, ctx: Comp) {}
      });
    }

    class App {
      condition = true;
      condition2 = true;

      static ngComponentDef = ɵɵdefineComponent({
        type: App,
        selectors: [['app']],
        factory: () => new App(),
        consts: 3,
        vars: 0,
        template: function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵelement(0, 'div');
            ɵɵcontainer(1);
            ɵɵcontainer(2);
          }
          if (rf & RenderFlags.Update) {
            ɵɵcontainerRefreshStart(1);
            {
              if (ctx.condition) {
                let rf1 = ɵɵembeddedViewStart(0, 1, 0);
                if (rf1 & RenderFlags.Create) {
                  ɵɵelement(0, 'comp');
                }
                ɵɵembeddedViewEnd();
              }
            }
            ɵɵcontainerRefreshEnd();
            ɵɵcontainerRefreshStart(2);
            {
              if (ctx.condition2) {
                let rf1 = ɵɵembeddedViewStart(0, 1, 0);
                if (rf1 & RenderFlags.Create) {
                  ɵɵelement(0, 'comp');
                }
                ɵɵembeddedViewEnd();
              }
            }
            ɵɵcontainerRefreshEnd();
          }
        },
        directives: () => [Comp]
      });
    }

    const fixture = new ComponentFixture(App);
    expect(log).toEqual(['comp!', 'comp!']);
  });

  it('should work with a sibling if block that starts closed', () => {
    let log: string[] = [];

    // Intentionally duplicating the templates from above so we are
    // testing the behavior on firstTemplatePass for each of these tests
    class Comp {
      static ngComponentDef = ɵɵdefineComponent({
        type: Comp,
        selectors: [['comp']],
        consts: 0,
        vars: 0,
        factory: () => {
          log.push('comp!');
          return new Comp();
        },
        template: function(rf: RenderFlags, ctx: Comp) {}
      });
    }

    class App {
      condition = false;
      condition2 = true;

      static ngComponentDef = ɵɵdefineComponent({
        type: App,
        selectors: [['app']],
        factory: () => new App(),
        consts: 3,
        vars: 0,
        template: function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            ɵɵelement(0, 'div');
            ɵɵcontainer(1);
            ɵɵcontainer(2);
          }
          if (rf & RenderFlags.Update) {
            ɵɵcontainerRefreshStart(1);
            {
              if (ctx.condition) {
                let rf1 = ɵɵembeddedViewStart(0, 1, 0);
                if (rf1 & RenderFlags.Create) {
                  ɵɵelement(0, 'comp');
                }
                ɵɵembeddedViewEnd();
              }
            }
            ɵɵcontainerRefreshEnd();
            ɵɵcontainerRefreshStart(2);
            {
              if (ctx.condition2) {
                let rf1 = ɵɵembeddedViewStart(0, 1, 0);
                if (rf1 & RenderFlags.Create) {
                  ɵɵelement(0, 'comp');
                }
                ɵɵembeddedViewEnd();
              }
            }
            ɵɵcontainerRefreshEnd();
          }
        },
        directives: () => [Comp]
      });
    }

    const fixture = new ComponentFixture(App);
    expect(log).toEqual(['comp!']);

    fixture.component.condition = true;
    fixture.update();
    expect(log).toEqual(['comp!', 'comp!']);
  });
});

describe('JS for loop', () => {
  it('should work with sibling for blocks', () => {
    const config: {data1: string[], data2: number[]} = {data1: ['a', 'b', 'c'], data2: [1, 2]};

    /**
     * <div>
     *    % for (let i = 0; i < ctx.data1.length; i++) {
     *        {{data1[i]}}
     *    % } for (let j = 0; j < ctx.data2.length; j++) {
     *        {{data1[j]}}
     *    % }
     * </div>
     */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelementStart(0, 'div');
        { ɵɵcontainer(1); }
        ɵɵelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(1);
        {
          for (let i = 0; i < config.data1.length; i++) {
            let rf2 = ɵɵembeddedViewStart(1, 1, 1);
            if (rf2 & RenderFlags.Create) {
              ɵɵtext(0);
            }
            if (rf2 & RenderFlags.Update) {
              ɵɵselect(0);
              ɵɵtextBinding(config.data1[i]);
            }
            ɵɵembeddedViewEnd();
          }
          for (let j = 0; j < config.data2.length; j++) {
            let rf2 = ɵɵembeddedViewStart(1, 1, 1);
            if (rf2 & RenderFlags.Create) {
              ɵɵtext(0);
            }
            if (rf2 & RenderFlags.Update) {
              ɵɵselect(0);
              ɵɵtextBinding(config.data2[j]);
            }
            ɵɵembeddedViewEnd();
          }
        }
        ɵɵcontainerRefreshEnd();
      }
    }, 2);

    const fixture = new ComponentFixture(App);
    expect(fixture.html).toEqual('<div>abc12</div>');

    config.data1 = ['e', 'f'];
    fixture.update();
    expect(fixture.html).toEqual('<div>ef12</div>');

    config.data2 = [8];
    fixture.update();
    expect(fixture.html).toEqual('<div>ef8</div>');

    config.data1 = ['x', 'y'];
    fixture.update();
    expect(fixture.html).toEqual('<div>xy8</div>');
  });
});

describe('function calls', () => {
  it('should work', () => {
    let data: string[] = ['foo', 'bar'];

    function spanify(rf: RenderFlags, ctx: {message: string | null}) {
      const message = ctx.message;
      if (rf & RenderFlags.Create) {
        ɵɵelementStart(0, 'span');
        { ɵɵtext(1); }
        ɵɵelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ɵɵselect(1);
        ɵɵtextBinding(message);
      }
    }

    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelementStart(0, 'div');
        {
          ɵɵtext(1, 'Before');
          ɵɵcontainer(2);
          ɵɵcontainer(3);
          ɵɵtext(4, 'After');
        }
        ɵɵelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(2);
        {
          let rf0 = ɵɵembeddedViewStart(0, 2, 1);
          { spanify(rf0, {message: data[0]}); }
          ɵɵembeddedViewEnd();
        }
        ɵɵcontainerRefreshEnd();
        ɵɵcontainerRefreshStart(3);
        {
          let rf0 = ɵɵembeddedViewStart(0, 2, 1);
          { spanify(rf0, {message: data[1]}); }
          ɵɵembeddedViewEnd();
        }
        ɵɵcontainerRefreshEnd();
      }
    }, 5);

    const fixture = new ComponentFixture(App);
    expect(fixture.html).toEqual('<div>Before<span>foo</span><span>bar</span>After</div>');

    data = [];
    fixture.update();
    expect(fixture.html).toEqual('<div>Before<span></span><span></span>After</div>');

  });
});
