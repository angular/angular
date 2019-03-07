/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('projection', () => {
  it('should handle projected containers inside other containers', () => {
    @Component({
      selector: 'child-comp',  //
      template: '<ng-content></ng-content>'
    })
    class ChildComp {
    }

    @Component({
      selector: 'root-comp',  //
      template: '<ng-content></ng-content>'
    })
    class RootComp {
    }

    @Component({
      selector: 'my-app',
      template: `
        <root-comp>
          <ng-container *ngFor="let item of items; last as last">
            <child-comp *ngIf="!last">{{ item }}|</child-comp>
          </ng-container>
        </root-comp>
      `
    })
    class MyApp {
      items: number[] = [1, 2, 3];
    }

    TestBed.configureTestingModule({declarations: [ChildComp, RootComp, MyApp]});
    const fixture = TestBed.createComponent(MyApp);
    fixture.detectChanges();

    // expecting # of elements to be (items.length - 1), since last element is filtered out by
    // *ngIf, this applies to all other assertions below
    expect(fixture.nativeElement).toHaveText('1|2|');

    fixture.componentInstance.items = [4, 5];
    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('4|');

    fixture.componentInstance.items = [6, 7, 8, 9];
    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('6|7|8|');
  });

  describe('on inline templates (e.g.  *ngIf)', () => {
    it('should work when matching the element name', () => {
      let divDirectives = 0;
      @Component({selector: 'selector-proj', template: '<ng-content select="div"></ng-content>'})
      class SelectedNgContentComp {
      }

      @Directive({selector: 'div'})
      class DivDirective {
        constructor() { divDirectives++; }
      }

      @Component({
        selector: 'main-selector',
        template: '<selector-proj><div x="true" *ngIf="true">Hello world!</div></selector-proj>'
      })
      class SelectorMainComp {
      }

      TestBed.configureTestingModule(
          {declarations: [DivDirective, SelectedNgContentComp, SelectorMainComp]});
      const fixture = TestBed.createComponent<SelectorMainComp>(SelectorMainComp);

      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('Hello world!');
      expect(divDirectives).toEqual(1);
    });

    it('should work when matching attributes', () => {
      let xDirectives = 0;
      @Component({selector: 'selector-proj', template: '<ng-content select="[x]"></ng-content>'})
      class SelectedNgContentComp {
      }

      @Directive({selector: '[x]'})
      class XDirective {
        constructor() { xDirectives++; }
      }

      @Component({
        selector: 'main-selector',
        template: '<selector-proj><div x="true" *ngIf="true">Hello world!</div></selector-proj>'
      })
      class SelectorMainComp {
      }

      TestBed.configureTestingModule(
          {declarations: [XDirective, SelectedNgContentComp, SelectorMainComp]});
      const fixture = TestBed.createComponent<SelectorMainComp>(SelectorMainComp);

      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('Hello world!');
      expect(xDirectives).toEqual(1);
    });

    it('should work when matching classes', () => {
      let xDirectives = 0;
      @Component({selector: 'selector-proj', template: '<ng-content select=".x"></ng-content>'})
      class SelectedNgContentComp {
      }

      @Directive({selector: '.x'})
      class XDirective {
        constructor() { xDirectives++; }
      }

      @Component({
        selector: 'main-selector',
        template: '<selector-proj><div class="x" *ngIf="true">Hello world!</div></selector-proj>'
      })
      class SelectorMainComp {
      }

      TestBed.configureTestingModule(
          {declarations: [XDirective, SelectedNgContentComp, SelectorMainComp]});
      const fixture = TestBed.createComponent<SelectorMainComp>(SelectorMainComp);

      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('Hello world!');
      expect(xDirectives).toEqual(1);
    });

    it('should ignore synthesized attributes (e.g. ngTrackBy)', () => {
      @Component(
          {selector: 'selector-proj', template: '<ng-content select="[ngTrackBy]"></ng-content>'})
      class SelectedNgContentComp {
      }

      @Component({
        selector: 'main-selector',
        template:
            'inline(<selector-proj><div *ngFor="let item of items trackBy getItemId">{{item.name}}</div></selector-proj>)' +
            'ng-template(<selector-proj><ng-template ngFor [ngForOf]="items" let-item ngTrackBy="getItemId"><div>{{item.name}}</div></ng-template></selector-proj>)'
      })
      class SelectorMainComp {
        items = [
          {id: 1, name: 'one'},
          {id: 2, name: 'two'},
          {id: 3, name: 'three'},
        ];
        getItemId(item: {id: number}) { return item.id; }
      }

      TestBed.configureTestingModule({declarations: [SelectedNgContentComp, SelectorMainComp]});
      const fixture = TestBed.createComponent<SelectorMainComp>(SelectorMainComp);

      fixture.detectChanges();
      expect(fixture.nativeElement).toHaveText('inline()ng-template(onetwothree)');
    });
  });
});