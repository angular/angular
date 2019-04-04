/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component, Directive, ElementRef, HostBinding} from '@angular/core';
import {checkNoChanges} from '@angular/core/src/render3/instructions/shared';
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

  it('should render styling for parent and sub-classed components in order', () => {
    @Component({
      template: `
        <child-and-parent-cmp></child-and-parent-cmp>
      `
    })
    class MyApp {
    }

    @Component({template: '...'})
    class ParentCmp {
      @HostBinding('style.width') public width1 = '100px';
      @HostBinding('style.height') public height1 = '100px';
      @HostBinding('style.opacity') public opacity1 = '0.5';
    }

    @Component({selector: 'child-and-parent-cmp', template: '...'})
    class ChildCmp extends ParentCmp {
      @HostBinding('style.width') public width2 = '200px';
      @HostBinding('style.height') public height2 = '200px';
    }

    TestBed.configureTestingModule({declarations: [MyApp, ParentCmp, ChildCmp]});
    const fixture = TestBed.createComponent(MyApp);
    const element = fixture.nativeElement;
    fixture.detectChanges();

    const childElement = element.querySelector('child-and-parent-cmp');
    expect(childElement.style.width).toEqual('200px');
    expect(childElement.style.height).toEqual('200px');
    expect(childElement.style.opacity).toEqual('0.5');
  });

  onlyInIvy('[style.prop] and [class.name] prioritization is a new feature')
      .it('should render styling for parent and sub-classed directives in order', () => {
        const log: string[] = [];

        @Component({
          template: `
        <div child-dir orphan-dir></div>
      `
        })
        class MyApp {
        }

        @Directive({selector: '[parent-dir]'})
        class ParentDir {
          @HostBinding('style.width')
          get width1() {
            log.push('parent: width');
            return '100px';
          }
          @HostBinding('style.height')
          get height1() {
            log.push('parent: height');
            return '100px';
          }
        }

        @Directive({selector: '[child-dir]'})
        class ChildDir extends ParentDir {
          @HostBinding('style.width')
          get width2() {
            log.push('child: width');
            return '200px';
          }
          @HostBinding('style.height')
          get height2() {
            log.push('child: height');
            return '200px';
          }
        }

        @Directive({selector: '[orphan-dir]'})
        class OrphanDir {
          @HostBinding('style.width')
          get width3() {
            log.push('orphan: width');
            return '300px';
          }
          @HostBinding('style.height')
          get height3() {
            log.push('orphan: height');
            return '300px';
          }
        }

        TestBed.configureTestingModule({declarations: [MyApp, ParentDir, ChildDir, OrphanDir]});
        const fixture = TestBed.createComponent(MyApp);
        const element = fixture.nativeElement;
        fixture.detectChanges();

        const childElement = element.querySelector('div');
        expect(childElement.style.width).toEqual('200px');
        expect(childElement.style.height).toEqual('200px');

        if (checkNoChanges) {
          log.length /= 2;
        }

        expect(log).toEqual([
          'parent: width',
          'parent: height',
          'child: width',
          'child: height',
          'orphan: width',
          'orphan: height',
        ]);
      });

  onlyInIvy('[style] and [class] bindings are a new feature')
      .it('should render styling for parent and sub-classed components in order', () => {
        @Component({
          template: `
        <child-and-parent-cmp></child-and-parent-cmp>
      `
        })
        class MyApp {
        }

        @Component({template: '...'})
        class ParentCmp {
          @HostBinding('style.width') public width1 = '100px';

          @HostBinding('style.height') public height1 = '100px';

          @HostBinding('style') public styles1 = {color: 'red'};
        }

        @Component({selector: 'child-and-parent-cmp', template: '...'})
        class ChildCmp extends ParentCmp {
          @HostBinding('style.width') public width2 = '200px';

          @HostBinding('style') public styles2 = {opacity: 0.5};
        }

        TestBed.configureTestingModule({declarations: [MyApp, ParentCmp, ChildCmp]});
        const fixture = TestBed.createComponent(MyApp);
        const element = fixture.nativeElement;
        fixture.detectChanges();

        const childElement = element.querySelector('child-and-parent-cmp');
        expect(childElement.style.width).toEqual('200px');
        expect(childElement.style.height).toEqual('100px');
        expect(childElement.style.opacity).toEqual('0.5');
        expect(childElement.style.color).toEqual('red');
      });

  it('should allow host classes to be placed on a ng-container', () => {
    @Component({
      template: `
            <project>
              outer
              <ng-container dir-that-adds-other-classes class="inner">
                inner
              </ng-container>
            </project>
          `
    })
    class MyApp {
    }

    @Directive({selector: '[dir-that-adds-other-classes]'})
    class DirThatAddsOtherClasses {
      @HostBinding('class.other-class') public bool = true;
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

    TestBed.configureTestingModule({declarations: [MyApp, DirThatAddsOtherClasses, ProjectCmp]});
    const fixture = TestBed.createComponent(MyApp);
    const element = fixture.nativeElement;
    fixture.detectChanges();

    const inner = element.querySelector('.inner-area');
    expect(inner.textContent.trim()).toEqual('inner');
    const outer = element.querySelector('.outer-area');
    expect(outer.textContent.trim()).toEqual('outer');
  });
});
