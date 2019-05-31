/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {onlyInIvy} from '@angular/private/testing';

describe('TemplateRef', () => {
  describe('rootNodes', () => {
    it('should include projected nodes in rootNodes', () => {
      @Component({
        selector: 'menu-content',
        template: `
          <ng-template>
            Header
            <ng-content></ng-content>
          </ng-template>
        `,
        exportAs: 'menuContent'
      })
      class MenuContent {
        @ViewChild(TemplateRef, {static: true}) template !: TemplateRef<any>;
      }

      @Component({
        template: `
          <menu-content #menu="menuContent">
            <button>Item one</button>
            <button>Item two</button>
          </menu-content>
        `
      })
      class App {
        @ViewChild(MenuContent, {static: false}) content !: MenuContent;

        constructor(public viewContainerRef: ViewContainerRef) {}
      }

      TestBed.configureTestingModule({declarations: [MenuContent, App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const instance = fixture.componentInstance;
      const viewRef = instance.viewContainerRef.createEmbeddedView(instance.content.template);
      const rootNodeTextContent = viewRef.rootNodes.map(node => node && node.textContent.trim())
                                      .filter(text => text !== '');

      expect(rootNodeTextContent).toEqual(['Header', 'Item one', 'Item two']);
    });

    it('should return root render nodes for an embedded view instance', () => {
      @Component({
        template: `
          <ng-template #templateRef>
            <div></div>
            some text
            <span></span>
          </ng-template>
        `
      })
      class App {
        @ViewChild('templateRef', {static: true})
        templateRef !: TemplateRef<any>;
      }

      TestBed.configureTestingModule({
        declarations: [App],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const embeddedView = fixture.componentInstance.templateRef.createEmbeddedView({});
      expect(embeddedView.rootNodes.length).toBe(3);
    });

    /**
     * This is different as compared to the view engine implementation which returns a comment node
     * in this case:
     * https://stackblitz.com/edit/angular-uiqry6?file=src/app/app.component.ts
     *
     * Returning a comment node for a template ref with no nodes is wrong is fixed in Ivy.
     */
    onlyInIvy('Fixed: Ivy no longer adds a comment node in this case.')
        .it('should return an empty array for embedded view with no nodes', () => {
          @Component({
            template: `
              <ng-template #templateRef></ng-template>
            `
          })
          class App {
            @ViewChild('templateRef', {static: true})
            templateRef !: TemplateRef<any>;
          }

          TestBed.configureTestingModule({
            declarations: [App],
          });
          const fixture = TestBed.createComponent(App);
          fixture.detectChanges();

          const embeddedView = fixture.componentInstance.templateRef.createEmbeddedView({});
          expect(embeddedView.rootNodes.length).toBe(0);
        });

    it('should not descend into containers when retrieving root nodes', () => {
      /**
       * NOTE: In VE, if `SUFFIX` text node below is _not_ present, VE will add an
       * additional `<!---->` comment, thus being slightly different than Ivy.
       * (resulting in 1 root node in Ivy and 2 in VE).
       */
      @Component({
        template: `
          <ng-template #templateRef><ng-template [ngIf]="true">text</ng-template>SUFFIX</ng-template>
        `
      })
      class App {
        @ViewChild('templateRef', {static: true})
        templateRef !: TemplateRef<any>;
      }

      TestBed.configureTestingModule({
        declarations: [App],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const embeddedView = fixture.componentInstance.templateRef.createEmbeddedView({});
      expect(embeddedView.rootNodes.length).toBe(2);
      expect(embeddedView.rootNodes[0].nodeType).toBe(Node.COMMENT_NODE);
      expect(embeddedView.rootNodes[1].nodeType).toBe(Node.TEXT_NODE);
    });

    /**
     * Contrary to containers (<ng-template>) we _do_ descend into element containers
     * (<ng-container>)
     */
    it('should descend into element containers when retrieving root nodes', () => {
      @Component({
        template: `
          <ng-template #templateRef>
            <ng-container>text</ng-container>
          </ng-template>
        `
      })
      class App {
        @ViewChild('templateRef', {static: true})
        templateRef !: TemplateRef<any>;
      }

      TestBed.configureTestingModule({
        declarations: [App],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const embeddedView = fixture.componentInstance.templateRef.createEmbeddedView({});

      expect(embeddedView.rootNodes.length).toBe(2);
      expect(embeddedView.rootNodes[0].nodeType).toBe(Node.COMMENT_NODE);
      expect(embeddedView.rootNodes[1].nodeType).toBe(Node.TEXT_NODE);
    });
  });
});
