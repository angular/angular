/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ComponentFactoryResolver, Injector, NgModule, TemplateRef, ViewChild, ViewContainerRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {ivyEnabled, onlyInIvy} from '@angular/private/testing';

describe('TemplateRef', () => {
  describe('rootNodes', () => {
    @Component({template: `<ng-template #templateRef></ng-template>`})
    class App {
      @ViewChild('templateRef', {static: true}) templateRef!: TemplateRef<any>;
      minutes = 0;
    }

    function getRootNodes(template: string): any[] {
      TestBed.configureTestingModule({
        declarations: [App],
      });
      TestBed.overrideTemplate(App, template);
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const embeddedView = fixture.componentInstance.templateRef.createEmbeddedView({});
      embeddedView.detectChanges();

      return embeddedView.rootNodes;
    }


    it('should return root render nodes for an embedded view instance', () => {
      const rootNodes =
          getRootNodes(`<ng-template #templateRef><div></div>some text<span></span></ng-template>`);
      expect(rootNodes.length).toBe(3);
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
          const rootNodes = getRootNodes('<ng-template #templateRef></ng-template>');
          expect(rootNodes.length).toBe(0);
        });

    it('should include projected nodes and their children', () => {
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
                <ng-template [ngIf]="true"><button>Item three</button></ng-template>
              </menu-content>
            `
      })
      class App {
        @ViewChild(MenuContent) content!: MenuContent;

        constructor(public viewContainerRef: ViewContainerRef) {}
      }

      TestBed.configureTestingModule({declarations: [MenuContent, App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const instance = fixture.componentInstance;
      const viewRef = instance.viewContainerRef.createEmbeddedView(instance.content.template);
      const rootNodeTextContent =
          viewRef.rootNodes.map(node => node && node.textContent.trim())
              .filter(text => text !== '' && text.indexOf('ng-reflect-ng-if') === -1);

      expect(rootNodeTextContent).toEqual(['Header', 'Item one', 'Item two', 'Item three']);
    });

    it('should descend into view containers on ng-template', () => {
      /**
       * NOTE: In VE, if `SUFFIX` text node below is _not_ present, VE will add an
       * additional `<!---->` comment, thus being slightly different than Ivy.
       * (resulting in 1 root node in Ivy and 2 in VE).
       */
      const rootNodes = getRootNodes(`
      <ng-template #templateRef>
        <ng-template [ngIf]="true">text|</ng-template>SUFFIX
      </ng-template>`);

      expect(rootNodes.length).toBe(3);
      expect(rootNodes[0].nodeType).toBe(Node.COMMENT_NODE);
      expect(rootNodes[1].nodeType).toBe(Node.TEXT_NODE);
      expect(rootNodes[2].nodeType).toBe(Node.TEXT_NODE);
    });

    it('should descend into view containers on an element', () => {
      /**
       * NOTE: In VE, if `SUFFIX` text node below is _not_ present, VE will add an
       * additional `<!---->` comment, thus being slightly different than Ivy.
       * (resulting in 1 root node in Ivy and 2 in VE).
       */
      const rootNodes = getRootNodes(`
      <ng-template #dynamicTpl>text</ng-template>
      <ng-template #templateRef>
        <div [ngTemplateOutlet]="dynamicTpl"></div>SUFFIX
      </ng-template>
    `);

      expect(rootNodes.length).toBe(3);
      expect(rootNodes[0].nodeType).toBe(Node.ELEMENT_NODE);
      expect(rootNodes[1].nodeType).toBe(Node.TEXT_NODE);
      expect(rootNodes[2].nodeType).toBe(Node.TEXT_NODE);
    });

    it('should descend into view containers on ng-container', () => {
      /**
       * NOTE: In VE, if `SUFFIX` text node below is _not_ present, VE will add an
       * additional `<!---->` comment, thus being slightly different than Ivy.
       * (resulting in 1 root node in Ivy and 2 in VE).
       */
      const rootNodes = getRootNodes(`
          <ng-template #dynamicTpl>text</ng-template>
          <ng-template #templateRef><ng-container [ngTemplateOutlet]="dynamicTpl"></ng-container>SUFFIX</ng-template>
        `);

      expect(rootNodes.length).toBe(3);
      expect(rootNodes[0].nodeType).toBe(Node.COMMENT_NODE);
      expect(rootNodes[1].nodeType).toBe(Node.TEXT_NODE);
      expect(rootNodes[2].nodeType).toBe(Node.TEXT_NODE);
    });

    it('should descend into element containers', () => {
      const rootNodes = getRootNodes(`
          <ng-template #templateRef>
            <ng-container>text</ng-container>
          </ng-template>
        `);

      expect(rootNodes.length).toBe(2);
      expect(rootNodes[0].nodeType).toBe(Node.COMMENT_NODE);
      expect(rootNodes[1].nodeType).toBe(Node.TEXT_NODE);
    });

    it('should descend into ICU containers', () => {
      const rootNodes = getRootNodes(`
          <ng-template #templateRef>
            <ng-container i18n>Updated {minutes, select, =0 {just now} other {some time ago}}</ng-container>
          </ng-template>
        `);

      if (ivyEnabled) {
        expect(rootNodes.length).toBe(4);
        expect(rootNodes[0].nodeType).toBe(Node.COMMENT_NODE);  // ng-container
        expect(rootNodes[1].nodeType).toBe(Node.TEXT_NODE);     // "Updated " text
        expect(rootNodes[2].nodeType).toBe(Node.COMMENT_NODE);  // ICU container
        expect(rootNodes[3].nodeType).toBe(Node.TEXT_NODE);     // "one minute ago" text
      } else {
        // ViewEngine seems to produce very different DOM structure as compared to ivy
        // when it comes to ICU containers - this needs more investigation / fix.
        expect(rootNodes.length).toBe(7);
      }
    });

    it('should return an empty array for an embedded view with projection and no projectable nodes',
       () => {
         const rootNodes =
             getRootNodes(`<ng-template #templateRef><ng-content></ng-content></ng-template>`);
         // VE will, incorrectly, return an additional comment node in this case
         expect(rootNodes.length).toBe(ivyEnabled ? 0 : 1);
       });

    it('should return an empty array for an embedded view with multiple projections and no projectable nodes',
       () => {
         const rootNodes = getRootNodes(
             `<ng-template #templateRef><ng-content></ng-content><ng-content select="foo"></ng-content></ng-template>`);
         // VE will, incorrectly, return an additional comment node in this case
         expect(rootNodes.length).toBe(ivyEnabled ? 0 : 1);
       });

    describe('projectable nodes provided to a dynamically created component', () => {
      @Component({selector: 'dynamic', template: ''})
      class DynamicCmp {
        @ViewChild('templateRef', {static: true}) templateRef!: TemplateRef<any>;
      }

      @NgModule({
        declarations: [DynamicCmp],
        entryComponents: [DynamicCmp],
      })
      class WithDynamicCmpModule {
      }

      @Component({selector: 'test', template: ''})
      class TestCmp {
        constructor(public cfr: ComponentFactoryResolver) {}
      }

      beforeEach(() => {
        TestBed.configureTestingModule({
          declarations: [TestCmp],
          imports: [WithDynamicCmpModule],
        });
      });

      it('should return projectable nodes when provided', () => {
        TestBed.overrideTemplate(
            DynamicCmp, `<ng-template #templateRef><ng-content></ng-content></ng-template>`);

        const fixture = TestBed.createComponent(TestCmp);
        const dynamicCmptFactory =
            fixture.componentInstance.cfr.resolveComponentFactory(DynamicCmp);

        // Number of projectable nodes matches the number of slots - all nodes should be returned
        const projectableNodes = [[document.createTextNode('textNode')]];
        const cmptRef = dynamicCmptFactory.create(Injector.NULL, projectableNodes);
        const viewRef = cmptRef.instance.templateRef.createEmbeddedView({});

        // VE will, incorrectly, return an additional comment node in this case
        expect(viewRef.rootNodes.length).toBe(ivyEnabled ? 1 : 2);
      });

      it('should return an empty collection when no projectable nodes were provided', () => {
        TestBed.overrideTemplate(
            DynamicCmp, `<ng-template #templateRef><ng-content></ng-content></ng-template>`);

        const fixture = TestBed.createComponent(TestCmp);
        const dynamicCmptFactory =
            fixture.componentInstance.cfr.resolveComponentFactory(DynamicCmp);

        // There are slots but projectable nodes were not provided - nothing should be returned
        const cmptRef = dynamicCmptFactory.create(Injector.NULL, []);
        const viewRef = cmptRef.instance.templateRef.createEmbeddedView({});

        // VE will, incorrectly, return an additional comment node in this case
        expect(viewRef.rootNodes.length).toBe(ivyEnabled ? 0 : 1);
      });

      it('should return an empty collection when projectable nodes were provided but there are no slots',
         () => {
           TestBed.overrideTemplate(DynamicCmp, `<ng-template #templateRef></ng-template>`);

           const fixture = TestBed.createComponent(TestCmp);
           const dynamicCmptFactory =
               fixture.componentInstance.cfr.resolveComponentFactory(DynamicCmp);

           // There are no slots but projectable were provided - nothing should be returned
           const projectableNodes = [[document.createTextNode('textNode')]];
           const cmptRef = dynamicCmptFactory.create(Injector.NULL, projectableNodes);
           const viewRef = cmptRef.instance.templateRef.createEmbeddedView({});

           // VE will, incorrectly, return an additional comment node in this case
           expect(viewRef.rootNodes.length).toBe(ivyEnabled ? 0 : 1);
         });
    });
  });

  describe('context', () => {
    @Component({
      template: `
      <ng-template #templateRef let-name="name">{{name}}</ng-template>
      <ng-container #containerRef></ng-container>
    `
    })
    class App {
      @ViewChild('templateRef') templateRef!: TemplateRef<any>;
      @ViewChild('containerRef', {read: ViewContainerRef}) containerRef!: ViewContainerRef;
    }

    it('should update if the context of a view ref is mutated', () => {
      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const context = {name: 'Frodo'};
      const viewRef = fixture.componentInstance.templateRef.createEmbeddedView(context);
      fixture.componentInstance.containerRef.insert(viewRef);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Frodo');

      context.name = 'Bilbo';
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Bilbo');
    });

    it('should update if the context of a view ref is replaced', () => {
      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const viewRef = fixture.componentInstance.templateRef.createEmbeddedView({name: 'Frodo'});
      fixture.componentInstance.containerRef.insert(viewRef);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Frodo');

      viewRef.context = {name: 'Bilbo'};
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Bilbo');
    });

    it('should use the latest context information inside template listeners', () => {
      const events: string[] = [];

      @Component({
        template: `
          <ng-template #templateRef let-name="name">
            <button (click)="log(name)"></button>
          </ng-template>
          <ng-container #containerRef></ng-container>
        `
      })
      class ListenerTest {
        @ViewChild('templateRef') templateRef!: TemplateRef<any>;
        @ViewChild('containerRef', {read: ViewContainerRef}) containerRef!: ViewContainerRef;

        log(name: string) {
          events.push(name);
        }
      }

      TestBed.configureTestingModule({declarations: [ListenerTest]});
      const fixture = TestBed.createComponent(ListenerTest);
      fixture.detectChanges();
      const viewRef = fixture.componentInstance.templateRef.createEmbeddedView({name: 'Frodo'});
      fixture.componentInstance.containerRef.insert(viewRef);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      button.click();
      expect(events).toEqual(['Frodo']);

      viewRef.context = {name: 'Bilbo'};
      fixture.detectChanges();
      button.click();
      expect(events).toEqual(['Frodo', 'Bilbo']);
    });
  });
});
