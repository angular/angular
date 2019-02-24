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
        @ViewChild(TemplateRef) template !: TemplateRef<any>;
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
        @ViewChild(MenuContent) content !: MenuContent;

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
  });

});
