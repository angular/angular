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

  it('should project selected inline templates matching element name', () => {
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

  it('should select selected inline templates matching attributes', () => {
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

  it('should select selected inline templates matching classes', () => {
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
});
