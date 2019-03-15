/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component, NgModule} from '@angular/core';
import {getEmbeddedViewFactory, getViewContainer, viewContainerGetAt, viewContainerIndexOf, viewContainerInsertBefore, viewContainerLength, viewContainerRemove} from '@angular/core/src/render3/api/view';
import {CHILD_HEAD, CHILD_TAIL, NEXT} from '@angular/core/src/render3/interfaces/view';
import {readPatchedLView} from '@angular/core/src/render3/util/view_utils';
import {TestBed} from '@angular/core/testing';
import {onlyInIvy} from '@angular/private/testing';

onlyInIvy('This is an ivy-specific means of manipulating containers and views')
    .describe('ViewContainer manipulation commands', () => {
      it('should get the embedded view from a comment added by ng-template and be able to insert it',
         () => {
           @Component({
             selector: 'dynamic-cpt',
             template: `
              <div></div>
              <ng-template let-name="name">
                <b>Hello </b>
                <i>{{name}}</i>
              </ng-template>
             `
           })
           class App {
           }

           @NgModule({declarations: [App]})
           class MyTestModule {
           }

           TestBed.configureTestingModule({imports: [MyTestModule]});
           const fixture = TestBed.createComponent(App);
           fixture.detectChanges();

           const comment = fixture.nativeElement.lastChild;
           expect(comment.nodeType).toBe(Node.COMMENT_NODE);
           const embeddedViewFactory = getEmbeddedViewFactory(comment) !;
           expect(typeof embeddedViewFactory).toEqual('function');

           const commentViewContainer = getViewContainer(comment) !;

           const bView = embeddedViewFactory({name: 'B'});
           // Putting this in the very front.
           viewContainerInsertBefore(commentViewContainer, bView, null);

           // Now putting this in front of B (because it's in the very front).
           viewContainerInsertBefore(commentViewContainer, embeddedViewFactory({name: 'A'}), bView);

           // Putting this one after B
           viewContainerInsertBefore(commentViewContainer, embeddedViewFactory({name: 'C'}), null);

           // Putting this one right after that initial <div></div>
           const divViewContainer = getViewContainer(fixture.nativeElement.firstChild !) !;
           viewContainerInsertBefore(divViewContainer, embeddedViewFactory({name: 'X'}), null);

           fixture.detectChanges();

           expect(fixture.nativeElement.innerHTML)
               .toEqual(
                   '<div></div><b>Hello </b><i>X</i><!--container--><b>Hello </b><i>A</i><b>Hello </b><i>B</i><b>Hello </b><i>C</i>');
         });

      it('should get the embedded view from a comment added by ng-template and be able to insert it, where last node of inserted view is also a container',
         () => {
           @Component({
             selector: 'dynamic-cpt',
             template: `
                  <div></div>
                  <ng-template let-name="name">
                    <b>Hello </b>
                    <i *ngIf="true">{{name}}</i>
                  </ng-template>
                 `
           })
           class App {
           }

           @NgModule({declarations: [App], imports: [CommonModule]})
           class MyTestModule {
           }

           TestBed.configureTestingModule({imports: [MyTestModule]});
           const fixture = TestBed.createComponent(App);
           fixture.detectChanges();

           const comment = fixture.nativeElement.lastChild;
           expect(comment.nodeType).toBe(Node.COMMENT_NODE);
           const embeddedViewFactory = getEmbeddedViewFactory(comment) !;

           const commentViewContainer = getViewContainer(comment) !;

           const bView = embeddedViewFactory({name: 'B'});
           // Putting this in the very front.
           viewContainerInsertBefore(commentViewContainer, bView, null);
           fixture.detectChanges();

           // Now putting this in front of B (because it's in the very front).
           viewContainerInsertBefore(commentViewContainer, embeddedViewFactory({name: 'A'}), bView);
           fixture.detectChanges();

           // Putting this one after B
           viewContainerInsertBefore(commentViewContainer, embeddedViewFactory({name: 'C'}), null);
           fixture.detectChanges();

           // Putting this one right after that initial <div></div>
           const divViewContainer = getViewContainer(fixture.nativeElement.firstChild !) !;
           viewContainerInsertBefore(divViewContainer, embeddedViewFactory({name: 'X'}), null);
           fixture.detectChanges();

           expect(fixture.nativeElement.innerHTML.replace(/<!--bindings[.\s\S]*?-->/g, ''))
               .toEqual(
                   '<div></div><b>Hello </b><i>X</i><!--container--><b>Hello </b><i>A</i><b>Hello </b><i>B</i><b>Hello </b><i>C</i>');
         });

      it('should use the provided node to create the container, not the parent view host', () => {
        @Component({
          selector: 'dynamic-cpt',
          template: `
               <div class="container1"></div>
               <ng-template let-name="name">
                 <i *ngIf="true">{{name}}</i>
                 <div class="container2"></div>
               </ng-template>
              `
        })
        class App {
        }

        @NgModule({declarations: [App], imports: [CommonModule]})
        class MyTestModule {
        }

        TestBed.configureTestingModule({imports: [MyTestModule]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        const comment = fixture.nativeElement.lastChild;
        expect(comment.nodeType).toBe(Node.COMMENT_NODE);

        const embeddedViewFactory = getEmbeddedViewFactory(comment) !;

        const container1Element = fixture.nativeElement.querySelector('.container1');
        const viewContainer1 = getViewContainer(container1Element) !;

        // Insert a view that has a container in it.
        viewContainerInsertBefore(viewContainer1, embeddedViewFactory({name: 'A'}), null);

        // Get another container from *inside* the view we just inserted.
        const container2Element = fixture.nativeElement.querySelector('.container2');
        const viewContainer2 = getViewContainer(container2Element) !;

        // Insert into the inner container.
        viewContainerInsertBefore(viewContainer2, embeddedViewFactory({name: 'B'}), null);
        fixture.detectChanges();

        expect(fixture.nativeElement.innerHTML.replace(/<!--bindings[.\s\S]*?-->/g, ''))
            .toEqual(
                '<div class="container1"></div><i>A</i><div class="container2"></div><i>B</i><div class="container2"></div><!--container-->');

      });

      describe('getViewContainer', () => {
        it('should lazily create LContainers and add them to the internal linked list in the order of DOM',
           () => {
             @Component({
               selector: 'test',
               template: `
                <ng-template>one</ng-template>
                <ng-template>two</ng-template>
                <ng-template>three</ng-template>
                <ng-template>four</ng-template>
               `
             })
             class App {
             }

             @NgModule({declarations: [App]})
             class MyTestModule {
             }

             TestBed.configureTestingModule({imports: [MyTestModule]});
             const fixture = TestBed.createComponent(App);
             fixture.detectChanges();

             const one = fixture.nativeElement.firstChild !;
             const two = one.nextSibling;
             const three = two.nextSibling;
             const four = three.nextSibling;

             // This is adding to the CHILD_HEAD and CHILD_TAIL
             const threeContainer = getViewContainer(three);
             // This is inserting to CHILD_HEAD infront of existing CHILD_HEAD
             const oneContainer = getViewContainer(one);
             // This is inserting at CHILD_TAIL, after existing CHILD_TAIL
             const fourContainer = getViewContainer(four);
             // This is inserting in the middle of the list
             const twoContainer = getViewContainer(two);

             const hostView = readPatchedLView(fixture.nativeElement.firstChild) !;

             let cursor = hostView[CHILD_HEAD];

             expect(cursor).toBe(oneContainer as any);

             cursor = cursor ![NEXT];
             expect(cursor).toBe(twoContainer as any);

             cursor = cursor ![NEXT];
             expect(cursor).toBe(threeContainer as any);

             cursor = cursor ![NEXT];
             expect(cursor).toBe(fourContainer as any);

             expect(hostView[CHILD_TAIL]).toBe(cursor);
             expect(cursor ![NEXT]).toEqual(null);
           });

        it('should lazily create LContainers and add them to the internal linked list in order of DOM, depth first',
           () => {
             @Component({
               selector: 'test',
               template: `
                <div>
                  <ng-template>
                  </ng-template>
                  <div>
                    <ng-template>
                    </ng-template>
                    <div>
                      <ng-template>
                      </ng-template>
                      <div>
                        <ng-template>
                        </ng-template>
                      </div>
                    </div>
                  </div>
                </div>
              `
             })
             class App {
             }

             @NgModule({declarations: [App], imports: [CommonModule]})
             class MyTestModule {
             }

             TestBed.configureTestingModule({imports: [MyTestModule]});
             const fixture = TestBed.createComponent(App);
             fixture.detectChanges();

             const divs = fixture.nativeElement.querySelectorAll('div');
             const one = divs[0].firstChild;
             const two = divs[1].firstChild;
             const three = divs[2].firstChild;
             const four = divs[3].firstChild;

             // This is adding to the CHILD_HEAD and CHILD_TAIL
             const threeContainer = getViewContainer(three);
             // This is inserting to CHILD_HEAD in front of existing CHILD_HEAD
             const oneContainer = getViewContainer(one);
             // This is inserting at CHILD_TAIL, after existing CHILD_TAIL
             const fourContainer = getViewContainer(four);
             // This is inserting in the middle of the list
             const twoContainer = getViewContainer(two);

             const hostView = readPatchedLView(fixture.nativeElement.firstChild) !;

             let cursor = hostView[CHILD_HEAD];

             expect(cursor).toBe(oneContainer as any);

             cursor = cursor ![NEXT];
             expect(cursor).toBe(twoContainer as any);

             cursor = cursor ![NEXT];
             expect(cursor).toBe(threeContainer as any);

             cursor = cursor ![NEXT];
             expect(cursor).toBe(fourContainer as any);

             expect(hostView[CHILD_TAIL]).toBe(cursor);
             expect(cursor ![NEXT]).toEqual(null);
           });
      });

      describe('viewContainerRemove', () => {
        it('should remove views from a container', () => {
          @Component({
            selector: 'test',
            template: `
              <div></div>
              <ng-template><span></span></ng-template>
            `
          })
          class App {
          }

          @NgModule({declarations: [App]})
          class MyTestModule {
          }

          TestBed.configureTestingModule({imports: [MyTestModule]});
          const fixture = TestBed.createComponent(App);
          fixture.detectChanges();

          expect(fixture.nativeElement.innerHTML).toEqual('<div></div><!--container-->');
          const containerComment = fixture.nativeElement.lastChild !;
          const embeddedViewFactory = getEmbeddedViewFactory(containerComment) !;
          const view = embeddedViewFactory({});
          const container = getViewContainer(containerComment) !;
          viewContainerInsertBefore(container, view, null);
          fixture.detectChanges();

          expect(fixture.nativeElement.innerHTML)
              .toEqual('<div></div><!--container--><span></span>');
          viewContainerRemove(container, view, true);
          fixture.detectChanges();

          expect(fixture.nativeElement.innerHTML).toEqual('<div></div><!--container-->');
        });

        it('should remove all dom elements for a view, as there could be more than one', () => {
          @Component({
            selector: 'test',
            template: `
              <ul>
                <ng-template>
                  <li>one</li>
                  <li>two</li>
                  <li>three</li>
                </ng-template>
              </ul>
            `
          })
          class App {
          }

          @NgModule({declarations: [App]})
          class MyTestModule {
          }

          TestBed.configureTestingModule({imports: [MyTestModule]});
          const fixture = TestBed.createComponent(App);
          fixture.detectChanges();


          expect(fixture.nativeElement.innerHTML).toEqual('<ul><!--container--></ul>');
          const containerComment = fixture.nativeElement.firstChild !.firstChild !;
          const embeddedViewFactory = getEmbeddedViewFactory(containerComment) !;
          const container = getViewContainer(containerComment) !;

          const view = embeddedViewFactory({});
          viewContainerInsertBefore(container, view, null);
          fixture.detectChanges();

          expect(fixture.nativeElement.innerHTML)
              .toEqual('<ul><!--container--><li>one</li><li>two</li><li>three</li></ul>');
          viewContainerRemove(container, view, true);
          fixture.detectChanges();

          expect(fixture.nativeElement.innerHTML).toEqual('<ul><!--container--></ul>');
        });
      });

      describe('viewContainerInsertAfter', () => {
        it('should insert views in the container', () => {
          @Component({
            selector: 'test',
            template: `
              <div></div><ng-template><span></span></ng-template>
            `
          })
          class App {
          }

          @NgModule({declarations: [App]})
          class MyTestModule {
          }

          TestBed.configureTestingModule({imports: [MyTestModule]});
          const fixture = TestBed.createComponent(App);
          fixture.detectChanges();

          const containerComment = fixture.nativeElement.lastChild !;
          const embeddedViewFactory = getEmbeddedViewFactory(containerComment) !;
          const container = getViewContainer(containerComment) !;

          expect(viewContainerLength(container)).toBe(0);

          const view1 = embeddedViewFactory({});
          viewContainerInsertBefore(container, view1, null);

          expect(viewContainerLength(container)).toBe(1);
          expect(viewContainerGetAt(container, 0)).toBe(view1);

          const view2 = embeddedViewFactory({});
          viewContainerInsertBefore(container, view2, null);

          expect(viewContainerLength(container)).toBe(2);
          expect(viewContainerGetAt(container, 1)).toBe(view2);

          const view3 = embeddedViewFactory({});
          viewContainerInsertBefore(container, view3, null);

          expect(viewContainerLength(container)).toBe(3);
          expect(viewContainerGetAt(container, 2)).toBe(view3);

          const viewA = embeddedViewFactory({});
          viewContainerInsertBefore(container, viewA, view1);

          expect(viewContainerLength(container)).toBe(4);
          expect(viewContainerGetAt(container, 0)).toBe(viewA);
          expect(viewContainerGetAt(container, 1)).toBe(view1);
          expect(viewContainerGetAt(container, 2)).toBe(view2);
          expect(viewContainerGetAt(container, 3)).toBe(view3);
        });

        it('should move the view around if you insert the same view twice', () => {
          @Component({
            selector: 'test',
            template: `
              <div></div><ng-template><span></span></ng-template>
            `
          })
          class App {
          }

          @NgModule({declarations: [App]})
          class MyTestModule {
          }

          TestBed.configureTestingModule({imports: [MyTestModule]});
          const fixture = TestBed.createComponent(App);
          fixture.detectChanges();


          const containerComment = fixture.nativeElement.lastChild !;
          const embeddedViewFactory = getEmbeddedViewFactory(containerComment) !;
          const container = getViewContainer(containerComment) !;

          expect(viewContainerLength(container)).toBe(0);

          const view1 = embeddedViewFactory({});
          viewContainerInsertBefore(container, view1, null);
          fixture.detectChanges();

          expect(viewContainerLength(container)).toBe(1);
          expect(viewContainerGetAt(container, 0)).toBe(view1);

          const view2 = embeddedViewFactory({});
          viewContainerInsertBefore(container, view2, null);
          fixture.detectChanges();

          expect(viewContainerLength(container)).toBe(2);
          expect(viewContainerGetAt(container, 1)).toBe(view2);

          // Move view1 after view2 (it was before)
          viewContainerInsertBefore(container, view1, null);
          fixture.detectChanges();

          expect(viewContainerLength(container)).toBe(2);
          expect(viewContainerGetAt(container, 0)).toBe(view2);
          expect(viewContainerGetAt(container, 1)).toBe(view1);
        });
      });

      describe('viewContainerIndexOf', () => {
        it('should find the first index of a container within a view, and return -1 if it cannot find it',
           () => {
             @Component({
               selector: 'test',
               template: `
                 <div></div><ng-template><span></span></ng-template>
               `
             })
             class App {
             }

             @NgModule({declarations: [App]})
             class MyTestModule {
             }

             TestBed.configureTestingModule({imports: [MyTestModule]});
             const fixture = TestBed.createComponent(App);
             fixture.detectChanges();

             const containerComment = fixture.nativeElement.lastChild !;
             const embeddedViewFactory = getEmbeddedViewFactory(containerComment) !;
             const view1 = embeddedViewFactory({});
             const container = getViewContainer(containerComment) !;

             expect(viewContainerIndexOf(container, view1))
                 .toBe(-1);  // not found because it's not inserted yet.

             viewContainerInsertBefore(container, view1, null);
             expect(viewContainerIndexOf(container, view1)).toBe(0);

             const view2 = embeddedViewFactory({});
             viewContainerInsertBefore(container, view2, null);
             expect(viewContainerIndexOf(container, view2)).toBe(1);
           });
      });

      describe('viewContainerGetAt', () => {
        it('should get a view by index from the container', () => {
          @Component({
            selector: 'test',
            template: `
              <div></div><ng-template><span></span></ng-template>
            `
          })
          class App {
          }

          @NgModule({declarations: [App]})
          class MyTestModule {
          }

          TestBed.configureTestingModule({imports: [MyTestModule]});
          const fixture = TestBed.createComponent(App);
          fixture.detectChanges();

          const containerComment = fixture.nativeElement.lastChild !;
          const embeddedViewFactory = getEmbeddedViewFactory(containerComment) !;
          const container = getViewContainer(containerComment) !;

          const view1 = embeddedViewFactory({});
          viewContainerInsertBefore(container, view1, null);


          const view2 = embeddedViewFactory({});
          viewContainerInsertBefore(container, view2, null);

          expect(viewContainerGetAt(container, 0)).toBe(view1);
          expect(viewContainerGetAt(container, 1)).toBe(view2);
        });
      });

      describe('viewContainerLength', () => {
        it('should get the current length of the container, by contained view count', () => {
          @Component({
            selector: 'test',
            template: `
              <div></div><ng-template><span></span></ng-template>
            `
          })
          class App {
          }

          @NgModule({declarations: [App]})
          class MyTestModule {
          }

          TestBed.configureTestingModule({imports: [MyTestModule]});
          const fixture = TestBed.createComponent(App);
          fixture.detectChanges();

          const containerComment = fixture.nativeElement.lastChild !;
          const embeddedViewFactory = getEmbeddedViewFactory(containerComment) !;
          const container = getViewContainer(containerComment) !;
          expect(viewContainerLength(container)).toBe(0);

          const view1 = embeddedViewFactory({});
          viewContainerInsertBefore(container, view1, null);
          expect(viewContainerLength(container)).toBe(1);


          const view2 = embeddedViewFactory({});
          viewContainerInsertBefore(container, view2, null);
          expect(viewContainerLength(container)).toBe(2);
        });
      });
    });
