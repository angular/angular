/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter} from '@angular/core';

import {ɵɵdefineComponent, ɵɵdefineDirective} from '../../src/render3/index';
import {ɵɵcontainer, ɵɵcontainerRefreshEnd, ɵɵcontainerRefreshStart, ɵɵelementEnd, ɵɵelementStart, ɵɵembeddedViewEnd, ɵɵembeddedViewStart, ɵɵlistener, ɵɵtext} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';

import {renderToHtml} from './render_util';

describe('outputs', () => {
  let buttonToggle: ButtonToggle;

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


  const deps = [ButtonToggle, OtherDir];

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
