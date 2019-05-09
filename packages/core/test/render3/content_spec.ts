/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SelectorFlags} from '@angular/core/src/render3/interfaces/projection';

import {AttributeMarker, detectChanges} from '../../src/render3/index';
import {Δcontainer, ΔcontainerRefreshEnd, ΔcontainerRefreshStart, Δelement, ΔelementContainerEnd, ΔelementContainerStart, ΔelementEnd, ΔelementStart, ΔembeddedViewEnd, ΔembeddedViewStart, Δprojection, ΔprojectionDef, Δtext} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {ComponentFixture, createComponent, getDirectiveOnNode, renderComponent, toHtml} from './render_util';

describe('content projection', () => {
  it('should project containers', () => {
    /** <div><ng-content></ng-content></div> */
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔprojectionDef();
        ΔelementStart(0, 'div');
        { Δprojection(1); }
        ΔelementEnd();
      }
    }, 2);

    /**
     * <child>
     *     (
     *      % if (value) {
     *        content
     *      % }
     *     )
     * </child>
     */
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: {value: any}) {
      if (rf & RenderFlags.Create) {
        ΔelementStart(0, 'child');
        {
          Δtext(1, '(');
          Δcontainer(2);
          Δtext(3, ')');
        }
        ΔelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ΔcontainerRefreshStart(2);
        {
          if (ctx.value) {
            let rf0 = ΔembeddedViewStart(0, 1, 0);
            if (rf0 & RenderFlags.Create) {
              Δtext(0, 'content');
            }
            ΔembeddedViewEnd();
          }
        }
        ΔcontainerRefreshEnd();
      }
    }, 4, 0, [Child]);

    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child><div>()</div></child>');
    parent.value = true;
    detectChanges(parent);

    expect(toHtml(parent)).toEqual('<child><div>(content)</div></child>');
    parent.value = false;
    detectChanges(parent);

    expect(toHtml(parent)).toEqual('<child><div>()</div></child>');
  });

  it('should project containers into root', () => {
    /** <ng-content></ng-content> */
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔprojectionDef();
        Δprojection(0);
      }
    }, 1);

    /**
     * <child>
     *    % if (value) {
     *      content
     *    % }
     * </child>
     */
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: {value: any}) {
      if (rf & RenderFlags.Create) {
        ΔelementStart(0, 'child');
        { Δcontainer(1); }
        ΔelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ΔcontainerRefreshStart(1);
        {
          if (ctx.value) {
            let rf0 = ΔembeddedViewStart(0, 1, 0);
            if (rf0 & RenderFlags.Create) {
              Δtext(0, 'content');
            }
            ΔembeddedViewEnd();
          }
        }
        ΔcontainerRefreshEnd();
      }
    }, 2, 0, [Child]);

    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child></child>');

    parent.value = true;
    detectChanges(parent);
    expect(toHtml(parent)).toEqual('<child>content</child>');

    parent.value = false;
    detectChanges(parent);
    expect(toHtml(parent)).toEqual('<child></child>');
  });

  it('should project containers with if-else.', () => {
    /** <div><ng-content></ng-content></div> */
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔprojectionDef();
        ΔelementStart(0, 'div');
        { Δprojection(1); }
        ΔelementEnd();
      }
    }, 2);

    /**
     * <child>
     *     (
     *       % if (value) {
     *         content
     *       % } else {
     *         else
     *       % }
     *     )
     * </child>
     */
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: {value: any}) {
      if (rf & RenderFlags.Create) {
        ΔelementStart(0, 'child');
        {
          Δtext(1, '(');
          Δcontainer(2);
          Δtext(3, ')');
        }
        ΔelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ΔcontainerRefreshStart(2);
        {
          if (ctx.value) {
            let rf0 = ΔembeddedViewStart(0, 1, 0);
            if (rf0 & RenderFlags.Create) {
              Δtext(0, 'content');
            }
            ΔembeddedViewEnd();
          } else {
            if (ΔembeddedViewStart(1, 1, 0)) {
              Δtext(0, 'else');
            }
            ΔembeddedViewEnd();
          }
        }
        ΔcontainerRefreshEnd();
      }
    }, 4, 0, [Child]);

    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child><div>(else)</div></child>');
    parent.value = true;
    detectChanges(parent);
    expect(toHtml(parent)).toEqual('<child><div>(content)</div></child>');
    parent.value = false;
    detectChanges(parent);
    expect(toHtml(parent)).toEqual('<child><div>(else)</div></child>');
  });

  it('should support projection into embedded views', () => {
    let childCmptInstance: any;

    /**
     * <div>
     *  % if (!skipContent) {
     *    <span>
     *      <ng-content></ng-content>
     *    </span>
     *  % }
     * </div>
     */
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔprojectionDef();
        ΔelementStart(0, 'div');
        { Δcontainer(1); }
        ΔelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ΔcontainerRefreshStart(1);
        {
          if (!ctx.skipContent) {
            let rf0 = ΔembeddedViewStart(0, 2, 0);
            if (rf0 & RenderFlags.Create) {
              ΔelementStart(0, 'span');
              Δprojection(1);
              ΔelementEnd();
            }
            ΔembeddedViewEnd();
          }
        }
        ΔcontainerRefreshEnd();
      }
    }, 2, 0);

    /**
     * <child>
     *   <div>text</div>
     *   content
     * </child>
     */
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔelementStart(0, 'child');
        {
          ΔelementStart(1, 'div');
          { Δtext(2, 'text'); }
          ΔelementEnd();
          Δtext(3, 'content');
        }
        ΔelementEnd();

        // testing
        childCmptInstance = getDirectiveOnNode(0);
      }
    }, 4, 0, [Child]);

    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child><div><span><div>text</div>content</span></div></child>');

    childCmptInstance.skipContent = true;
    detectChanges(parent);
    expect(toHtml(parent)).toEqual('<child><div></div></child>');
  });

  it('should support projection into embedded views when no projected nodes', () => {
    let childCmptInstance: any;

    /**
     * <div>
     *  % if (!skipContent) {
     *      <ng-content></ng-content>
     *      text
     *  % }
     * </div>
     */
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔprojectionDef();
        ΔelementStart(0, 'div');
        { Δcontainer(1); }
        ΔelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ΔcontainerRefreshStart(1);
        {
          if (!ctx.skipContent) {
            let rf0 = ΔembeddedViewStart(0, 2, 0);
            if (rf0 & RenderFlags.Create) {
              Δprojection(0);
              Δtext(1, 'text');
            }
            ΔembeddedViewEnd();
          }
        }
        ΔcontainerRefreshEnd();
      }
    }, 2);

    /** <child></child> */
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        Δelement(0, 'child');

        // testing
        childCmptInstance = getDirectiveOnNode(0);
      }
    }, 1, 0, [Child]);

    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child><div>text</div></child>');

    childCmptInstance.skipContent = true;
    detectChanges(parent);
    expect(toHtml(parent)).toEqual('<child><div></div></child>');
  });

  it('should support projection into embedded views when ng-content is a root node of an embedded view',
     () => {
       let childCmptInstance: any;

       /**
        * <div>
        *  % if (!skipContent) {
         *    <ng-content></ng-content>
         *  % }
        * </div>
        */
       const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
         if (rf & RenderFlags.Create) {
           ΔprojectionDef();
           ΔelementStart(0, 'div');
           { Δcontainer(1); }
           ΔelementEnd();
         }
         if (rf & RenderFlags.Update) {
           ΔcontainerRefreshStart(1);
           {
             if (!ctx.skipContent) {
               let rf0 = ΔembeddedViewStart(0, 1, 0);
               if (rf0 & RenderFlags.Create) {
                 Δprojection(0);
               }
               ΔembeddedViewEnd();
             }
           }
           ΔcontainerRefreshEnd();
         }
       }, 2);

       /**
        * <child>content</child>
        */
       const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
         if (rf & RenderFlags.Create) {
           ΔelementStart(0, 'child');
           {
             childCmptInstance = getDirectiveOnNode(0);
             Δtext(1, 'content');
           }
           ΔelementEnd();
         }
       }, 2, 0, [Child]);

       const parent = renderComponent(Parent);
       expect(toHtml(parent)).toEqual('<child><div>content</div></child>');

       childCmptInstance.skipContent = true;
       detectChanges(parent);
       expect(toHtml(parent)).toEqual('<child><div></div></child>');
     });

  it('should project containers into containers', () => {
    /**
     * <div>
     *  Before (inside)
     *  % if (!skipContent) {
     *    <ng-content></ng-content>
     *  % }
     *  After (inside)
     * </div>
     */
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔprojectionDef();
        ΔelementStart(0, 'div');
        {
          Δtext(1, 'Before (inside)-');
          Δcontainer(2);
          Δtext(3, '-After (inside)');
        }
        ΔelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ΔcontainerRefreshStart(2);
        {
          if (!ctx.skipContent) {
            let rf0 = ΔembeddedViewStart(0, 1, 0);
            if (rf0 & RenderFlags.Create) {
              Δprojection(0);
            }
            ΔembeddedViewEnd();
          }
        }
        ΔcontainerRefreshEnd();
      }
    }, 4);

    /**
     * <child>
     *     Before text-
     *     % if (!skipContent) {
     *       content
     *     % }
     *     -After text
     * </child>
     */
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔelementStart(0, 'child');
        {
          Δtext(1, 'Before text-');
          Δcontainer(2);
          Δtext(3, '-After text');
        }
        ΔelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ΔcontainerRefreshStart(2);
        {
          if (!ctx.skipContent) {
            let rf0 = ΔembeddedViewStart(0, 1, 0);
            if (rf0 & RenderFlags.Create) {
              Δtext(0, 'content');
            }
            ΔembeddedViewEnd();
          }
        }
        ΔcontainerRefreshEnd();
      }
    }, 4, 0, [Child]);

    const fixture = new ComponentFixture(Parent);
    expect(fixture.html)
        .toEqual(
            '<child><div>Before (inside)-Before text-content-After text-After (inside)</div></child>');

    fixture.component.skipContent = true;
    fixture.update();
    expect(fixture.html)
        .toEqual(
            '<child><div>Before (inside)-Before text--After text-After (inside)</div></child>');
  });

  it('should re-project containers into containers', () => {
    /**
     * <div>
     *  % if (!skipContent) {
     *    <ng-content></ng-content>
     *  % }
     * </div>
     */
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔprojectionDef();
        ΔelementStart(0, 'div');
        { Δcontainer(1); }
        ΔelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ΔcontainerRefreshStart(1);
        {
          if (!ctx.skipContent) {
            let rf0 = ΔembeddedViewStart(0, 1, 0);
            if (rf0 & RenderFlags.Create) {
              Δprojection(0);
            }
            ΔembeddedViewEnd();
          }
        }
        ΔcontainerRefreshEnd();
      }
    }, 2);

    /**
     * <child>
     *     Before text
     *     % if (!skipContent) {
     *       <ng-content></ng-content>
     *     % }
     *     -After text
     * </child>
     */
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔprojectionDef();
        ΔelementStart(0, 'child');
        {
          Δtext(1, 'Before text');
          Δcontainer(2);
          Δtext(3, '-After text');
        }
        ΔelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ΔcontainerRefreshStart(2);
        {
          if (!ctx.skipContent) {
            let rf0 = ΔembeddedViewStart(0, 1, 0);
            if (rf0 & RenderFlags.Create) {
              Δprojection(0);
            }
            ΔembeddedViewEnd();
          }
        }
        ΔcontainerRefreshEnd();
      }
    }, 4, 0, [Child]);

    let parent: any;
    /** <parent><p>text</p></parent> */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔelementStart(0, 'parent');
        {
          ΔelementStart(1, 'p');
          { Δtext(2, 'text'); }
          ΔelementEnd();
        }
        ΔelementEnd();
        // testing
        parent = getDirectiveOnNode(0);
      }
    }, 3, 0, [Parent]);

    const fixture = new ComponentFixture(App);
    expect(fixture.html)
        .toEqual('<parent><child><div>Before text<p>text</p>-After text</div></child></parent>');

    parent.skipContent = true;
    fixture.update();
    expect(fixture.html)
        .toEqual('<parent><child><div>Before text-After text</div></child></parent>');
  });

  it('should support projection into embedded views when ng-content is a root node of an embedded view, with other nodes after',
     () => {
       let childCmptInstance: any;

       /**
        * <div>
        *  % if (!skipContent) {
         *    before-<ng-content></ng-content>-after
         *  % }
        * </div>
        */
       const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
         if (rf & RenderFlags.Create) {
           ΔprojectionDef();
           ΔelementStart(0, 'div');
           { Δcontainer(1); }
           ΔelementEnd();
         }
         if (rf & RenderFlags.Update) {
           ΔcontainerRefreshStart(1);
           {
             if (!ctx.skipContent) {
               let rf0 = ΔembeddedViewStart(0, 3, 0);
               if (rf0 & RenderFlags.Create) {
                 Δtext(0, 'before-');
                 Δprojection(1);
                 Δtext(2, '-after');
               }
               ΔembeddedViewEnd();
             }
           }
           ΔcontainerRefreshEnd();
         }
       }, 2);

       /**
        * <child>content</child>
        */
       const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
         if (rf & RenderFlags.Create) {
           ΔelementStart(0, 'child');
           {
             childCmptInstance = getDirectiveOnNode(0);
             Δtext(1, 'content');
           }
           ΔelementEnd();
         }
       }, 2, 0, [Child]);

       const parent = renderComponent(Parent);
       expect(toHtml(parent)).toEqual('<child><div>before-content-after</div></child>');

       childCmptInstance.skipContent = true;
       detectChanges(parent);
       expect(toHtml(parent)).toEqual('<child><div></div></child>');
     });

  it('should project nodes into the last ng-content', () => {
    /**
     * <div><ng-content></ng-content></div>
     * <span><ng-content></ng-content></span>
     */
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔprojectionDef();
        ΔelementStart(0, 'div');
        { Δprojection(1); }
        ΔelementEnd();
        ΔelementStart(2, 'span');
        { Δprojection(3); }
        ΔelementEnd();
      }
    }, 4);

    /**
     * <child>content</child>
     */
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔelementStart(0, 'child');
        { Δtext(1, 'content'); }
        ΔelementEnd();
      }
    }, 2, 0, [Child]);

    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child><div></div><span>content</span></child>');
  });

  /**
   * Warning: this test is _not_ in-line with what Angular does atm.
   * Moreover the current implementation logic will result in DOM nodes
   * being re-assigned from one parent to another. Proposal: have compiler
   * to remove all but the latest occurrence of <ng-content> so we generate
   * only one P(n, m, 0) instruction. It would make it consistent with the
   * current Angular behavior:
   * http://plnkr.co/edit/OAYkNawTDPkYBFTqovTP?p=preview
   */
  it('should project nodes into the last available ng-content', () => {
    let childCmptInstance: any;
    /**
     *  <ng-content></ng-content>
     *  <div>
     *  % if (show) {
     *    <ng-content></ng-content>
     *  % }
     *  </div>
     */
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔprojectionDef();
        Δprojection(0);
        ΔelementStart(1, 'div');
        { Δcontainer(2); }
        ΔelementEnd();
      }
      if (rf & RenderFlags.Update) {
        ΔcontainerRefreshStart(2);
        {
          if (ctx.show) {
            let rf0 = ΔembeddedViewStart(0, 1, 0);
            if (rf0 & RenderFlags.Create) {
              Δprojection(0);
            }
            ΔembeddedViewEnd();
          }
        }
        ΔcontainerRefreshEnd();
      }
    }, 3);

    /**
     * <child>content</child>
     */
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔelementStart(0, 'child');
        {
          childCmptInstance = getDirectiveOnNode(0);
          Δtext(1, 'content');
        }
        ΔelementEnd();
      }
    }, 2, 0, [Child]);

    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child>content<div></div></child>');

    childCmptInstance.show = true;
    detectChanges(parent);
    expect(toHtml(parent)).toEqual('<child><div>content</div></child>');
  });

  it('should project with multiple instances of a component with projection', () => {
    const ProjectionComp = createComponent('projection-comp', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔprojectionDef();
        Δtext(0, 'Before');
        Δprojection(1);
        Δtext(2, 'After');
      }
    }, 3);

    /**
     * <projection-comp>
     *     <div>A</div>
     *     <p>123</p>
     * </projection-comp>
     * <projection-comp>
     *     <div>B</div>
     *     <p>456</p>
     * </projection-comp>
     */
    const AppComp = createComponent('app-comp', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔelementStart(0, 'projection-comp');
        {
          ΔelementStart(1, 'div');
          { Δtext(2, 'A'); }
          ΔelementEnd();
          ΔelementStart(3, 'p');
          { Δtext(4, '123'); }
          ΔelementEnd();
        }
        ΔelementEnd();
        ΔelementStart(5, 'projection-comp');
        {
          ΔelementStart(6, 'div');
          { Δtext(7, 'B'); }
          ΔelementEnd();
          ΔelementStart(8, 'p');
          { Δtext(9, '456'); }
          ΔelementEnd();
        }
        ΔelementEnd();
      }
    }, 10, 0, [ProjectionComp]);

    const fixture = new ComponentFixture(AppComp);
    fixture.update();
    expect(fixture.html)
        .toEqual(
            '<projection-comp>Before<div>A</div><p>123</p>After</projection-comp>' +
            '<projection-comp>Before<div>B</div><p>456</p>After</projection-comp>');
  });

  it('should re-project with multiple instances of a component with projection', () => {
    /**
     * Before
     * <ng-content></ng-content>
     * After
     */
    const ProjectionComp = createComponent('projection-comp', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔprojectionDef();
        Δtext(0, 'Before');
        Δprojection(1);
        Δtext(2, 'After');
      }
    }, 3);

    /**
     * <projection-comp>
     *     <div>A</div>
     *     <ng-content></ng-content>
     *     <p>123</p>
     * </projection-comp>
     * <projection-comp>
     *     <div>B</div>
     *     <p>456</p>
     * </projection-comp>
     */
    const ProjectionParent = createComponent('parent-comp', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔprojectionDef();
        ΔelementStart(0, 'projection-comp');
        {
          ΔelementStart(1, 'div');
          { Δtext(2, 'A'); }
          ΔelementEnd();
          Δprojection(3, 0);
          ΔelementStart(4, 'p');
          { Δtext(5, '123'); }
          ΔelementEnd();
        }
        ΔelementEnd();
        ΔelementStart(6, 'projection-comp');
        {
          ΔelementStart(7, 'div');
          { Δtext(8, 'B'); }
          ΔelementEnd();
          ΔelementStart(9, 'p');
          { Δtext(10, '456'); }
          ΔelementEnd();
        }
        ΔelementEnd();
      }
    }, 11, 0, [ProjectionComp]);

    /**
     * <parent-comp>
     *    **ABC**
     * </parent-comp>
     * <parent-comp>
     *    **DEF**
     * </parent-comp>
     */
    const AppComp = createComponent('app-comp', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔelementStart(0, 'parent-comp');
        { Δtext(1, '**ABC**'); }
        ΔelementEnd();
        ΔelementStart(2, 'parent-comp');
        { Δtext(3, '**DEF**'); }
        ΔelementEnd();
      }
    }, 4, 0, [ProjectionParent]);

    const fixture = new ComponentFixture(AppComp);
    fixture.update();
    expect(fixture.html)
        .toEqual(
            '<parent-comp>' +
            '<projection-comp>Before<div>A</div>**ABC**<p>123</p>After</projection-comp>' +
            '<projection-comp>Before<div>B</div><p>456</p>After</projection-comp></parent-comp>' +
            '<parent-comp>' +
            '<projection-comp>Before<div>A</div>**DEF**<p>123</p>After</projection-comp>' +
            '<projection-comp>Before<div>B</div><p>456</p>After</projection-comp></parent-comp>');
  });

  it('should project ng-container at the content root', () => {

    `<ng-content></ng-content>`;
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔprojectionDef();
        Δprojection(0);
      }
    }, 1);

    `<child>
      <ng-container>
        <ng-container>
          content
        </ng-container>
      </ng-container>
    </child>`;
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔelementStart(0, 'child');
        {
          ΔelementContainerStart(1);
          {
            ΔelementContainerStart(2);
            { Δtext(3, 'content'); }
            ΔelementContainerEnd();
          }
          ΔelementContainerEnd();
        }
        ΔelementEnd();
      }
    }, 4, 0, [Child]);

    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child>content</child>');
  });

  it('should re-project ng-container at the content root', () => {

    `<ng-content></ng-content>`;
    const GrandChild = createComponent('grand-child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔprojectionDef();
        Δprojection(0);
      }
    }, 1);

    `<grand-child>
      <ng-content></ng-content>
    </grand-child>`;
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔprojectionDef();
        ΔelementStart(0, 'grand-child');
        { Δprojection(1); }
        ΔelementEnd();
      }
    }, 2, 0, [GrandChild]);

    `<child>
      <ng-container>
        <ng-container>
          content
        </ng-container>
      </ng-container>
    </child>`;
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ΔelementStart(0, 'child');
        {
          ΔelementContainerStart(1);
          {
            ΔelementContainerStart(2);
            { Δtext(3, 'content'); }
            ΔelementContainerEnd();
          }
          ΔelementContainerEnd();
        }
        ΔelementEnd();
      }
    }, 4, 0, [Child]);

    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child><grand-child>content</grand-child></child>');
  });

  describe('with selectors', () => {

    it('should project nodes using attribute selectors', () => {
      /**
       *  <div id="first"><ng-content select="span[title=toFirst]"></ng-content></div>
       *  <div id="second"><ng-content select="span[title=toSecond]"></ng-content></div>
       */
      const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔprojectionDef([[['span', 'title', 'toFirst']], [['span', 'title', 'toSecond']]]);
          ΔelementStart(0, 'div', ['id', 'first']);
          { Δprojection(1, 1); }
          ΔelementEnd();
          ΔelementStart(2, 'div', ['id', 'second']);
          { Δprojection(3, 2); }
          ΔelementEnd();
        }
      }, 4);

      /**
       * <child>
       *  <span title="toFirst">1</span>
       *  <span title="toSecond">2</span>
       * </child>
       */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔelementStart(0, 'child');
          {
            ΔelementStart(1, 'span', ['title', 'toFirst']);
            { Δtext(2, '1'); }
            ΔelementEnd();
            ΔelementStart(3, 'span', ['title', 'toSecond']);
            { Δtext(4, '2'); }
            ΔelementEnd();
          }
          ΔelementEnd();
        }
      }, 5, 0, [Child]);

      const parent = renderComponent(Parent);
      expect(toHtml(parent))
          .toEqual(
              '<child><div id="first"><span title="toFirst">1</span></div><div id="second"><span title="toSecond">2</span></div></child>');
    });

    it('should project nodes using class selectors', () => {
      /**
       *  <div id="first"><ng-content select="span.toFirst"></ng-content></div>
       *  <div id="second"><ng-content select="span.toSecond"></ng-content></div>
       */
      const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔprojectionDef([
            [['span', SelectorFlags.CLASS, 'toFirst']],
            [['span', SelectorFlags.CLASS, 'toSecond']]
          ]);
          ΔelementStart(0, 'div', ['id', 'first']);
          { Δprojection(1, 1); }
          ΔelementEnd();
          ΔelementStart(2, 'div', ['id', 'second']);
          { Δprojection(3, 2); }
          ΔelementEnd();
        }
      }, 4);

      /**
       * <child>
       *  <span class="toFirst">1</span>
       *  <span class="toSecond">2</span>
       * </child>
       */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔelementStart(0, 'child');
          {
            ΔelementStart(1, 'span', ['class', 'toFirst']);
            { Δtext(2, '1'); }
            ΔelementEnd();
            ΔelementStart(3, 'span', ['class', 'toSecond']);
            { Δtext(4, '2'); }
            ΔelementEnd();
          }
          ΔelementEnd();
        }
      }, 5, 0, [Child]);

      const parent = renderComponent(Parent);
      expect(toHtml(parent))
          .toEqual(
              '<child><div id="first"><span class="toFirst">1</span></div><div id="second"><span class="toSecond">2</span></div></child>');
    });

    it('should project nodes using class selectors when element has multiple classes', () => {
      /**
       *  <div id="first"><ng-content select="span.toFirst"></ng-content></div>
       *  <div id="second"><ng-content select="span.toSecond"></ng-content></div>
       */
      const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔprojectionDef([
            [['span', SelectorFlags.CLASS, 'toFirst']],
            [['span', SelectorFlags.CLASS, 'toSecond']]
          ]);
          ΔelementStart(0, 'div', ['id', 'first']);
          { Δprojection(1, 1); }
          ΔelementEnd();
          ΔelementStart(2, 'div', ['id', 'second']);
          { Δprojection(3, 2); }
          ΔelementEnd();
        }
      }, 4);

      /**
       * <child>
       *  <span class="other toFirst">1</span>
       *  <span class="toSecond noise">2</span>
       * </child>
       */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔelementStart(0, 'child');
          {
            ΔelementStart(1, 'span', ['class', 'other toFirst']);
            { Δtext(2, '1'); }
            ΔelementEnd();
            ΔelementStart(3, 'span', ['class', 'toSecond noise']);
            { Δtext(4, '2'); }
            ΔelementEnd();
          }
          ΔelementEnd();
        }
      }, 5, 0, [Child]);

      const parent = renderComponent(Parent);
      expect(toHtml(parent))
          .toEqual(
              '<child><div id="first"><span class="other toFirst">1</span></div><div id="second"><span class="toSecond noise">2</span></div></child>');
    });

    it('should project nodes into the first matching selector', () => {
      /**
       *  <div id="first"><ng-content select="span"></ng-content></div>
       *  <div id="second"><ng-content select="span.toSecond"></ng-content></div>
       */
      const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔprojectionDef([[['span']], [['span', SelectorFlags.CLASS, 'toSecond']]]);
          ΔelementStart(0, 'div', ['id', 'first']);
          { Δprojection(1, 1); }
          ΔelementEnd();
          ΔelementStart(2, 'div', ['id', 'second']);
          { Δprojection(3, 2); }
          ΔelementEnd();
        }
      }, 4);

      /**
       * <child>
       *  <span class="toFirst">1</span>
       *  <span class="toSecond">2</span>
       * </child>
       */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔelementStart(0, 'child');
          {
            ΔelementStart(1, 'span', ['class', 'toFirst']);
            { Δtext(2, '1'); }
            ΔelementEnd();
            ΔelementStart(3, 'span', ['class', 'toSecond']);
            { Δtext(4, '2'); }
            ΔelementEnd();
          }
          ΔelementEnd();
        }
      }, 5, 0, [Child]);

      const parent = renderComponent(Parent);
      expect(toHtml(parent))
          .toEqual(
              '<child><div id="first"><span class="toFirst">1</span><span class="toSecond">2</span></div><div id="second"></div></child>');
    });

    it('should allow mixing ng-content with and without selectors', () => {
      /**
       *  <div id="first"><ng-content select="span.toFirst"></ng-content></div>
       *  <div id="second"><ng-content></ng-content></div>
       */
      const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔprojectionDef([[['span', SelectorFlags.CLASS, 'toFirst']]]);
          ΔelementStart(0, 'div', ['id', 'first']);
          { Δprojection(1, 1); }
          ΔelementEnd();
          ΔelementStart(2, 'div', ['id', 'second']);
          { Δprojection(3); }
          ΔelementEnd();
        }
      }, 4);

      /**
       * <child>
       *  <span class="other toFirst">1</span>
       *  <span class="toSecond noise">2</span>
       * </child>
       */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔelementStart(0, 'child');
          {
            ΔelementStart(1, 'span', ['class', 'toFirst']);
            { Δtext(2, '1'); }
            ΔelementEnd();
            ΔelementStart(3, 'span');
            { Δtext(4, 'remaining'); }
            ΔelementEnd();
            Δtext(5, 'more remaining');
          }
          ΔelementEnd();
        }
      }, 6, 0, [Child]);

      const parent = renderComponent(Parent);
      expect(toHtml(parent))
          .toEqual(
              '<child><div id="first"><span class="toFirst">1</span></div><div id="second"><span>remaining</span>more remaining</div></child>');
    });

    it('should allow mixing ng-content with and without selectors - ng-content first', () => {
      /**
       *  <div id="first"><ng-content></ng-content></div>
       *  <div id="second"><ng-content select="span.toSecond"></ng-content></div>
       */
      const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔprojectionDef([[['span', SelectorFlags.CLASS, 'toSecond']]]);
          ΔelementStart(0, 'div', ['id', 'first']);
          { Δprojection(1); }
          ΔelementEnd();
          ΔelementStart(2, 'div', ['id', 'second']);
          { Δprojection(3, 1); }
          ΔelementEnd();
        }
      }, 4);

      /**
       * <child>
       *  <span>1</span>
       *  <span class="toSecond">2</span>
       *  remaining
       * </child>
       */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔelementStart(0, 'child');
          {
            ΔelementStart(1, 'span');
            { Δtext(2, '1'); }
            ΔelementEnd();
            ΔelementStart(3, 'span', ['class', 'toSecond']);
            { Δtext(4, '2'); }
            ΔelementEnd();
            Δtext(5, 'remaining');
          }
          ΔelementEnd();
        }
      }, 6, 0, [Child]);

      const parent = renderComponent(Parent);
      expect(toHtml(parent))
          .toEqual(
              '<child><div id="first"><span>1</span>remaining</div><div id="second"><span class="toSecond">2</span></div></child>');
    });

    /**
     * Descending into projected content for selector-matching purposes is not supported
     * today: http://plnkr.co/edit/MYQcNfHSTKp9KvbzJWVQ?p=preview
     */
    it('should not descend into re-projected content', () => {

      /**
       *  <ng-content select="span"></ng-content>
       *  <hr>
       *  <ng-content></ng-content>
       */
      const GrandChild = createComponent('grand-child', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔprojectionDef([[['span']]]);
          Δprojection(0, 1);
          Δelement(1, 'hr');
          Δprojection(2);
        }
      }, 3);

      /**
       *  <grand-child>
       *    <ng-content></ng-content>
       *    <span>in child template</span>
       *  </grand-child>
       */
      const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔprojectionDef();
          ΔelementStart(0, 'grand-child');
          {
            Δprojection(1);
            ΔelementStart(2, 'span');
            { Δtext(3, 'in child template'); }
            ΔelementEnd();
          }
          ΔelementEnd();
        }
      }, 4, 0, [GrandChild]);

      /**
       * <child>
       *  <div>
       *    parent content
       *  </div>
       * </child>
       */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔelementStart(0, 'child');
          {
            ΔelementStart(1, 'span');
            { Δtext(2, 'parent content'); }
            ΔelementEnd();
          }
          ΔelementEnd();
        }
      }, 3, 0, [Child]);

      const parent = renderComponent(Parent);
      expect(toHtml(parent))
          .toEqual(
              '<child><grand-child><span>in child template</span><hr><span>parent content</span></grand-child></child>');
    });

    it('should match selectors on ng-content nodes with attributes', () => {

      /**
       * <ng-content select="[card-title]"></ng-content>
       * <hr>
       * <ng-content select="[card-content]"></ng-content>
       */
      const Card = createComponent('card', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔprojectionDef([[['', 'card-title', '']], [['', 'card-content', '']]]);
          Δprojection(0, 1);
          Δelement(1, 'hr');
          Δprojection(2, 2);
        }
      }, 3);

      /**
       * <card>
       *  <h1 card-title>Title</h1>
       *  <ng-content card-content></ng-content>
       * </card>
       */
      const CardWithTitle = createComponent('card-with-title', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔprojectionDef();
          ΔelementStart(0, 'card');
          {
            ΔelementStart(1, 'h1', ['card-title', '']);
            { Δtext(2, 'Title'); }
            ΔelementEnd();
            Δprojection(3, 0, ['card-content', '']);
          }
          ΔelementEnd();
        }
      }, 4, 0, [Card]);

      /**
       * <card-with-title>
       *  content
       * </card-with-title>
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔelementStart(0, 'card-with-title');
          { Δtext(1, 'content'); }
          ΔelementEnd();
        }
      }, 2, 0, [CardWithTitle]);

      const app = renderComponent(App);
      expect(toHtml(app))
          .toEqual(
              '<card-with-title><card><h1 card-title="">Title</h1><hr>content</card></card-with-title>');
    });

    it('should not match selectors against node having ngProjectAs attribute', function() {

      /**
       *  <ng-content select="div"></ng-content>
       */
      const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔprojectionDef([[['div']]]);
          Δprojection(0, 1);
        }
      }, 1);

      /**
       * <child>
       *  <div ngProjectAs="span">should not project</div>
       *  <div>should project</div>
       * </child>
       */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          ΔelementStart(0, 'child');
          {
            ΔelementStart(1, 'div', [AttributeMarker.ProjectAs, ['span']]);
            { Δtext(2, 'should not project'); }
            ΔelementEnd();
            ΔelementStart(3, 'div');
            { Δtext(4, 'should project'); }
            ΔelementEnd();
          }
          ΔelementEnd();
        }
      }, 5, 0, [Child]);

      const parent = renderComponent(Parent);
      expect(toHtml(parent)).toEqual('<child><div>should project</div></child>');
    });
  });

});
