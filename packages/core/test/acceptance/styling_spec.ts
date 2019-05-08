/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CommonModule} from '@angular/common';
import {Component, Directive, ElementRef, Sanitizer, SecurityContext, ɵɵdefaultStyleSanitizer} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {onlyInIvy} from '@angular/private/testing';

describe('styling', () => {
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

  it('should ensure that static classes are assigned to ng-container elements and picked up for content projection',
     () => {
       @Component({
         template: `
            <project>
              outer
              <ng-container class="inner">
                inner
              </ng-container>
            </project>
          `
       })
       class MyApp {
       }

       @Component({
         selector: 'project',
         template: `
            <div class="outer-area">
              <ng-content></ng-content>
            </div>
            <div class="inner-area">
              <ng-content select=".inner"></ng-content>
            </div>
          `
       })
       class ProjectCmp {
       }

       TestBed.configureTestingModule({declarations: [MyApp, ProjectCmp]});
       const fixture = TestBed.createComponent(MyApp);
       const element = fixture.nativeElement;
       fixture.detectChanges();

       const inner = element.querySelector('.inner-area');
       expect(inner.textContent.trim()).toEqual('inner');
       const outer = element.querySelector('.outer-area');
       expect(outer.textContent.trim()).toEqual('outer');
     });

  it('should do nothing for empty style bindings', () => {
    @Component({template: '<div [style.color]></div>'})
    class App {
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe('<div></div>');
  });

  it('should do nothing for empty class bindings', () => {
    @Component({template: '<div [class.is-open]></div>'})
    class App {
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe('<div></div>');
  });

  describe('style map', () => {

    onlyInIvy('style maps via [style]')
        .it('should sanitize styles that may contain `url` properties', () => {
          @Component({
            template: `<div [style]="styles"></div>`,
          })
          class App {
            styles: any = {};
          }

          TestBed.configureTestingModule({
            imports: [CommonModule],
            declarations: [App],
          });
          const fixture = TestBed.createComponent(App);
          fixture.detectChanges();
          const comp = fixture.componentInstance;

          comp.styles = {
            'background-image': 'url(javascript:alert("lol"))',
            'background': 'url(javascript:alert("lol"))',
            'border-image': 'url(javascript:alert("lol"))',
            'list-style': 'url(javascript:alert("lol"))',
            'list-style-image': 'url(javascript:alert("lol"))',
            'filter': 'url(javascript:alert("lol"))',
          };
          fixture.detectChanges();
          const div = fixture.debugElement.query(By.css('div')).nativeElement;

          expect(div.style.backgroundImage).toBe('');
          expect(div.style.background).toBe('');
          expect(div.style.borderImage).toBe('');
          expect(div.style.listStyle).toBe('');
          expect(div.style.listStyleImage).toBe('');
          expect(div.style.filter).toBe('');
          expect(div.style.width).toBe('');

          comp.styles = {
            'background-image': 'url(okay.gif)',
            'background': 'url(okay.gif)',
            'border-image': 'url(okay.gif)',
            'list-style': 'url(okay.gif)',
            'list-style-image': 'url(okay.gif)',
            'filter': 'url(okay.gif)',
          };
          fixture.detectChanges();
          expect(div.style.backgroundImage).toBe('url(okay.gif)');
          expect(div.style.background).toBe('url(okay.gif)');
          expect(div.style.borderImage).toBe('url(okay.gif)');
          expect(div.style.listStyle).toBe('url(okay.gif)');
          expect(div.style.listStyleImage).toBe('url(okay.gif)');
          expect(div.style.filter).toBe('url(okay.gif)');

        });
  });
});
