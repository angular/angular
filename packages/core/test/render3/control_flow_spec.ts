/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bind, container, containerRefreshEnd, containerRefreshStart, elementEnd, elementStart, embeddedViewEnd, embeddedViewStart, text, textBinding} from '../../src/render3/instructions';

import {renderToHtml} from './render_util';

describe('JS control flow', () => {
  it('should work with if block', () => {
    const ctx: {message: string | null, condition: boolean} = {message: 'Hello', condition: true};

    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'div');
        { container(1); }
        elementEnd();
      }
      containerRefreshStart(1);
      {
        if (ctx.condition) {
          let cm1 = embeddedViewStart(1);
          {
            if (cm1) {
              elementStart(0, 'span');
              { text(1); }
              elementEnd();
            }
            textBinding(1, bind(ctx.message));
          }
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
    }

    expect(renderToHtml(Template, ctx)).toEqual('<div><span>Hello</span></div>');

    ctx.condition = false;
    ctx.message = 'Hi!';
    expect(renderToHtml(Template, ctx)).toEqual('<div></div>');

    ctx.condition = true;
    expect(renderToHtml(Template, ctx)).toEqual('<div><span>Hi!</span></div>');
  });

  it('should work with nested if blocks', () => {
    const ctx: {condition: boolean, condition2: boolean} = {condition: true, condition2: true};

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
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'div');
        { container(1); }
        elementEnd();
      }
      containerRefreshStart(1);
      {
        if (ctx.condition) {
          let cm1 = embeddedViewStart(1);
          {
            if (cm1) {
              elementStart(0, 'span');
              { container(1); }
              elementEnd();
            }
            containerRefreshStart(1);
            {
              if (ctx.condition2) {
                let cm2 = embeddedViewStart(2);
                {
                  if (cm2) {
                    text(0, 'Hello');
                  }
                }
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
          }
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
    }

    expect(renderToHtml(Template, ctx)).toEqual('<div><span>Hello</span></div>');

    ctx.condition = false;
    expect(renderToHtml(Template, ctx)).toEqual('<div></div>');

    ctx.condition = true;
    expect(renderToHtml(Template, ctx)).toEqual('<div><span>Hello</span></div>');

    ctx.condition2 = false;
    expect(renderToHtml(Template, ctx)).toEqual('<div><span></span></div>');

    ctx.condition2 = true;
    expect(renderToHtml(Template, ctx)).toEqual('<div><span>Hello</span></div>');

    ctx.condition2 = false;
    expect(renderToHtml(Template, ctx)).toEqual('<div><span></span></div>');

    ctx.condition = false;
    expect(renderToHtml(Template, ctx)).toEqual('<div></div>');

    ctx.condition = true;
    expect(renderToHtml(Template, ctx)).toEqual('<div><span></span></div>');

    ctx.condition2 = true;
    expect(renderToHtml(Template, ctx)).toEqual('<div><span>Hello</span></div>');
  });

  it('should work with containers with views as parents', () => {
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'div');
        { text(1, 'hello'); }
        elementEnd();
        container(2);
      }
      containerRefreshStart(2);
      {
        if (ctx.condition1) {
          let cm0 = embeddedViewStart(0);
          {
            if (cm0) {
              container(0);
            }
            containerRefreshStart(0);
            {
              if (ctx.condition2) {
                let cm0 = embeddedViewStart(0);
                {
                  if (cm0) {
                    text(0, 'world');
                  }
                }
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
          }
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
    }

    expect(renderToHtml(Template, {condition1: true, condition2: true}))
        .toEqual('<div>hello</div>world');
    expect(renderToHtml(Template, {condition1: false, condition2: false}))
        .toEqual('<div>hello</div>');

  });

  it('should work with loop block', () => {
    const ctx: {data: string[] | null} = {data: ['a', 'b', 'c']};

    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'ul');
        { container(1); }
        elementEnd();
      }
      containerRefreshStart(1);
      {
        for (let i = 0; i < ctx.data.length; i++) {
          let cm1 = embeddedViewStart(1);
          {
            if (cm1) {
              elementStart(0, 'li');
              { text(1); }
              elementEnd();
            }
            textBinding(1, bind(ctx.data[i]));
          }
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
    }

    expect(renderToHtml(Template, ctx)).toEqual('<ul><li>a</li><li>b</li><li>c</li></ul>');

    ctx.data = ['e', 'f'];
    expect(renderToHtml(Template, ctx)).toEqual('<ul><li>e</li><li>f</li></ul>');

    ctx.data = [];
    expect(renderToHtml(Template, ctx)).toEqual('<ul></ul>');

    ctx.data = ['a', 'b', 'c'];
    expect(renderToHtml(Template, ctx)).toEqual('<ul><li>a</li><li>b</li><li>c</li></ul>');

    ctx.data.push('d');
    expect(renderToHtml(Template, ctx))
        .toEqual('<ul><li>a</li><li>b</li><li>c</li><li>d</li></ul>');

    ctx.data = ['e'];
    expect(renderToHtml(Template, ctx)).toEqual('<ul><li>e</li></ul>');
  });

  it('should work with nested loop blocks', () => {
    const ctx: {data: string[][] | null} = {data: [['a', 'b', 'c'], ['m', 'n']]};

    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'ul');
        { container(1); }
        elementEnd();
      }
      containerRefreshStart(1);
      {
        for (let i = 0; i < ctx.data[0].length; i++) {
          let cm1 = embeddedViewStart(1);
          {
            if (cm1) {
              elementStart(0, 'li');
              { container(1); }
              elementEnd();
            }
            containerRefreshStart(1);
            {
              ctx.data[1].forEach((value: string, ind: number) => {
                if (embeddedViewStart(2)) {
                  text(0);
                }
                textBinding(0, bind(ctx.data[0][i] + value));
                embeddedViewEnd();
              });
            }
            containerRefreshEnd();
          }
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
    }

    expect(renderToHtml(Template, ctx)).toEqual('<ul><li>aman</li><li>bmbn</li><li>cmcn</li></ul>');

    ctx.data = [[], []];
    expect(renderToHtml(Template, ctx)).toEqual('<ul></ul>');
  });

  it('should work with nested loop blocks where nested container is a root node', () => {

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
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'div');
        {
          text(1, 'Before');
          container(2);
          text(3, 'After');
        }
        elementEnd();
      }
      containerRefreshStart(2);
      {
        for (let i = 0; i < ctx.cafes.length; i++) {
          let cm1 = embeddedViewStart(1);
          {
            if (cm1) {
              elementStart(0, 'h2');
              { text(1); }
              elementEnd();
              container(2);
              text(3, '-');
            }
            textBinding(1, bind(ctx.cafes[i].name));
            containerRefreshStart(2);
            {
              for (let j = 0; j < ctx.cafes[i].entrees.length; j++) {
                if (embeddedViewStart(1)) {
                  text(0);
                }
                textBinding(0, bind(ctx.cafes[i].entrees[j]));
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
          }
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
    }

    const ctx = {
      cafes: [
        {name: '1', entrees: ['a', 'b', 'c']}, {name: '2', entrees: ['d', 'e', 'f']},
        {name: '3', entrees: ['g', 'h', 'i']}
      ]
    };

    expect(renderToHtml(Template, ctx))
        .toEqual('<div>Before<h2>1</h2>abc-<h2>2</h2>def-<h2>3</h2>ghi-After</div>');

    ctx.cafes = [];
    expect(renderToHtml(Template, ctx)).toEqual('<div>BeforeAfter</div>');

    ctx.cafes = [
      {name: '1', entrees: ['a', 'c']},
      {name: '2', entrees: ['d', 'e']},
    ];
    expect(renderToHtml(Template, ctx)).toEqual('<div>Before<h2>1</h2>ac-<h2>2</h2>de-After</div>');

  });

  it('should work with loop blocks nested three deep', () => {

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
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'div');
        {
          text(1, 'Before');
          container(2);
          text(3, 'After');
        }
        elementEnd();
      }
      containerRefreshStart(2);
      {
        for (let i = 0; i < ctx.cafes.length; i++) {
          let cm1 = embeddedViewStart(1);
          {
            if (cm1) {
              elementStart(0, 'h2');
              { text(1); }
              elementEnd();
              container(2);
              text(3, '-');
            }
            textBinding(1, bind(ctx.cafes[i].name));
            containerRefreshStart(2);
            {
              for (let j = 0; j < ctx.cafes[i].entrees.length; j++) {
                let cm1 = embeddedViewStart(1);
                {
                  if (cm1) {
                    elementStart(0, 'h3');
                    { text(1); }
                    elementEnd();
                    container(2);
                  }
                  textBinding(1, bind(ctx.cafes[i].entrees[j].name));
                  containerRefreshStart(2);
                  {
                    for (let k = 0; k < ctx.cafes[i].entrees[j].foods.length; k++) {
                      if (embeddedViewStart(1)) {
                        text(0);
                      }
                      textBinding(0, bind(ctx.cafes[i].entrees[j].foods[k]));
                      embeddedViewEnd();
                    }
                  }
                  containerRefreshEnd();
                }
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
          }
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
    }

    const ctx = {
      cafes: [
        {
          name: '1',
          entrees:
              [{name: 'a', foods: [1, 2]}, {name: 'b', foods: [3, 4]}, {name: 'c', foods: [5, 6]}]
        },
        {
          name: '2',
          entrees: [
            {name: 'd', foods: [1, 2]}, {name: 'e', foods: [3, 4]}, {name: 'f', foods: [5, 6]}
          ]
        }
      ]
    };

    expect(renderToHtml(Template, ctx))
        .toEqual(
            '<div>' +
            'Before' +
            '<h2>1</h2><h3>a</h3>12<h3>b</h3>34<h3>c</h3>56-' +
            '<h2>2</h2><h3>d</h3>12<h3>e</h3>34<h3>f</h3>56-' +
            'After' +
            '</div>');

    ctx.cafes = [];
    expect(renderToHtml(Template, ctx)).toEqual('<div>BeforeAfter</div>');
  });

  it('should work with if/else blocks', () => {
    const ctx: {message: string | null, condition: boolean} = {message: 'Hello', condition: true};

    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'div');
        { container(1); }
        elementEnd();
      }
      containerRefreshStart(1);
      {
        if (ctx.condition) {
          let cm1 = embeddedViewStart(1);
          {
            if (cm1) {
              elementStart(0, 'span');
              { text(1, 'Hello'); }
              elementEnd();
            }
          }
          embeddedViewEnd();
        } else {
          let cm2 = embeddedViewStart(2);
          {
            if (cm2) {
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

    expect(renderToHtml(Template, ctx)).toEqual('<div><span>Hello</span></div>');

    ctx.condition = false;
    expect(renderToHtml(Template, ctx)).toEqual('<div><div>Goodbye</div></div>');

    ctx.condition = true;
    expect(renderToHtml(Template, ctx)).toEqual('<div><span>Hello</span></div>');
  });
});

describe('JS for loop', () => {
  it('should work with sibling for blocks', () => {
    const ctx: {data1: string[] | null,
                data2: number[] | null} = {data1: ['a', 'b', 'c'], data2: [1, 2]};

    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'div');
        { container(1); }
        elementEnd();
      }
      containerRefreshStart(1);
      {
        for (let i = 0; i < ctx.data1.length; i++) {
          if (embeddedViewStart(1)) {
            text(0);
          }
          textBinding(0, bind(ctx.data1[i]));
          embeddedViewEnd();
        }
        for (let j = 0; j < ctx.data2.length; j++) {
          if (embeddedViewStart(2)) {
            text(0);
          }
          textBinding(0, bind(ctx.data2[j]));
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
    }

    expect(renderToHtml(Template, ctx)).toEqual('<div>abc12</div>');

    ctx.data1 = ['e', 'f'];
    expect(renderToHtml(Template, ctx)).toEqual('<div>ef12</div>');

    ctx.data2 = [8];
    expect(renderToHtml(Template, ctx)).toEqual('<div>ef8</div>');

    ctx.data1 = ['x', 'y'];
    expect(renderToHtml(Template, ctx)).toEqual('<div>xy8</div>');
  });
});

describe('function calls', () => {
  it('should work', () => {
    const ctx: {data: string[]} = {data: ['foo', 'bar']};

    function spanify(ctx: {message: string | null}, cm: boolean) {
      const message = ctx.message;
      if (cm) {
        elementStart(0, 'span');
        { text(1); }
        elementEnd();
      }
      textBinding(1, bind(message));
    }

    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'div');
        {
          text(1, 'Before');
          container(2);
          container(3);
          text(4, 'After');
        }
        elementEnd();
      }
      containerRefreshStart(2);
      {
        let cm0 = embeddedViewStart(0);
        { spanify({message: ctx.data[0]}, cm0); }
        embeddedViewEnd();
      }
      containerRefreshEnd();
      containerRefreshStart(3);
      {
        let cm0 = embeddedViewStart(0);
        { spanify({message: ctx.data[1]}, cm0); }
        embeddedViewEnd();
      }
      containerRefreshEnd();
    }

    expect(renderToHtml(Template, ctx))
        .toEqual('<div>Before<span>foo</span><span>bar</span>After</div>');

    ctx.data = [];
    expect(renderToHtml(Template, ctx)).toEqual('<div>Before<span></span><span></span>After</div>');

  });
});
