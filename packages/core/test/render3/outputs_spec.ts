/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter} from '@angular/core';

import {defineComponent, defineDirective} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, directiveRefresh, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, listener, text} from '../../src/render3/instructions';

import {containerEl, renderToHtml} from './render_util';

describe('outputs', () => {
  let buttonToggle: ButtonToggle;

  class ButtonToggle {
    change = new EventEmitter();
    resetStream = new EventEmitter();

    static ngComponentDef = defineComponent({
      type: ButtonToggle,
      tag: 'button-toggle',
      template: function(ctx: any, cm: boolean) {},
      factory: () => buttonToggle = new ButtonToggle(),
      outputs: {change: 'change', resetStream: 'reset'}
    });
  }

  let otherDir: OtherDir;

  class OtherDir {
    changeStream = new EventEmitter();

    static ngDirectiveDef = defineDirective({
      type: OtherDir,
      factory: () => otherDir = new OtherDir,
      outputs: {changeStream: 'change'}
    });
  }

  it('should call component output function when event is emitted', () => {
    /** <button-toggle (change)="onChange()"></button-toggle> */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, ButtonToggle);
        {
          listener('change', function() { ctx.onChange(); });
        }
        elementEnd();
      }
      ButtonToggle.ngComponentDef.h(1, 0);
      directiveRefresh(1, 0);
    }

    let counter = 0;
    const ctx = {onChange: () => counter++};
    renderToHtml(Template, ctx);

    buttonToggle !.change.next();
    expect(counter).toEqual(1);

    buttonToggle !.change.next();
    expect(counter).toEqual(2);
  });

  it('should support more than 1 output function on the same node', () => {
    /** <button-toggle (change)="onChange()" (reset)="onReset()"></button-toggle> */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, ButtonToggle);
        {
          listener('change', function() { ctx.onChange(); });
          listener('reset', function() { ctx.onReset(); });
        }
        elementEnd();
      }
      ButtonToggle.ngComponentDef.h(1, 0);
      directiveRefresh(1, 0);
    }

    let counter = 0;
    let resetCounter = 0;
    const ctx = {onChange: () => counter++, onReset: () => resetCounter++};
    renderToHtml(Template, ctx);

    buttonToggle !.change.next();
    expect(counter).toEqual(1);

    buttonToggle !.resetStream.next();
    expect(resetCounter).toEqual(1);
  });

  it('should eval component output expression when event is emitted', () => {
    /** <button-toggle (change)="counter++"></button-toggle> */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, ButtonToggle);
        {
          listener('change', function() { ctx.counter++; });
        }
        elementEnd();
      }
      ButtonToggle.ngComponentDef.h(1, 0);
      directiveRefresh(1, 0);
    }

    const ctx = {counter: 0};
    renderToHtml(Template, ctx);

    buttonToggle !.change.next();
    expect(ctx.counter).toEqual(1);

    buttonToggle !.change.next();
    expect(ctx.counter).toEqual(2);
  });

  it('should unsubscribe from output when view is destroyed', () => {

    /**
     * % if (condition) {
     *   <button-toggle (change)="onChange()"></button-toggle>
     * % }
     */

    function Template(ctx: any, cm: boolean) {
      if (cm) {
        container(0);
      }
      containerRefreshStart(0);
      {
        if (ctx.condition) {
          if (embeddedViewStart(0)) {
            elementStart(0, ButtonToggle);
            {
              listener('change', function() { ctx.onChange(); });
            }
            elementEnd();
          }
          ButtonToggle.ngComponentDef.h(1, 0);
          directiveRefresh(1, 0);
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
    }

    let counter = 0;
    const ctx = {onChange: () => counter++, condition: true};
    renderToHtml(Template, ctx);

    buttonToggle !.change.next();
    expect(counter).toEqual(1);

    ctx.condition = false;
    renderToHtml(Template, ctx);

    buttonToggle !.change.next();
    expect(counter).toEqual(1);
  });

  it('should unsubscribe from output in nested view', () => {

    /**
     * % if (condition) {
     *   % if (condition2) {
     *     <button-toggle (change)="onChange()"></button-toggle>
     *   % }
     * % }
     */

    function Template(ctx: any, cm: boolean) {
      if (cm) {
        container(0);
      }
      containerRefreshStart(0);
      {
        if (ctx.condition) {
          if (embeddedViewStart(0)) {
            container(0);
          }
          containerRefreshStart(0);
          {
            if (ctx.condition2) {
              if (embeddedViewStart(0)) {
                elementStart(0, ButtonToggle);
                {
                  listener('change', function() { ctx.onChange(); });
                }
                elementEnd();
              }
              ButtonToggle.ngComponentDef.h(1, 0);
              directiveRefresh(1, 0);
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
    }

    let counter = 0;
    const ctx = {onChange: () => counter++, condition: true, condition2: true};
    renderToHtml(Template, ctx);

    buttonToggle !.change.next();
    expect(counter).toEqual(1);

    ctx.condition = false;
    renderToHtml(Template, ctx);

    buttonToggle !.change.next();
    expect(counter).toEqual(1);
  });

  it('should work properly when view also has listeners and destroys', () => {
    let destroyComp: DestroyComp;

    class DestroyComp {
      events: string[] = [];
      ngOnDestroy() { this.events.push('destroy'); }

      static ngComponentDef = defineComponent({
        type: DestroyComp,
        tag: 'destroy-comp',
        template: function(ctx: any, cm: boolean) {},
        factory: () => destroyComp = new DestroyComp()
      });
    }

    /**
     * % if (condition) {
     *   <button (click)="onClick()">Click me</button>
     *   <button-toggle (change)="onChange()"></button-toggle>
     *   <destroy-comp></destroy-comp>
     * % }
     */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        container(0);
      }
      containerRefreshStart(0);
      {
        if (ctx.condition) {
          if (embeddedViewStart(0)) {
            elementStart(0, 'button');
            {
              listener('click', function() { ctx.onClick(); });
              text(1, 'Click me');
            }
            elementEnd();
            elementStart(2, ButtonToggle);
            {
              listener('change', function() { ctx.onChange(); });
            }
            elementEnd();
            elementStart(4, DestroyComp);
            elementEnd();
          }
          ButtonToggle.ngComponentDef.h(3, 2);
          DestroyComp.ngComponentDef.h(5, 4);
          directiveRefresh(3, 2);
          directiveRefresh(5, 4);
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
    }

    let clickCounter = 0;
    let changeCounter = 0;
    const ctx = {condition: true, onChange: () => changeCounter++, onClick: () => clickCounter++};
    renderToHtml(Template, ctx);

    buttonToggle !.change.next();
    expect(changeCounter).toEqual(1);
    expect(clickCounter).toEqual(0);

    const button = containerEl.querySelector('button');
    button !.click();
    expect(changeCounter).toEqual(1);
    expect(clickCounter).toEqual(1);

    ctx.condition = false;
    renderToHtml(Template, ctx);

    expect(destroyComp !.events).toEqual(['destroy']);

    buttonToggle !.change.next();
    button !.click();
    expect(changeCounter).toEqual(1);
    expect(clickCounter).toEqual(1);
  });

  it('should fire event listeners along with outputs if they match', () => {
    let buttonDir: MyButton;

    /** <button myButton (click)="onClick()">Click me</button> */
    class MyButton {
      click = new EventEmitter();

      static ngDirectiveDef = defineDirective(
          {type: MyButton, factory: () => buttonDir = new MyButton, outputs: {click: 'click'}});
    }

    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'button', null, [MyButton]);
        {
          listener('click', function() { ctx.onClick(); });
        }
        elementEnd();
      }
    }

    let counter = 0;
    renderToHtml(Template, {counter, onClick: () => counter++});

    // To match current Angular behavior, the click listener is still
    // set up in addition to any matching outputs.
    const button = containerEl.querySelector('button') !;
    button.click();
    expect(counter).toEqual(1);

    buttonDir !.click.next();
    expect(counter).toEqual(2);
  });

  it('should work with two outputs of the same name', () => {
    /** <button-toggle (change)="onChange()" otherDir></button-toggle> */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, ButtonToggle, null, [OtherDir]);
        {
          listener('change', function() { ctx.onChange(); });
        }
        elementEnd();
      }
      ButtonToggle.ngComponentDef.h(1, 0);
      directiveRefresh(1, 0);
    }

    let counter = 0;
    renderToHtml(Template, {counter, onChange: () => counter++});

    buttonToggle !.change.next();
    expect(counter).toEqual(1);

    otherDir !.changeStream.next();
    expect(counter).toEqual(2);
  });

  it('should work with an input and output of the same name', () => {
    let otherDir: OtherDir;

    class OtherDir {
      change: boolean;

      static ngDirectiveDef = defineDirective(
          {type: OtherDir, factory: () => otherDir = new OtherDir, inputs: {change: 'change'}});
    }

    /** <button-toggle (change)="onChange()" otherDir [change]="change"></button-toggle> */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, ButtonToggle, null, [OtherDir]);
        {
          listener('change', function() { ctx.onChange(); });
        }
        elementEnd();
      }
      elementProperty(0, 'change', bind(ctx.change));
      ButtonToggle.ngComponentDef.h(1, 0);
      directiveRefresh(1, 0);
    }

    let counter = 0;
    renderToHtml(Template, {counter, onChange: () => counter++, change: true});
    expect(otherDir !.change).toEqual(true);

    renderToHtml(Template, {counter, onChange: () => counter++, change: false});
    expect(otherDir !.change).toEqual(false);

    buttonToggle !.change.next();
    expect(counter).toEqual(1);
  });

  it('should work with outputs at same index in if block', () => {
    /**
     * <button (click)="onClick()">Click me</button>             // outputs: null
     * % if (condition) {
     *   <button-toggle (change)="onChange()"></button-toggle>   // outputs: {change: [0, 'change']}
     * % } else {
     *   <div otherDir (change)="onChange()"></div>             // outputs: {change: [0,
     * 'changeStream']}
     * % }
     */
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'button');
        {
          listener('click', function() { ctx.onClick(); });
          text(1, 'Click me');
        }
        elementEnd();
        container(2);
      }
      containerRefreshStart(2);
      {
        if (ctx.condition) {
          if (embeddedViewStart(0)) {
            elementStart(0, ButtonToggle);
            {
              listener('change', function() { ctx.onChange(); });
            }
            elementEnd();
          }
          ButtonToggle.ngComponentDef.h(1, 0);
          directiveRefresh(1, 0);
          embeddedViewEnd();
        } else {
          if (embeddedViewStart(1)) {
            elementStart(0, 'div', null, [OtherDir]);
            {
              listener('change', function() { ctx.onChange(); });
            }
            elementEnd();
          }
          embeddedViewEnd();
        }
      }
      containerRefreshEnd();
    }

    let counter = 0;
    const ctx = {condition: true, onChange: () => counter++, onClick: () => {}};
    renderToHtml(Template, ctx);

    buttonToggle !.change.next();
    expect(counter).toEqual(1);

    ctx.condition = false;
    renderToHtml(Template, ctx);
    expect(counter).toEqual(1);

    otherDir !.changeStream.next();
    expect(counter).toEqual(2);
  });

});
