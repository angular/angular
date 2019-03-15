/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TemplateFixture} from './render_util';
import {template, element, RenderFlags, elementEnd, elementStart, text, textBinding, bind} from '@angular/core/src/render3';
import {getEmbeddedViewFactory, viewContainerInsertAfter, getViewContainer, viewContainerRemove, viewContainerGet, viewContainerIndexOf, viewContainerLength} from '@angular/core/src/render3/view';
import {CHILD_HEAD, NEXT, CHILD_TAIL} from '@angular/core/src/render3/interfaces/view';

describe('ViewContainer manipulation commands', () => {
  it('should get the embedded view from a comment added by ng-template and be able to insert it', () => {
    /*
    <div></div>
    <ng-template>
      <b>Hello </b>
      <i>{{name}}</i>
    </ng-template>
    */
    const fixture = new TemplateFixture(
        () => {
          element(0, 'div');
          template(1, (rf: RenderFlags, ctx: any) => {
            if (rf & RenderFlags.Create) {
              elementStart(0, 'b');
              text(1, 'Hello ');
              elementEnd();
              elementStart(2, 'i');
              text(3);
              elementEnd();
            }
            if (rf & RenderFlags.Update) {
              textBinding(3, bind(ctx.name));
            }
          }, 4, 1);
        },
        () => {

        },
        2, 0);

    /*
    <div></div>
    <!-- container -->
    */
    const comment = fixture.hostElement.lastChild !;
    expect(comment.nodeType).toBe(Node.COMMENT_NODE);
    const embeddedViewFactory = getEmbeddedViewFactory(comment) !;
    expect(typeof embeddedViewFactory).toEqual('function');

    const commentViewContainer = getViewContainer(comment) !;

    const bView = embeddedViewFactory({name: 'B'});
    // Putting this in the very front.
    viewContainerInsertAfter(commentViewContainer, bView, null);

    // Now putting this in front of B (because it's in the very front).
    viewContainerInsertAfter(commentViewContainer, embeddedViewFactory({name: 'A'}), null);

    // Putting this one after B
    viewContainerInsertAfter(commentViewContainer, embeddedViewFactory({name: 'C'}), bView);

    // Putting this one right after that initial <div></div>
    const divViewContainer = getViewContainer(fixture.hostElement.firstChild !) !;
    viewContainerInsertAfter(divViewContainer, embeddedViewFactory({name: 'X'}), null);

    fixture.update();
    expect(fixture.htmlWithContainerComments)
        .toEqual(
            '<div></div><b>Hello </b><i>X</i><!--container--><b>Hello </b><i>A</i><b>Hello </b><i>B</i><b>Hello </b><i>C</i>');
  });

  describe('getViewContainer', () => {
    it('should lazily create LContainers and add them to the internal linked list in the order of DOM',
       () => {
         /*
          <one/>
          <two/>
          <three/>
          <four/>
         */
         const fixture = new TemplateFixture(
             () => {
               element(0, 'one');
               element(1, 'two');
               element(2, 'three');
               element(3, 'four');
             },
             () => {

             },
             4, 0);

         const one = fixture.hostElement.querySelector('one') !;
         const two = fixture.hostElement.querySelector('two') !;
         const three = fixture.hostElement.querySelector('three') !;
         const four = fixture.hostElement.querySelector('four') !;

         // This is adding to the CHILD_HEAD and CHILD_TAIL
         const threeContainer = getViewContainer(three);
         // This is inserting to CHILD_HEAD infront of existing CHILD_HEAD
         const oneContainer = getViewContainer(one);
         // This is inserting at CHILD_TAIL, after existing CHILD_TAIL
         const fourContainer = getViewContainer(four);
         // This is inserting in the middle of the list
         const twoContainer = getViewContainer(two);

         let cursor = fixture.hostView[CHILD_HEAD];

         expect(cursor).toBe(oneContainer as any);

         cursor = cursor ![NEXT];
         expect(cursor).toBe(twoContainer as any);

         cursor = cursor ![NEXT];
         expect(cursor).toBe(threeContainer as any);

         cursor = cursor ![NEXT];
         expect(cursor).toBe(fourContainer as any);

         expect(fixture.hostView[CHILD_TAIL]).toBe(cursor);
         expect(cursor ![NEXT]).toEqual(null);
       });

    it('should lazily create LContainers and add them to the internal linked list in order of DOM, depth first',
       () => {
         /*
           <one>
             <two>
               <three>
                 <four/>
               </three>
             </two>
           </one>
         */
         const fixture = new TemplateFixture(
             () => {
               elementStart(0, 'one');
               {
                 elementStart(1, 'two');

                 {
                   elementStart(2, 'three');
                   {
                     element(3, 'four');  //
                   }
                   elementEnd();
                 }
                 elementEnd();
               }
               elementEnd();
             },
             () => {

             },
             4, 0);

         const one = fixture.hostElement.querySelector('one') !;
         const two = fixture.hostElement.querySelector('two') !;
         const three = fixture.hostElement.querySelector('three') !;
         const four = fixture.hostElement.querySelector('four') !;

         // This is adding to the CHILD_HEAD and CHILD_TAIL
         const threeContainer = getViewContainer(three);
         // This is inserting to CHILD_HEAD infront of existing CHILD_HEAD
         const oneContainer = getViewContainer(one);
         // This is inserting at CHILD_TAIL, after existing CHILD_TAIL
         const fourContainer = getViewContainer(four);
         // This is inserting in the middle of the list
         const twoContainer = getViewContainer(two);

         let cursor = fixture.hostView[CHILD_HEAD];

         expect(cursor).toBe(oneContainer as any);

         cursor = cursor ![NEXT];
         expect(cursor).toBe(twoContainer as any);

         cursor = cursor ![NEXT];
         expect(cursor).toBe(threeContainer as any);

         cursor = cursor ![NEXT];
         expect(cursor).toBe(fourContainer as any);

         expect(fixture.hostView[CHILD_TAIL]).toBe(cursor);
         expect(cursor ![NEXT]).toEqual(null);
       });
  });

  describe('viewContainerRemove', () => {
    it('should remove views from a container', () => {
      /*
       <div></div><ng-template><span></span></ng-template>
      */
      const fixture = new TemplateFixture(
          () => {
            element(0, 'div');
            template(1, (rf: RenderFlags, ctx: any) => {
              if (rf & RenderFlags.Create) {
                element(0, 'span');
              }
            }, 1, 0);
          },
          () => {

          },
          2, 0);

      expect(fixture.htmlWithContainerComments).toEqual('<div></div><!--container-->');
      const containerComment = fixture.hostElement.lastChild !;
      const embeddedViewFactory = getEmbeddedViewFactory(containerComment) !;
      const view = embeddedViewFactory({});
      const container = getViewContainer(containerComment) !;
      viewContainerInsertAfter(container, view, null);
      expect(fixture.htmlWithContainerComments).toEqual('<div></div><!--container--><span></span>');
      viewContainerRemove(container, view);
      expect(fixture.htmlWithContainerComments).toEqual('<div></div><!--container-->');
    });

    it('should remove all dom elements for a view, as there could be more than one', () => {
      /*
      <ul>
        <ng-template>
          <li>one</li>
          <li>two</li>
          <li>three</li>
        </ng-template>
      </ul>
      */
      const fixture = new TemplateFixture(
          () => {
            elementStart(0, 'ul');
            template(1, (rf: RenderFlags, ctx: any) => {
              if (rf & RenderFlags.Create) {
                elementStart(0, 'li');
                text(1, 'one');
                elementEnd();
                elementStart(2, 'li');
                text(3, 'two');
                elementEnd();
                elementStart(4, 'li');
                text(5, 'three');
                elementEnd();
              }
            }, 6, 0);
            elementEnd();
          },
          () => {

          },
          2, 0);

      expect(fixture.htmlWithContainerComments).toEqual('<ul><!--container--></ul>');
      const containerComment = fixture.hostElement.firstChild !.firstChild !;
      const embeddedViewFactory = getEmbeddedViewFactory(containerComment) !;
      const container = getViewContainer(containerComment) !;
      const view = embeddedViewFactory({});
      viewContainerInsertAfter(container, view, null);
      expect(fixture.htmlWithContainerComments)
          .toEqual('<ul><!--container--><li>one</li><li>two</li><li>three</li></ul>');
      viewContainerRemove(container, view);
      expect(fixture.htmlWithContainerComments).toEqual('<ul><!--container--></ul>');
    });
  });

  describe('viewContainerInsertAfter', () => {
    it('should insert views in the container', () => {
      /*
        <div></div><ng-template><span></span></ng-template>
      */
      const fixture = new TemplateFixture(
          () => {
            element(0, 'div');
            template(1, (rf: RenderFlags, ctx: any) => {
              if (rf & RenderFlags.Create) {
                element(0, 'span');
              }
            }, 1, 0);
          },
          () => {

          },
          2, 0);

      const containerComment = fixture.hostElement.lastChild !;
      const embeddedViewFactory = getEmbeddedViewFactory(containerComment) !;
      const container = getViewContainer(containerComment) !;

      expect(viewContainerLength(container)).toBe(0);

      const view1 = embeddedViewFactory({});
      viewContainerInsertAfter(container, view1, null);
      expect(viewContainerLength(container)).toBe(1);
      expect(viewContainerGet(container, 0)).toBe(view1);

      const view2 = embeddedViewFactory({});
      viewContainerInsertAfter(container, view2, view1);
      expect(viewContainerLength(container)).toBe(2);
      expect(viewContainerGet(container, 1)).toBe(view2);

      const view3 = embeddedViewFactory({});
      viewContainerInsertAfter(container, view3, view2);
      expect(viewContainerLength(container)).toBe(3);
      expect(viewContainerGet(container, 2)).toBe(view3);

      // assure that passing null will prepend even if other views are in there.
      const viewA = embeddedViewFactory({});

      viewContainerInsertAfter(container, viewA, null);
      expect(viewContainerLength(container)).toBe(4);
      expect(viewContainerGet(container, 0)).toBe(viewA);
      expect(viewContainerGet(container, 1)).toBe(view1);
      expect(viewContainerGet(container, 2)).toBe(view2);
      expect(viewContainerGet(container, 3)).toBe(view3);
    });
  });

  describe('viewContainerIndexOf', () => {
    it('should find the first index of a container within a view, and return -1 if it cannot find it',
       () => {
         /*
          <div></div><ng-template><span></span></ng-template>
         */
         const fixture = new TemplateFixture(
             () => {
               element(0, 'div');
               template(1, (rf: RenderFlags, ctx: any) => {
                 if (rf & RenderFlags.Create) {
                   element(0, 'span');
                 }
               }, 1, 0);
             },
             () => {

             },
             2, 0);

         const containerComment = fixture.hostElement.lastChild !;
         const embeddedViewFactory = getEmbeddedViewFactory(containerComment) !;
         const view = embeddedViewFactory({});
         const container = getViewContainer(containerComment) !;

         expect(viewContainerIndexOf(container, view))
             .toBe(-1);  // not found because it's not inserted yet.

         // insert one view and see if an index is returned.
         viewContainerInsertAfter(container, view, null);
         expect(viewContainerIndexOf(container, view)).toBe(0);

         // insert the view twice, just to make sure the first index is returned.
         viewContainerInsertAfter(container, view, null);
         expect(viewContainerIndexOf(container, view)).toBe(0);
       });
  });

  describe('viewContainerGet', () => {
    it('should get a view by index from the container', () => {
      /*
        <div></div><ng-template><span></span></ng-template>
      */
      const fixture = new TemplateFixture(
          () => {
            element(0, 'div');
            template(1, (rf: RenderFlags, ctx: any) => {
              if (rf & RenderFlags.Create) {
                element(0, 'span');
              }
            }, 1, 0);
          },
          () => {

          },
          2, 0);

      const containerComment = fixture.hostElement.lastChild !;
      const embeddedViewFactory = getEmbeddedViewFactory(containerComment) !;
      const container = getViewContainer(containerComment) !;

      const view1 = embeddedViewFactory({});
      viewContainerInsertAfter(container, view1, null);


      const view2 = embeddedViewFactory({});
      viewContainerInsertAfter(container, view2, view1);

      expect(viewContainerGet(container, 0)).toBe(view1);
      expect(viewContainerGet(container, 1)).toBe(view2);
    });
  });

  describe('viewContainerLength', () => {
    it('should get the current length of the container, by contained view count', () => {
      /*
        <div></div><ng-template><span></span></ng-template>
      */
      const fixture = new TemplateFixture(
          () => {
            element(0, 'div');
            template(1, (rf: RenderFlags, ctx: any) => {
              if (rf & RenderFlags.Create) {
                element(0, 'span');
              }
            }, 1, 0);
          },
          () => {

          },
          2, 0);

      const containerComment = fixture.hostElement.lastChild !;
      const embeddedViewFactory = getEmbeddedViewFactory(containerComment) !;
      const container = getViewContainer(containerComment) !;
      expect(viewContainerLength(container)).toBe(0);

      const view1 = embeddedViewFactory({});
      viewContainerInsertAfter(container, view1, null);
      expect(viewContainerLength(container)).toBe(1);


      const view2 = embeddedViewFactory({});
      viewContainerInsertAfter(container, view2, view1);
      expect(viewContainerLength(container)).toBe(2);
    });
  });
});
