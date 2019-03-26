/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component, Directive, ElementRef, HostBinding, Input} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {ivyEnabled, onlyInIvy} from '@angular/private/testing';

describe('acceptance integration tests', () => {
  onlyInIvy('[style] and [class] bindings are a new feature')
      .it('should render host bindings on the root component', () => {
        @Component({template: '...'})
        class MyApp {
          @HostBinding('style') public myStylesExp = {};
          @HostBinding('class') public myClassesExp = {};
        }

        TestBed.configureTestingModule({declarations: [MyApp]});
        const fixture = TestBed.createComponent(MyApp);
        const element = fixture.nativeElement;
        fixture.detectChanges();

        const component = fixture.componentInstance;
        component.myStylesExp = {width: '100px'};
        component.myClassesExp = 'foo';
        fixture.detectChanges();

        expect(element.style['width']).toEqual('100px');
        expect(element.classList.contains('foo')).toBeTruthy();

        component.myStylesExp = {width: '200px'};
        component.myClassesExp = 'bar';
        fixture.detectChanges();

        expect(element.style['width']).toEqual('200px');
        expect(element.classList.contains('foo')).toBeFalsy();
        expect(element.classList.contains('bar')).toBeTruthy();
      });

  it('should render host class and style on the root component', () => {
    @Component({template: '...', host: {class: 'foo', style: 'color: red'}})
    class MyApp {
    }

    TestBed.configureTestingModule({declarations: [MyApp]});
    const fixture = TestBed.createComponent(MyApp);
    const element = fixture.nativeElement;
    fixture.detectChanges();

    expect(element.style['color']).toEqual('red');
    expect(element.classList.contains('foo')).toBeTruthy();
  });

  it('should combine the inherited static styles of a parent and child component', () => {
    @Component({template: '...', host: {'style': 'width:100px; height:100px;'}})
    class ParentCmp {
    }

    @Component({template: '...', host: {'style': 'width:200px; color:red'}})
    class ChildCmp extends ParentCmp {
    }

    TestBed.configureTestingModule({declarations: [ChildCmp]});
    const fixture = TestBed.createComponent(ChildCmp);
    fixture.detectChanges();

    const element = fixture.nativeElement;
    if (ivyEnabled) {
      expect(element.style['height']).toEqual('100px');
    }
    expect(element.style['width']).toEqual('200px');
    expect(element.style['color']).toEqual('red');
  });

  it('should combine the inherited static classes of a parent and child component', () => {
    @Component({template: '...', host: {'class': 'foo bar'}})
    class ParentCmp {
    }

    @Component({template: '...', host: {'class': 'foo baz'}})
    class ChildCmp extends ParentCmp {
    }

    TestBed.configureTestingModule({declarations: [ChildCmp]});
    const fixture = TestBed.createComponent(ChildCmp);
    fixture.detectChanges();

    const element = fixture.nativeElement;
    if (ivyEnabled) {
      expect(element.classList.contains('bar')).toBeTruthy();
    }
    expect(element.classList.contains('foo')).toBeTruthy();
    expect(element.classList.contains('baz')).toBeTruthy();
  });

  it('should render inline style and class attribute values on the element before a directive is instantiated',
     () => {
       @Component({
         template: `
        <div directive-expecting-styling style="width:200px" class="abc xyz"></div>
      `
       })
       class Cmp {
       }

       @Directive({selector: '[directive-expecting-styling]'})
       class DirectiveExpectingStyling {
         constructor(elm: ElementRef) {
           const native = elm.nativeElement;
           native.setAttribute('data-captured-width', native.style.width);
           native.setAttribute('data-captured-classes', native.className);
         }
       }

       TestBed.configureTestingModule({declarations: [Cmp, DirectiveExpectingStyling]});
       const fixture = TestBed.createComponent(Cmp);
       fixture.detectChanges();

       const element = fixture.nativeElement.querySelector('div');
       expect(element.style.width).toEqual('200px');
       expect(element.getAttribute('data-captured-width')).toEqual('200px');
       expect(element.className.trim()).toEqual('abc xyz');
       expect(element.getAttribute('data-captured-classes')).toEqual('abc xyz');
     });

  it('should only render the same initial styling values once before a directive runs', () => {
    @Component({
      template: `
        <div directive-expecting-styling style="width:200px" class="abc"></div>
      `
    })
    class Cmp {
    }

    @Directive({selector: '[directive-expecting-styling]'})
    class DirectiveExpectingStyling {
      constructor(elm: ElementRef) {
        const native = elm.nativeElement;
        native.style.width = '300px';
        native.classList.remove('abc');
      }
    }

    TestBed.configureTestingModule({declarations: [Cmp, DirectiveExpectingStyling]});
    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('div');
    expect(element.style.width).toEqual('300px');
    expect(element.classList.contains('abc')).toBeFalsy();
  });

  it('should evaluate styling host bindings of a parent component and child component before rendering other components',
     () => {
       const log: string[] = [];

       @Component({
         template: `
        <div [style]="getStyleDiv1()" dir="1">
          <child-cmp></child-cmp>
        </div>
        <div [style]="getStyleDiv2()" dir="2"></div>
      `
       })
       class ParentCmp {
         getStyleDiv1() {
           log.push('getStyle-Div1');
           return {width: '100px'};
         }
         getStyleDiv2() {
           log.push('getStyle-Div2');
           return {height: '100px'};
         }
       }

       @Component({
         selector: 'child-cmp',
         template: `
        <div [style]="getStyleTemplate()"></div>
      `
       })
       class ChildCmp {
         @HostBinding('style')
         get getStyleHost() {
           log.push('getStyle-ChildHost');
           return {color: 'red'};
         }

         getStyleTemplate() {
           log.push('getStyle-ChildTemplate');
           return {opacity: '0.5'};
         }
       }

       @Directive({
         selector: '[dir]',
       })
       class Dir {
         @Input('dir')
         val = '';

         @HostBinding('style')
         get getStyle() {
           log.push('getStyle-DivDir' + this.val);
           return {color: 'red'};
         }
       }

       TestBed.configureTestingModule({declarations: [ParentCmp, ChildCmp, Dir]});
       const fixture = TestBed.createComponent(ParentCmp);
       fixture.detectChanges();

       // we cut this in half because of check no changes
       const items = log.slice(0, log.length / 2);
       expect(items).toEqual([
         'getStyle-Div1',
         'getStyle-DivDir1',
         'getStyle-ChildHost',
         'getStyle-Div2',
         'getStyle-DivDir2',
         'getStyle-ChildTemplate',
       ]);
     });
});
