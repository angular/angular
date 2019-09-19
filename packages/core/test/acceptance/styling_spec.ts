/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component, ComponentFactoryResolver, ComponentRef, Directive, ElementRef, HostBinding, Input, NgModule, ViewChild, ViewContainerRef} from '@angular/core';
import {DebugNode, LViewDebug, toDebug} from '@angular/core/src/render3/instructions/lview_debug';
import {loadLContextFromNode} from '@angular/core/src/render3/util/discovery_utils';
import {ngDevModeResetPerfCounters} from '@angular/core/src/util/ng_dev_mode';
import {TestBed} from '@angular/core/testing';
import {By, DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {ivyEnabled, onlyInIvy} from '@angular/private/testing';

describe('styling', () => {
  beforeEach(ngDevModeResetPerfCounters);

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

  it('should be able to bind a SafeValue to backgroundImage', () => {
    @Component({template: '<div [style.backgroundImage]="image"></div>'})
    class Cmp {
      image !: SafeStyle;
    }

    TestBed.configureTestingModule({declarations: [Cmp]});
    const fixture = TestBed.createComponent(Cmp);
    const sanitizer: DomSanitizer = TestBed.inject(DomSanitizer);

    fixture.componentInstance.image = sanitizer.bypassSecurityTrustStyle('url("#test")');
    fixture.detectChanges();

    const div = fixture.nativeElement.querySelector('div') as HTMLDivElement;
    expect(div.style.backgroundImage).toBe('url("#test")');

    onlyInIvy('perf counters').expectPerfCounters({
      styleProp: 2,
      stylePropCacheMiss: 1,
      tNode: 3,
    });
  });

  it('should not throw if host style binding is on a template node', () => {
    // This ex is a bit contrived. In real apps, you might have a shared class that is extended both
    // by components with host elements and by directives on template nodes. In that case, the host
    // styles for the template directives should just be ignored.
    @Directive({selector: 'ng-template[styleDir]', host: {'[style.display]': 'display'}})
    class StyleDir {
      display = 'block';
    }

    @Component({selector: 'app-comp', template: `<ng-template styleDir></ng-template>`})
    class MyApp {
    }

    TestBed.configureTestingModule({declarations: [MyApp, StyleDir]});
    expect(() => {
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should be able to bind a SafeValue to clip-path', () => {
    @Component({template: '<div [style.clip-path]="path"></div>'})
    class Cmp {
      path !: SafeStyle;
    }

    TestBed.configureTestingModule({declarations: [Cmp]});
    const fixture = TestBed.createComponent(Cmp);
    const sanitizer: DomSanitizer = TestBed.inject(DomSanitizer);

    fixture.componentInstance.path = sanitizer.bypassSecurityTrustStyle('url("#test")');
    fixture.detectChanges();

    const html = fixture.nativeElement.innerHTML;

    // Note that check the raw HTML, because (at the time of writing) the Node-based renderer
    // that we use to run tests doesn't support `clip-path` in `CSSStyleDeclaration`.
    expect(html).toMatch(/style=["|']clip-path:\s*url\(.*#test.*\)/);
  });

  it('should support interpolations inside a class binding', () => {
    @Component({
      template: `
        <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i{{nine}}j"></div>
        <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h{{eight}}i"></div>
        <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g{{seven}}h"></div>
        <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f{{six}}g"></div>
        <div class="a{{one}}b{{two}}c{{three}}d{{four}}e{{five}}f"></div>
        <div class="a{{one}}b{{two}}c{{three}}d{{four}}e"></div>
        <div class="a{{one}}b{{two}}c{{three}}d"></div>
        <div class="a{{one}}b{{two}}c"></div>
        <div class="a{{one}}b"></div>
        <div class="{{one}}"></div>
      `
    })
    class Cmp {
      one = 'one';
      two = 'two';
      three = 'three';
      four = 'four';
      five = 'five';
      six = 'six';
      seven = 'seven';
      eight = 'eight';
      nine = 'nine';
    }

    TestBed.configureTestingModule({declarations: [Cmp]});
    const fixture = TestBed.createComponent(Cmp);
    const instance = fixture.componentInstance;
    fixture.detectChanges();

    const divs = fixture.nativeElement.querySelectorAll('div');

    expect(divs[0].getAttribute('class')).toBe('aonebtwocthreedfourefivefsixgsevenheightininej');
    expect(divs[1].getAttribute('class')).toBe('aonebtwocthreedfourefivefsixgsevenheighti');
    expect(divs[2].getAttribute('class')).toBe('aonebtwocthreedfourefivefsixgsevenh');
    expect(divs[3].getAttribute('class')).toBe('aonebtwocthreedfourefivefsixg');
    expect(divs[4].getAttribute('class')).toBe('aonebtwocthreedfourefivef');
    expect(divs[5].getAttribute('class')).toBe('aonebtwocthreedfoure');
    expect(divs[6].getAttribute('class')).toBe('aonebtwocthreed');
    expect(divs[7].getAttribute('class')).toBe('aonebtwoc');
    expect(divs[8].getAttribute('class')).toBe('aoneb');
    expect(divs[9].getAttribute('class')).toBe('one');

    instance.one = instance.two = instance.three = instance.four = instance.five = instance.six =
        instance.seven = instance.eight = instance.nine = '';
    fixture.detectChanges();

    expect(divs[0].getAttribute('class')).toBe('abcdefghij');
    expect(divs[1].getAttribute('class')).toBe('abcdefghi');
    expect(divs[2].getAttribute('class')).toBe('abcdefgh');
    expect(divs[3].getAttribute('class')).toBe('abcdefg');
    expect(divs[4].getAttribute('class')).toBe('abcdef');
    expect(divs[5].getAttribute('class')).toBe('abcde');
    expect(divs[6].getAttribute('class')).toBe('abcd');
    expect(divs[7].getAttribute('class')).toBe('abc');
    expect(divs[8].getAttribute('class')).toBe('ab');
    expect(divs[9].getAttribute('class')).toBeFalsy();
  });

  it('should support interpolations inside a class binding when other classes are present', () => {
    @Component({template: '<div class="zero i-{{one}} {{two}} three"></div>'})
    class Cmp {
      one = 'one';
      two = 'two';
    }

    TestBed.configureTestingModule({declarations: [Cmp]});
    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();
    const classList = fixture.nativeElement.querySelector('div').classList;

    expect(classList).toContain('zero');
    expect(classList).toContain('i-one');
    expect(classList).toContain('two');
    expect(classList).toContain('three');

    fixture.componentInstance.one = fixture.componentInstance.two = '';
    fixture.detectChanges();

    expect(classList).toContain('zero');
    expect(classList).toContain('i-');
    expect(classList).toContain('three');
    expect(classList).not.toContain('i-one');
    expect(classList).not.toContain('two');
  });

  it('should support interpolations inside a style property binding', () => {
    @Component({
      template: `
        <div style.font-family="f{{one}}{{two}}{{three}}{{four}}{{five}}{{six}}{{seven}}{{eight}}{{nine}}"></div>
        <div style.font-family="f{{one}}{{two}}{{three}}{{four}}{{five}}{{six}}{{seven}}{{eight}}"></div>
        <div style.font-family="f{{one}}{{two}}{{three}}{{four}}{{five}}{{six}}{{seven}}"></div>
        <div style.font-family="f{{one}}{{two}}{{three}}{{four}}{{five}}{{six}}"></div>
        <div style.font-family="f{{one}}{{two}}{{three}}{{four}}{{five}}"></div>
        <div style.font-family="f{{one}}{{two}}{{three}}{{four}}"></div>
        <div style.font-family="f{{one}}{{two}}{{three}}"></div>
        <div style.font-family="f{{one}}{{two}}"></div>
        <div style.font-family="f{{one}}"></div>
        <div style.width="{{singleBinding}}"></div>
      `
    })
    class Cmp {
      singleBinding: string|null = '1337px';
      one = 1;
      two = 2;
      three = 3;
      four = 4;
      five = 5;
      six = 6;
      seven = 7;
      eight = 8;
      nine = 9;
    }

    TestBed.configureTestingModule({declarations: [Cmp]});
    const fixture = TestBed.createComponent(Cmp);
    const instance = fixture.componentInstance;
    fixture.detectChanges();

    const divs: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('div');

    expect(divs[0].style.fontFamily).toBe('f123456789');
    expect(divs[1].style.fontFamily).toBe('f12345678');
    expect(divs[2].style.fontFamily).toBe('f1234567');
    expect(divs[3].style.fontFamily).toBe('f123456');
    expect(divs[4].style.fontFamily).toBe('f12345');
    expect(divs[5].style.fontFamily).toBe('f1234');
    expect(divs[6].style.fontFamily).toBe('f123');
    expect(divs[7].style.fontFamily).toBe('f12');
    expect(divs[8].style.fontFamily).toBe('f1');
    expect(divs[9].style.width).toBe('1337px');

    instance.singleBinding = null;
    instance.one = instance.two = instance.three = instance.four = instance.five = instance.six =
        instance.seven = instance.eight = instance.nine = 1;
    fixture.detectChanges();

    expect(divs[0].style.fontFamily).toBe('f111111111');
    expect(divs[1].style.fontFamily).toBe('f11111111');
    expect(divs[2].style.fontFamily).toBe('f1111111');
    expect(divs[3].style.fontFamily).toBe('f111111');
    expect(divs[4].style.fontFamily).toBe('f11111');
    expect(divs[5].style.fontFamily).toBe('f1111');
    expect(divs[6].style.fontFamily).toBe('f111');
    expect(divs[7].style.fontFamily).toBe('f11');
    expect(divs[8].style.fontFamily).toBe('f1');
    expect(divs[9].style.width).toBeFalsy();
  });

  it('should support interpolations when a style property has a unit suffix', () => {
    @Component({template: '<div style.width.px="{{one}}{{three}}{{three}}7"></div>'})
    class Cmp {
      one = 1;
      three = 3;
    }

    TestBed.configureTestingModule({declarations: [Cmp]});
    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('div');

    expect(div.style.width).toBe('1337px');

    fixture.componentInstance.one = 2;
    fixture.componentInstance.three = 6;
    fixture.detectChanges();

    expect(div.style.width).toBe('2667px');
  });

  it('should not write to a `class` input binding in the event that there is no static class value',
     () => {
       let capturedClassBindingCount = 0;
       let capturedClassBindingValue: string|null|undefined = undefined;
       let capturedMyClassBindingCount = 0;
       let capturedMyClassBindingValue: string|null|undefined = undefined;

       @Component({template: '<div [class]="c" [my-class-dir]="x"></div>'})
       class Cmp {
         c: any = null;
         x = 'foo';
       }

       @Directive({selector: '[my-class-dir]'})
       class MyClassDir {
         @Input('class')
         set classVal(v: string) {
           capturedClassBindingCount++;
           capturedClassBindingValue = v;
         }

         @Input('my-class-dir')
         set myClassVal(v: string) {
           capturedMyClassBindingCount++;
           capturedMyClassBindingValue = v;
         }
       }

       TestBed.configureTestingModule({declarations: [Cmp, MyClassDir]});
       const fixture = TestBed.createComponent(Cmp);
       fixture.detectChanges();

       expect(capturedClassBindingCount).toEqual(1);
       expect(capturedClassBindingValue as any).toEqual(null);
       expect(capturedMyClassBindingCount).toEqual(1);
       expect(capturedMyClassBindingValue !).toEqual('foo');

       fixture.componentInstance.c = 'dynamic-value';
       fixture.detectChanges();

       expect(capturedClassBindingCount).toEqual(2);
       expect(capturedClassBindingValue !).toEqual('dynamic-value');
       expect(capturedMyClassBindingCount).toEqual(1);
       expect(capturedMyClassBindingValue !).toEqual('foo');

       fixture.componentInstance.c = null;
       fixture.detectChanges();

       expect(capturedClassBindingCount).toEqual(3);
       expect(capturedClassBindingValue as any).toEqual(null);
       expect(capturedMyClassBindingCount).toEqual(1);
       expect(capturedMyClassBindingValue !).toEqual('foo');

       fixture.componentInstance.c = '';
       fixture.detectChanges();

       expect(capturedClassBindingCount).toEqual(4);
       expect(capturedClassBindingValue as any).toEqual('');
       expect(capturedMyClassBindingCount).toEqual(1);
       expect(capturedMyClassBindingValue !).toEqual('foo');
     });

  it('should write to [class] binding during `update` mode if there is an instantiation-level value',
     () => {
       let capturedClassBindingCount = 0;
       let capturedClassBindingValue: string|null|undefined = undefined;

       @Component({template: '<div [class]="c" my-class-dir></div>'})
       class Cmp {
         c: any = 'bar';
       }

       @Directive({selector: '[my-class-dir]'})
       class MyClassDir {
         @Input('class')
         set classVal(v: string) {
           capturedClassBindingCount++;
           capturedClassBindingValue = v;
         }
       }

       // Ivy does an extra `[class]` write with a falsy value since the value
       // is applied during creation mode. This is a deviation from VE and should
       // be (Jira Issue = FW-1467).
       let totalWrites = ivyEnabled ? 1 : 0;

       TestBed.configureTestingModule({declarations: [Cmp, MyClassDir]});
       const fixture = TestBed.createComponent(Cmp);
       expect(capturedClassBindingCount).toEqual(totalWrites++);
       fixture.detectChanges();

       expect(capturedClassBindingCount).toEqual(totalWrites++);
       expect(capturedClassBindingValue as any).toEqual('bar');

       fixture.componentInstance.c = 'dynamic-bar';
       fixture.detectChanges();

       expect(capturedClassBindingCount).toEqual(totalWrites++);
       expect(capturedClassBindingValue !).toEqual('dynamic-bar');
     });

  it('should write to a `class` input binding if there is a static class value', () => {
    let capturedClassBindingCount = 0;
    let capturedClassBindingValue: string|null = null;
    let capturedMyClassBindingCount = 0;
    let capturedMyClassBindingValue: string|null = null;

    @Component({template: '<div class="static-val" [my-class-dir]="x"></div>'})
    class Cmp {
      x = 'foo';
    }

    @Directive({selector: '[my-class-dir]'})
    class MyClassDir {
      @Input('class')
      set classVal(v: string) {
        capturedClassBindingCount++;
        capturedClassBindingValue = v;
      }

      @Input('my-class-dir')
      set myClassVal(v: string) {
        capturedMyClassBindingCount++;
        capturedMyClassBindingValue = v;
      }
    }

    TestBed.configureTestingModule({declarations: [Cmp, MyClassDir]});
    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    expect(capturedClassBindingValue !).toEqual('static-val');
    expect(capturedClassBindingCount).toEqual(1);
    expect(capturedMyClassBindingValue !).toEqual('foo');
    expect(capturedMyClassBindingCount).toEqual(1);
  });

  onlyInIvy('only ivy persists static class/style attrs with their binding counterparts')
      .it('should write to a `class` input binding if there is a static class value and there is a binding value',
          () => {
            let capturedClassBindingCount = 0;
            let capturedClassBindingValue: string|null = null;
            let capturedMyClassBindingCount = 0;
            let capturedMyClassBindingValue: string|null = null;

            @Component({template: '<div class="static-val" [class]="c" [my-class-dir]="x"></div>'})
            class Cmp {
              c: any = null;
              x: any = 'foo';
            }

            @Directive({selector: '[my-class-dir]'})
            class MyClassDir {
              @Input('class')
              set classVal(v: string) {
                capturedClassBindingCount++;
                capturedClassBindingValue = v;
              }

              @Input('my-class-dir')
              set myClassVal(v: string) {
                capturedMyClassBindingCount++;
                capturedMyClassBindingValue = v;
              }
            }

            TestBed.configureTestingModule({declarations: [Cmp, MyClassDir]});
            const fixture = TestBed.createComponent(Cmp);
            fixture.detectChanges();

            expect(capturedClassBindingCount).toEqual(1);
            expect(capturedClassBindingValue !).toEqual('static-val');
            expect(capturedMyClassBindingCount).toEqual(1);
            expect(capturedMyClassBindingValue !).toEqual('foo');

            fixture.componentInstance.c = 'dynamic-val';
            fixture.detectChanges();

            expect(capturedClassBindingCount).toEqual(2);
            expect(capturedClassBindingValue !).toEqual('static-val dynamic-val');
            expect(capturedMyClassBindingCount).toEqual(1);
            expect(capturedMyClassBindingValue !).toEqual('foo');
          });

  onlyInIvy('only ivy balances styling across directives and component host bindings')
      .it('should allow multiple directives to set dynamic and static classes independent of one another',
          () => {
            @Component({
              template: `
        <div dir-one dir-two></div>
      `
            })
            class Cmp {
            }

            @Directive({selector: '[dir-one]', host: {'[class.dir-one]': 'dirOneExp'}})
            class DirOne {
              dirOneExp = true;
            }

            @Directive({selector: '[dir-two]', host: {'class': 'dir-two'}})
            class DirTwo {
            }

            TestBed.configureTestingModule({declarations: [Cmp, DirOne, DirTwo]});
            const fixture = TestBed.createComponent(Cmp);
            fixture.detectChanges();

            const element = fixture.nativeElement.querySelector('div');
            expect(element.classList.contains('dir-one')).toBeTruthy();
            expect(element.classList.contains('dir-two')).toBeTruthy();
          });

  describe('NgClass', () => {

    // We had a bug where NgClass would not allocate sufficient slots for host bindings,
    // so it would overwrite information about other directives nearby. This test checks
    // that TestDir's injector is not overwritten by NgClass, so TestDir should still
    // be found by DI when ChildDir is instantiated.
    it('should not overwrite other directive info when using NgClass', () => {
      @Directive({selector: '[test-dir]'})
      class TestDir {
      }

      @Directive({selector: '[child-dir]'})
      class ChildDir {
        constructor(public parent: TestDir) {}
      }

      @Component({
        selector: 'app',
        template: `
          <div class="my-class" [ngClass]="classMap" test-dir>
            <div *ngIf="showing" child-dir>Hello</div>
          </div>
        `
      })
      class AppComponent {
        classMap = {'with-button': true};
        showing = false;
      }

      TestBed.configureTestingModule({declarations: [AppComponent, TestDir, ChildDir]});
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const testDirDiv = fixture.debugElement.nativeElement.querySelector('div');
      expect(testDirDiv.classList).toContain('with-button');
      expect(fixture.debugElement.nativeElement.textContent).not.toContain('Hello');

      fixture.componentInstance.classMap = {'with-button': false};
      fixture.componentInstance.showing = true;
      fixture.detectChanges();

      const childDir = fixture.debugElement.query(By.directive(ChildDir)).injector.get(ChildDir);
      expect(childDir.parent).toBeAnInstanceOf(TestDir);
      expect(testDirDiv.classList).not.toContain('with-button');
      expect(fixture.debugElement.nativeElement.textContent).toContain('Hello');
    });
  });

  it('should be able to name inputs starting with `class` or `style`', () => {
    @Directive({selector: '[dir]'})
    class Dir {
      @Input('classesInSchool') classes = '';
      @Input('styleOfClothing') style = '';
    }

    @Component({
      template: '<span dir [classesInSchool]="classes" [styleOfClothing]="style"></span>',
    })
    class App {
      @ViewChild(Dir, {static: false}) dir !: Dir;

      classes = 'math';
      style = '80s';
    }

    TestBed.configureTestingModule({declarations: [App, Dir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const directive = fixture.componentInstance.dir;

    expect(directive.classes).toBe('math');
    expect(directive.style).toBe('80s');
  });

  it('should be able to bind to `className`', () => {
    @Component({template: ''})
    class App {
      @HostBinding('className')
      klass = 'one two';
    }

    TestBed.configureTestingModule({declarations: [App]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const classList = fixture.nativeElement.classList;

    expect(classList.contains('one')).toBe(true);
    expect(classList.contains('two')).toBe(true);
  });

  onlyInIvy('ivy resolves styling across directives, components and templates in unison')
      .it('should apply single property styles/classes to the element and default to any static styling values',
          () => {
            @Component({
              template: `
        <div [style.width]="w"
              [style.height]="h"
              [style.opacity]="o"
              style="width:200px; height:200px;"
              [class.abc]="abc"
              [class.xyz]="xyz"></div>
      `
            })
            class Cmp {
              w: string|null = '100px';
              h: string|null = '100px';
              o: string|null = '0.5';
              abc = true;
              xyz = false;
            }

            TestBed.configureTestingModule({declarations: [Cmp]});
            const fixture = TestBed.createComponent(Cmp);
            fixture.detectChanges();

            const element = fixture.nativeElement.querySelector('div');
            expect(element.style.width).toEqual('100px');
            expect(element.style.height).toEqual('100px');
            expect(element.style.opacity).toEqual('0.5');
            expect(element.classList.contains('abc')).toBeTruthy();
            expect(element.classList.contains('xyz')).toBeFalsy();

            fixture.componentInstance.w = null;
            fixture.componentInstance.h = null;
            fixture.componentInstance.o = null;
            fixture.componentInstance.abc = false;
            fixture.componentInstance.xyz = true;
            fixture.detectChanges();

            expect(element.style.width).toEqual('200px');
            expect(element.style.height).toEqual('200px');
            expect(element.style.opacity).toBeFalsy();
            expect(element.classList.contains('abc')).toBeFalsy();
            expect(element.classList.contains('xyz')).toBeTruthy();
          });

  onlyInIvy('ivy resolves styling across directives, components and templates in unison')
      .it('should apply single style/class across the template and directive host bindings', () => {
        @Directive({selector: '[dir-that-sets-width]'})
        class DirThatSetsWidthDirective {
          @Input('dir-that-sets-width') @HostBinding('style.width') public width: string = '';
        }

        @Directive({selector: '[another-dir-that-sets-width]', host: {'[style.width]': 'width'}})
        class AnotherDirThatSetsWidthDirective {
          @Input('another-dir-that-sets-width') public width: string = '';
        }

        @Component({
          template: `
        <div [style.width]="w0"
              [dir-that-sets-width]="w1"
              [another-dir-that-sets-width]="w2">
      `
        })
        class Cmp {
          w0: string|null = null;
          w1: string|null = null;
          w2: string|null = null;
        }

        TestBed.configureTestingModule(
            {declarations: [Cmp, DirThatSetsWidthDirective, AnotherDirThatSetsWidthDirective]});
        const fixture = TestBed.createComponent(Cmp);
        fixture.componentInstance.w0 = '100px';
        fixture.componentInstance.w1 = '200px';
        fixture.componentInstance.w2 = '300px';
        fixture.detectChanges();

        const element = fixture.nativeElement.querySelector('div');
        expect(element.style.width).toEqual('100px');

        fixture.componentInstance.w0 = null;
        fixture.detectChanges();

        expect(element.style.width).toEqual('200px');

        fixture.componentInstance.w1 = null;
        fixture.detectChanges();

        expect(element.style.width).toEqual('300px');

        fixture.componentInstance.w2 = null;
        fixture.detectChanges();

        expect(element.style.width).toBeFalsy();

        fixture.componentInstance.w2 = '400px';
        fixture.detectChanges();

        expect(element.style.width).toEqual('400px');

        fixture.componentInstance.w1 = '500px';
        fixture.componentInstance.w0 = '600px';
        fixture.detectChanges();

        expect(element.style.width).toEqual('600px');
      });

  onlyInIvy('ivy resolves styling across directives, components and templates in unison')
      .it('should only run stylingFlush once when there are no collisions between styling properties',
          () => {
            @Directive({selector: '[dir-with-styling]'})
            class DirWithStyling {
              @HostBinding('style.font-size') public fontSize = '100px';
            }

            @Component({selector: 'comp-with-styling'})
            class CompWithStyling {
              @HostBinding('style.width') public width = '900px';

              @HostBinding('style.height') public height = '900px';
            }

            @Component({
              template: `
        <comp-with-styling
          [style.opacity]="opacity"
          dir-with-styling>...</comp-with-styling>
      `
            })
            class Cmp {
              opacity: string|null = '0.5';
              @ViewChild(CompWithStyling, {static: true})
              compWithStyling: CompWithStyling|null = null;
              @ViewChild(DirWithStyling, {static: true}) dirWithStyling: DirWithStyling|null = null;
            }

            TestBed.configureTestingModule({declarations: [Cmp, DirWithStyling, CompWithStyling]});
            const fixture = TestBed.createComponent(Cmp);
            fixture.detectChanges();

            const component = fixture.componentInstance;
            const element = fixture.nativeElement.querySelector('comp-with-styling');
            const node = getDebugNode(element) !;

            const styles = node.styles !;
            const config = styles.context.config;
            expect(config.hasCollisions).toBeFalsy();
            expect(config.hasMapBindings).toBeFalsy();
            expect(config.hasPropBindings).toBeTruthy();
            expect(config.allowDirectStyling).toBeTruthy();

            expect(element.style.opacity).toEqual('0.5');
            expect(element.style.width).toEqual('900px');
            expect(element.style.height).toEqual('900px');
            expect(element.style.fontSize).toEqual('100px');

            // once for the template flush and again for the host bindings
            expect(ngDevMode !.flushStyling).toEqual(2);
            ngDevModeResetPerfCounters();

            component.opacity = '0.6';
            component.compWithStyling !.height = '100px';
            component.compWithStyling !.width = '100px';
            component.dirWithStyling !.fontSize = '50px';
            fixture.detectChanges();

            expect(element.style.opacity).toEqual('0.6');
            expect(element.style.width).toEqual('100px');
            expect(element.style.height).toEqual('100px');
            expect(element.style.fontSize).toEqual('50px');

            // there is no need to flush styling since the styles are applied directly
            expect(ngDevMode !.flushStyling).toEqual(0);
          });

  onlyInIvy('ivy resolves styling across directives, components and templates in unison')
      .it('should combine all styling across the template, directive and component host bindings',
          () => {
            @Directive({selector: '[dir-with-styling]'})
            class DirWithStyling {
              @HostBinding('style.color') public color = 'red';

              @HostBinding('style.font-size') public fontSize = '100px';

              @HostBinding('class.dir') public dirClass = true;
            }

            @Component({selector: 'comp-with-styling'})
            class CompWithStyling {
              @HostBinding('style.width') public width = '900px';

              @HostBinding('style.height') public height = '900px';

              @HostBinding('class.comp') public compClass = true;
            }

            @Component({
              template: `
        <comp-with-styling
          [style.opacity]="opacity"
          [style.width]="width"
          [class.tpl]="tplClass"
          dir-with-styling>...</comp-with-styling>
      `
            })
            class Cmp {
              opacity: string|null = '0.5';
              width: string|null = 'auto';
              tplClass = true;
            }

            TestBed.configureTestingModule({declarations: [Cmp, DirWithStyling, CompWithStyling]});
            const fixture = TestBed.createComponent(Cmp);
            fixture.detectChanges();

            const element = fixture.nativeElement.querySelector('comp-with-styling');

            const node = getDebugNode(element) !;
            const styles = node.styles !;
            const classes = node.classes !;

            expect(styles.values).toEqual({
              'color': 'red',
              'width': 'auto',
              'opacity': '0.5',
              'height': '900px',
              'font-size': '100px'
            });
            expect(classes.values).toEqual({
              'dir': true,
              'comp': true,
              'tpl': true,
            });

            fixture.componentInstance.width = null;
            fixture.componentInstance.opacity = null;
            fixture.componentInstance.tplClass = false;
            fixture.detectChanges();

            expect(styles.values).toEqual({
              'color': 'red',
              'width': '900px',
              'opacity': null,
              'height': '900px',
              'font-size': '100px'
            });
            expect(classes.values).toEqual({
              'dir': true,
              'comp': true,
              'tpl': false,
            });
          });

  onlyInIvy('ivy resolves styling across directives, components and templates in unison')
      .it('should properly apply styling across sub and super class directive host bindings',
          () => {
            @Directive({selector: '[super-class-dir]'})
            class SuperClassDirective {
              @HostBinding('style.width') public w1 = '100px';
            }

            @Component({selector: '[sub-class-dir]'})
            class SubClassDirective extends SuperClassDirective {
              @HostBinding('style.width') public w2 = '200px';
            }

            @Component({
              template: `
          <div sub-class-dir [style.width]="w3"></div>
      `
            })
            class Cmp {
              w3: string|null = '300px';
            }

            TestBed.configureTestingModule(
                {declarations: [Cmp, SuperClassDirective, SubClassDirective]});
            const fixture = TestBed.createComponent(Cmp);
            fixture.detectChanges();

            const element = fixture.nativeElement.querySelector('div');

            const node = getDebugNode(element) !;
            const styles = node.styles !;

            expect(styles.values).toEqual({
              'width': '300px',
            });

            fixture.componentInstance.w3 = null;
            fixture.detectChanges();

            expect(styles.values).toEqual({
              'width': '200px',
            });
          });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should support situations where there are more than 32 bindings', () => {
        const TOTAL_BINDINGS = 34;

        let bindingsHTML = '';
        let bindingsArr: any[] = [];
        for (let i = 0; i < TOTAL_BINDINGS; i++) {
          bindingsHTML += `[style.prop${i}]="bindings[${i}]" `;
          bindingsArr.push(null);
        }

        @Component({template: `<div ${bindingsHTML}></div>`})
        class Cmp {
          bindings = bindingsArr;

          updateBindings(value: string) {
            for (let i = 0; i < TOTAL_BINDINGS; i++) {
              this.bindings[i] = value + i;
            }
          }
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);

        let testValue = 'initial';
        fixture.componentInstance.updateBindings('initial');
        fixture.detectChanges();

        const element = fixture.nativeElement.querySelector('div');

        const node = getDebugNode(element) !;
        const styles = node.styles !;

        let values = styles.values;
        let props = Object.keys(values);
        expect(props.length).toEqual(TOTAL_BINDINGS);

        for (let i = 0; i < props.length; i++) {
          const prop = props[i];
          const value = values[prop] as string;
          const num = value.substr(testValue.length);
          expect(value).toEqual(`initial${num}`);
        }

        testValue = 'final';
        fixture.componentInstance.updateBindings('final');
        fixture.detectChanges();

        values = styles.values;
        props = Object.keys(values);
        expect(props.length).toEqual(TOTAL_BINDINGS);
        for (let i = 0; i < props.length; i++) {
          const prop = props[i];
          const value = values[prop] as string;
          const num = value.substr(testValue.length);
          expect(value).toEqual(`final${num}`);
        }
      });

  onlyInIvy('only ivy has style debugging support')
      .it('should apply map-based style and class entries', () => {
        @Component({template: '<div [style]="s" [class]="c"></div>'})
        class Cmp {
          public c: {[key: string]: any}|null = null;
          updateClasses(classes: string) {
            const c = this.c || (this.c = {});
            Object.keys(this.c).forEach(className => { c[className] = false; });
            classes.split(/\s+/).forEach(className => { c[className] = true; });
          }

          public s: {[key: string]: any}|null = null;
          updateStyles(prop: string, value: string|number|null) {
            const s = this.s || (this.s = {});
            Object.assign(s, {[prop]: value});
          }

          reset() {
            this.s = null;
            this.c = null;
          }
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);
        const comp = fixture.componentInstance;
        comp.updateStyles('width', '100px');
        comp.updateStyles('height', '200px');
        comp.updateClasses('abc');
        fixture.detectChanges();

        const element = fixture.nativeElement.querySelector('div');
        const node = getDebugNode(element) !;
        let styles = node.styles !;
        let classes = node.classes !;

        let stylesSummary = styles.summary;
        let widthSummary = stylesSummary['width'];
        expect(widthSummary.prop).toEqual('width');
        expect(widthSummary.value).toEqual('100px');

        let heightSummary = stylesSummary['height'];
        expect(heightSummary.prop).toEqual('height');
        expect(heightSummary.value).toEqual('200px');

        let classesSummary = classes.summary;
        let abcSummary = classesSummary['abc'];
        expect(abcSummary.prop).toEqual('abc');
        expect(abcSummary.value).toBeTruthy();

        comp.reset();
        comp.updateStyles('width', '500px');
        comp.updateStyles('height', null);
        comp.updateClasses('def');
        fixture.detectChanges();

        styles = node.styles !;
        classes = node.classes !;

        stylesSummary = styles.summary;
        widthSummary = stylesSummary['width'];
        expect(widthSummary.value).toEqual('500px');

        heightSummary = stylesSummary['height'];
        expect(heightSummary.value).toEqual(null);

        classesSummary = classes.summary;
        abcSummary = classesSummary['abc'];
        expect(abcSummary.prop).toEqual('abc');
        expect(abcSummary.value).toBeFalsy();

        let defSummary = classesSummary['def'];
        expect(defSummary.prop).toEqual('def');
        expect(defSummary.value).toBeTruthy();
      });

  onlyInIvy('ivy resolves styling across directives, components and templates in unison')
      .it('should resolve styling collisions across templates, directives and components for prop and map-based entries',
          () => {
            @Directive({selector: '[dir-that-sets-styling]'})
            class DirThatSetsStyling {
              @HostBinding('style') public map: any = {color: 'red', width: '777px'};
            }

            @Component({
              template: `
        <div [style.width]="width"
              [style]="map"
              style="width:200px; font-size:99px"
              dir-that-sets-styling
              #dir
              [class.xyz]="xyz"></div>
      `
            })
            class Cmp {
              map: any = {width: '111px', opacity: '0.5'};
              width: string|null = '555px';

              @ViewChild('dir', {read: DirThatSetsStyling, static: true})
              dir !: DirThatSetsStyling;
            }

            TestBed.configureTestingModule({declarations: [Cmp, DirThatSetsStyling]});
            const fixture = TestBed.createComponent(Cmp);
            const comp = fixture.componentInstance;
            fixture.detectChanges();

            const element = fixture.nativeElement.querySelector('div');
            const node = getDebugNode(element) !;

            const styles = node.styles !;

            expect(styles.values).toEqual({
              'width': '555px',
              'color': 'red',
              'font-size': '99px',
              'opacity': '0.5',
            });

            comp.width = null;
            fixture.detectChanges();

            expect(styles.values).toEqual({
              'width': '111px',
              'color': 'red',
              'font-size': '99px',
              'opacity': '0.5',
            });

            comp.map = null;
            fixture.detectChanges();

            expect(styles.values).toEqual({
              'width': '777px',
              'color': 'red',
              'font-size': '99px',
              'opacity': null,
            });

            comp.dir.map = null;
            fixture.detectChanges();

            expect(styles.values).toEqual({
              'width': '200px',
              'color': null,
              'font-size': '99px',
              'opacity': null,
            });
          });

  onlyInIvy('ivy resolves styling across directives, components and templates in unison')
      .it('should only apply each styling property once per CD across templates, components, directives',
          () => {
            @Directive({selector: '[dir-that-sets-styling]'})
            class DirThatSetsStyling {
              @HostBinding('style') public map: any = {width: '999px', height: '999px'};
            }

            @Component({
              template: `
                <div #dir
                  style="width:0px; height:0px"
                  [style.width]="width"
                  [style.height]="height"
                  [style]="map"
                  dir-that-sets-styling></div>
              `
            })
            class Cmp {
              width: string|null = '111px';
              height: string|null = '111px';

              map: any = {width: '555px', height: '555px'};

              @ViewChild('dir', {read: DirThatSetsStyling, static: true})
              dir !: DirThatSetsStyling;
            }

            TestBed.configureTestingModule({declarations: [Cmp, DirThatSetsStyling]});
            const fixture = TestBed.createComponent(Cmp);
            const comp = fixture.componentInstance;

            ngDevModeResetPerfCounters();
            fixture.detectChanges();
            const element = fixture.nativeElement.querySelector('div');

            // both are applied because this is the first pass
            assertStyleCounters(2, 0);
            assertStyle(element, 'width', '111px');
            assertStyle(element, 'height', '111px');

            comp.width = '222px';
            ngDevModeResetPerfCounters();
            fixture.detectChanges();

            assertStyleCounters(1, 0);
            assertStyle(element, 'width', '222px');
            assertStyle(element, 'height', '111px');

            comp.height = '222px';
            ngDevModeResetPerfCounters();
            fixture.detectChanges();

            assertStyleCounters(1, 0);
            assertStyle(element, 'width', '222px');
            assertStyle(element, 'height', '222px');

            comp.width = null;
            ngDevModeResetPerfCounters();
            fixture.detectChanges();

            assertStyleCounters(1, 0);
            assertStyle(element, 'width', '555px');
            assertStyle(element, 'height', '222px');

            comp.width = '123px';
            comp.height = '123px';
            ngDevModeResetPerfCounters();
            fixture.detectChanges();

            assertStyle(element, 'width', '123px');
            assertStyle(element, 'height', '123px');

            comp.map = {};
            ngDevModeResetPerfCounters();
            fixture.detectChanges();

            // both are applied because the map was altered
            assertStyleCounters(2, 0);
            assertStyle(element, 'width', '123px');
            assertStyle(element, 'height', '123px');

            comp.width = null;
            ngDevModeResetPerfCounters();
            fixture.detectChanges();

            // the width is applied both in TEMPLATE and in HOST_BINDINGS mode
            assertStyleCounters(2, 0);
            assertStyle(element, 'width', '999px');
            assertStyle(element, 'height', '123px');

            comp.dir.map = null;
            ngDevModeResetPerfCounters();
            fixture.detectChanges();

            // the width is only applied once
            assertStyleCounters(1, 0);
            assertStyle(element, 'width', '0px');
            assertStyle(element, 'height', '123px');

            comp.dir.map = {width: '1000px', height: '1000px', color: 'red'};
            ngDevModeResetPerfCounters();
            fixture.detectChanges();

            // only the width and color have changed
            assertStyleCounters(2, 0);
            assertStyle(element, 'width', '1000px');
            assertStyle(element, 'height', '123px');
            assertStyle(element, 'color', 'red');

            comp.height = null;
            ngDevModeResetPerfCounters();
            fixture.detectChanges();

            // height gets applied twice and all other
            // values get applied
            assertStyleCounters(4, 0);
            assertStyle(element, 'width', '1000px');
            assertStyle(element, 'height', '1000px');
            assertStyle(element, 'color', 'red');

            comp.map = {color: 'blue', width: '2000px', opacity: '0.5'};
            ngDevModeResetPerfCounters();
            fixture.detectChanges();

            assertStyleCounters(5, 0);
            assertStyle(element, 'width', '2000px');
            assertStyle(element, 'height', '1000px');
            assertStyle(element, 'color', 'blue');
            assertStyle(element, 'opacity', '0.5');

            comp.map = {color: 'blue', width: '2000px'};
            ngDevModeResetPerfCounters();
            fixture.detectChanges();

            // all four are applied because the map was altered
            assertStyleCounters(4, 1);
            assertStyle(element, 'width', '2000px');
            assertStyle(element, 'height', '1000px');
            assertStyle(element, 'color', 'blue');
            assertStyle(element, 'opacity', '');
          });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should sanitize style values before writing them', () => {
        @Component({
          template: `
                <div [style.width]="widthExp"
                      [style.background-image]="bgImageExp"
                      [style]="styleMapExp"></div>
              `
        })
        class Cmp {
          widthExp = '';
          bgImageExp = '';
          styleMapExp: any = {};
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);
        const comp = fixture.componentInstance;
        fixture.detectChanges();

        const element = fixture.nativeElement.querySelector('div');
        const node = getDebugNode(element) !;
        const styles = node.styles !;

        const lastSanitizedProps: any[] = [];
        styles.overrideSanitizer((prop, value) => {
          lastSanitizedProps.push(prop);
          return value;
        });

        comp.bgImageExp = '123';
        fixture.detectChanges();

        expect(styles.values).toEqual({
          'background-image': '123',
          'width': null,
        });

        expect(lastSanitizedProps).toEqual(['background-image']);
        lastSanitizedProps.length = 0;

        comp.styleMapExp = {'clip-path': '456'};
        fixture.detectChanges();

        expect(styles.values).toEqual({
          'background-image': '123',
          'clip-path': '456',
          'width': null,
        });

        expect(lastSanitizedProps).toEqual(['background-image', 'clip-path']);
        lastSanitizedProps.length = 0;

        comp.widthExp = '789px';
        fixture.detectChanges();

        expect(styles.values).toEqual({
          'background-image': '123',
          'clip-path': '456',
          'width': '789px',
        });

        expect(lastSanitizedProps).toEqual(['background-image', 'clip-path']);
        lastSanitizedProps.length = 0;
      });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should apply a unit to a style before writing it', () => {
        @Component({
          template: `
            <div [style.width.px]="widthExp"
                  [style.height.em]="heightExp"></div>
          `
        })
        class Cmp {
          widthExp: string|number|null = '';
          heightExp: string|number|null = '';
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);
        const comp = fixture.componentInstance;
        fixture.detectChanges();

        const element = fixture.nativeElement.querySelector('div');
        const node = getDebugNode(element) !;
        const styles = node.styles !;

        comp.widthExp = '200';
        comp.heightExp = 10;
        fixture.detectChanges();

        expect(styles.values).toEqual({
          'width': '200px',
          'height': '10em',
        });

        comp.widthExp = 0;
        comp.heightExp = null;
        fixture.detectChanges();

        expect(styles.values).toEqual({
          'width': '0px',
          'height': null,
        });
      });

  it('should be able to bind a SafeValue to clip-path', () => {
    @Component({template: '<div [style.clip-path]="path"></div>'})
    class Cmp {
      path !: SafeStyle;
    }

    TestBed.configureTestingModule({declarations: [Cmp]});
    const fixture = TestBed.createComponent(Cmp);
    const sanitizer: DomSanitizer = TestBed.inject(DomSanitizer);

    fixture.componentInstance.path = sanitizer.bypassSecurityTrustStyle('url("#test")');
    fixture.detectChanges();

    const html = fixture.nativeElement.innerHTML;

    // Note that check the raw HTML, because (at the time of writing) the Node-based renderer
    // that we use to run tests doesn't support `clip-path` in `CSSStyleDeclaration`.
    expect(html).toMatch(/style=["|']clip-path:\s*url\(.*#test.*\)/);
  });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should evaluate follow-up [style] maps even if a former map is null', () => {
        @Directive({selector: '[dir-with-styling]'})
        class DirWithStyleMap {
          @HostBinding('style') public styleMap: any = {color: 'red'};
        }

        @Directive({selector: '[dir-with-styling-part2]'})
        class DirWithStyleMapPart2 {
          @HostBinding('style') public styleMap: any = {width: '200px'};
        }

        @Component({
          template: `
        <div #div
              [style]="map"
              dir-with-styling
              dir-with-styling-part2></div>
      `
        })
        class Cmp {
          map: any = null;

          @ViewChild('div', {read: DirWithStyleMap, static: true})
          dir1 !: DirWithStyleMap;

          @ViewChild('div', {read: DirWithStyleMapPart2, static: true})
          dir2 !: DirWithStyleMapPart2;
        }

        TestBed.configureTestingModule(
            {declarations: [Cmp, DirWithStyleMap, DirWithStyleMapPart2]});
        const fixture = TestBed.createComponent(Cmp);
        fixture.detectChanges();

        const element = fixture.nativeElement.querySelector('div');
        const node = getDebugNode(element) !;
        const styles = node.styles !;

        const values = styles.values;
        const props = Object.keys(values).sort();
        expect(props).toEqual(['color', 'width']);

        expect(values['width']).toEqual('200px');
        expect(values['color']).toEqual('red');
      });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should evaluate initial style/class values on a list of elements that changes', () => {
        @Component({
          template: `
            <div *ngFor="let item of items"
                  class="initial-class item-{{ item }}">
              {{ item }}
            </div>
          `
        })
        class Cmp {
          items = [1, 2, 3];
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);
        const comp = fixture.componentInstance;
        fixture.detectChanges();

        function getItemElements(): HTMLElement[] {
          return [].slice.call(fixture.nativeElement.querySelectorAll('div'));
        }

        function getItemClasses(): string[] {
          return getItemElements().map(e => e.className).sort().join(' ').split(' ');
        }

        expect(getItemElements().length).toEqual(3);
        expect(getItemClasses()).toEqual([
          'initial-class',
          'item-1',
          'initial-class',
          'item-2',
          'initial-class',
          'item-3',
        ]);

        comp.items = [2, 4, 6, 8];
        fixture.detectChanges();

        expect(getItemElements().length).toEqual(4);
        expect(getItemClasses()).toEqual([
          'initial-class',
          'item-2',
          'initial-class',
          'item-4',
          'initial-class',
          'item-6',
          'initial-class',
          'item-8',
        ]);
      });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should create and update multiple class bindings across multiple elements in a template',
          () => {
            @Component({
              template: `
            <header class="header">header</header>
            <div *ngFor="let item of items" class="item item-{{ item }}">
              {{ item }}
            </div>
            <footer class="footer">footer</footer>
          `
            })
            class Cmp {
              items = [1, 2, 3];
            }

            TestBed.configureTestingModule({declarations: [Cmp]});
            const fixture = TestBed.createComponent(Cmp);
            const comp = fixture.componentInstance;
            fixture.detectChanges();

            function getItemElements(): HTMLElement[] {
              return [].slice.call(fixture.nativeElement.querySelectorAll('div'));
            }

            function getItemClasses(): string[] {
              return getItemElements().map(e => e.className).sort().join(' ').split(' ');
            }

            const header = fixture.nativeElement.querySelector('header');
            expect(header.classList.contains('header'));

            const footer = fixture.nativeElement.querySelector('footer');
            expect(footer.classList.contains('footer'));

            expect(getItemElements().length).toEqual(3);
            expect(getItemClasses()).toEqual([
              'item',
              'item-1',
              'item',
              'item-2',
              'item',
              'item-3',
            ]);
          });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should understand multiple directives which contain initial classes', () => {
        @Directive({selector: 'dir-one'})
        class DirOne {
          @HostBinding('class') public className = 'dir-one';
        }

        @Directive({selector: 'dir-two'})
        class DirTwo {
          @HostBinding('class') public className = 'dir-two';
        }

        @Component({
          template: `
            <dir-one></dir-one>
            <div class="initial"></div>
            <dir-two></dir-two>
          `
        })
        class Cmp {
        }

        TestBed.configureTestingModule({declarations: [Cmp, DirOne, DirTwo]});
        const fixture = TestBed.createComponent(Cmp);
        fixture.detectChanges();

        const dirOne = fixture.nativeElement.querySelector('dir-one');
        const div = fixture.nativeElement.querySelector('div');
        const dirTwo = fixture.nativeElement.querySelector('dir-two');

        expect(dirOne.classList.contains('dir-one')).toBeTruthy();
        expect(dirTwo.classList.contains('dir-two')).toBeTruthy();
        expect(div.classList.contains('initial')).toBeTruthy();
      });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should evaluate styling across the template directives when there are multiple elements/sources of styling',
          () => {
            @Directive({selector: '[one]'})
            class DirOne {
              @HostBinding('class') public className = 'dir-one';
            }

            @Directive({selector: '[two]'})
            class DirTwo {
              @HostBinding('class') public className = 'dir-two';
            }

            @Component({
              template: `
                <div class="a" [style.width.px]="w" one></div>
                <div class="b" [style.height.px]="h" one two></div>
                <div class="c" [style.color]="c" two></div>
              `
            })
            class Cmp {
              w = 100;
              h = 200;
              c = 'red';
            }

            TestBed.configureTestingModule({declarations: [Cmp, DirOne, DirTwo]});
            const fixture = TestBed.createComponent(Cmp);
            fixture.detectChanges();

            const divA = fixture.nativeElement.querySelector('.a');
            const divB = fixture.nativeElement.querySelector('.b');
            const divC = fixture.nativeElement.querySelector('.c');

            expect(divA.style.width).toEqual('100px');
            expect(divB.style.height).toEqual('200px');
            expect(divC.style.color).toEqual('red');
          });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should evaluate styling across the template and directives within embedded views',
          () => {
            @Directive({selector: '[some-dir-with-styling]'})
            class SomeDirWithStyling {
              @HostBinding('style')
              public styles = {
                width: '200px',
                height: '500px',
              };
            }

            @Component({
              template: `
                <div
                  class="item"
                  *ngFor="let item of items; let i = index"
                  [style.color]="c"
                  [style.height.px]="h * i"
                  some-dir-with-styling>
                  {{ item }}
                </div>
                <section [style.width.px]="w"></section>
                <p [style.height.px]="h"></p>
              `
            })
            class Cmp {
              items: any[] = [];
              c = 'red';
              w = 100;
              h = 100;
            }

            TestBed.configureTestingModule({declarations: [Cmp, SomeDirWithStyling]});
            const fixture = TestBed.createComponent(Cmp);
            const comp = fixture.componentInstance;
            comp.items = [1, 2, 3, 4];
            fixture.detectChanges();

            const items = fixture.nativeElement.querySelectorAll('.item');
            expect(items.length).toEqual(4);
            const [a, b, c, d] = items;
            expect(a.style.height).toEqual('0px');
            expect(b.style.height).toEqual('100px');
            expect(c.style.height).toEqual('200px');
            expect(d.style.height).toEqual('300px');

            const section = fixture.nativeElement.querySelector('section');
            const p = fixture.nativeElement.querySelector('p');

            expect(section.style['width']).toEqual('100px');
            expect(p.style['height']).toEqual('100px');
          });

  onlyInIvy('only ivy has style/class bindings debugging support')
      .it('should flush bindings even if any styling hasn\'t changed in a previous directive',
          () => {
            @Directive({selector: '[one]'})
            class DirOne {
              @HostBinding('style.width') w = '100px';
              @HostBinding('style.opacity') o = '0.5';
            }

            @Directive({selector: '[two]'})
            class DirTwo {
              @HostBinding('style.height') h = '200px';
              @HostBinding('style.color') c = 'red';
            }

            @Component({template: '<div #target one two></div>'})
            class Cmp {
              @ViewChild('target', {read: DirOne, static: true}) one !: DirOne;
              @ViewChild('target', {read: DirTwo, static: true}) two !: DirTwo;
            }

            TestBed.configureTestingModule({declarations: [Cmp, DirOne, DirTwo]});
            const fixture = TestBed.createComponent(Cmp);
            const comp = fixture.componentInstance;
            fixture.detectChanges();

            const div = fixture.nativeElement.querySelector('div');
            expect(div.style.opacity).toEqual('0.5');
            expect(div.style.color).toEqual('red');
            expect(div.style.width).toEqual('100px');
            expect(div.style.height).toEqual('200px');

            comp.two.h = '300px';
            fixture.detectChanges();
            expect(div.style.opacity).toEqual('0.5');
            expect(div.style.color).toEqual('red');
            expect(div.style.width).toEqual('100px');
            expect(div.style.height).toEqual('300px');
          });

  it('should work with NO_CHANGE values if they are applied to bindings ', () => {
    @Component({
      template: `
            <div
              [style.width]="w"
              style.height="{{ h }}"
              [style.opacity]="o"></div>
          `
    })
    class Cmp {
      w: any = null;
      h: any = null;
      o: any = null;
    }

    TestBed.configureTestingModule({declarations: [Cmp]});
    const fixture = TestBed.createComponent(Cmp);
    const comp = fixture.componentInstance;

    comp.w = '100px';
    comp.h = '200px';
    comp.o = '0.5';
    fixture.detectChanges();

    const div = fixture.nativeElement.querySelector('div');
    expect(div.style.width).toEqual('100px');
    expect(div.style.height).toEqual('200px');
    expect(div.style.opacity).toEqual('0.5');

    comp.w = '500px';
    comp.o = '1';
    fixture.detectChanges();

    expect(div.style.width).toEqual('500px');
    expect(div.style.height).toEqual('200px');
    expect(div.style.opacity).toEqual('1');
  });

  it('should allow [ngStyle] and [ngClass] to be used together', () => {
    @Component({
      template: `
            <div [ngClass]="c" [ngStyle]="s"></div>
          `
    })
    class Cmp {
      c: any = 'foo bar';
      s: any = {width: '200px'};
    }

    TestBed.configureTestingModule({declarations: [Cmp]});
    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    const div = fixture.nativeElement.querySelector('div');
    expect(div.style.width).toEqual('200px');
    expect(div.classList.contains('foo')).toBeTruthy();
    expect(div.classList.contains('bar')).toBeTruthy();
  });

  it('should allow detectChanges to be run in a property change that causes additional styling to be rendered',
     () => {
       @Component({
         selector: 'child',
         template: `
          <div [class.ready-child]="readyTpl"></div>
        `,
       })
       class ChildCmp {
         readyTpl = false;

         @HostBinding('class.ready-host')
         readyHost = false;
       }

       @Component({
         selector: 'parent',
         template: `
        <div>
          <div #template></div>
          <p>{{prop}}</p>
        </div>
      `,
         host: {
           '[style.color]': 'color',
         },
       })
       class ParentCmp {
         private _prop = '';

         @ViewChild('template', {read: ViewContainerRef, static: false})
         vcr: ViewContainerRef = null !;

         private child: ComponentRef<ChildCmp> = null !;

         @Input()
         set prop(value: string) {
           this._prop = value;
           if (this.child && value === 'go') {
             this.child.instance.readyHost = true;
             this.child.instance.readyTpl = true;
             this.child.changeDetectorRef.detectChanges();
           }
         }

         get prop() { return this._prop; }

         ngAfterViewInit() {
           const factory = this.componentFactoryResolver.resolveComponentFactory(ChildCmp);
           this.child = this.vcr.createComponent(factory);
         }

         constructor(private componentFactoryResolver: ComponentFactoryResolver) {}
       }

       @Component({
         template: `<parent [prop]="prop"></parent>`,
       })
       class App {
         prop = 'a';
       }

       @NgModule({
         entryComponents: [ChildCmp],
         declarations: [ChildCmp],
       })
       class ChildCmpModule {
       }

       TestBed.configureTestingModule({declarations: [App, ParentCmp], imports: [ChildCmpModule]});
       const fixture = TestBed.createComponent(App);
       fixture.detectChanges(false);

       let readyHost = fixture.nativeElement.querySelector('.ready-host');
       let readyChild = fixture.nativeElement.querySelector('.ready-child');

       expect(readyHost).toBeFalsy();
       expect(readyChild).toBeFalsy();

       fixture.componentInstance.prop = 'go';
       fixture.detectChanges(false);

       readyHost = fixture.nativeElement.querySelector('.ready-host');
       readyChild = fixture.nativeElement.querySelector('.ready-child');
       expect(readyHost).toBeTruthy();
       expect(readyChild).toBeTruthy();
     });

  it('should allow detectChanges to be run in a hook that causes additional styling to be rendered',
     () => {
       @Component({
         selector: 'child',
         template: `
          <div [class.ready-child]="readyTpl"></div>
        `,
       })
       class ChildCmp {
         readyTpl = false;

         @HostBinding('class.ready-host')
         readyHost = false;
       }

       @Component({
         selector: 'parent',
         template: `
          <div>
            <div #template></div>
            <p>{{prop}}</p>
          </div>
        `,
       })
       class ParentCmp {
         updateChild = false;

         @ViewChild('template', {read: ViewContainerRef, static: false})
         vcr: ViewContainerRef = null !;

         private child: ComponentRef<ChildCmp> = null !;

         ngDoCheck() {
           if (this.updateChild) {
             this.child.instance.readyHost = true;
             this.child.instance.readyTpl = true;
             this.child.changeDetectorRef.detectChanges();
           }
         }

         ngAfterViewInit() {
           const factory = this.componentFactoryResolver.resolveComponentFactory(ChildCmp);
           this.child = this.vcr.createComponent(factory);
         }

         constructor(private componentFactoryResolver: ComponentFactoryResolver) {}
       }

       @Component({
         template: `<parent #parent></parent>`,
       })
       class App {
         @ViewChild('parent', {static: true}) public parent: ParentCmp|null = null;
       }

       @NgModule({
         entryComponents: [ChildCmp],
         declarations: [ChildCmp],
       })
       class ChildCmpModule {
       }

       TestBed.configureTestingModule({declarations: [App, ParentCmp], imports: [ChildCmpModule]});
       const fixture = TestBed.createComponent(App);
       fixture.detectChanges(false);

       let readyHost = fixture.nativeElement.querySelector('.ready-host');
       let readyChild = fixture.nativeElement.querySelector('.ready-child');
       expect(readyHost).toBeFalsy();
       expect(readyChild).toBeFalsy();

       const parent = fixture.componentInstance.parent !;
       parent.updateChild = true;
       fixture.detectChanges(false);

       readyHost = fixture.nativeElement.querySelector('.ready-host');
       readyChild = fixture.nativeElement.querySelector('.ready-child');
       expect(readyHost).toBeTruthy();
       expect(readyChild).toBeTruthy();
     });

  onlyInIvy('only ivy allows for multiple styles/classes to be balanaced across directives')
      .it('should allow various duplicate properties to be defined in various styling maps within the template and directive styling bindings',
          () => {
            @Component({
              template: `
           <div [style.width]="w"
                [style.height]="h"
                [style]="s1"
                [dir-with-styling]="s2">
         `
            })
            class Cmp {
              h = '100px';
              w = '100px';
              s1: any = {border: '10px solid black', width: '200px'};
              s2: any = {border: '10px solid red', width: '300px'};
            }

            @Directive({selector: '[dir-with-styling]'})
            class DirectiveExpectingStyling {
              @Input('dir-with-styling') @HostBinding('style') public styles: any = null;
            }

            TestBed.configureTestingModule({declarations: [Cmp, DirectiveExpectingStyling]});
            const fixture = TestBed.createComponent(Cmp);
            fixture.detectChanges();

            const element = fixture.nativeElement.querySelector('div');
            expect(element.style.border).toEqual('10px solid black');
            expect(element.style.width).toEqual('100px');
            expect(element.style.height).toEqual('100px');

            fixture.componentInstance.s1 = null;
            fixture.detectChanges();

            expect(element.style.border).toEqual('10px solid red');
            expect(element.style.width).toEqual('100px');
            expect(element.style.height).toEqual('100px');
          });
});

function getDebugNode(element: Node): DebugNode|null {
  const lContext = loadLContextFromNode(element);
  const lViewDebug = toDebug(lContext.lView) as LViewDebug;
  const debugNodes = lViewDebug.nodes || [];
  for (let i = 0; i < debugNodes.length; i++) {
    const n = debugNodes[i];
    if (n.native === element) {
      return n;
    }
  }
  return null;
}

function assertStyleCounters(countForSet: number, countForRemove: number) {
  expect(ngDevMode !.rendererSetStyle).toEqual(countForSet);
  expect(ngDevMode !.rendererRemoveStyle).toEqual(countForRemove);
}

function assertStyle(element: HTMLElement, prop: string, value: any) {
  expect((element.style as any)[prop]).toEqual(value);
}
