/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SelectorFlags} from '@angular/core/src/render3/interfaces/projection';

import {Input, TemplateRef, ViewContainerRef, ViewRef} from '../../src/core';
import {defineDirective} from '../../src/render3/definition';
import {injectTemplateRef, injectViewContainerRef} from '../../src/render3/di';
import {AttributeMarker, detectChanges} from '../../src/render3/index';
import {bind, container, containerRefreshEnd, containerRefreshStart, element, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, loadDirective, projection, projectionDef, text} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';

import {NgIf} from './common_with_def';
import {ComponentFixture, createComponent, renderComponent, toHtml} from './render_util';

describe('content projection', () => {
  it('should project content', () => {

    /**
     * <div><ng-content></ng-content></div>
     */
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        projectionDef();
        elementStart(0, 'div');
        { projection(1); }
        elementEnd();
      }
    });

    /**
     * <child>content</child>
     */
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'child');
        { text(1, 'content'); }
        elementEnd();
      }
    }, [Child]);

    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child><div>content</div></child>');
  });

  it('should project content when root.', () => {
    /** <ng-content></ng-content> */
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        projectionDef();
        projection(0);
      }
    });

    /** <child>content</child> */
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'child');
        { text(1, 'content'); }
        elementEnd();
      }
    }, [Child]);

    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child>content</child>');
  });

  it('should project content with siblings', () => {
    /** <ng-content></ng-content> */
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        projectionDef();
        projection(0);
      }
    });

    /**
     * <child>
     *  before
     *  <div>content</div>
     *  after
     * </child>
     */
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'child');
        {
          text(1, 'before');
          elementStart(2, 'div');
          { text(3, 'content'); }
          elementEnd();
          text(4, 'after');
        }
        elementEnd();
      }
    }, [Child]);

    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child>before<div>content</div>after</child>');
  });

  it('should re-project content when root.', () => {
    /** <div><ng-content></ng-content></div> */
    const GrandChild = createComponent('grand-child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        projectionDef();
        elementStart(0, 'div');
        { projection(1); }
        elementEnd();
      }
    });

    /** <grand-child><ng-content></ng-content></grand-child> */
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        projectionDef();
        elementStart(0, 'grand-child');
        { projection(1); }
        elementEnd();
      }
    }, [GrandChild]);

    /** <child><b>Hello</b>World!</child> */
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'child');
        {
          elementStart(1, 'b');
          text(2, 'Hello');
          elementEnd();
          text(3, 'World!');
        }
        elementEnd();
      }
    }, [Child]);

    const parent = renderComponent(Parent);
    expect(toHtml(parent))
        .toEqual('<child><grand-child><div><b>Hello</b>World!</div></grand-child></child>');
  });

  it('should project components', () => {

    /** <div><ng-content></ng-content></div> */
    const Child = createComponent('child', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        projectionDef();
        elementStart(0, 'div');
        { projection(1); }
        elementEnd();
      }
    });

    const ProjectedComp = createComponent('projected-comp', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        text(0, 'content');
      }
    });

    /**
     * <child>
     *   <projected-comp></projected-comp>
     * </child>
     */
    const Parent = createComponent('parent', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'child');
        { element(1, 'projected-comp'); }
        elementEnd();
      }
    }, [Child, ProjectedComp]);

    const parent = renderComponent(Parent);
    expect(toHtml(parent))
        .toEqual('<child><div><projected-comp>content</projected-comp></div></child>');
  });

  it('should project components that have their own projection', () => {
    /** <div><ng-content></ng-content></div> */
    const Child = createComponent('child', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        projectionDef();
        elementStart(0, 'div');
        { projection(1); }
        elementEnd();
      }
    });

    /** <p><ng-content></ng-content></p> */
    const ProjectedComp = createComponent('projected-comp', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        projectionDef();
        elementStart(0, 'p');
        projection(1);
        elementEnd();
      }
    });

    /**
     * <child>
     *   <projected-comp>
     *       <div> Some content </div>
     *       Other content
     *   </projected-comp>
     * </child>
     */
    const Parent = createComponent('parent', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'child');
        {
          elementStart(1, 'projected-comp');
          {
            elementStart(2, 'div');
            text(3, 'Some content');
            elementEnd();
            text(4, 'Other content');
          }

          elementEnd();
        }
        elementEnd();
      }
    }, [Child, ProjectedComp]);

    const parent = renderComponent(Parent);
    expect(toHtml(parent))
        .toEqual(
            '<child><div><projected-comp><p><div>Some content</div>Other content</p></projected-comp></div></child>');
  });

  it('should project containers', () => {
    /** <div> <ng-content></ng-content></div> */
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        projectionDef();
        elementStart(0, 'div');
        { projection(1); }
        elementEnd();
      }
    });

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
        elementStart(0, 'child');
        {
          text(1, '(');
          container(2);
          text(3, ')');
        }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(2);
        {
          if (ctx.value) {
            let rf0 = embeddedViewStart(0);
            if (rf0 & RenderFlags.Create) {
              text(0, 'content');
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    }, [Child]);

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
        projectionDef();
        projection(0);
      }
    });

    /**
     * <child>
     *    % if (value) {
     *      content
     *    % }
     * </child>
     */
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: {value: any}) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'child');
        { container(1); }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(1);
        {
          if (ctx.value) {
            let rf0 = embeddedViewStart(0);
            if (rf0 & RenderFlags.Create) {
              text(0, 'content');
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    }, [Child]);

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
        projectionDef();
        elementStart(0, 'div');
        { projection(1); }
        elementEnd();
      }
    });

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
        elementStart(0, 'child');
        {
          text(1, '(');
          container(2);
          text(3, ')');
        }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(2);
        {
          if (ctx.value) {
            let rf0 = embeddedViewStart(0);
            if (rf0 & RenderFlags.Create) {
              text(0, 'content');
            }
            embeddedViewEnd();
          } else {
            if (embeddedViewStart(1)) {
              text(0, 'else');
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    }, [Child]);

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
        projectionDef();
        elementStart(0, 'div');
        { container(1); }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(1);
        {
          if (!ctx.skipContent) {
            let rf0 = embeddedViewStart(0);
            if (rf0 & RenderFlags.Create) {
              elementStart(0, 'span');
              projection(1);
              elementEnd();
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    });

    /**
     * <child>
     *   <div>text</div>
     *   content
     * </child>
     */
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'child');
        {
          elementStart(1, 'div');
          { text(2, 'text'); }
          elementEnd();
          text(3, 'content');
        }
        elementEnd();

        // testing
        childCmptInstance = loadDirective(0);
      }
    }, [Child]);

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
        projectionDef();
        elementStart(0, 'div');
        { container(1); }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(1);
        {
          if (!ctx.skipContent) {
            let rf0 = embeddedViewStart(0);
            if (rf0 & RenderFlags.Create) {
              projection(0);
              text(1, 'text');
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    });

    /** <child></child> */
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        element(0, 'child');

        // testing
        childCmptInstance = loadDirective(0);
      }
    }, [Child]);

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
           projectionDef();
           elementStart(0, 'div');
           { container(1); }
           elementEnd();
         }
         if (rf & RenderFlags.Update) {
           containerRefreshStart(1);
           {
             if (!ctx.skipContent) {
               let rf0 = embeddedViewStart(0);
               if (rf0 & RenderFlags.Create) {
                 projection(0);
               }
               embeddedViewEnd();
             }
           }
           containerRefreshEnd();
         }
       });

       /**
        * <child>content</child>
        */
       const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
         if (rf & RenderFlags.Create) {
           elementStart(0, 'child');
           {
             childCmptInstance = loadDirective(0);
             text(1, 'content');
           }
           elementEnd();
         }
       }, [Child]);

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
        projectionDef();
        elementStart(0, 'div');
        {
          text(1, 'Before (inside)-');
          container(2);
          text(3, '-After (inside)');
        }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(2);
        {
          if (!ctx.skipContent) {
            let rf0 = embeddedViewStart(0);
            if (rf0 & RenderFlags.Create) {
              projection(0);
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    });

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
        elementStart(0, 'child');
        {
          text(1, 'Before text-');
          container(2);
          text(3, '-After text');
        }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(2);
        {
          if (!ctx.skipContent) {
            let rf0 = embeddedViewStart(0);
            if (rf0 & RenderFlags.Create) {
              text(0, 'content');
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    }, [Child]);

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
        projectionDef();
        elementStart(0, 'div');
        { container(1); }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(1);
        {
          if (!ctx.skipContent) {
            let rf0 = embeddedViewStart(0);
            if (rf0 & RenderFlags.Create) {
              projection(0);
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    });

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
        projectionDef();
        elementStart(0, 'child');
        {
          text(1, 'Before text');
          container(2);
          text(3, '-After text');
        }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(2);
        {
          if (!ctx.skipContent) {
            let rf0 = embeddedViewStart(0);
            if (rf0 & RenderFlags.Create) {
              projection(0);
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    }, [Child]);

    let parent: any;
    /** <parent><p>text</p></parent> */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'parent');
        {
          elementStart(1, 'p');
          { text(2, 'text'); }
          elementEnd();
        }
        elementEnd();
        // testing
        parent = loadDirective(0);
      }
    }, [Parent]);

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
           projectionDef();
           elementStart(0, 'div');
           { container(1); }
           elementEnd();
         }
         if (rf & RenderFlags.Update) {
           containerRefreshStart(1);
           {
             if (!ctx.skipContent) {
               let rf0 = embeddedViewStart(0);
               if (rf0 & RenderFlags.Create) {
                 text(0, 'before-');
                 projection(1);
                 text(2, '-after');
               }
               embeddedViewEnd();
             }
           }
           containerRefreshEnd();
         }
       });

       /**
        * <child>content</child>
        */
       const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
         if (rf & RenderFlags.Create) {
           elementStart(0, 'child');
           {
             childCmptInstance = loadDirective(0);
             text(1, 'content');
           }
           elementEnd();
         }
       }, [Child]);

       const parent = renderComponent(Parent);
       expect(toHtml(parent)).toEqual('<child><div>before-content-after</div></child>');

       childCmptInstance.skipContent = true;
       detectChanges(parent);
       expect(toHtml(parent)).toEqual('<child><div></div></child>');
     });

  it('should project into dynamic views (with createEmbeddedView)', () => {
    /**
     * Before-
     * <ng-template [ngIf]="showing">
     *     <ng-content></ng-content>
     * </ng-template>
     * -After
     */
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        projectionDef();
        text(0, 'Before-');
        container(1, IfTemplate, '', [AttributeMarker.SelectOnly, 'ngIf']);
        text(2, '-After');
      }
      if (rf & RenderFlags.Update) {
        elementProperty(1, 'ngIf', bind(ctx.showing));
      }

      function IfTemplate(rf1: RenderFlags, ctx1: any, child: any) {
        if (rf1 & RenderFlags.Create) {
          projectionDef();
          projection(0);
        }
      }
    }, [NgIf]);

    let child: {showing: boolean};
    /**
     * <child>
     *     <div>A</div>
     *     Some text
     * </child>
     */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'child');
        {
          elementStart(1, 'div');
          { text(2, 'A'); }
          elementEnd();
          text(3, 'Some text');
        }
        elementEnd();

        // testing
        child = loadDirective(0);
      }
    }, [Child]);

    const fixture = new ComponentFixture(App);
    child !.showing = true;
    fixture.update();
    expect(fixture.html).toEqual('<child>Before-<div>A</div>Some text-After</child>');

    child !.showing = false;
    fixture.update();
    expect(fixture.html).toEqual('<child>Before--After</child>');

    child !.showing = true;
    fixture.update();
    expect(fixture.html).toEqual('<child>Before-<div>A</div>Some text-After</child>');
  });

  it('should project into dynamic views (with insertion)', () => {
    /**
     * Before-
     * <ng-template [ngIf]="showing">
     *     <ng-content></ng-content>
     * </ng-template>
     * -After
     */
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        projectionDef();
        text(0, 'Before-');
        container(1, IfTemplate, '', [AttributeMarker.SelectOnly, 'ngIf']);
        text(2, '-After');
      }
      if (rf & RenderFlags.Update) {
        elementProperty(1, 'ngIf', bind(ctx.showing));
      }

      function IfTemplate(rf1: RenderFlags, ctx1: any, child: any) {
        if (rf1 & RenderFlags.Create) {
          projectionDef();
          projection(0);
        }
      }
    }, [NgIf]);

    let child: {showing: boolean};
    /**
     * <child>
     *     <div>A</div>
     *     Some text
     * </child>
     */
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'child');
        {
          elementStart(1, 'div');
          { text(2, 'A'); }
          elementEnd();
          text(3, 'Some text');
        }
        elementEnd();

        // testing
        child = loadDirective(0);
      }
    }, [Child]);

    const fixture = new ComponentFixture(App);
    child !.showing = true;
    fixture.update();
    expect(fixture.html).toEqual('<child>Before-<div>A</div>Some text-After</child>');

    child !.showing = false;
    fixture.update();
    expect(fixture.html).toEqual('<child>Before--After</child>');

    child !.showing = true;
    fixture.update();
    expect(fixture.html).toEqual('<child>Before-<div>A</div>Some text-After</child>');
  });

  it('should project nodes into the last ng-content', () => {
    /**
     * <div><ng-content></ng-content></div>
     * <span><ng-content></ng-content></span>
     */
    const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        projectionDef();
        elementStart(0, 'div');
        { projection(1); }
        elementEnd();
        elementStart(2, 'span');
        { projection(3); }
        elementEnd();
      }
    });

    /**
     * <child>content</child>
     */
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'child');
        { text(1, 'content'); }
        elementEnd();
      }
    }, [Child]);

    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child><div></div><span>content</span></child>');
  });

  /**
   * Warning: this test is _not_ in-line with what Angular does atm.
   * Moreover the current implementation logic will result in DOM nodes
   * being re-assigned from one parent to another. Proposal: have compiler
   * to remove all but the latest occurrence of <ng-content> so we generate
   * only one P(n, m, 0) instruction. It would make it consistent with the
   * current Angular behaviour:
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
        projectionDef();
        projection(0);
        elementStart(1, 'div');
        { container(2); }
        elementEnd();
      }
      if (rf & RenderFlags.Update) {
        containerRefreshStart(2);
        {
          if (ctx.show) {
            let rf0 = embeddedViewStart(0);
            if (rf0 & RenderFlags.Create) {
              projection(0);
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }
    });

    /**
     * <child>content</child>
     */
    const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        elementStart(0, 'child');
        {
          childCmptInstance = loadDirective(0);
          text(1, 'content');
        }
        elementEnd();
      }
    }, [Child]);

    const parent = renderComponent(Parent);
    expect(toHtml(parent)).toEqual('<child>content<div></div></child>');

    childCmptInstance.show = true;
    detectChanges(parent);
    expect(toHtml(parent)).toEqual('<child><div>content</div></child>');
  });

  it('should project with multiple instances of a component with projection', () => {
    const ProjectionComp = createComponent('projection-comp', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        projectionDef();
        text(0, 'Before');
        projection(1);
        text(2, 'After');
      }
    });

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
        elementStart(0, 'projection-comp');
        {
          elementStart(1, 'div');
          { text(2, 'A'); }
          elementEnd();
          elementStart(3, 'p');
          { text(4, '123'); }
          elementEnd();
        }
        elementEnd();
        elementStart(5, 'projection-comp');
        {
          elementStart(6, 'div');
          { text(7, 'B'); }
          elementEnd();
          elementStart(8, 'p');
          { text(9, '456'); }
          elementEnd();
        }
        elementEnd();
      }
    }, [ProjectionComp]);

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
        projectionDef();
        text(0, 'Before');
        projection(1);
        text(2, 'After');
      }
    });

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
        projectionDef();
        elementStart(0, 'projection-comp');
        {
          elementStart(1, 'div');
          { text(2, 'A'); }
          elementEnd();
          projection(3, 0);
          elementStart(4, 'p');
          { text(5, '123'); }
          elementEnd();
        }
        elementEnd();
        elementStart(6, 'projection-comp');
        {
          elementStart(7, 'div');
          { text(8, 'B'); }
          elementEnd();
          elementStart(9, 'p');
          { text(10, '456'); }
          elementEnd();
        }
        elementEnd();
      }
    }, [ProjectionComp]);

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
        elementStart(0, 'parent-comp');
        { text(1, '**ABC**'); }
        elementEnd();
        elementStart(2, 'parent-comp');
        { text(3, '**DEF**'); }
        elementEnd();
      }
    }, [ProjectionParent]);

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

  describe('with selectors', () => {

    it('should project nodes using attribute selectors', () => {
      /**
       *  <div id="first"><ng-content select="span[title=toFirst]"></ng-content></div>
       *  <div id="second"><ng-content select="span[title=toSecond]"></ng-content></div>
       */
      const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          projectionDef(
              [[['span', 'title', 'toFirst']], [['span', 'title', 'toSecond']]],
              ['span[title=toFirst]', 'span[title=toSecond]']);
          elementStart(0, 'div', ['id', 'first']);
          { projection(1, 1); }
          elementEnd();
          elementStart(2, 'div', ['id', 'second']);
          { projection(3, 2); }
          elementEnd();
        }
      });

      /**
       * <child>
       *  <span title="toFirst">1</span>
       *  <span title="toSecond">2</span>
       * </child>
       */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'child');
          {
            elementStart(1, 'span', ['title', 'toFirst']);
            { text(2, '1'); }
            elementEnd();
            elementStart(3, 'span', ['title', 'toSecond']);
            { text(4, '2'); }
            elementEnd();
          }
          elementEnd();
        }
      }, [Child]);

      const parent = renderComponent(Parent);
      expect(toHtml(parent))
          .toEqual(
              '<child><div id="first"><span title="toFirst">1</span></div><div id="second"><span title="toSecond">2</span></div></child>');
    });

    // https://stackblitz.com/edit/angular-psokum?file=src%2Fapp%2Fapp.module.ts
    it('should project nodes where attribute selector matches a binding', () => {
      /**
       *  <ng-content select="[title]"></ng-content>
       */
      const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          projectionDef([[['', 'title', '']]], ['[title]']);
          { projection(0, 1); }
        }
      });

      /**
       * <child>
       *  <span [title]="'Some title'">Has title</span>
       * </child>
       */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'child');
          {
            elementStart(1, 'span', [AttributeMarker.SelectOnly, 'title']);
            { text(2, 'Has title'); }
            elementEnd();
          }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(1, 'title', bind('Some title'));
        }
      }, [Child]);

      const fixture = new ComponentFixture(Parent);
      expect(fixture.html).toEqual('<child><span title="Some title">Has title</span></child>');

    });

    it('should project nodes using class selectors', () => {
      /**
       *  <div id="first"><ng-content select="span.toFirst"></ng-content></div>
       *  <div id="second"><ng-content select="span.toSecond"></ng-content></div>
       */
      const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          projectionDef(
              [
                [['span', SelectorFlags.CLASS, 'toFirst']],
                [['span', SelectorFlags.CLASS, 'toSecond']]
              ],
              ['span.toFirst', 'span.toSecond']);
          elementStart(0, 'div', ['id', 'first']);
          { projection(1, 1); }
          elementEnd();
          elementStart(2, 'div', ['id', 'second']);
          { projection(3, 2); }
          elementEnd();
        }
      });

      /**
       * <child>
       *  <span class="toFirst">1</span>
       *  <span class="toSecond">2</span>
       * </child>
       */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'child');
          {
            elementStart(1, 'span', ['class', 'toFirst']);
            { text(2, '1'); }
            elementEnd();
            elementStart(3, 'span', ['class', 'toSecond']);
            { text(4, '2'); }
            elementEnd();
          }
          elementEnd();
        }
      }, [Child]);

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
          projectionDef(
              [
                [['span', SelectorFlags.CLASS, 'toFirst']],
                [['span', SelectorFlags.CLASS, 'toSecond']]
              ],
              ['span.toFirst', 'span.toSecond']);
          elementStart(0, 'div', ['id', 'first']);
          { projection(1, 1); }
          elementEnd();
          elementStart(2, 'div', ['id', 'second']);
          { projection(3, 2); }
          elementEnd();
        }
      });

      /**
       * <child>
       *  <span class="other toFirst">1</span>
       *  <span class="toSecond noise">2</span>
       * </child>
       */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'child');
          {
            elementStart(1, 'span', ['class', 'other toFirst']);
            { text(2, '1'); }
            elementEnd();
            elementStart(3, 'span', ['class', 'toSecond noise']);
            { text(4, '2'); }
            elementEnd();
          }
          elementEnd();
        }
      }, [Child]);

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
          projectionDef(
              [[['span']], [['span', SelectorFlags.CLASS, 'toSecond']]], ['span', 'span.toSecond']);
          elementStart(0, 'div', ['id', 'first']);
          { projection(1, 1); }
          elementEnd();
          elementStart(2, 'div', ['id', 'second']);
          { projection(3, 2); }
          elementEnd();
        }
      });

      /**
       * <child>
       *  <span class="toFirst">1</span>
       *  <span class="toSecond">2</span>
       * </child>
       */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'child');
          {
            elementStart(1, 'span', ['class', 'toFirst']);
            { text(2, '1'); }
            elementEnd();
            elementStart(3, 'span', ['class', 'toSecond']);
            { text(4, '2'); }
            elementEnd();
          }
          elementEnd();
        }
      }, [Child]);

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
          projectionDef([[['span', SelectorFlags.CLASS, 'toFirst']]], ['span.toFirst']);
          elementStart(0, 'div', ['id', 'first']);
          { projection(1, 1); }
          elementEnd();
          elementStart(2, 'div', ['id', 'second']);
          { projection(3); }
          elementEnd();
        }
      });

      /**
       * <child>
       *  <span class="other toFirst">1</span>
       *  <span class="toSecond noise">2</span>
       * </child>
       */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'child');
          {
            elementStart(1, 'span', ['class', 'toFirst']);
            { text(2, '1'); }
            elementEnd();
            elementStart(3, 'span');
            { text(4, 'remaining'); }
            elementEnd();
            text(5, 'more remaining');
          }
          elementEnd();
        }
      }, [Child]);

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
          projectionDef([[['span', SelectorFlags.CLASS, 'toSecond']]], ['span.toSecond']);
          elementStart(0, 'div', ['id', 'first']);
          { projection(1); }
          elementEnd();
          elementStart(2, 'div', ['id', 'second']);
          { projection(3, 1); }
          elementEnd();
        }
      });

      /**
       * <child>
       *  <span>1</span>
       *  <span class="toSecond">2</span>
       *  remaining
       * </child>
       */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'child');
          {
            elementStart(1, 'span');
            { text(2, '1'); }
            elementEnd();
            elementStart(3, 'span', ['class', 'toSecond']);
            { text(4, '2'); }
            elementEnd();
            text(5, 'remaining');
          }
          elementEnd();
        }
      }, [Child]);

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
          projectionDef([[['span']]], ['span']);
          projection(0, 1);
          element(1, 'hr');
          projection(2);
        }
      });

      /**
       *  <grand-child>
       *    <ng-content></ng-content>
       *    <span>in child template</span>
       *  </grand-child>
       */
      const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          projectionDef();
          elementStart(0, 'grand-child');
          {
            projection(1);
            elementStart(2, 'span');
            { text(3, 'in child template'); }
            elementEnd();
          }
          elementEnd();
        }
      }, [GrandChild]);

      /**
       * <child>
       *  <div>
       *    parent content
       *  </div>
       * </child>
       */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'child');
          {
            elementStart(1, 'span');
            { text(2, 'parent content'); }
            elementEnd();
          }
          elementEnd();
        }
      }, [Child]);

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
          projectionDef(
              [[['', 'card-title', '']], [['', 'card-content', '']]],
              ['[card-title]', '[card-content]']);
          projection(0, 1);
          element(1, 'hr');
          projection(2, 2);
        }
      });

      /**
       * <card>
       *  <h1 card-title>Title</h1>
       *  <ng-content card-content></ng-content>
       * </card>
       */
      const CardWithTitle = createComponent('card-with-title', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          projectionDef();
          elementStart(0, 'card');
          {
            elementStart(1, 'h1', ['card-title', '']);
            { text(2, 'Title'); }
            elementEnd();
            projection(3, 0, ['card-content', '']);
          }
          elementEnd();
        }
      }, [Card]);

      /**
       * <card-with-title>
       *  content
       * </card-with-title>
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'card-with-title');
          { text(1, 'content'); }
          elementEnd();
        }
      }, [CardWithTitle]);

      const app = renderComponent(App);
      expect(toHtml(app))
          .toEqual(
              '<card-with-title><card><h1 card-title="">Title</h1><hr>content</card></card-with-title>');
    });


    it('should support ngProjectAs on elements (including <ng-content>)', () => {

      /**
       * <ng-content select="[card-title]"></ng-content>
       * <hr>
       * <ng-content select="[card-content]"></ng-content>
       */
      const Card = createComponent('card', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          projectionDef(
              [[['', 'card-title', '']], [['', 'card-content', '']]],
              ['[card-title]', '[card-content]']);
          projection(0, 1);
          element(1, 'hr');
          projection(2, 2);
        }
      });

      /**
       * <card>
       *  <h1 ngProjectAs="[card-title]>Title</h1>
       *  <ng-content ngProjectAs="[card-content]"></ng-content>
       * </card>
       */
      const CardWithTitle = createComponent('card-with-title', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          projectionDef();
          elementStart(0, 'card');
          {
            elementStart(1, 'h1', ['ngProjectAs', '[card-title]']);
            { text(2, 'Title'); }
            elementEnd();
            projection(3, 0, ['ngProjectAs', '[card-content]']);
          }
          elementEnd();
        }
      }, [Card]);

      /**
       * <card-with-title>
       *  content
       * </card-with-title>
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'card-with-title');
          { text(1, 'content'); }
          elementEnd();
        }
      }, [CardWithTitle]);

      const app = renderComponent(App);
      expect(toHtml(app))
          .toEqual('<card-with-title><card><h1>Title</h1><hr>content</card></card-with-title>');

    });

    it('should not match selectors against node having ngProjectAs attribute', function() {

      /**
       *  <ng-content select="div"></ng-content>
       */
      const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          projectionDef([[['div']]], ['div']);
          projection(0, 1);
        }
      });

      /**
       * <child>
       *  <div ngProjectAs="span">should not project</div>
       *  <div>should project</div>
       * </child>
       */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'child');
          {
            elementStart(1, 'div', ['ngProjectAs', 'span']);
            { text(2, 'should not project'); }
            elementEnd();
            elementStart(3, 'div');
            { text(4, 'should project'); }
            elementEnd();
          }
          elementEnd();
        }
      }, [Child]);

      const parent = renderComponent(Parent);
      expect(toHtml(parent)).toEqual('<child><div>should project</div></child>');
    });

    it('should match selectors against projected containers', () => {

      /**
       * <span>
       *  <ng-content select="div"></ng-content>
       * </span>
       */
      const Child = createComponent('child', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          projectionDef([[['div']]], ['div']);
          elementStart(0, 'span');
          { projection(1, 1); }
          elementEnd();
        }
      });

      /**
       * <child>
       *   <div *ngIf="true">content</div>
       * </child>
       */
      const Parent = createComponent('parent', function(rf: RenderFlags, ctx: {value: any}) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'child');
          { container(1, undefined, 'div'); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(1);
          {
            if (true) {
              let rf0 = embeddedViewStart(0);
              if (rf0 & RenderFlags.Create) {
                elementStart(0, 'div');
                { text(1, 'content'); }
                elementEnd();
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }, [Child]);
      const parent = renderComponent(Parent);
      expect(toHtml(parent)).toEqual('<child><span><div>content</div></span></child>');
    });

  });

});
