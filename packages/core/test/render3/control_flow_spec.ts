/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {defineComponent} from '../../src/render3/definition';
import {bind, container, containerRefreshEnd, containerRefreshStart, element, elementEnd, elementStart, embeddedViewEnd, embeddedViewStart, text, textBinding} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';

import {ComponentFixture, TemplateFixture, createComponent} from './render_util';

describe('JS control flow', () => {
  it('should work with if block', () => {
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'div');
        { container(1); }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(1);
        {
          if (ctx.condition) {
            let rf1 = embeddedViewStart(1, 2, 1);
            {
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'span');
                { text(1); }
                elementEnd();
              }
              if (rf1 & RenderFlags.Update) {
                textBinding(1, bind(ctx.message));
              }
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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
        elementStart(0, 'div');
        { container(1); }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(1);
        {
          if (ctx.condition) {
            let rf1 = embeddedViewStart(1, 2, 0);
            {
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'span');
                { container(1); }
                elementEnd();
              }
              if (rf1 & RenderFlags.Update) {
                containerRefreshStart(1);
                {
                  if (ctx.condition2) {
                    let rf2 = embeddedViewStart(2, 1, 0);
                    {
                      if (rf2 & RenderFlags.Create) {
                        text(0, 'Hello');
                      }
                    }
                    embeddedViewEnd();
                  }
                }
                containerRefreshEnd();
              }
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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
    function createTemplate() { container(0); }

    function updateTemplate() {
      containerRefreshStart(0);
      {
        if (ctx.condition) {
          let rf1 = embeddedViewStart(1, 2, 0);
          {
            if (rf1 & RenderFlags.Create) {
              { container(0); }
              { container(1); }
            }
            if (rf1 & RenderFlags.Update) {
              containerRefreshStart(0);
              {
                if (ctx.condition2) {
                  let rf2 = embeddedViewStart(2, 1, 0);
                  {
                    if (rf2 & RenderFlags.Create) {
                      text(0, 'Hello');
                    }
                  }
                  embeddedViewEnd();
                }
              }
              containerRefreshEnd();
              containerRefreshStart(1);
              {
                if (ctx.condition3) {
                  let rf2 = embeddedViewStart(2, 1, 0);
                  {
                    if (rf2 & RenderFlags.Create) {
                      text(0, 'World');
                    }
                  }
                  embeddedViewEnd();
                }
              }
              containerRefreshEnd();
            }
          }
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
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
        container(0);
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(0);
        if (ctx.condition1) {
          const rf1 = embeddedViewStart(1, 1, 0);
          if (rf1 & RenderFlags.Create) {
            text(0, '1');
          }
          embeddedViewEnd();
        }  // can't have ; here due linting rules
        if (ctx.condition2) {
          const rf2 = embeddedViewStart(2, 1, 0);
          if (rf2 & RenderFlags.Create) {
            text(0, '2');
          }
          embeddedViewEnd();
        }  // can't have ; here due linting rules
        if (ctx.condition3) {
          const rf3 = embeddedViewStart(3, 1, 0);
          if (rf3 & RenderFlags.Create) {
            text(0, '3');
          }
          embeddedViewEnd();
        }
        containerRefreshEnd();
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
        elementStart(0, 'div');
        { text(1, 'hello'); }
        elementEnd();
        container(2);
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(2);
        {
          if (ctx.condition1) {
            let rf0 = embeddedViewStart(0, 1, 0);
            {
              if (rf0 & RenderFlags.Create) {
                container(0);
              }
              if (rf0 & RenderFlags.Update) {
                containerRefreshStart(0);
                {
                  if (ctx.condition2) {
                    let rf0 = embeddedViewStart(0, 1, 0);
                    {
                      if (rf0 & RenderFlags.Create) {
                        text(0, 'world');
                      }
                    }
                    embeddedViewEnd();
                  }
                }
                containerRefreshEnd();
              }
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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
        elementStart(0, 'ul');
        { container(1); }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(1);
        {
          for (let i = 0; i < data.length; i++) {
            let rf1 = embeddedViewStart(1, 2, 1);
            {
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'li');
                { text(1); }
                elementEnd();
              }
              if (rf1 & RenderFlags.Update) {
                textBinding(1, bind(data[i]));
              }
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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
        elementStart(0, 'ul');
        { container(1); }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(1);
        {
          for (let i = 0; i < data[0].length; i++) {
            let rf1 = embeddedViewStart(1, 2, 0);
            {
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'li');
                { container(1); }
                elementEnd();
              }
              if (rf1 & RenderFlags.Update) {
                containerRefreshStart(1);
                {
                  data[1].forEach((value: string, ind: number) => {
                    let rf2 = embeddedViewStart(2, 1, 1);
                    if (rf2 & RenderFlags.Create) {
                      text(0);
                    }
                    if (rf2 & RenderFlags.Update) {
                      textBinding(0, bind(data[0][i] + value));
                    }
                    embeddedViewEnd();
                  });
                }
                containerRefreshEnd();
              }
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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
        elementStart(0, 'div');
        {
          text(1, 'Before');
          container(2);
          text(3, 'After');
        }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(2);
        {
          for (let i = 0; i < cafes.length; i++) {
            let rf1 = embeddedViewStart(1, 4, 1);
            {
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'h2');
                { text(1); }
                elementEnd();
                container(2);
                text(3, '-');
              }
              if (rf1 & RenderFlags.Update) {
                textBinding(1, bind(cafes[i].name));
                containerRefreshStart(2);
                {
                  for (let j = 0; j < cafes[i].entrees.length; j++) {
                    let rf2 = embeddedViewStart(2, 1, 1);
                    if (rf2 & RenderFlags.Create) {
                      text(0);
                    }
                    if (rf2 & RenderFlags.Update) {
                      textBinding(0, bind(cafes[i].entrees[j]));
                    }
                    embeddedViewEnd();
                  }
                }
                containerRefreshEnd();
              }
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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
        elementStart(0, 'div');
        {
          text(1, 'Before');
          container(2);
          text(3, 'After');
        }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(2);
        {
          for (let i = 0; i < cafes.length; i++) {
            let rf1 = embeddedViewStart(1, 4, 1);
            {
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'h2');
                { text(1); }
                elementEnd();
                container(2);
                text(3, '-');
              }
              if (rf1 & RenderFlags.Update) {
                textBinding(1, bind(cafes[i].name));
                containerRefreshStart(2);
                {
                  for (let j = 0; j < cafes[i].entrees.length; j++) {
                    let rf1 = embeddedViewStart(1, 3, 1);
                    {
                      if (rf1 & RenderFlags.Create) {
                        elementStart(0, 'h3');
                        { text(1); }
                        elementEnd();
                        container(2);
                      }
                      if (rf1 & RenderFlags.Update) {
                        textBinding(1, bind(cafes[i].entrees[j].name));
                        containerRefreshStart(2);
                        {
                          for (let k = 0; k < cafes[i].entrees[j].foods.length; k++) {
                            let rf2 = embeddedViewStart(1, 1, 1);
                            if (rf2 & RenderFlags.Create) {
                              text(0);
                            }
                            if (rf2 & RenderFlags.Update) {
                              textBinding(0, bind(cafes[i].entrees[j].foods[k]));
                            }
                            embeddedViewEnd();
                          }
                        }
                        containerRefreshEnd();
                      }
                    }
                    embeddedViewEnd();
                  }
                }
                containerRefreshEnd();
              }
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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
        elementStart(0, 'div');
        { container(1); }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(1);
        {
          if (ctx.condition) {
            let rf1 = embeddedViewStart(1, 2, 0);
            {
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'span');
                { text(1, 'Hello'); }
                elementEnd();
              }
            }
            embeddedViewEnd();
          } else {
            let rf2 = embeddedViewStart(2, 2, 0);
            {
              if (rf2) {
                elementStart(0, 'div');
                { text(1, 'Goodbye'); }
                elementEnd();
              }
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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
      static ngComponentDef = defineComponent({
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

      static ngComponentDef = defineComponent({
        type: App,
        selectors: [['app']],
        factory: () => new App(),
        consts: 3,
        vars: 0,
        template: function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'div');
            container(1);
            container(2);
          }
          if (rf & RenderFlags.Update) {
            containerRefreshStart(1);
            {
              if (ctx.condition) {
                let rf1 = embeddedViewStart(0, 1, 0);
                if (rf1 & RenderFlags.Create) {
                  element(0, 'comp');
                }
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
            containerRefreshStart(2);
            {
              if (ctx.condition2) {
                let rf1 = embeddedViewStart(0, 1, 0);
                if (rf1 & RenderFlags.Create) {
                  element(0, 'comp');
                }
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
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
      static ngComponentDef = defineComponent({
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

      static ngComponentDef = defineComponent({
        type: App,
        selectors: [['app']],
        factory: () => new App(),
        consts: 3,
        vars: 0,
        template: function(rf: RenderFlags, ctx: any) {
          if (rf & RenderFlags.Create) {
            element(0, 'div');
            container(1);
            container(2);
          }
          if (rf & RenderFlags.Update) {
            containerRefreshStart(1);
            {
              if (ctx.condition) {
                let rf1 = embeddedViewStart(0, 1, 0);
                if (rf1 & RenderFlags.Create) {
                  element(0, 'comp');
                }
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
            containerRefreshStart(2);
            {
              if (ctx.condition2) {
                let rf1 = embeddedViewStart(0, 1, 0);
                if (rf1 & RenderFlags.Create) {
                  element(0, 'comp');
                }
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
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
        elementStart(0, 'div');
        { container(1); }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(1);
        {
          for (let i = 0; i < config.data1.length; i++) {
            let rf2 = embeddedViewStart(1, 1, 1);
            if (rf2 & RenderFlags.Create) {
              text(0);
            }
            if (rf2 & RenderFlags.Update) {
              textBinding(0, bind(config.data1[i]));
            }
            embeddedViewEnd();
          }
          for (let j = 0; j < config.data2.length; j++) {
            let rf2 = embeddedViewStart(1, 1, 1);
            if (rf2 & RenderFlags.Create) {
              text(0);
            }
            if (rf2 & RenderFlags.Update) {
              textBinding(0, bind(config.data2[j]));
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
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
        elementStart(0, 'span');
        { text(1); }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        textBinding(1, bind(message));
      }
    }

    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'div');
        {
          text(1, 'Before');
          container(2);
          container(3);
          text(4, 'After');
        }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(2);
        {
          let rf0 = embeddedViewStart(0, 2, 1);
          { spanify(rf0, {message: data[0]}); }
          embeddedViewEnd();
        }
        containerRefreshEnd();
        containerRefreshStart(3);
        {
          let rf0 = embeddedViewStart(0, 2, 1);
          { spanify(rf0, {message: data[1]}); }
          embeddedViewEnd();
        }
        containerRefreshEnd();
      }
    }, 5);

    const fixture = new ComponentFixture(App);
    expect(fixture.html).toEqual('<div>Before<span>foo</span><span>bar</span>After</div>');

    data = [];
    fixture.update();
    expect(fixture.html).toEqual('<div>Before<span></span><span></span>After</div>');

  });
});
