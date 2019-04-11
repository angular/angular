/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter} from '@angular/core';

import {ɵɵdefineComponent, ɵɵdefineDirective} from '../../src/render3/index';
import {ɵɵbind, ɵɵcontainer, ɵɵcontainerRefreshEnd, ɵɵcontainerRefreshStart, ɵɵelement, ɵɵelementEnd, ɵɵelementProperty, ɵɵelementStart, ɵɵembeddedViewEnd, ɵɵembeddedViewStart, ɵɵlistener, ɵɵtext} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';

import {containerEl, renderToHtml} from './render_util';

describe('outputs', () => {
  let buttonToggle: ButtonToggle;
  let destroyComp: DestroyComp;
  let buttonDir: MyButton;

  class ButtonToggle {
    change = new EventEmitter();
    resetStream = new EventEmitter();

    static ngComponentDef = ɵɵdefineComponent({
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

    static ngDirectiveDef = ɵɵdefineDirective({
      type: OtherDir,
      selectors: [['', 'otherDir', '']],
      factory: () => otherDir = new OtherDir,
      outputs: {changeStream: 'change'}
    });
  }

  class DestroyComp {
    events: string[] = [];
    ngOnDestroy() { this.events.push('destroy'); }

    static ngComponentDef = ɵɵdefineComponent({
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

    static ngDirectiveDef = ɵɵdefineDirective({
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
        ɵɵelementStart(0, 'button-toggle');
        {
          ɵɵlistener('change', function() { return ctx.onChange(); });
        }
        ɵɵelementEnd();
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
        ɵɵelementStart(0, 'button-toggle');
        {
          ɵɵlistener('change', function() { return ctx.onChange(); });
          ɵɵlistener('reset', function() { return ctx.onReset(); });
        }
        ɵɵelementEnd();
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
        ɵɵelementStart(0, 'button-toggle');
        {
          ɵɵlistener('change', function() { return ctx.counter++; });
        }
        ɵɵelementEnd();
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
        ɵɵcontainer(0);
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(0);
        {
          if (ctx.condition) {
            let rf1 = ɵɵembeddedViewStart(0, 1, 0);
            if (rf1 & RenderFlags.Create) {
              ɵɵelementStart(0, 'button-toggle');
              {
                ɵɵlistener('change', function() { return ctx.onChange(); });
              }
              ɵɵelementEnd();
            }
            ɵɵembeddedViewEnd();
          }
        }
        ɵɵcontainerRefreshEnd();
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
        ɵɵcontainer(0);
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(0);
        {
          if (ctx.condition) {
            let rf1 = ɵɵembeddedViewStart(0, 1, 0);
            if (rf1 & RenderFlags.Create) {
              ɵɵcontainer(0);
            }
            ɵɵcontainerRefreshStart(0);
            {
              if (ctx.condition2) {
                let rf1 = ɵɵembeddedViewStart(0, 1, 0);
                if (rf1 & RenderFlags.Create) {
                  ɵɵelementStart(0, 'button-toggle');
                  {
                    ɵɵlistener('change', function() { return ctx.onChange(); });
                  }
                  ɵɵelementEnd();
                }
                ɵɵembeddedViewEnd();
              }
            }
            ɵɵcontainerRefreshEnd();
            ɵɵembeddedViewEnd();
          }
        }
        ɵɵcontainerRefreshEnd();
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
        ɵɵcontainer(0);
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(0);
        {
          if (ctx.condition) {
            let rf1 = ɵɵembeddedViewStart(0, 4, 0);
            if (rf1 & RenderFlags.Create) {
              ɵɵelementStart(0, 'button');
              {
                ɵɵlistener('click', function() { return ctx.onClick(); });
                ɵɵtext(1, 'Click me');
              }
              ɵɵelementEnd();
              ɵɵelementStart(2, 'button-toggle');
              {
                ɵɵlistener('change', function() { return ctx.onChange(); });
              }
              ɵɵelementEnd();
              ɵɵelement(3, 'destroy-comp');
            }
            ɵɵembeddedViewEnd();
          }
        }
        ɵɵcontainerRefreshEnd();
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
        ɵɵelementStart(0, 'button', ['myButton', '']);
        {
          ɵɵlistener('click', function() { return ctx.onClick(); });
        }
        ɵɵelementEnd();
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
        ɵɵelementStart(0, 'button-toggle', ['otherDir', '']);
        {
          ɵɵlistener('change', function() { return ctx.onChange(); });
        }
        ɵɵelementEnd();
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

      static ngDirectiveDef = ɵɵdefineDirective({
        type: OtherChangeDir,
        selectors: [['', 'otherChangeDir', '']],
        factory: () => otherDir = new OtherChangeDir,
        inputs: {change: 'change'}
      });
    }

    /** <button-toggle (change)="onChange()" otherChangeDir [change]="change"></button-toggle> */
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelementStart(0, 'button-toggle', ['otherChangeDir', '']);
        {
          ɵɵlistener('change', function() { return ctx.onChange(); });
        }
        ɵɵelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ɵɵelementProperty(0, 'change', ɵɵbind(ctx.change));
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
        ɵɵelementStart(0, 'button');
        {
          ɵɵlistener('click', function() { return ctx.onClick(); });
          ɵɵtext(1, 'Click me');
        }
        ɵɵelementEnd();
        ɵɵcontainer(2);
      }
      if (rf & RenderFlags.Update) {
        ɵɵcontainerRefreshStart(2);
        {
          if (ctx.condition) {
            let rf1 = ɵɵembeddedViewStart(0, 1, 0);
            if (rf1 & RenderFlags.Create) {
              ɵɵelementStart(0, 'button-toggle');
              {
                ɵɵlistener('change', function() { return ctx.onChange(); });
              }
              ɵɵelementEnd();
            }
            ɵɵembeddedViewEnd();
          } else {
            if (ɵɵembeddedViewStart(1, 1, 0)) {
              ɵɵelementStart(0, 'div', ['otherDir', '']);
              {
                ɵɵlistener('change', function() { return ctx.onChange(); });
              }
              ɵɵelementEnd();
            }
            ɵɵembeddedViewEnd();
          }
        }
        ɵɵcontainerRefreshEnd();
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
