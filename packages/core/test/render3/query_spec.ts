/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, Injectable, QueryList, TemplateRef, ViewChild, ViewChildren, ViewContainerRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';


describe('query', () => {
  describe('predicate', () => {
    describe('providers', () => {
      @Injectable()
      class Service {
      }

      @Injectable()
      class Alias {
      }

      let directive: MyDirective|null = null;

      @Directive({
        selector: '[myDir]',
        standalone: true,
        providers: [
          Service,
          {provide: Alias, useExisting: Service},
        ],
      })
      class MyDirective {
        constructor(public service: Service) {
          directive = this;
        }
      }

      beforeEach(() => directive = null);

      // https://stackblitz.com/edit/ng-viewengine-viewchild-providers?file=src%2Fapp%2Fapp.component.ts
      it('should query for providers that are present on a directive', () => {
        @Component({
          selector: 'app',
          template: '<div myDir></div>',
          imports: [MyDirective],
          standalone: true,
        })
        class App {
          @ViewChild(MyDirective) directive!: MyDirective;
          @ViewChild(Service) service!: Service;
          @ViewChild(Alias) alias!: Alias;
        }

        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const component = fixture.componentInstance;
        expect(component.directive).toBe(directive!);
        expect(component.service).toBe(directive!.service);
        expect(component.alias).toBe(directive!.service);
      });

      it('should resolve a provider if given as read token', () => {
        @Component({
          selector: 'app',
          standalone: true,
          template: '<div myDir></div>',
          imports: [MyDirective],
        })
        class App {
          @ViewChild(MyDirective, {read: Alias}) service!: Service;
        }

        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        expect(fixture.componentInstance.service).toBe(directive!.service);
      });
    });
  });

  it('should restore queries if view changes', () => {
    @Directive({
      selector: '[someDir]',
      standalone: true,
    })
    class SomeDir {
      constructor(public vcr: ViewContainerRef, public temp: TemplateRef<any>) {
        this.vcr.createEmbeddedView(this.temp);
      }
    }

    @Component({
      selector: 'app',
      standalone: true,
      template: `
        <div *someDir></div>
        <div #foo></div>
      `,
      imports: [SomeDir],
    })
    class AppComponent {
      @ViewChildren('foo') query!: QueryList<any>;
    }

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.query.length).toBe(1);
  });
});
