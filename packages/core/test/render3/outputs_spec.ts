/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter} from '@angular/core';

import {defineComponent, defineDirective} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, element, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, listener, text} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';

import {containerEl, renderToHtml} from './render_util';

describe('outputs', () => {
  let buttonToggle: ButtonToggle;
  let destroyComp: DestroyComp;
  let buttonDir: MyButton;

  class ButtonToggle {
    change = new EventEmitter();
    resetStream = new EventEmitter();

    static ngComponentDef = defineComponent({
      type: ButtonToggle,
      selectors: [['button-toggle']],
      template: function(rf: RenderFlags, ctx: any) {},
      consts: 0,
      vars: 0,
      factory: () => buttonToggle = new ButtonToggle(),
      outputs: {change: 'change', resetStream: 'reset'}
    });
  }

  let otherDir: OtherDir;

  class OtherDir {
    changeStream = new EventEmitter();

    static ngDirectiveDef = defineDirective({
      type: OtherDir,
      selectors: [['', 'otherDir', '']],
      factory: () => otherDir = new OtherDir,
      outputs: {changeStream: 'change'}
    });
  }

  class DestroyComp {
    events: string[] = [];
    ngOnDestroy() { this.events.push('destroy'); }

    static ngComponentDef = defineComponent({
      type: DestroyComp,
      selectors: [['destroy-comp']],
      consts: 0,
      vars: 0,
      template: function(rf: RenderFlags, ctx: any) {},
      factory: () => destroyComp = new DestroyComp()
    });
  }

  /** <button myButton (click)="onClick()">Click me</button> */
  class MyButton {
    click = new EventEmitter();

    static ngDirectiveDef = defineDirective({
      type: MyButton,
      selectors: [['', 'myButton', '']],
      factory: () => buttonDir = new MyButton,
      outputs: {click: 'click'}
    });
  }


  const deps = [ButtonToggle, OtherDir, DestroyComp, MyButton];

  it('should call component output function when event is emitted', () => {
    /** <button-toggle (change)="onChange()"></button-toggle> */
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'button-toggle');
        {
          listener('change', function() { return ctx.onChange(); });
        }
        elementEnd();
      }
    }

    let counter = 0;
    const ctx = {onChange: () => counter++};
    renderToHtml(Template, ctx, 1, 0, deps);

    buttonToggle !.change.next();
    expect(counter).toEqual(1);

    buttonToggle !.change.next();
    expect(counter).toEqual(2);
  });

  it('should support more than 1 output function on the same node', () => {
    /** <button-toggle (change)="onChange()" (reset)="onReset()"></button-toggle> */
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'button-toggle');
        {
          listener('change', function() { return ctx.onChange(); });
          listener('reset', function() { return ctx.onReset(); });
        }
        elementEnd();
      }
    }

    let counter = 0;
    let resetCounter = 0;
    const ctx = {onChange: () => counter++, onReset: () => resetCounter++};
    renderToHtml(Template, ctx, 1, 0, deps);

    buttonToggle !.change.next();
    expect(counter).toEqual(1);

    buttonToggle !.resetStream.next();
    expect(resetCounter).toEqual(1);
  });

  it('should eval component output expression when event is emitted', () => {
    /** <button-toggle (change)="counter++"></button-toggle> */
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'button-toggle');
        {
          listener('change', function() { return ctx.counter++; });
        }
        elementEnd();
      }
    }

    const ctx = {counter: 0};
    renderToHtml(Template, ctx, 1, 0, deps);

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
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        container(0);
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(0);
        {
          if (ctx.condition) {
            let rf1 = embeddedViewStart(0, 1, 0);
            if (rf1 & RenderFlags.Create) {
              elementStart(0, 'button-toggle');
              {
                listener('change', function() { return ctx.onChange(); });
              }
              elementEnd();
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    }

    let counter = 0;
    const ctx = {onChange: () => counter++, condition: true};
    renderToHtml(Template, ctx, 1, 0, deps);

    buttonToggle !.change.next();
    expect(counter).toEqual(1);

    ctx.condition = false;
    renderToHtml(Template, ctx, 1, 0, deps);

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
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        container(0);
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(0);
        {
          if (ctx.condition) {
            let rf1 = embeddedViewStart(0, 1, 0);
            if (rf1 & RenderFlags.Create) {
              container(0);
            }
            containerRefreshStart(0);
            {
              if (ctx.condition2) {
                let rf1 = embeddedViewStart(0, 1, 0);
                if (rf1 & RenderFlags.Create) {
                  elementStart(0, 'button-toggle');
                  {
                    listener('change', function() { return ctx.onChange(); });
                  }
                  elementEnd();
                }
                embeddedViewEnd();
              }
            }
            containerRefreshEnd();
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    }

    let counter = 0;
    const ctx = {onChange: () => counter++, condition: true, condition2: true};
    renderToHtml(Template, ctx, 1, 0, deps);

    buttonToggle !.change.next();
    expect(counter).toEqual(1);

    ctx.condition = false;
    renderToHtml(Template, ctx, 1, 0, deps);

    buttonToggle !.change.next();
    expect(counter).toEqual(1);
  });

  it('should work properly when view also has listeners and destroys', () => {
    /**
     * % if (condition) {
     *   <button (click)="onClick()">Click me</button>
     *   <button-toggle (change)="onChange()"></button-toggle>
     *   <destroy-comp></destroy-comp>
     * % }
     */
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        container(0);
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(0);
        {
          if (ctx.condition) {
            let rf1 = embeddedViewStart(0, 4, 0);
            if (rf1 & RenderFlags.Create) {
              elementStart(0, 'button');
              {
                listener('click', function() { return ctx.onClick(); });
                text(1, 'Click me');
              }
              elementEnd();
              elementStart(2, 'button-toggle');
              {
                listener('change', function() { return ctx.onChange(); });
              }
              elementEnd();
              element(3, 'destroy-comp');
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    }

    let clickCounter = 0;
    let changeCounter = 0;
    const ctx = {condition: true, onChange: () => changeCounter++, onClick: () => clickCounter++};
    renderToHtml(Template, ctx, 1, 0, deps);

    buttonToggle !.change.next();
    expect(changeCounter).toEqual(1);
    expect(clickCounter).toEqual(0);

    const button = containerEl.querySelector('button');
    button !.click();
    expect(changeCounter).toEqual(1);
    expect(clickCounter).toEqual(1);

    ctx.condition = false;
    renderToHtml(Template, ctx, 1, 0, deps);

    expect(destroyComp !.events).toEqual(['destroy']);

    buttonToggle !.change.next();
    button !.click();
    expect(changeCounter).toEqual(1);
    expect(clickCounter).toEqual(1);
  });

  it('should fire event listeners along with outputs if they match', () => {
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'button', ['myButton', '']);
        {
          listener('click', function() { return ctx.onClick(); });
        }
        elementEnd();
      }
    }

    let counter = 0;
    renderToHtml(Template, {counter, onClick: () => counter++}, 1, 0, deps);

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
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'button-toggle', ['otherDir', '']);
        {
          listener('change', function() { return ctx.onChange(); });
        }
        elementEnd();
      }
    }

    let counter = 0;
    renderToHtml(Template, {counter, onChange: () => counter++}, 1, 0, deps);

    buttonToggle !.change.next();
    expect(counter).toEqual(1);

    otherDir !.changeStream.next();
    expect(counter).toEqual(2);
  });

  it('should work with an input and output of the same name', () => {
    let otherDir: OtherChangeDir;

    class OtherChangeDir {
      // TODO(issue/24571): remove '!'.
      change !: boolean;

      static ngDirectiveDef = defineDirective({
        type: OtherChangeDir,
        selectors: [['', 'otherChangeDir', '']],
        factory: () => otherDir = new OtherChangeDir,
        inputs: {change: 'change'}
      });
    }

    /** <button-toggle (change)="onChange()" otherChangeDir [change]="change"></button-toggle> */
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'button-toggle', ['otherChangeDir', '']);
        {
          listener('change', function() { return ctx.onChange(); });
        }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        elementProperty(0, 'change', bind(ctx.change));
      }
    }

    let counter = 0;
    const deps = [ButtonToggle, OtherChangeDir];
    renderToHtml(Template, {counter, onChange: () => counter++, change: true}, 1, 1, deps);
    expect(otherDir !.change).toEqual(true);

    renderToHtml(Template, {counter, onChange: () => counter++, change: false}, 1, 1, deps);
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
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'button');
        {
          listener('click', function() { return ctx.onClick(); });
          text(1, 'Click me');
        }
        elementEnd();
        container(2);
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(2);
        {
          if (ctx.condition) {
            let rf1 = embeddedViewStart(0, 1, 0);
            if (rf1 & RenderFlags.Create) {
              elementStart(0, 'button-toggle');
              {
                listener('change', function() { return ctx.onChange(); });
              }
              elementEnd();
            }
            embeddedViewEnd();
          } else {
            if (embeddedViewStart(1, 1, 0)) {
              elementStart(0, 'div', ['otherDir', '']);
              {
                listener('change', function() { return ctx.onChange(); });
              }
              elementEnd();
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    }

    let counter = 0;
    const ctx = {condition: true, onChange: () => counter++, onClick: () => {}};
    renderToHtml(Template, ctx, 3, 0, deps);

    buttonToggle !.change.next();
    expect(counter).toEqual(1);

    ctx.condition = false;
    renderToHtml(Template, ctx, 3, 0, deps);
    expect(counter).toEqual(1);

    otherDir !.changeStream.next();
    expect(counter).toEqual(2);
  });

});
