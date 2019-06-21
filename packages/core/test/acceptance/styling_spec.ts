/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component, Directive, ElementRef, Input} from '@angular/core';
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
    const sanitizer: DomSanitizer = TestBed.get(DomSanitizer);

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
    const sanitizer: DomSanitizer = TestBed.get(DomSanitizer);

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
});
