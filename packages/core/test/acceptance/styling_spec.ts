/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {NgClass, NgFor, NgIf, NgStyle} from '@angular/common';
import {By, DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {isBrowser} from '@angular/private/testing';
import {
  Component,
  ComponentRef,
  computed,
  Directive,
  ElementRef,
  HostBinding,
  Input,
  Renderer2,
  signal,
  ViewChild,
  ViewContainerRef,
} from '../../src/core';
import {bypassSanitizationTrustStyle} from '../../src/sanitization/bypass';
import {TestBed} from '../../testing';
import {
  getElementClasses,
  getElementStyles,
  getSortedClassName,
  getSortedStyle,
} from '../../testing/src/styling';

describe('styling', () => {
  describe('apply in prioritization order', () => {
    it('should perform static bindings', () => {
      @Component({
        template: `<div class="STATIC" style="color: blue"></div>`,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      const staticDiv = fixture.nativeElement.querySelectorAll('div')[0];

      expect(getSortedClassName(staticDiv)).toEqual('STATIC');
      expect(getSortedStyle(staticDiv)).toEqual('color: blue;');
    });

    it('should perform prop bindings', () => {
      @Component({
        template: `<div
          [class.dynamic]="true"
          [style.color]="'blue'"
          [style.width.px]="100"
        ></div>`,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();

      const div = fixture.nativeElement.querySelector('div');
      expect(getSortedClassName(div)).toEqual('dynamic');
      expect(getSortedStyle(div)).toEqual('color: blue; width: 100px;');
    });

    it('should perform map bindings', () => {
      @Component({
        template: `<div [class]="{dynamic: true}" [style]="{color: 'blue', width: '100px'}"></div>`,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();

      const div = fixture.nativeElement.querySelector('div');
      expect(getSortedClassName(div)).toEqual('dynamic');
      expect(getSortedStyle(div)).toEqual('color: blue; width: 100px;');
    });

    it('should perform interpolation bindings', () => {
      @Component({
        template: `<div
          class="static {{ 'dynamic' }}"
          style.color="blu{{ 'e' }}"
          style="width: {{ '100' }}px"
        ></div>`,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();

      const div = fixture.nativeElement.querySelector('div');
      expect(getSortedClassName(div)).toEqual('dynamic static');
      expect(getSortedStyle(div)).toEqual('color: blue; width: 100px;');
    });

    it('should support hostBindings', () => {
      @Directive({
        selector: '[my-host-bindings-1]',
        host: {'class': 'HOST_STATIC_1', 'style': 'font-family: "c1"'},
      })
      class Dir1 {}

      @Directive({
        selector: '[my-host-bindings-2]',
        host: {'class': 'HOST_STATIC_2', 'style': 'font-family: "c2"'},
      })
      class Dir2 {}

      @Component({
        template: `<div
          my-host-bindings-2
          my-host-bindings-1
          class="STATIC"
          style="color: blue"
        ></div>`,

        imports: [
          // Order of directives in the template does not matter.
          // Order of declarations matters as it determines the relative priority for overrides.
          Dir1,
          Dir2,
          // Even thought component is at the end, it will still have lowest priority because
          // components are special that way.
        ],
      })
      class Cmp {}
      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();

      const div = fixture.nativeElement.querySelector('div');
      expect(getSortedClassName(div)).toEqual('HOST_STATIC_1 HOST_STATIC_2 STATIC');
      // Chrome will remove quotes but Firefox and Domino do not.
      expect(getSortedStyle(div)).toMatch(/color: blue; font-family: "?c2"?;/);
    });

    it('should support hostBindings inheritance', () => {
      @Directive({
        host: {'class': 'SUPER_STATIC', 'style': 'font-family: "super";'},
      })
      class SuperDir {}
      @Directive({
        selector: '[my-host-bindings]',
        host: {'class': 'HOST_STATIC', 'style': 'font-family: "host font"'},
      })
      class Dir extends SuperDir {}

      @Component({
        template: `<div my-host-bindings class="STATIC" style="color: blue;"></div>`,
        imports: [Dir],
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();

      const div = fixture.nativeElement.querySelector('div');
      expect(getSortedClassName(div)).toEqual('HOST_STATIC STATIC SUPER_STATIC');
      // Browsers keep the '"' around the font name, but Domino removes it some we do search and
      // replace. Yes we could do `replace(/"/g, '')` but that fails on android.
      expect(getSortedStyle(div).replace('"', '').replace('"', '')).toEqual(
        'color: blue; font-family: host font;',
      );
    });

    it('should apply style properties that require quote wrapping', () => {
      @Component({
        template: `
          <div style='content: "foo"'></div>
          <div style='content: "foo"'></div>
          <div style="content: 'foo'"></div>
        `,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();

      const divElements = fixture.nativeElement.querySelectorAll('div');
      expect(getSortedStyle(divElements[0])).toBe('content: "foo";');
      expect(getSortedStyle(divElements[1])).toBe('content: "foo";');
      expect(getSortedStyle(divElements[2])).toMatch(/content: ["']foo["'];/);
    });

    it('should apply template classes in correct order', () => {
      @Component({
        template: `
          <div
            class="STATIC DELETE_MAP_A DELETE_PROP_B"
            [class]="{foo: true, DELETE_MAP_A: false}"
            [class.bar]="true"
            [class.DELETE_PROP_B]="false"
          ></div>
        `,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();

      const classDiv = fixture.nativeElement.querySelector('div');
      expect(getSortedClassName(classDiv)).toEqual('STATIC bar foo');
    });

    it('should apply template styles in correct order', () => {
      @Component({
        template: `
          <div
            style="width: 100px; height: 200px: color: red; background-color: yellow"
            [style]="{width: '110px', height: null}"
            [style.color]="'blue'"
            [style.height.px]="undefined"
          ></div>
        `,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();

      const styleDiv = fixture.nativeElement.querySelector('div');
      expect(getSortedStyle(styleDiv)).toEqual(
        'background-color: yellow; color: blue; width: 110px;',
      );
    });

    it('should work with ngClass/ngStyle', () => {
      @Component({
        template: `<div [ngClass]="['dynamic']" [ngStyle]="{'font-family': 'dynamic'}"></div>`,
        imports: [NgClass, NgStyle],
      })
      class Cmp {}
      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();

      const div = fixture.nativeElement.querySelector('div');
      expect(getSortedClassName(div)).toEqual('dynamic');
      expect(getSortedStyle(div)).toEqual('font-family: dynamic;');
    });
  });

  describe('css variables', () => {
    const supportsCssVariables =
      typeof getComputedStyle !== 'undefined' &&
      typeof CSS !== 'undefined' &&
      typeof CSS.supports !== 'undefined' &&
      CSS.supports('color', 'var(--fake-var)');

    it('should support css variables', () => {
      // This test only works in browsers which support CSS variables.
      if (!supportsCssVariables) {
        return;
      }

      @Component({
        template: `
          <div [style.--my-var]="'100px'">
            <span style="width: var(--my-var)">CONTENT</span>
          </div>
        `,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();

      const span = fixture.nativeElement.querySelector('span') as HTMLElement;
      expect(getComputedStyle(span).getPropertyValue('width')).toEqual('100px');
    });

    it('should support css variables with numbers in their name inside a host binding', () => {
      // This test only works in browsers which support CSS variables.
      if (!supportsCssVariables) {
        return;
      }

      @Component({
        template: `<h1 style="width: var(--my-1337-var)">Hello</h1>`,
      })
      class Cmp {
        @HostBinding('style') style = '--my-1337-var: 100px;';
      }
      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();

      const header = fixture.nativeElement.querySelector('h1') as HTMLElement;
      expect(getComputedStyle(header).getPropertyValue('width')).toEqual('100px');
    });

    it('should support case-sensitive css variables', () => {
      // This test only works in browsers which support CSS variables.
      if (!supportsCssVariables) {
        return;
      }

      @Component({
        template: `
          <div [style.--MyVar]="'100px'">
            <span style="width: var(--MyVar)">CONTENT</span>
          </div>
        `,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();

      const span = fixture.nativeElement.querySelector('span') as HTMLElement;
      expect(getComputedStyle(span).getPropertyValue('width')).toEqual('100px');
    });
  });

  describe('non-string class keys', () => {
    it('should allow null in a class array binding', () => {
      @Component({
        template: `<div [class]="['a', null, 'c']" [class.extra]="true"></div>`,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      const div = fixture.nativeElement.querySelector('div');
      expect(div.getAttribute('class')).toBe('a c null extra');
    });

    it('should allow undefined in a class array binding', () => {
      @Component({
        template: `<div [class]="['a', undefined, 'c']" [class.extra]="true"></div>`,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      const div = fixture.nativeElement.querySelector('div');
      expect(div.getAttribute('class')).toBe('a c undefined extra');
    });

    it('should allow zero in a class array binding', () => {
      @Component({
        template: `<div [class]="['a', 0, 'c']" [class.extra]="true"></div>`,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      const div = fixture.nativeElement.querySelector('div');
      expect(div.getAttribute('class')).toBe('0 a c extra');
    });

    it('should allow false in a class array binding', () => {
      @Component({
        template: `<div [class]="['a', false, 'c']" [class.extra]="true"></div>`,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      const div = fixture.nativeElement.querySelector('div');
      expect(div.getAttribute('class')).toBe('a c false extra');
    });

    it('should ignore an empty string in a class array binding', () => {
      @Component({
        template: `<div [class]="['a', '', 'c']" [class.extra]="true"></div>`,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      const div = fixture.nativeElement.querySelector('div');
      expect(div.getAttribute('class')).toBe('a c extra');
    });

    it('should ignore a string containing spaces in a class array binding', () => {
      @Component({
        template: `<div [class]="['a', 'hello there', 'c']" [class.extra]="true"></div>`,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      const div = fixture.nativeElement.querySelector('div');
      expect(div.getAttribute('class')).toBe('a c extra');
    });

    it('should ignore a string containing spaces in a class object literal binding', () => {
      @Component({
        template: `<div
          [class]="{a: true, 'hello there': true, c: true}"
          [class.extra]="true"
        ></div>`,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      const div = fixture.nativeElement.querySelector('div');
      expect(div.getAttribute('class')).toBe('a c extra');
    });

    it('should ignore an object literal in a class array binding', () => {
      @Component({
        template: `<div [class]="['a', {foo: true}, 'c']" [class.extra]="true"></div>`,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      const div = fixture.nativeElement.querySelector('div');
      expect(div.getAttribute('class')).toBe('a c extra');
    });

    it('should handle a string array in a class array binding', () => {
      @Component({
        template: `<div [class]="['a', ['foo', 'bar'], 'c']" [class.extra]="true"></div>`,
      })
      class Cmp {}

      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();
      const div = fixture.nativeElement.querySelector('div');
      expect(div.getAttribute('class')).toBe('a c foo,bar extra');
    });
  });

  it('should bind [class] as input to directive', () => {
    @Directive({
      selector: '[dir-shadows-class-input]',
    })
    class DirectiveShadowsClassInput {
      constructor(private elementRef: ElementRef) {}
      @Input('class')
      set klass(value: string) {
        this.elementRef.nativeElement.setAttribute('shadow-class', value);
      }
    }

    @Component({
      template: `
        <div class="s1" [class]="'d1'" dir-shadows-class-input></div>
        <div class="s2 {{ 'd2' }}" dir-shadows-class-input></div>
      `,
      imports: [DirectiveShadowsClassInput],
    })
    class Cmp {}

    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    const divs = fixture.nativeElement.querySelectorAll('div');

    // TODO: Use destructuring once Domino supports native ES2015, or when jsdom is used.
    const div1 = divs[0];
    const div2 = divs[1];

    // Static value `class="s1"` is always written to the DOM.
    expect(div1.className).toEqual('s1');
    expect(div1.getAttribute('shadow-class')).toEqual('s1 d1');

    expect(div2.className).toEqual('');
    expect(div2.getAttribute('shadow-class')).toEqual('s2 d2');
  });

  it('should not feed host classes back into shadow input', () => {
    @Directive({
      selector: '[dir-shadows-class-input]',
      host: {'class': 'DIRECTIVE'},
    })
    class DirectiveShadowsClassInput {
      constructor(private elementRef: ElementRef) {}
      @Input('class')
      set klass(value: string) {
        this.elementRef.nativeElement.setAttribute('shadow-class', value);
      }
    }

    @Component({
      template: `
        <div class="s1" dir-shadows-class-input></div>
        <div class="s1" [class]="'d1'" dir-shadows-class-input></div>
      `,

      imports: [DirectiveShadowsClassInput],
    })
    class Cmp {}

    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    const divs = fixture.nativeElement.querySelectorAll('div');

    // TODO: Use destructuring once Domino supports native ES2015, or when jsdom is used.
    const divStatic = divs[0];
    const divBinding = divs[1];

    expectClass(divStatic).toEqual({'DIRECTIVE': true, 's1': true});
    expect(divStatic.getAttribute('shadow-class')).toEqual('s1');

    expectClass(divBinding).toEqual({'DIRECTIVE': true, 's1': true});
    expect(divBinding.getAttribute('shadow-class')).toEqual('s1 d1');
  });

  it('should not feed host style back into shadow input', () => {
    @Directive({
      selector: '[dir-shadows-class-input]',
      host: {'style': 'color: red;'},
    })
    class DirectiveShadowsStyleInput {
      constructor(private elementRef: ElementRef) {}
      @Input('style')
      set style(value: string) {
        this.elementRef.nativeElement.setAttribute('shadow-style', value);
      }
    }

    @Component({
      template: `
        <div style="width: 1px;" dir-shadows-class-input></div>
        <div style="width: 1px;" [style]="'height:1px;'" dir-shadows-class-input></div>
      `,

      imports: [DirectiveShadowsStyleInput],
    })
    class Cmp {}

    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    const divs = fixture.nativeElement.querySelectorAll('div');

    // TODO: Use destructuring once Domino supports native ES2015, or when jsdom is used.
    const divStatic = divs[0];
    const divBinding = divs[1];

    expectStyle(divStatic).toEqual({'color': 'red', 'width': '1px'});
    expect(divStatic.getAttribute('shadow-style')).toEqual('width: 1px;');

    expectStyle(divBinding).toEqual({'color': 'red', 'width': '1px'});
    expect(divBinding.getAttribute('shadow-style')).toEqual('width: 1px; height:1px;');
  });

  it('should bind [class] as input to directive when both static and falsy dynamic values are present', async () => {
    @Directive({
      selector: '[dir-shadows-class-input]',
    })
    class DirectiveShadowsClassInput {
      constructor(private elementRef: ElementRef) {}
      @Input('class')
      set klass(value: string) {
        this.elementRef.nativeElement.setAttribute('shadow-class', value);
      }
    }

    @Component({
      template: ` <div class="s1" [class]="classBinding()" dir-shadows-class-input></div> `,
      imports: [DirectiveShadowsClassInput],
    })
    class Cmp {
      classBinding = signal<any>(undefined);
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();

    const div = fixture.nativeElement.querySelector('div');
    expect(div.className).toEqual('s1');
    expect(div.getAttribute('shadow-class')).toEqual('s1');

    fixture.componentInstance.classBinding.set(null);
    await fixture.whenStable();
    expect(div.className).toEqual('s1');
    expect(div.getAttribute('shadow-class')).toEqual('s1');

    fixture.componentInstance.classBinding.set(false);
    await fixture.whenStable();
    expect(div.className).toEqual('s1');
    expect(div.getAttribute('shadow-class')).toEqual('s1');

    fixture.componentInstance.classBinding.set({toString: () => 'd1'});
    await fixture.whenStable();
    expect(div.className).toEqual('s1');
    expect(div.getAttribute('shadow-class')).toEqual('s1 d1');
  });

  it('should bind [style] as input to directive', () => {
    @Directive({
      selector: '[dir-shadows-style-input]',
    })
    class DirectiveShadowsStyleInput {
      constructor(private elementRef: ElementRef) {}
      @Input('style')
      set style(value: string) {
        this.elementRef.nativeElement.setAttribute('shadow-style', value);
      }
    }

    @Component({
      template: `
        <div style="color: red;" [style]="'width: 100px;'" dir-shadows-style-input></div>
      `,

      imports: [DirectiveShadowsStyleInput],
    })
    class Cmp {}

    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    const div = fixture.nativeElement.querySelector('div');
    expect(div.style.cssText).toEqual('color: red;');
    expect(div.getAttribute('shadow-style')).toEqual('color: red; width: 100px;');
  });

  it('should prevent circular ExpressionChangedAfterItHasBeenCheckedError on shadow inputs', () => {
    @Directive({
      selector: '[dir-shadows-class-input]',
    })
    class DirectiveShadowsClassInput {
      @Input('class') klass: string | undefined;

      @HostBinding('class')
      get hostClasses() {
        return `${this.klass} SUFFIX`;
      }
    }

    @Component({
      template: `<div class="s1" dir-shadows-class-input></div>`,

      imports: [DirectiveShadowsClassInput],
    })
    class Cmp {}

    const fixture = TestBed.createComponent(Cmp);
    expect(() => fixture.detectChanges()).not.toThrow();

    const div = fixture.nativeElement.querySelector('div');
    expect(div.className).toEqual('s1 SUFFIX');
  });

  it('should recover from exceptions', () => {
    const myDirHostBinding = signal(false);
    @Directive({
      selector: '[my-dir]',
      host: {
        '[class.myDir]': 'myDir()',
      },
    })
    class MyDirective {
      myDir(): boolean {
        if (!myDirHostBinding()) {
          throw new Error('class.myDir');
        }
        return myDirHostBinding();
      }
    }

    @Component({
      template: `
        <div [id]="maybeThrow(id())">
          <span my-dir [class]="maybeThrow(klass())" [class.foo]="maybeThrow(foo())"></span>
        </div>
      `,
      imports: [MyDirective],
    })
    class Cmp {
      id = signal('throw_id');
      klass = signal<string | string[]>('throw_klass');
      foo = signal(`throw_foo`);

      maybeThrow(value: any) {
        if (typeof value === 'string' && value.indexOf('throw') === 0) {
          throw new Error(value);
        }
        return value;
      }
    }

    const fixture = TestBed.createComponent(Cmp);
    const cmp = fixture.componentInstance;
    const div = fixture.nativeElement.querySelector('div');
    const span = fixture.nativeElement.querySelector('span');

    expect(() => fixture.detectChanges()).toThrowError(/throw_id/);
    expect(div.id).toBeFalsy();
    expectClass(span).toEqual({});

    cmp.id.set('myId');
    expect(() => fixture.detectChanges()).toThrowError(/throw_klass/);
    expect(div.id).toEqual('myId');
    expectClass(span).toEqual({});

    cmp.klass.set(['BAR']);
    expect(() => fixture.detectChanges()).toThrowError(/throw_foo/);
    expect(div.id).toEqual('myId');
    expectClass(span).toEqual({BAR: true});

    cmp.foo.set('foo');
    expect(() => fixture.detectChanges()).toThrowError(/class.myDir/);
    expect(div.id).toEqual('myId');
    expectClass(span).toEqual({BAR: true, foo: true});

    myDirHostBinding.set(true);
    fixture.detectChanges();
    expect(div.id).toEqual('myId');
    expectClass(span).toEqual({BAR: true, foo: true, myDir: true});
  });

  it('should render inline style and class attribute values on the element before a directive is instantiated', () => {
    @Directive({
      selector: '[directive-expecting-styling]',
    })
    class DirectiveExpectingStyling {
      constructor(elm: ElementRef) {
        const native = elm.nativeElement;
        native.setAttribute('data-captured-width', native.style.width);
        native.setAttribute('data-captured-classes', native.className);
      }
    }

    @Component({
      template: ` <div directive-expecting-styling style="width:200px" class="abc xyz"></div> `,

      imports: [DirectiveExpectingStyling],
    })
    class Cmp {}

    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('div');
    expect(element.style.width).toEqual('200px');
    expect(element.getAttribute('data-captured-width')).toEqual('200px');
    expect(element.className.trim()).toEqual('abc xyz');
    expect(element.getAttribute('data-captured-classes')).toEqual('abc xyz');
  });

  it('should only render the same initial styling values once before a directive runs', () => {
    @Directive({
      selector: '[directive-expecting-styling]',
    })
    class DirectiveExpectingStyling {
      constructor(elm: ElementRef) {
        const native = elm.nativeElement;
        native.style.width = '300px';
        native.classList.remove('abc');
      }
    }

    @Component({
      template: ` <div directive-expecting-styling style="width:200px" class="abc"></div> `,

      imports: [DirectiveExpectingStyling],
    })
    class Cmp {}

    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('div');
    expect(element.style.width).toEqual('300px');
    expect(element.classList.contains('abc')).toBeFalsy();
  });

  it('should ensure that static classes are assigned to ng-container elements and picked up for content projection', () => {
    @Component({
      selector: 'project',
      template: `
        <div class="outer-area">
          <ng-content></ng-content>
        </div>
        <div class="inner-area">
          <ng-content select=".inner"></ng-content>
        </div>
      `,
    })
    class ProjectCmp {}

    @Component({
      template: `
        <project>
          outer
          <ng-container class="inner"> inner </ng-container>
        </project>
      `,
      imports: [ProjectCmp],
    })
    class MyApp {}

    const fixture = TestBed.createComponent(MyApp);
    const element = fixture.nativeElement;
    fixture.detectChanges();

    const inner = element.querySelector('.inner-area');
    expect(inner.textContent.trim()).toEqual('inner');
    const outer = element.querySelector('.outer-area');
    expect(outer.textContent.trim()).toEqual('outer');
  });

  it('should render initial styling for repeated nodes that a component host', () => {
    @Component({
      selector: '[comp]',
      template: '',
    })
    class Comp {}

    @Component({
      template: `
        <ng-template ngFor [ngForOf]="items" let-item>
          <p comp class="a">A</p>
        </ng-template>
      `,
      imports: [NgFor, Comp],
    })
    class App {
      items = [1, 2, 3];
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.a')).length).toBe(3);
  });

  it('should do nothing for empty style bindings', () => {
    @Component({
      template: '<div [style.color]></div>',
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe('<div></div>');
  });

  it('should do nothing for empty class bindings', () => {
    @Component({
      template: '<div [class.is-open]></div>',
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe('<div></div>');
  });

  it('should be able to bind zero', () => {
    @Component({
      template: '<div #div [style.opacity]="opacity"></div>',
    })
    class App {
      @ViewChild('div') div!: ElementRef<HTMLElement>;
      opacity = 0;
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance.div.nativeElement.style.opacity).toBe('0');
  });

  it('should be able to bind a SafeValue to backgroundImage', async () => {
    @Component({
      template: '<div [style.backgroundImage]="image"></div>',
    })
    class Cmp {
      image!: SafeStyle;
    }

    const fixture = TestBed.createComponent(Cmp);
    const sanitizer: DomSanitizer = TestBed.inject(DomSanitizer);

    fixture.componentInstance.image = sanitizer.bypassSecurityTrustStyle('url("#test")');
    await fixture.whenStable();

    const div = fixture.nativeElement.querySelector('div') as HTMLDivElement;
    expect(div.style.backgroundImage).toBe('url("#test")');
  });

  it('should set !important on a single property', async () => {
    @Component({
      template: '<div [style.width]="width"></div>',
    })
    class Cmp {
      width = '50px !important';
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();
    const html = fixture.nativeElement.innerHTML;

    // We have to check the `style` attribute, because `element.style.prop` doesn't include
    // `!important`. Use a regex, because the different renderers produce different whitespace.
    expect(html).toMatch(/style=["|']width:\s*50px\s*!important/);
  });

  it('should set !important that is not preceded by a space', async () => {
    @Component({
      template: '<div [style.width]="width"></div>',
    })
    class Cmp {
      width = '50px!important';
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();
    const html = fixture.nativeElement.innerHTML;

    // We have to check the `style` attribute, because `element.style.prop` doesn't include
    // `!important`. Use a regex, because the different renderers produce different whitespace.
    expect(html).toMatch(/style=["|']width:\s*50px\s*!important/);
  });

  it('should set !important on a dash-case property', async () => {
    @Component({
      template: '<div [style.margin-right]="marginRight"></div>',
    })
    class Cmp {
      marginRight = '5px !important';
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();
    const html = fixture.nativeElement.innerHTML;

    // We have to check the `style` attribute, because `element.style.prop` doesn't include
    // `!important`. Use a regex, because the different renderers produce different whitespace.
    expect(html).toMatch(/style=["|']margin-right:\s*5px\s*!important/);
  });

  it('should set !important on multiple properties', async () => {
    @Component({
      template: '<div [style]="styles"></div>',
    })
    class Cmp {
      styles = 'height: 25px !important; width: 50px !important;';
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();
    const html = fixture.nativeElement.innerHTML;

    // We have to check the `style` attribute, because `element.style.prop` doesn't include
    // `!important`. Use a regex, because the different renderers produce different whitespace.
    expect(html).toMatch(/style=["|']height:\s*25px\s*!important;\s*width:\s*50px\s*!important/);
  });

  it('should set !important if some properties are !important and other are not', async () => {
    @Component({
      template: '<div [style]="styles"></div>',
    })
    class Cmp {
      styles = 'height: 25px; width: 50px !important;';
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();
    const html = fixture.nativeElement.innerHTML;

    // We have to check the `style` attribute, because `element.style.prop` doesn't include
    // `!important`. Use a regex, because the different renderers produce different whitespace.
    expect(html).toMatch(/style=["|']height:\s*25px;\s*width:\s*50px\s*!important/);
  });

  it('should not write to the native element if a directive shadows the class input', () => {
    // This ex is a bit contrived. In real apps, you might have a shared class that is extended
    // both by components with host elements and by directives on template nodes. In that case, the
    // host styles for the template directives should just be ignored.
    @Directive({
      selector: 'ng-template[styleDir]',
      host: {'[style.display]': 'display'},
    })
    class StyleDir {
      display = 'block';
    }

    @Component({
      template: `<ng-template styleDir></ng-template>`,
      imports: [StyleDir],
    })
    class MyApp {}

    TestBed.createComponent(MyApp).detectChanges();
  });

  it('should be able to bind a SafeValue to clip-path', async () => {
    @Component({
      template: '<div [style.clip-path]="path"></div>',
    })
    class Cmp {
      constructor(private sanitizer: DomSanitizer) {
        this.path = this.sanitizer.bypassSecurityTrustStyle('url("#test")');
      }

      path!: SafeStyle;
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();

    const html = fixture.nativeElement.innerHTML;

    // Note that check the raw HTML, because (at the time of writing) the Node-based renderer
    // that we use to run tests doesn't support `clip-path` in `CSSStyleDeclaration`.
    expect(html).toMatch(/style=["|']clip-path:\s*url\(.*#test.*\)/);
  });

  it('should support interpolations inside a class binding', async () => {
    @Component({
      template: `
        <div
          class="a{{ one() }}b{{ two() }}c{{ three() }}d{{ four() }}e{{ five() }}f{{ six() }}g{{
            seven()
          }}h{{ eight() }}i{{ nine() }}j"
        ></div>
        <div
          class="a{{ one() }}b{{ two() }}c{{ three() }}d{{ four() }}e{{ five() }}f{{ six() }}g{{
            seven()
          }}h{{ eight() }}i"
        ></div>
        <div
          class="a{{ one() }}b{{ two() }}c{{ three() }}d{{ four() }}e{{ five() }}f{{ six() }}g{{
            seven()
          }}h"
        ></div>
        <div
          class="a{{ one() }}b{{ two() }}c{{ three() }}d{{ four() }}e{{ five() }}f{{ six() }}g"
        ></div>
        <div class="a{{ one() }}b{{ two() }}c{{ three() }}d{{ four() }}e{{ five() }}f"></div>
        <div class="a{{ one() }}b{{ two() }}c{{ three() }}d{{ four() }}e"></div>
        <div class="a{{ one() }}b{{ two() }}c{{ three() }}d"></div>
        <div class="a{{ one() }}b{{ two() }}c"></div>
        <div class="a{{ one() }}b"></div>
        <div class="{{ one() }}"></div>
      `,
    })
    class Cmp {
      one = signal('1');
      two = signal('2');
      three = signal('3');
      four = signal('4');
      five = signal('5');
      six = signal('6');
      seven = signal('7');
      eight = signal('8');
      nine = signal('9');
    }

    const fixture = TestBed.createComponent(Cmp);
    const instance = fixture.componentInstance;
    await fixture.whenStable();

    const divs = fixture.nativeElement.querySelectorAll('div');

    expect(divs[0].getAttribute('class')).toBe('a1b2c3d4e5f6g7h8i9j');
    expect(divs[1].getAttribute('class')).toBe('a1b2c3d4e5f6g7h8i');
    expect(divs[2].getAttribute('class')).toBe('a1b2c3d4e5f6g7h');
    expect(divs[3].getAttribute('class')).toBe('a1b2c3d4e5f6g');
    expect(divs[4].getAttribute('class')).toBe('a1b2c3d4e5f');
    expect(divs[5].getAttribute('class')).toBe('a1b2c3d4e');
    expect(divs[6].getAttribute('class')).toBe('a1b2c3d');
    expect(divs[7].getAttribute('class')).toBe('a1b2c');
    expect(divs[8].getAttribute('class')).toBe('a1b');
    expect(divs[9].getAttribute('class')).toBe('1');

    instance.one.set('');
    instance.two.set('');
    instance.three.set('');
    instance.four.set('');
    instance.five.set('');
    instance.six.set('');
    instance.seven.set('');
    instance.eight.set('');
    instance.nine.set('');
    await fixture.whenStable();

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

  it('should support interpolations inside a style binding', async () => {
    @Component({
      template: `
        <div
          style="content: &quot;a{{ one() }}b{{ two() }}c{{ three() }}d{{ four() }}e{{ five() }}f{{
            six()
          }}g{{ seven() }}h{{ eight() }}i{{ nine() }}j&quot;"
        ></div>
        <div
          style="content: &quot;a{{ one() }}b{{ two() }}c{{ three() }}d{{ four() }}e{{ five() }}f{{
            six()
          }}g{{ seven() }}h{{ eight() }}i&quot;"
        ></div>
        <div
          style="content: &quot;a{{ one() }}b{{ two() }}c{{ three() }}d{{ four() }}e{{ five() }}f{{
            six()
          }}g{{ seven() }}h&quot;"
        ></div>
        <div
          style="content: &quot;a{{ one() }}b{{ two() }}c{{ three() }}d{{ four() }}e{{ five() }}f{{
            six()
          }}g&quot;"
        ></div>
        <div
          style="content: &quot;a{{ one() }}b{{ two() }}c{{ three() }}d{{ four() }}e{{
            five()
          }}f&quot;"
        ></div>
        <div
          style="content: &quot;a{{ one() }}b{{ two() }}c{{ three() }}d{{ four() }}e&quot;"
        ></div>
        <div style="content: &quot;a{{ one() }}b{{ two() }}c{{ three() }}d&quot;"></div>
        <div style="content: &quot;a{{ one() }}b{{ two() }}c&quot;"></div>
        <div style="content: &quot;a{{ one() }}b&quot;"></div>
        <div style="{{ self() }}"></div>
      `,
    })
    class Cmp {
      self = signal('content: "self"');
      one = signal('1');
      two = signal('2');
      three = signal('3');
      four = signal('4');
      five = signal('5');
      six = signal('6');
      seven = signal('7');
      eight = signal('8');
      nine = signal('9');
    }

    const fixture = TestBed.createComponent(Cmp);
    const instance = fixture.componentInstance;
    await fixture.whenStable();

    const divs = fixture.nativeElement.querySelectorAll('div');

    expect(divs[0].style.getPropertyValue('content')).toBe('"a1b2c3d4e5f6g7h8i9j"');
    expect(divs[1].style.getPropertyValue('content')).toBe('"a1b2c3d4e5f6g7h8i"');
    expect(divs[2].style.getPropertyValue('content')).toBe('"a1b2c3d4e5f6g7h"');
    expect(divs[3].style.getPropertyValue('content')).toBe('"a1b2c3d4e5f6g"');
    expect(divs[4].style.getPropertyValue('content')).toBe('"a1b2c3d4e5f"');
    expect(divs[5].style.getPropertyValue('content')).toBe('"a1b2c3d4e"');
    expect(divs[6].style.getPropertyValue('content')).toBe('"a1b2c3d"');
    expect(divs[7].style.getPropertyValue('content')).toBe('"a1b2c"');
    expect(divs[8].style.getPropertyValue('content')).toBe('"a1b"');
    expect(divs[9].style.getPropertyValue('content')).toBe('"self"');

    instance.one.set('');
    instance.two.set('');
    instance.three.set('');
    instance.four.set('');
    instance.five.set('');
    instance.six.set('');
    instance.seven.set('');
    instance.eight.set('');
    instance.nine.set('');
    instance.self.set('');
    await fixture.whenStable();

    expect(divs[0].style.getPropertyValue('content')).toBe('"abcdefghij"');
    expect(divs[1].style.getPropertyValue('content')).toBe('"abcdefghi"');
    expect(divs[2].style.getPropertyValue('content')).toBe('"abcdefgh"');
    expect(divs[3].style.getPropertyValue('content')).toBe('"abcdefg"');
    expect(divs[4].style.getPropertyValue('content')).toBe('"abcdef"');
    expect(divs[5].style.getPropertyValue('content')).toBe('"abcde"');
    expect(divs[6].style.getPropertyValue('content')).toBe('"abcd"');
    expect(divs[7].style.getPropertyValue('content')).toBe('"abc"');
    expect(divs[8].style.getPropertyValue('content')).toBe('"ab"');
    expect(divs[9].style.getPropertyValue('content')).toBeFalsy();
  });

  it('should support interpolations inside a class binding when other classes are present', async () => {
    @Component({
      template: '<div class="zero i-{{one()}} {{two()}} three"></div>',
    })
    class Cmp {
      one = signal('one');
      two = signal('two');
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();
    const classList = fixture.nativeElement.querySelector('div').classList;

    expect(classList).toContain('zero');
    expect(classList).toContain('i-one');
    expect(classList).toContain('two');
    expect(classList).toContain('three');

    fixture.componentInstance.one.set('');
    fixture.componentInstance.two.set('');
    await fixture.whenStable();

    expect(classList).toContain('zero');
    expect(classList).toContain('i-');
    expect(classList).toContain('three');
    expect(classList).not.toContain('i-one');
    expect(classList).not.toContain('two');
  });

  it('should support interpolations inside a style property binding', async () => {
    @Component({
      template: `
        <div
          style.font-family="f{{ one() }}{{ two() }}{{ three() }}{{ four() }}{{ five() }}{{
            six()
          }}{{ seven() }}{{ eight() }}{{ nine() }}"
        ></div>
        <div
          style.font-family="f{{ one() }}{{ two() }}{{ three() }}{{ four() }}{{ five() }}{{
            six()
          }}{{ seven() }}{{ eight() }}"
        ></div>
        <div
          style.font-family="f{{ one() }}{{ two() }}{{ three() }}{{ four() }}{{ five() }}{{
            six()
          }}{{ seven() }}"
        ></div>
        <div
          style.font-family="f{{ one() }}{{ two() }}{{ three() }}{{ four() }}{{ five() }}{{
            six()
          }}"
        ></div>
        <div style.font-family="f{{ one() }}{{ two() }}{{ three() }}{{ four() }}{{ five() }}"></div>
        <div style.font-family="f{{ one() }}{{ two() }}{{ three() }}{{ four() }}"></div>
        <div style.font-family="f{{ one() }}{{ two() }}{{ three() }}"></div>
        <div style.font-family="f{{ one() }}{{ two() }}"></div>
        <div style.font-family="f{{ one() }}"></div>
        <div style.width="{{ singleBinding() }}"></div>
      `,
    })
    class Cmp {
      singleBinding = signal<string | null>('1337px');
      one = signal(1);
      two = signal(2);
      three = signal(3);
      four = signal(4);
      five = signal(5);
      six = signal(6);
      seven = signal(7);
      eight = signal(8);
      nine = signal(9);
    }

    const fixture = TestBed.createComponent(Cmp);
    const instance = fixture.componentInstance;
    await fixture.whenStable();

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

    instance.singleBinding.set(null);
    instance.one.set(1);
    instance.two.set(1);
    instance.three.set(1);
    instance.four.set(1);
    instance.five.set(1);
    instance.six.set(1);
    instance.seven.set(1);
    instance.eight.set(1);
    instance.nine.set(1);
    await fixture.whenStable();

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

  it('should support interpolations when a style property has a unit suffix', async () => {
    @Component({
      template: '<div style.width.px="{{one()}}{{three()}}{{three()}}7"></div>',
    })
    class Cmp {
      one = signal(1);
      three = signal(3);
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();
    const div = fixture.nativeElement.querySelector('div');

    expect(div.style.width).toBe('1337px');

    fixture.componentInstance.one.set(2);
    fixture.componentInstance.three.set(6);
    await fixture.whenStable();

    expect(div.style.width).toBe('2667px');
  });

  it('should not write to a `class` input binding in the event that there is no static class value', async () => {
    let capturedClassBindingCount = 0;
    let capturedClassBindingValue: string | null | undefined = undefined;
    let capturedMyClassBindingCount = 0;
    let capturedMyClassBindingValue: string | null | undefined = undefined;

    @Directive({
      selector: '[my-class-dir]',
    })
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

    @Component({
      template: '<div [class]="c()" [my-class-dir]="x"></div>',
      imports: [MyClassDir],
    })
    class Cmp {
      c = signal<any>(null);
      x = 'foo';
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();

    expect(capturedClassBindingCount).toEqual(1);
    expect(capturedClassBindingValue as any).toEqual(null);
    expect(capturedMyClassBindingCount).toEqual(1);
    expect(capturedMyClassBindingValue!).toEqual('foo');

    fixture.componentInstance.c.set('dynamic-value');
    await fixture.whenStable();

    expect(capturedClassBindingCount).toEqual(2);
    expect(capturedClassBindingValue!).toEqual('dynamic-value');
    expect(capturedMyClassBindingCount).toEqual(1);
    expect(capturedMyClassBindingValue!).toEqual('foo');

    fixture.componentInstance.c.set(null);
    await fixture.whenStable();

    expect(capturedClassBindingCount).toEqual(3);
    expect(capturedClassBindingValue as any).toEqual(null);
    expect(capturedMyClassBindingCount).toEqual(1);
    expect(capturedMyClassBindingValue!).toEqual('foo');

    fixture.componentInstance.c.set('');
    await fixture.whenStable();

    expect(capturedClassBindingCount).toEqual(4);
    expect(capturedClassBindingValue as any).toEqual('');
    expect(capturedMyClassBindingCount).toEqual(1);
    expect(capturedMyClassBindingValue!).toEqual('foo');
  });

  it('should write to [class] binding during `update` mode if there is an instantiation-level value', async () => {
    let capturedClassBindingCount = 0;
    let capturedClassBindingValue: string | null | undefined = undefined;

    @Directive({
      selector: '[my-class-dir]',
    })
    class MyClassDir {
      @Input('class')
      set classVal(v: string) {
        capturedClassBindingCount++;
        capturedClassBindingValue = v;
      }
    }

    @Component({
      template: '<div [class]="c()" my-class-dir></div>',
      imports: [MyClassDir],
    })
    class Cmp {
      c = signal<any>('bar');
    }

    const fixture = TestBed.createComponent(Cmp);
    expect(capturedClassBindingCount).toEqual(0);
    await fixture.whenStable();

    expect(capturedClassBindingCount).toEqual(1);
    expect(capturedClassBindingValue as any).toEqual('bar');

    fixture.componentInstance.c.set('dynamic-bar');
    await fixture.whenStable();

    expect(capturedClassBindingCount).toEqual(2);
    expect(capturedClassBindingValue!).toEqual('dynamic-bar');
  });

  it('should write to a `class` input binding if there is a static class value', () => {
    let capturedClassBindingCount = 0;
    let capturedClassBindingValue: string | null = null;
    let capturedMyClassBindingCount = 0;
    let capturedMyClassBindingValue: string | null = null;

    @Directive({
      selector: '[my-class-dir]',
    })
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

    @Component({
      template: '<div class="static-val" [my-class-dir]="x"></div>',

      imports: [MyClassDir],
    })
    class Cmp {
      x = 'foo';
    }

    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    expect(capturedClassBindingValue!).toEqual('static-val');
    expect(capturedClassBindingCount).toEqual(1);
    expect(capturedMyClassBindingValue!).toEqual('foo');
    expect(capturedMyClassBindingCount).toEqual(1);
  });

  it('should write to a `className` input binding', () => {
    @Component({
      selector: 'comp',
      template: `{{ className }}`,
    })
    class Comp {
      @Input() className: string = '';
    }
    @Component({
      template: `<comp [className]="'my-className'"></comp>`,
      imports: [Comp],
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.firstChild.innerHTML).toBe('my-className');
  });

  it('should write combined class attribute and class binding to the class input', () => {
    @Component({
      selector: 'comp',
      template: `{{ className }}`,
    })
    class Comp {
      @Input('class') className: string = '';
    }

    @Component({
      template: `<comp class="static" [class]="'my-className'"></comp>`,
      imports: [Comp],
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.firstChild.innerHTML).toBe('static my-className');
  });

  it('should write to a `class` input binding if there is a static class value and there is a binding value', async () => {
    let capturedClassBindingCount = 0;
    let capturedClassBindingValue: string | null = null;
    let capturedMyClassBindingCount = 0;
    let capturedMyClassBindingValue: string | null = null;

    @Directive({
      selector: '[my-class-dir]',
    })
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

    @Component({
      template: '<div class="static-val" [class]="c()" [my-class-dir]="x"></div>',
      imports: [MyClassDir],
    })
    class Cmp {
      c = signal<any>(null);
      x: any = 'foo';
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();

    expect(capturedClassBindingCount).toEqual(
      2,
      // '2' is not ideal as '1' would be preferred.
      // The reason for two writes is that one is for the  static
      // `class="static-val"` and one for `[class]="c"`. This means that
      // `class="static-val"` is written during the create block which is not ideal.
      // To do this correctly we would have to delay the `class="static-val"` until
      // the update block, but that would be expensive since it would require that we
      // would check if we possibly have this situation on every `advance()`
      // instruction. We don't think this is worth it, and we are just going to live
      // with this.
    );
    expect(capturedClassBindingValue!).toEqual('static-val');
    expect(capturedMyClassBindingCount).toEqual(1);
    expect(capturedMyClassBindingValue!).toEqual('foo');

    capturedClassBindingCount = 0;
    fixture.componentInstance.c.set('dynamic-val');
    await fixture.whenStable();

    expect(capturedClassBindingCount).toEqual(1);
    expect(capturedClassBindingValue!).toEqual('static-val dynamic-val');
    expect(capturedMyClassBindingCount).toEqual(1);
    expect(capturedMyClassBindingValue!).toEqual('foo');
  });

  it('should allow multiple directives to set dynamic and static classes independent of one another', () => {
    @Directive({
      selector: '[dir-one]',
      host: {'[class.dir-one]': 'dirOneExp'},
    })
    class DirOne {
      dirOneExp = true;
    }

    @Directive({
      selector: '[dir-two]',
      host: {'class': 'dir-two'},
    })
    class DirTwo {}

    @Component({
      template: ` <div dir-one dir-two></div> `,

      imports: [DirOne, DirTwo],
    })
    class Cmp {}

    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('div');
    expect(element.classList.contains('dir-one')).toBeTruthy();
    expect(element.classList.contains('dir-two')).toBeTruthy();
  });

  it('should support class bindings with dots in the class name', () => {
    @Directive({
      selector: '[dir]',
      host: {'[class.py-2.5]': 'exp'},
    })
    class Dir {
      exp = true;
    }

    @Component({
      template: `<div dir [class.px-3.5]="exp"></div>`,
      imports: [Dir],
    })
    class Cmp {
      exp = true;
    }

    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('div');
    expect(element.classList.contains('px-3.5')).toBeTrue();
    expect(element.classList.contains('py-2.5')).toBeTrue();
    expect(element.classList.contains('px-3')).toBeFalse();
    expect(element.classList.contains('py-2')).toBeFalse();
  });

  it('should not write empty style values to the DOM', () => {
    @Component({
      template: `
        <div
          [style.color]="null"
          [style.--bg-color]="undefined"
          [style.margin]="''"
          [style.font-size]="'   '"
        ></div>
      `,
    })
    class Cmp {}

    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe('<div></div>');
  });

  describe('NgClass', () => {
    // We had a bug where NgClass would not allocate sufficient slots for host bindings,
    // so it would overwrite information about other directives nearby. This test checks
    // that TestDir's injector is not overwritten by NgClass, so TestDir should still
    // be found by DI when ChildDir is instantiated.
    it('should not overwrite other directive info when using NgClass', async () => {
      @Directive({
        selector: '[test-dir]',
      })
      class TestDir {}

      @Directive({
        selector: '[child-dir]',
      })
      class ChildDir {
        constructor(public parent: TestDir) {}
      }

      @Component({
        imports: [NgClass, NgIf, ChildDir, TestDir],
        template: `
          <div class="my-class" [ngClass]="classMap()" test-dir>
            <div *ngIf="showing()" child-dir>Hello</div>
          </div>
        `,
      })
      class AppComponent {
        classMap = signal({'with-button': true});
        showing = signal(false);
      }

      const fixture = TestBed.createComponent(AppComponent);
      await fixture.whenStable();
      const testDirDiv = fixture.debugElement.nativeElement.querySelector('div');
      expect(testDirDiv.classList).toContain('with-button');
      expect(fixture.debugElement.nativeElement.textContent).not.toContain('Hello');

      fixture.componentInstance.classMap.set({'with-button': false});
      fixture.componentInstance.showing.set(true);
      await fixture.whenStable();

      const childDir = fixture.debugElement.query(By.directive(ChildDir)).injector.get(ChildDir);
      expect(childDir.parent).toBeInstanceOf(TestDir);
      expect(testDirDiv.classList).not.toContain('with-button');
      expect(fixture.debugElement.nativeElement.textContent).toContain('Hello');
    });
  });

  it('should be able to name inputs starting with `class` or `style`', () => {
    @Directive({
      selector: '[dir]',
    })
    class Dir {
      @Input('classesInSchool') classes = '';
      @Input('styleOfClothing') style = '';
    }

    @Component({
      template: '<span dir [classesInSchool]="classes" [styleOfClothing]="style"></span>',
      imports: [Dir],
    })
    class App {
      @ViewChild(Dir) dir!: Dir;

      classes = 'math';
      style = '80s';
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const directive = fixture.componentInstance.dir;

    expect(directive.classes).toBe('math');
    expect(directive.style).toBe('80s');
  });

  it('should be able to bind to `className`', () => {
    @Component({
      template: '',
    })
    class App {
      @HostBinding('className') klass = 'one two';
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const classList = fixture.nativeElement.classList;

    expect(classList.contains('one')).toBe(true);
    expect(classList.contains('two')).toBe(true);
  });

  it('should apply single property styles/classes to the element and default to any static styling values', async () => {
    @Component({
      template: `
        <div
          [style.width]="w()"
          [style.height]="h()"
          [style.opacity]="o()"
          style="width:200px; height:200px;"
          [class.abc]="abc()"
          [class.xyz]="xyz()"
        ></div>
      `,
    })
    class Cmp {
      w = signal<string | null | undefined>('100px');
      h = signal<string | null | undefined>('100px');
      o = signal<string | null | undefined>('0.5');
      abc = signal(true);
      xyz = signal(false);
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();

    const element = fixture.nativeElement.querySelector('div');
    expect(element.style.width).toEqual('100px');
    expect(element.style.height).toEqual('100px');
    expect(element.style.opacity).toEqual('0.5');
    expect(element.classList.contains('abc')).toBeTruthy();
    expect(element.classList.contains('xyz')).toBeFalsy();

    fixture.componentInstance.w.set(undefined);
    fixture.componentInstance.h.set(undefined);
    fixture.componentInstance.o.set(undefined);
    fixture.componentInstance.abc.set(false);
    fixture.componentInstance.xyz.set(true);
    await fixture.whenStable();

    expect(element.style.width).toEqual('200px');
    expect(element.style.height).toEqual('200px');
    expect(element.style.opacity).toBeFalsy();
    expect(element.classList.contains('abc')).toBeFalsy();
    expect(element.classList.contains('xyz')).toBeTruthy();

    fixture.componentInstance.w.set(null);
    fixture.componentInstance.h.set(null);
    fixture.componentInstance.o.set(null);
    await fixture.whenStable();
    expect(element.style.width).toBeFalsy();
    expect(element.style.height).toBeFalsy();
    expect(element.style.opacity).toBeFalsy();
  });

  it('should apply single style/class across the template and directive host bindings', async () => {
    @Directive({
      selector: '[dir-that-sets-width]',
    })
    class DirThatSetsWidthDirective {
      @Input('dir-that-sets-width') @HostBinding('style.width') public width:
        string | null | undefined = '';
    }

    @Directive({
      selector: '[another-dir-that-sets-width]',
      host: {'[style.width]': 'width'},
    })
    class AnotherDirThatSetsWidthDirective {
      @Input('another-dir-that-sets-width') public width: string | null | undefined = '';
    }

    @Component({
      template: `
        <div
          [style.width]="w0()"
          [dir-that-sets-width]="w1()"
          [another-dir-that-sets-width]="w2()"
        ></div>
      `,
      imports: [DirThatSetsWidthDirective, AnotherDirThatSetsWidthDirective],
    })
    class Cmp {
      w0 = signal<string | null | undefined>(null);
      w1 = signal<string | null | undefined>(null);
      w2 = signal<string | null | undefined>(null);
    }

    const fixture = TestBed.createComponent(Cmp);
    fixture.componentInstance.w0.set('100px');
    fixture.componentInstance.w1.set('200px');
    fixture.componentInstance.w2.set('300px');
    await fixture.whenStable();

    const element = fixture.nativeElement.querySelector('div');
    expect(element.style.width).toEqual('100px');

    fixture.componentInstance.w0.set(undefined);
    await fixture.whenStable();

    expect(element.style.width).toEqual('300px');

    fixture.componentInstance.w2.set(undefined);
    await fixture.whenStable();

    expect(element.style.width).toEqual('200px');

    fixture.componentInstance.w1.set(undefined);
    await fixture.whenStable();

    expect(element.style.width).toBeFalsy();

    fixture.componentInstance.w2.set('400px');
    await fixture.whenStable();

    expect(element.style.width).toEqual('400px');

    fixture.componentInstance.w1.set('500px');
    fixture.componentInstance.w0.set('600px');
    await fixture.whenStable();

    expect(element.style.width).toEqual('600px');
  });

  it('should only run stylingFlush once when there are no collisions between styling properties', async () => {
    @Directive({
      selector: '[dir-with-styling]',
      host: {'[style.font-size]': 'fontSize()'},
    })
    class DirWithStyling {
      public fontSize = signal('100px');
    }

    @Component({
      selector: 'comp-with-styling',
      template: '',
      host: {
        '[style.width]': 'width()',
        '[style.height]': 'height()',
      },
    })
    class CompWithStyling {
      public width = signal('900px');
      public height = signal('900px');
    }

    @Component({
      template: `
        <comp-with-styling [style.opacity]="opacity()" dir-with-styling>...</comp-with-styling>
      `,
      imports: [DirWithStyling, CompWithStyling],
    })
    class Cmp {
      opacity = signal<string | null>('0.5');
      @ViewChild(CompWithStyling, {static: true}) compWithStyling: CompWithStyling | null = null;
      @ViewChild(DirWithStyling, {static: true}) dirWithStyling: DirWithStyling | null = null;
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    const element = fixture.nativeElement.querySelector('comp-with-styling');

    expect(element.style.opacity).toEqual('0.5');
    expect(element.style.width).toEqual('900px');
    expect(element.style.height).toEqual('900px');
    expect(element.style.fontSize).toEqual('100px');

    component.opacity.set('0.6');
    component.compWithStyling!.height.set('100px');
    component.compWithStyling!.width.set('100px');
    component.dirWithStyling!.fontSize.set('50px');
    await fixture.whenStable();

    expect(element.style.opacity).toEqual('0.6');
    expect(element.style.width).toEqual('100px');
    expect(element.style.height).toEqual('100px');
    expect(element.style.fontSize).toEqual('50px');
  });

  it('should combine all styling across the template, directive and component host bindings', async () => {
    @Directive({
      selector: '[dir-with-styling]',
    })
    class DirWithStyling {
      @HostBinding('style.color') public color = 'red';

      @HostBinding('style.font-size') public fontSize = '100px';

      @HostBinding('class.dir') public dirClass = true;
    }

    @Component({
      template: '',
      selector: 'comp-with-styling',
    })
    class CompWithStyling {
      @HostBinding('style.width') public width = '900px';

      @HostBinding('style.height') public height = '900px';

      @HostBinding('class.comp') public compClass = true;
    }

    @Component({
      template: `
        <comp-with-styling
          [style.opacity]="opacity()"
          [style.width]="width()"
          [class.tpl]="tplClass()"
          dir-with-styling
          >...</comp-with-styling
        >
      `,
      imports: [DirWithStyling, CompWithStyling],
    })
    class Cmp {
      opacity = signal<string | null | undefined>('0.5');
      width = signal<string | null | undefined>('auto');
      tplClass = signal(true);
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();

    const element = fixture.nativeElement.querySelector('comp-with-styling');

    expectStyle(element).toEqual({
      'color': 'red',
      'font-size': '100px',
      'height': '900px',
      'opacity': '0.5',
      'width': 'auto',
    });
    expectClass(element).toEqual({
      'dir': true,
      'comp': true,
      'tpl': true,
    });

    fixture.componentInstance.width.set(undefined);
    fixture.componentInstance.opacity.set(undefined);
    fixture.componentInstance.tplClass.set(false);
    await fixture.whenStable();

    expectStyle(element).toEqual({
      'color': 'red',
      'width': '900px',
      'height': '900px',
      'font-size': '100px',
    });
    expectClass(element).toEqual({
      'dir': true,
      'comp': true,
    });

    fixture.componentInstance.width.set(null);
    fixture.componentInstance.opacity.set(null);
    await fixture.whenStable();

    expectStyle(element).toEqual({'color': 'red', 'height': '900px', 'font-size': '100px'});
  });

  it('should properly apply styling across sub and super class directive host bindings', async () => {
    @Directive({
      selector: '[super-class-dir]',
    })
    class SuperClassDirective {
      @HostBinding('style.width') public w1 = '100px';
    }

    @Component({
      selector: '[sub-class-dir]',
      template: '',
    })
    class SubClassDirective extends SuperClassDirective {
      @HostBinding('style.width') public w2 = '200px';
    }

    @Component({
      template: ` <div sub-class-dir [style.width]="w3()"></div> `,
      imports: [SubClassDirective],
    })
    class Cmp {
      w3 = signal<string | null | undefined>('300px');
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();

    const element = fixture.nativeElement.querySelector('div');

    expectStyle(element).toEqual({
      'width': '300px',
    });

    fixture.componentInstance.w3.set(null);
    await fixture.whenStable();

    expectStyle(element).toEqual({});

    fixture.componentInstance.w3.set(undefined);
    await fixture.whenStable();

    expectStyle(element).toEqual({
      'width': '200px',
    });
  });

  it('should apply map-based style and class entries', async () => {
    @Component({
      template: '<div [style]="s()" [class]="c()"></div>',
    })
    class Cmp {
      public c = signal<{[key: string]: any} | null>(null);
      updateClasses(classes: string) {
        const c = {...(this.c() || {})};
        Object.keys(c).forEach((className) => {
          c[className] = false;
        });
        classes.split(/\s+/).forEach((className) => {
          c[className] = true;
        });
        this.c.set(c);
      }

      public s = signal<{[key: string]: any} | null>(null);
      updateStyles(prop: string, value: string | number | null) {
        const s = {...(this.s() || {})};
        Object.assign(s, {[prop]: value});
        this.s.set(s);
      }

      reset() {
        this.s.set(null);
        this.c.set(null);
      }
    }

    const fixture = TestBed.createComponent(Cmp);
    const comp = fixture.componentInstance;
    comp.updateStyles('width', '100px');
    comp.updateStyles('height', '200px');
    comp.updateClasses('abc');
    await fixture.whenStable();

    const element = fixture.nativeElement.querySelector('div');
    expectStyle(element).toEqual({width: '100px', height: '200px'});
    expectClass(element).toEqual({abc: true});

    comp.reset();
    comp.updateStyles('width', '500px');
    comp.updateStyles('height', null);
    comp.updateClasses('def');
    await fixture.whenStable();

    expectStyle(element).toEqual({width: '500px'});
    expectClass(element).toEqual({def: true});
  });

  it('should resolve styling collisions across templates, directives and components for prop and map-based entries', async () => {
    @Directive({
      selector: '[dir-that-sets-styling]',
      host: {'[style]': 'map()'},
    })
    class DirThatSetsStyling {
      public map = signal<any>({color: 'red', width: '777px'});
    }

    @Component({
      template: `
        <div
          [style.width]="width()"
          [style]="map()"
          style="width:200px; font-size:99px"
          dir-that-sets-styling
          #dir
          [class.xyz]="xyz"
        ></div>
      `,
      imports: [DirThatSetsStyling],
    })
    class Cmp {
      map = signal<any>({width: '111px', opacity: '0.5'});
      width = signal<string | null | undefined>('555px');
      xyz = false;

      @ViewChild('dir', {read: DirThatSetsStyling, static: true}) dir!: DirThatSetsStyling;
    }

    const fixture = TestBed.createComponent(Cmp);
    const comp = fixture.componentInstance;
    await fixture.whenStable();

    const element = fixture.nativeElement.querySelector('div');
    expectStyle(element).toEqual({
      'width': '555px',
      'color': 'red',
      'font-size': '99px',
      'opacity': '0.5',
    });

    comp.width.set(undefined);
    await fixture.whenStable();

    expectStyle(element).toEqual({
      'width': '111px',
      'color': 'red',
      'font-size': '99px',
      'opacity': '0.5',
    });

    comp.map.set(null);
    await fixture.whenStable();

    expectStyle(element).toEqual({
      'width': '200px',
      'color': 'red',
      'font-size': '99px',
    });

    comp.dir.map.set(null);
    await fixture.whenStable();

    expectStyle(element).toEqual({
      'width': '200px',
      'font-size': '99px',
    });
  });

  it('should only apply each styling property once per CD across templates, components, directives', async () => {
    @Directive({
      selector: '[dir-that-sets-styling]',
      host: {
        'style': 'width:0px; height:0px',
        '[style]': 'map()',
      },
    })
    class DirThatSetsStyling {
      public map = signal<any>({width: '999px', height: '999px'});
    }

    @Component({
      template: `
        <div
          #dir
          [style.width]="width()"
          [style.height]="height()"
          [style]="map()"
          dir-that-sets-styling
        ></div>
      `,
      imports: [DirThatSetsStyling],
    })
    class Cmp {
      width = signal<string | null | undefined>('111px');
      height = signal<string | null | undefined>('111px');
      map = signal<any>({width: '555px', height: '555px'});

      @ViewChild('dir', {read: DirThatSetsStyling, static: true}) dir!: DirThatSetsStyling;
    }

    const fixture = TestBed.createComponent(Cmp);
    const comp = fixture.componentInstance;

    await fixture.whenStable();
    const element = fixture.nativeElement.querySelector('div');

    assertStyle(element, 'width', '111px');
    assertStyle(element, 'height', '111px');

    comp.width.set('222px');
    await fixture.whenStable();

    assertStyle(element, 'width', '222px');
    assertStyle(element, 'height', '111px');

    comp.height.set('222px');
    await fixture.whenStable();

    assertStyle(element, 'width', '222px');
    assertStyle(element, 'height', '222px');

    comp.width.set(undefined);
    await fixture.whenStable();

    assertStyle(element, 'width', '555px');
    assertStyle(element, 'height', '222px');

    comp.width.set('123px');
    comp.height.set('123px');
    await fixture.whenStable();

    assertStyle(element, 'width', '123px');
    assertStyle(element, 'height', '123px');

    comp.map.set({});
    await fixture.whenStable();

    // No change, hence no write
    assertStyle(element, 'width', '123px');
    assertStyle(element, 'height', '123px');

    comp.width.set(undefined);
    await fixture.whenStable();

    assertStyle(element, 'width', '999px');
    assertStyle(element, 'height', '123px');

    comp.dir.map.set(null);
    await fixture.whenStable();

    // the width is only applied once
    assertStyle(element, 'width', '0px');
    assertStyle(element, 'height', '123px');

    comp.dir.map.set({width: '1000px', height: '1100px', color: 'red'});
    await fixture.whenStable();

    assertStyle(element, 'width', '1000px');
    assertStyle(element, 'height', '123px');
    assertStyle(element, 'color', 'red');

    comp.height.set(undefined);
    await fixture.whenStable();

    // height gets applied twice and all other
    // values get applied
    assertStyle(element, 'width', '1000px');
    assertStyle(element, 'height', '1100px');
    assertStyle(element, 'color', 'red');

    comp.map.set({color: 'blue', width: '2000px', opacity: '0.5'});
    await fixture.whenStable();

    assertStyle(element, 'width', '2000px');
    assertStyle(element, 'height', '1100px');
    assertStyle(element, 'color', 'blue');
    assertStyle(element, 'opacity', '0.5');

    comp.map.set({color: 'blue', width: '2000px'});
    await fixture.whenStable();

    // all four are applied because the map was altered
    assertStyle(element, 'width', '2000px');
    assertStyle(element, 'height', '1100px');
    assertStyle(element, 'color', 'blue');
    assertStyle(element, 'opacity', '');
  });

  it('should not sanitize style values before writing them', async () => {
    @Component({
      template: ` <div [style.width]="widthExp()" [style.background-image]="bgImageExp()"></div> `,
    })
    class Cmp {
      widthExp = signal('');
      bgImageExp = signal('');
    }

    const fixture = TestBed.createComponent(Cmp);
    const comp = fixture.componentInstance;
    await fixture.whenStable();

    const div = fixture.nativeElement.querySelector('div');

    comp.bgImageExp.set('url("javascript:img")');
    await fixture.whenStable();
    expect(getSortedStyle(div)).toContain('javascript:img');

    // Prove that bindings work.
    comp.widthExp.set('789px');
    comp.bgImageExp.set(bypassSanitizationTrustStyle(comp.bgImageExp()) as string);
    await fixture.whenStable();

    expect(div.style.getPropertyValue('background-image')).toEqual('url("javascript:img")');
    expect(div.style.getPropertyValue('width')).toEqual('789px');
  });

  it('should not sanitize style values before writing them with styleMap', async () => {
    @Component({
      template: ` <div [style.width]="widthExp()" [style]="styleMapExp()"></div> `,
    })
    class Cmp {
      widthExp = signal('');
      styleMapExp = signal<{[key: string]: any}>({});
    }

    const fixture = TestBed.createComponent(Cmp);
    const comp = fixture.componentInstance;
    await fixture.whenStable();

    const div = fixture.nativeElement.querySelector('div');

    comp.styleMapExp.set({'background-image': 'url("javascript:img")'});
    await fixture.whenStable();
    expect(getSortedStyle(div)).toContain('javascript:img');

    // Prove that bindings work.
    comp.widthExp.set('789px');
    comp.styleMapExp.set({
      'background-image': bypassSanitizationTrustStyle(comp.styleMapExp()['background-image']),
    });
    await fixture.whenStable();

    expect(div.style.getPropertyValue('background-image')).toEqual('url("javascript:img")');
    expect(div.style.getPropertyValue('width')).toEqual('789px');
  });

  it('should apply a unit to a style before writing it', async () => {
    @Component({
      template: ` <div [style.width.px]="widthExp()" [style.height.em]="heightExp()"></div> `,
    })
    class Cmp {
      widthExp = signal<string | number | null>('');
      heightExp = signal<string | number | null>('');
    }

    const fixture = TestBed.createComponent(Cmp);
    const comp = fixture.componentInstance;
    await fixture.whenStable();

    const div = fixture.nativeElement.querySelector('div');

    comp.widthExp.set('200');
    comp.heightExp.set(10);
    await fixture.whenStable();

    expect(getSortedStyle(div)).toEqual('height: 10em; width: 200px;');

    comp.widthExp.set(0);
    comp.heightExp.set(null);
    await fixture.whenStable();

    expect(getSortedStyle(div)).toEqual('width: 0px;');
  });

  it('should handle values wrapped into SafeValue', async () => {
    @Component({
      template: `
        <!-- Verify sanitizable style prop values wrapped in SafeValue -->
        <div [style.background]="getBackgroundSafe()"></div>

        <!-- Verify regular style prop values wrapped in SafeValue -->
        <p [style.width]="getWidthSafe()" [style.height]="getHeightSafe()"></p>

        <!-- Verify regular style prop values not wrapped in SafeValue -->
        <span [style.color]="getColorUnsafe()"></span>
      `,
    })
    class MyComp {
      constructor(private sanitizer: DomSanitizer) {}
      public width = signal('calc(20%)');
      public height = signal('10px');
      public background = signal('1.png');
      public color = signal('red');

      private getSafeStyle(value: string) {
        return this.sanitizer.bypassSecurityTrustStyle(value);
      }

      getBackgroundSafe() {
        return this.getSafeStyle(`url("/${this.background()}")`);
      }
      getWidthSafe() {
        return this.getSafeStyle(this.width());
      }
      getHeightSafe() {
        return this.getSafeStyle(this.height());
      }
      getColorUnsafe() {
        return this.color();
      }
    }

    const fixture = TestBed.createComponent(MyComp);
    await fixture.whenStable();

    const comp = fixture.componentInstance;
    const div = fixture.nativeElement.querySelector('div');
    const p = fixture.nativeElement.querySelector('p');
    const span = fixture.nativeElement.querySelector('span');

    expect(div.style.background).toContain('url("/1.png")');
    expect(p.style.width).toBe('calc(20%)');
    expect(p.style.height).toBe('10px');
    expect(span.style.color).toBe('red');

    comp.background.set('2.png');
    comp.width.set('5px');
    comp.height.set('100%');
    comp.color.set('green');

    await fixture.whenStable();

    expect(div.style.background).toContain('url("/2.png")');
    expect(p.style.width).toBe('5px');
    expect(p.style.height).toBe('100%');
    expect(span.style.color).toBe('green');
  });

  it('should evaluate follow-up [style] maps even if a former map is null', () => {
    @Directive({
      selector: '[dir-with-styling]',
    })
    class DirWithStyleMap {
      @HostBinding('style') public styleMap: any = {color: 'red'};
    }

    @Directive({
      selector: '[dir-with-styling-part2]',
    })
    class DirWithStyleMapPart2 {
      @HostBinding('style') public styleMap: any = {width: '200px'};
    }

    @Component({
      template: ` <div #div [style]="map" dir-with-styling dir-with-styling-part2></div> `,
      imports: [DirWithStyleMap, DirWithStyleMapPart2],
    })
    class Cmp {
      map: any = null;

      @ViewChild('div', {read: DirWithStyleMap, static: true}) dir1!: DirWithStyleMap;

      @ViewChild('div', {read: DirWithStyleMapPart2, static: true}) dir2!: DirWithStyleMapPart2;
    }

    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('div');
    expectStyle(element).toEqual({
      color: 'red',
      width: '200px',
    });
  });

  it('should evaluate initial style/class values on a list of elements that changes', async () => {
    @Component({
      template: `
        <div *ngFor="let item of items()" class="initial-class item-{{ item }}">
          {{ item }}
        </div>
      `,
      imports: [NgFor],
    })
    class Cmp {
      items = signal([1, 2, 3]);
    }

    const fixture = TestBed.createComponent(Cmp);
    const comp = fixture.componentInstance;
    await fixture.whenStable();

    function getItemElements(): HTMLElement[] {
      return [].slice.call(fixture.nativeElement.querySelectorAll('div'));
    }

    function getItemClasses(): string[] {
      return getItemElements()
        .map((e) => e.className)
        .sort()
        .join(' ')
        .split(' ');
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

    comp.items.set([2, 4, 6, 8]);
    await fixture.whenStable();

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

  it('should create and update multiple class bindings across multiple elements in a template', () => {
    @Component({
      template: `
        <header class="header">header</header>
        <div *ngFor="let item of items" class="item item-{{ item }}">
          {{ item }}
        </div>
        <footer class="footer">footer</footer>
      `,
      imports: [NgFor],
    })
    class Cmp {
      items = [1, 2, 3];
    }

    const fixture = TestBed.createComponent(Cmp);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    function getItemElements(): HTMLElement[] {
      return [].slice.call(fixture.nativeElement.querySelectorAll('div'));
    }

    function getItemClasses(): string[] {
      return getItemElements()
        .map((e) => e.className)
        .sort()
        .join(' ')
        .split(' ');
    }

    const header = fixture.nativeElement.querySelector('header');
    expect(header.classList.contains('header')).toBeTrue();

    const footer = fixture.nativeElement.querySelector('footer');
    expect(footer.classList.contains('footer')).toBeTrue();

    expect(getItemElements().length).toEqual(3);
    expect(getItemClasses()).toEqual(['item', 'item-1', 'item', 'item-2', 'item', 'item-3']);
  });

  it('should understand multiple directives which contain initial classes', () => {
    @Directive({
      selector: 'dir-one',
    })
    class DirOne {
      @HostBinding('class') public className = 'dir-one';
    }

    @Directive({
      selector: 'dir-two',
    })
    class DirTwo {
      @HostBinding('class') public className = 'dir-two';
    }

    @Component({
      template: `
        <dir-one></dir-one>
        <div class="initial"></div>
        <dir-two></dir-two>
      `,

      imports: [DirOne, DirTwo],
    })
    class Cmp {}

    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    const dirOne = fixture.nativeElement.querySelector('dir-one');
    const div = fixture.nativeElement.querySelector('div');
    const dirTwo = fixture.nativeElement.querySelector('dir-two');

    expect(dirOne.classList.contains('dir-one')).toBeTruthy();
    expect(dirTwo.classList.contains('dir-two')).toBeTruthy();
    expect(div.classList.contains('initial')).toBeTruthy();
  });

  it('should evaluate styling across the template directives when there are multiple elements/sources of styling', () => {
    @Directive({
      selector: '[one]',
    })
    class DirOne {
      @HostBinding('class') public className = 'dir-one';
    }

    @Directive({
      selector: '[two]',
    })
    class DirTwo {
      @HostBinding('class') public className = 'dir-two';
    }

    @Component({
      template: `
        <div class="a" [style.width.px]="w" one></div>
        <div class="b" [style.height.px]="h" one two></div>
        <div class="c" [style.color]="c" two></div>
      `,

      imports: [DirOne, DirTwo],
    })
    class Cmp {
      w = 100;
      h = 200;
      c = 'red';
    }

    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    const divA = fixture.nativeElement.querySelector('.a');
    const divB = fixture.nativeElement.querySelector('.b');
    const divC = fixture.nativeElement.querySelector('.c');

    expect(divA.style.width).toEqual('100px');
    expect(divB.style.height).toEqual('200px');
    expect(divC.style.color).toEqual('red');
  });

  it('should evaluate styling across the template and directives within embedded views', async () => {
    @Directive({
      selector: '[some-dir-with-styling]',
    })
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
          some-dir-with-styling
        >
          {{ item }}
        </div>
        <section [style.width.px]="w"></section>
        <p [style.height.px]="h"></p>
      `,
      imports: [NgFor, SomeDirWithStyling],
    })
    class Cmp {
      items = [1, 2, 3, 4];
      c = 'red';
      w = 100;
      h = 100;
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();

    const items = fixture.nativeElement.querySelectorAll('.item');
    expect(items.length).toEqual(4);
    expect(items[0].style.height).toEqual('0px');
    expect(items[1].style.height).toEqual('100px');
    expect(items[2].style.height).toEqual('200px');
    expect(items[3].style.height).toEqual('300px');

    const section = fixture.nativeElement.querySelector('section');
    const p = fixture.nativeElement.querySelector('p');

    expect(section.style['width']).toEqual('100px');
    expect(p.style['height']).toEqual('100px');
  });

  it("should flush bindings even if any styling hasn't changed in a previous directive", async () => {
    @Directive({
      selector: '[one]',
    })
    class DirOne {
      @HostBinding('style.width') w = '100px';
      @HostBinding('style.opacity') o = '0.5';
    }

    @Directive({
      selector: '[two]',
      host: {
        '[style.height]': 'h()',
        '[style.color]': 'c()',
      },
    })
    class DirTwo {
      h = signal('200px');
      c = signal('red');
    }

    @Component({
      template: '<div #target one two></div>',
      imports: [DirOne, DirTwo],
    })
    class Cmp {
      @ViewChild('target', {read: DirOne, static: true}) one!: DirOne;
      @ViewChild('target', {read: DirTwo, static: true}) two!: DirTwo;
    }

    const fixture = TestBed.createComponent(Cmp);
    const comp = fixture.componentInstance;
    await fixture.whenStable();

    const div = fixture.nativeElement.querySelector('div');
    expect(div.style.opacity).toEqual('0.5');
    expect(div.style.color).toEqual('red');
    expect(div.style.width).toEqual('100px');
    expect(div.style.height).toEqual('200px');

    comp.two.h.set('300px');
    await fixture.whenStable();
    expect(div.style.opacity).toEqual('0.5');
    expect(div.style.color).toEqual('red');
    expect(div.style.width).toEqual('100px');
    expect(div.style.height).toEqual('300px');
  });

  it('should work with NO_CHANGE values if they are applied to bindings ', async () => {
    @Component({
      template: ` <div [style.width]="w()" style.height="{{ h() }}" [style.opacity]="o()"></div> `,
    })
    class Cmp {
      w = signal<any>(null);
      h = signal<any>(null);
      o = signal<any>(null);
    }

    const fixture = TestBed.createComponent(Cmp);
    const comp = fixture.componentInstance;

    comp.w.set('100px');
    comp.h.set('200px');
    comp.o.set('0.5');
    await fixture.whenStable();

    const div = fixture.nativeElement.querySelector('div');
    expect(div.style.width).toEqual('100px');
    expect(div.style.height).toEqual('200px');
    expect(div.style.opacity).toEqual('0.5');

    comp.w.set('500px');
    comp.o.set('1');
    await fixture.whenStable();

    expect(div.style.width).toEqual('500px');
    expect(div.style.height).toEqual('200px');
    expect(div.style.opacity).toEqual('1');
  });

  it('should allow [ngStyle] and [ngClass] to be used together', () => {
    @Component({
      template: ` <div [ngClass]="c" [ngStyle]="s"></div> `,
      imports: [NgClass, NgStyle],
    })
    class Cmp {
      c: any = 'foo bar';
      s: any = {width: '200px'};
    }

    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    const div = fixture.nativeElement.querySelector('div');
    expect(div.style.width).toEqual('200px');
    expect(div.classList.contains('foo')).toBeTruthy();
    expect(div.classList.contains('bar')).toBeTruthy();
  });

  it('should allow to reset style property value defined using ngStyle', async () => {
    @Component({
      template: ` <div [ngStyle]="s()"></div> `,
      imports: [NgStyle],
    })
    class Cmp {
      s = signal<any>({opacity: '1'});

      clearStyle(): void {
        this.s.set(null);
      }
    }

    const fixture = TestBed.createComponent(Cmp);
    const comp = fixture.componentInstance;
    await fixture.whenStable();

    const div = fixture.nativeElement.querySelector('div');
    expect(div.style.opacity).toEqual('1');

    comp.clearStyle();
    await fixture.whenStable();

    expect(div.style.opacity).toEqual('');
  });

  it('should allow detectChanges to be run in a property change that causes additional styling to be rendered', () => {
    @Component({
      selector: 'child',
      template: ` <div [class.ready-child]="readyTpl()"></div> `,
      host: {
        '[class.ready-host]': 'readyHost()',
      },
    })
    class ChildCmp {
      readyTpl = signal(false);
      readyHost = signal(false);
    }

    @Component({
      selector: 'parent',
      template: `
        <div>
          <div #template></div>
          <p>{{ prop }}</p>
        </div>
      `,
    })
    class ParentCmp {
      private _prop = '';

      @ViewChild('template', {read: ViewContainerRef}) vcr: ViewContainerRef = null!;

      private child: ComponentRef<ChildCmp> = null!;

      @Input()
      set prop(value: string) {
        this._prop = value;
        if (this.child && value === 'go') {
          this.child.instance.readyHost.set(true);
          this.child.instance.readyTpl.set(true);
          this.child.changeDetectorRef.detectChanges();
        }
      }

      get prop() {
        return this._prop;
      }

      ngAfterViewInit() {
        this.child = this.vcr.createComponent(ChildCmp);
      }
    }

    @Component({
      template: `<parent [prop]="prop()"></parent>`,
      imports: [ParentCmp],
    })
    class App {
      prop = signal('a');
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges(false);

    let readyHost = fixture.nativeElement.querySelector('.ready-host');
    let readyChild = fixture.nativeElement.querySelector('.ready-child');

    expect(readyHost).toBeFalsy();
    expect(readyChild).toBeFalsy();

    fixture.componentInstance.prop.set('go');
    fixture.detectChanges(false);

    readyHost = fixture.nativeElement.querySelector('.ready-host');
    readyChild = fixture.nativeElement.querySelector('.ready-child');
    expect(readyHost).toBeTruthy();
    expect(readyChild).toBeTruthy();
  });

  it('should allow detectChanges to be run in a hook that causes additional styling to be rendered', () => {
    @Component({
      selector: 'child',
      template: ` <div [class.ready-child]="readyTpl()"></div> `,
      host: {
        '[class.ready-host]': 'readyHost()',
      },
    })
    class ChildCmp {
      readyTpl = signal(false);
      readyHost = signal(false);
    }

    @Component({
      selector: 'parent',
      template: `
        <div>
          <div #template></div>
        </div>
      `,
    })
    class ParentCmp {
      @Input() updateChild = false;

      @ViewChild('template', {read: ViewContainerRef}) vcr: ViewContainerRef = null!;

      private child: ComponentRef<ChildCmp> = null!;

      ngDoCheck() {
        if (this.updateChild) {
          this.child.instance.readyHost.set(true);
          this.child.instance.readyTpl.set(true);
          this.child.changeDetectorRef.detectChanges();
        }
      }

      ngAfterViewInit() {
        this.child = this.vcr.createComponent(ChildCmp);
      }
    }

    @Component({
      template: `<parent [updateChild]="updateChild()"></parent>`,
      imports: [ParentCmp],
    })
    class App {
      updateChild = signal(false);
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges(false);

    let readyHost = fixture.nativeElement.querySelector('.ready-host');
    let readyChild = fixture.nativeElement.querySelector('.ready-child');
    expect(readyHost).toBeFalsy();
    expect(readyChild).toBeFalsy();

    fixture.componentInstance.updateChild.set(true);
    fixture.detectChanges(false);

    readyHost = fixture.nativeElement.querySelector('.ready-host');
    readyChild = fixture.nativeElement.querySelector('.ready-child');
    expect(readyHost).toBeTruthy();
    expect(readyChild).toBeTruthy();
  });

  it('should allow various duplicate properties to be defined in various styling maps within the template and directive styling bindings', async () => {
    @Directive({
      selector: '[dir-with-styling]',
    })
    class DirectiveExpectingStyling {
      @Input('dir-with-styling') @HostBinding('style') public styles: any = null;
    }

    @Component({
      template: `
        <div [style.width]="w" [style.height]="h" [style]="s1()" [dir-with-styling]="s2"></div>
      `,
      imports: [DirectiveExpectingStyling],
    })
    class Cmp {
      h = '100px';
      w = '100px';
      s1: any = signal({border: '10px solid black', width: '200px'});
      s2 = {border: '10px solid red', width: '300px'};
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();

    const element = fixture.nativeElement.querySelector('div');
    expect(element.style.border).toEqual('10px solid black');
    expect(element.style.width).toEqual('100px');
    expect(element.style.height).toEqual('100px');

    fixture.componentInstance.s1.set(null);
    await fixture.whenStable();

    expect(element.style.border).toEqual('10px solid red');
    expect(element.style.width).toEqual('100px');
    expect(element.style.height).toEqual('100px');
  });

  it('should retrieve styles set via Renderer2', () => {
    let dirInstance!: Dir;
    @Directive({
      selector: '[dir]',
    })
    class Dir {
      constructor(
        public elementRef: ElementRef,
        public renderer: Renderer2,
      ) {
        dirInstance = this;
      }

      setStyles() {
        const nativeEl = this.elementRef.nativeElement;
        this.renderer.setStyle(nativeEl, 'transform', 'translate3d(0px, 0px, 0px)');
        this.renderer.addClass(nativeEl, 'my-class');
      }
    }

    @Component({
      template: `<div dir></div>`,
      imports: [Dir],
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    dirInstance.setStyles();

    const div = fixture.debugElement.children[0];
    expect(div.styles['transform']).toMatch(/translate3d\(0px\s*,\s*0px\s*,\s*0px\)/);
    expect(div.classes['my-class']).toBe(true);
  });

  it('should remove styles via Renderer2', () => {
    let dirInstance: any;
    @Directive({
      selector: '[dir]',
    })
    class Dir {
      constructor(
        public elementRef: ElementRef,
        public renderer: Renderer2,
      ) {
        dirInstance = this;
      }
    }

    @Component({
      template: `<div dir></div>`,

      imports: [Dir],
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const div = fixture.debugElement.children[0];
    const nativeEl = dirInstance.elementRef.nativeElement;

    // camel case
    dirInstance.renderer.setStyle(nativeEl, 'backgroundColor', 'red');
    expect(div.styles['backgroundColor']).toBe('red');
    dirInstance.renderer.removeStyle(nativeEl, 'backgroundColor');
    expect(div.styles['backgroundColor']).toBe('');

    // kebab case
    dirInstance.renderer.setStyle(nativeEl, 'background-color', 'red');
    expect(div.styles['backgroundColor']).toBe('red');
    dirInstance.renderer.removeStyle(nativeEl, 'background-color');
    expect(div.styles['backgroundColor']).toBe('');
  });

  it('should not set classes when falsy value is passed while a sanitizer is present', () => {
    @Component({
      // Note that we use `background` here because it needs to be sanitized.
      template: `
        <span class="container" [ngClass]="{disabled: isDisabled}"></span>
        <div [style.background]="background"></div>
      `,
    })
    class AppComponent {
      isDisabled = false;
      background = 'orange';
    }

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('span');
    expect(span.classList).not.toContain('disabled');

    // The issue we're testing for happens after the second change detection.
    fixture.detectChanges();
    expect(span.classList).not.toContain('disabled');
  });

  it('should not set classes when falsy value is passed while a sanitizer from host bindings is present', () => {
    @Directive({
      selector: '[blockStyles]',
    })
    class StylesDirective {
      @HostBinding('style.border') border = '1px solid red';

      @HostBinding('style.background') background = 'white';
    }

    @Component({
      template: `<div class="container" [ngClass]="{disabled: isDisabled}" blockStyles></div>`,
      imports: [StylesDirective],
    })
    class AppComponent {
      isDisabled = false;
    }

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const div = fixture.nativeElement.querySelector('div');
    expect(div.classList.contains('disabled')).toBe(false);
  });

  it('should properly merge class interpolation with class-based directives', () => {
    @Component({
      template: `<div class="zero {{ one }}" [class.two]="true" [ngClass]="'three'"></div>`,
      imports: [NgClass],
    })
    class MyComp {
      one = 'one';
    }

    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();

    expect(fixture.debugElement.nativeElement.innerHTML).toContain('zero');
    expect(fixture.debugElement.nativeElement.innerHTML).toContain('one');
    expect(fixture.debugElement.nativeElement.innerHTML).toContain('two');
    expect(fixture.debugElement.nativeElement.innerHTML).toContain('three');
  });

  it('should allow static and bound `class` attribute, but use last occurrence', () => {
    @Component({
      template: `
        <div id="first" class="zero {{ one }}" [class]="'two'"></div>
        <div id="second" [class]="'two'" class="zero {{ one }}"></div>
      `,
    })
    class MyComp {
      one = 'one';
    }

    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();

    const first = fixture.nativeElement.querySelector('#first').outerHTML;
    expect(first).not.toContain('zero');
    expect(first).not.toContain('one');
    expect(first).toContain('two');

    const second = fixture.nativeElement.querySelector('#second').outerHTML;
    expect(second).toContain('zero');
    expect(second).toContain('one');
    expect(second).not.toContain('two');
  });

  it('should allow static and bound `style` attribute, but use last occurrence', () => {
    @Component({
      template: `
        <div id="first" style="margin: {{ margin }}" [style]="'padding: 20px;'"></div>
        <div id="second" [style]="'padding: 20px;'" style="margin: {{ margin }}"></div>
      `,
    })
    class MyComp {
      margin = '10px';
    }
    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();

    const first = fixture.nativeElement.querySelector('#first').outerHTML;
    expect(first).not.toContain('margin');
    expect(first).toContain('padding');

    const second = fixture.nativeElement.querySelector('#second').outerHTML;
    expect(second).toContain('margin');
    expect(second).not.toContain('padding');
  });

  it('should allow to reset style property value defined using [style.prop.px] binding', async () => {
    @Component({
      template: '<div [style.left.px]="left()"></div>',
    })
    class MyComp {
      left = signal<string | null | undefined>('');
    }
    const fixture = TestBed.createComponent(MyComp);
    await fixture.whenStable();

    const checks: [string | null | undefined, string][] = [
      ['15', '15px'],
      [undefined, ''],
      [null, ''],
      ['', ''],
      ['0', '0px'],
    ];
    const div = fixture.nativeElement.querySelector('div');
    for (const check of checks) {
      const [fieldValue, expectedValue] = check;
      fixture.componentInstance.left.set(fieldValue);
      await fixture.whenStable();
      expect(div.style.left).toBe(expectedValue);
    }
  });

  it('should retain classes added externally', async () => {
    @Component({
      template: `<div [class]="exp()"></div>`,
    })
    class MyComp {
      exp = signal('');
    }

    const fixture = TestBed.createComponent(MyComp);
    await fixture.whenStable();

    const div = fixture.nativeElement.querySelector('div')!;
    div.className += ' abc';
    expect(splitSortJoin(div.className)).toEqual('abc');

    fixture.componentInstance.exp.set('1 2 3');
    await fixture.whenStable();

    expect(splitSortJoin(div.className)).toEqual('1 2 3 abc');

    fixture.componentInstance.exp.set('4 5 6 7');
    await fixture.whenStable();

    expect(splitSortJoin(div.className)).toEqual('4 5 6 7 abc');

    function splitSortJoin(s: string) {
      return s.split(/\s+/).sort().join(' ').trim();
    }
  });

  describe('ExpressionChangedAfterItHasBeenCheckedError', () => {
    it('should not throw when bound to SafeValue', () => {
      @Component({
        template: `<div [style.background-image]="iconSafe"></div>`,
      })
      class MyComp {
        icon = 'https://i.imgur.com/4AiXzf8.jpg';
        get iconSafe() {
          return this.sanitizer.bypassSecurityTrustStyle(`url("${this.icon}")`);
        }

        constructor(private sanitizer: DomSanitizer) {}
      }

      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges(true /* Verify that check no changes does not cause an exception */);
      const div: HTMLElement = fixture.nativeElement.querySelector('div');
      expect(div.style.getPropertyValue('background-image')).toEqual(
        'url("https://i.imgur.com/4AiXzf8.jpg")',
      );
    });
  });

  isBrowser &&
    it('should process <style> tag contents extracted from template', () => {
      @Component({
        template: `
          <style>
            div {
              width: 10px;
            }
          </style>
          <div></div>
        `,
        styles: ['div { width: 100px; }'],
      })
      class MyComp {}

      const fixture = TestBed.createComponent(MyComp);
      fixture.detectChanges();

      // `styles` array values are applied first, styles from <style> tags second.
      const div = fixture.nativeElement.querySelector('div');
      expect(getComputedStyle(div).width).toBe('10px');
    });

  it('should allow multiple styling bindings to work alongside property/attribute bindings', () => {
    @Directive({
      selector: '[dir-that-sets-styles]',
    })
    class DirThatSetsStyling {
      @HostBinding('style.width') public w = '100px';
      @HostBinding('style.height') public h = '200px';
    }

    @Component({
      template: ` <div
        dir-that-sets-styles
        [style]="{'font-size': '300px'}"
        [attr.title]="'my-title'"
        [attr.data-foo]="'my-foo'"
      ></div>`,

      imports: [DirThatSetsStyling],
    })
    class MyComp {}

    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('div')!;
    expect(div.style.getPropertyValue('width')).toEqual('100px');
    expect(div.style.getPropertyValue('height')).toEqual('200px');
    expect(div.style.getPropertyValue('font-size')).toEqual('300px');
    expect(div.getAttribute('title')).toEqual('my-title');
    expect(div.getAttribute('data-foo')).toEqual('my-foo');
  });

  it('should allow host styling on the root element with external styling', async () => {
    @Component({
      template: '...',
      host: {
        '[class]': 'classes()',
      },
    })
    class MyComp {
      public classes = signal('');
    }

    const fixture = TestBed.createComponent(MyComp);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.className).toEqual('');

    fixture.componentInstance.classes.set('1 2 3');
    await fixture.whenStable();
    expect(root.className.split(/\s+/).sort().join(' ')).toEqual('1 2 3');

    root.classList.add('0');
    expect(root.className.split(/\s+/).sort().join(' ')).toEqual('0 1 2 3');

    fixture.componentInstance.classes.set('1 2 3 4');
    await fixture.whenStable();
    expect(root.className.split(/\s+/).sort().join(' ')).toEqual('0 1 2 3 4');
  });

  it('should apply camelCased class names', () => {
    @Component({
      template: `<div [class]="'fooBar'" [class.barFoo]="true"></div>`,
    })
    class MyComp {}

    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();

    const classList = (fixture.nativeElement.querySelector('div') as HTMLDivElement).classList;
    expect(classList.contains('fooBar')).toBeTruthy();
    expect(classList.contains('barFoo')).toBeTruthy();
  });

  it('should convert camelCased style property names to snake-case', async () => {
    @Component({
      template: `<div [style]="myStyles()"></div>`,
    })
    class MyComp {
      myStyles = signal<Record<string, string>>({});
    }

    const fixture = TestBed.createComponent(MyComp);
    await fixture.whenStable();

    const div = fixture.nativeElement.querySelector('div') as HTMLDivElement;
    fixture.componentInstance.myStyles.set({fontSize: '200px'});
    await fixture.whenStable();

    expect(div.style.getPropertyValue('font-size')).toEqual('200px');
  });

  it('should recover from an error thrown in styling bindings', () => {
    const raiseWidthError = signal(false);

    @Component({
      template: `<div [style.width]="myWidth()" [style.height]="'200px'"></div>`,
    })
    class MyComp {
      myWidth = computed(() => {
        if (raiseWidthError()) {
          throw new Error('...');
        }
        return '100px';
      });
    }

    const fixture = TestBed.createComponent(MyComp);

    raiseWidthError.set(true);
    expect(() => fixture.detectChanges()).toThrow();

    raiseWidthError.set(false);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('div') as HTMLDivElement;
    expect(div.style.getPropertyValue('width')).toEqual('100px');
    expect(div.style.getPropertyValue('height')).toEqual('200px');
  });

  it('should prioritize host bindings for templates first, then directives and finally components', async () => {
    @Component({
      selector: 'my-comp-with-styling',
      template: '',
      host: {
        '[style]': 'myStyles()',
        '[style.height]': 'myHeight()',
      },
    })
    class MyCompWithStyling {
      myStyles = signal<any>({width: '300px'});

      myHeight = signal<any>('305px');
    }

    @Directive({
      selector: '[my-dir-with-styling]',
      host: {
        '[style]': 'myStyles()',
        '[style.height]': 'myHeight()',
      },
    })
    class MyDirWithStyling {
      myStyles = signal<any>({width: '200px'});

      myHeight = signal<any>('205px');
    }

    @Component({
      template: `
        <my-comp-with-styling
          style="height:1px; width:2px"
          my-dir-with-styling
          [style.height]="myHeight()"
          [style]="myStyles()"
        >
        </my-comp-with-styling>
      `,
      imports: [MyCompWithStyling, MyDirWithStyling],
    })
    class MyComp {
      myStyles = signal<{width?: string}>({width: '100px'});
      myHeight = signal<string | null | undefined>('100px');

      @ViewChild(MyDirWithStyling) dir!: MyDirWithStyling;
      @ViewChild(MyCompWithStyling) comp!: MyCompWithStyling;
    }

    const fixture = TestBed.createComponent(MyComp);
    const comp = fixture.componentInstance;
    const elm = fixture.nativeElement.querySelector('my-comp-with-styling')!;

    await fixture.whenStable();
    expect(elm.style.width).toEqual('100px');
    expect(elm.style.height).toEqual('100px');

    comp.myStyles.set({});
    comp.myHeight.set(undefined);
    await fixture.whenStable();
    expect(elm.style.width).toEqual('2px');
    expect(elm.style.height).toEqual('1px');

    comp.comp.myStyles.set({});
    comp.comp.myHeight.set(undefined);
    await fixture.whenStable();
    expect(elm.style.width).toEqual('2px');
    expect(elm.style.height).toEqual('1px');

    comp.dir.myStyles.set({});
    comp.dir.myHeight.set(undefined);
    await fixture.whenStable();
    expect(elm.style.width).toEqual('2px');
    expect(elm.style.height).toEqual('1px');
  });

  it('should prioritize directive static bindings over components', () => {
    @Component({
      selector: 'my-comp-with-styling',
      host: {style: 'color: blue'},
      template: '',
    })
    class MyCompWithStyling {}

    @Directive({
      selector: '[my-dir-with-styling]',
      host: {style: 'color: red'},
    })
    class MyDirWithStyling {}

    @Component({
      template: `<my-comp-with-styling my-dir-with-styling></my-comp-with-styling>`,
      imports: [MyCompWithStyling, MyDirWithStyling],
    })
    class MyComp {}

    const fixture = TestBed.createComponent(MyComp);
    const elm = fixture.nativeElement.querySelector('my-comp-with-styling')!;

    fixture.detectChanges();
    expect(elm.style.color).toEqual('red');
  });

  it('should combine host class.foo bindings from multiple directives', async () => {
    @Directive({
      selector: '[dir-that-sets-one-two]',
      exportAs: 'one',
      host: {
        '[class.one]': 'one()',
        '[class.two]': 'two()',
      },
    })
    class DirThatSetsOneTwo {
      one = signal(false);
      two = signal(false);
    }

    @Directive({
      selector: '[dir-that-sets-three-four]',
      exportAs: 'two',
      host: {
        '[class.three]': 'three()',
        '[class.four]': 'four()',
      },
    })
    class DirThatSetsThreeFour {
      three = signal(false);
      four = signal(false);
    }

    @Component({
      template: `
        <div #div1 dir-that-sets-one-two dir-that-sets-three-four></div>
        <div #div2 [class.zero]="zero()" dir-that-sets-one-two dir-that-sets-three-four></div>
      `,
      imports: [DirThatSetsThreeFour, DirThatSetsOneTwo],
    })
    class MyComp {
      @ViewChild('div1', {static: true, read: DirThatSetsOneTwo})
      public dirOneA: DirThatSetsOneTwo | null = null;

      @ViewChild('div1', {static: true, read: DirThatSetsThreeFour})
      public dirTwoA: DirThatSetsThreeFour | null = null;

      @ViewChild('div2', {static: true, read: DirThatSetsOneTwo})
      public dirOneB: DirThatSetsOneTwo | null = null;

      @ViewChild('div2', {static: true, read: DirThatSetsThreeFour})
      public dirTwoB: DirThatSetsThreeFour | null = null;

      zero = signal(false);
    }

    const fixture = TestBed.createComponent(MyComp);
    await fixture.whenStable();

    const divs = fixture.nativeElement.querySelectorAll('div') as HTMLDivElement[];

    // TODO: Use destructuring once Domino supports native ES2015, or when jsdom is used.
    const div1 = divs[0];
    const div2 = divs[1];

    expect(div1.className).toBe('');
    expect(div2.className).toBe('');

    const comp = fixture.componentInstance;
    comp.dirOneA!.one.set(true);
    comp.dirOneB!.one.set(true);
    comp.dirOneA!.two.set(true);
    comp.dirOneB!.two.set(true);
    await fixture.whenStable();

    expect(div1.classList.contains('one')).toBeTruthy();
    expect(div1.classList.contains('two')).toBeTruthy();
    expect(div1.classList.contains('three')).toBeFalsy();
    expect(div1.classList.contains('four')).toBeFalsy();
    expect(div2.classList.contains('one')).toBeTruthy();
    expect(div2.classList.contains('two')).toBeTruthy();
    expect(div2.classList.contains('three')).toBeFalsy();
    expect(div2.classList.contains('four')).toBeFalsy();
    expect(div2.classList.contains('zero')).toBeFalsy();

    comp.dirTwoA!.three.set(true);
    comp.dirTwoB!.three.set(true);
    comp.dirTwoA!.four.set(true);
    comp.dirTwoB!.four.set(true);
    await fixture.whenStable();

    expect(div1.classList.contains('one')).toBeTruthy();
    expect(div1.classList.contains('two')).toBeTruthy();
    expect(div1.classList.contains('three')).toBeTruthy();
    expect(div1.classList.contains('four')).toBeTruthy();
    expect(div2.classList.contains('one')).toBeTruthy();
    expect(div2.classList.contains('two')).toBeTruthy();
    expect(div2.classList.contains('three')).toBeTruthy();
    expect(div2.classList.contains('four')).toBeTruthy();
    expect(div2.classList.contains('zero')).toBeFalsy();

    comp.zero.set(true);
    await fixture.whenStable();

    expect(div1.classList.contains('one')).toBeTruthy();
    expect(div1.classList.contains('two')).toBeTruthy();
    expect(div1.classList.contains('three')).toBeTruthy();
    expect(div1.classList.contains('four')).toBeTruthy();
    expect(div2.classList.contains('one')).toBeTruthy();
    expect(div2.classList.contains('two')).toBeTruthy();
    expect(div2.classList.contains('three')).toBeTruthy();
    expect(div2.classList.contains('four')).toBeTruthy();
    expect(div2.classList.contains('zero')).toBeTruthy();
  });

  it('should combine static host classes with component "class" host attribute', () => {
    @Component({
      selector: 'comp-with-classes',
      template: '',
      host: {'class': 'host'},
    })
    class CompWithClasses {
      constructor(ref: ElementRef) {
        ref.nativeElement.classList.add('custom');
      }
    }

    @Component({
      template: `<comp-with-classes class="inline" *ngFor="let item of items"></comp-with-classes>`,
      imports: [CompWithClasses, NgFor],
    })
    class MyComp {
      items = [1, 2, 3];
    }

    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();

    const [one, two, three] = fixture.nativeElement.querySelectorAll(
      'comp-with-classes',
    ) as HTMLDivElement[];

    expect(one.classList.contains('custom')).toBeTruthy();
    expect(one.classList.contains('inline')).toBeTruthy();
    expect(one.classList.contains('host')).toBeTruthy();

    expect(two.classList.contains('custom')).toBeTruthy();
    expect(two.classList.contains('inline')).toBeTruthy();
    expect(two.classList.contains('host')).toBeTruthy();

    expect(three.classList.contains('custom')).toBeTruthy();
    expect(three.classList.contains('inline')).toBeTruthy();
    expect(three.classList.contains('host')).toBeTruthy();
  });

  it('should allow a single style host binding on an element', () => {
    @Directive({
      selector: '[single-host-style-dir]',
    })
    class SingleHostStyleDir {
      @HostBinding('style.width') width = '100px';
    }

    @Component({
      template: `<div single-host-style-dir></div>`,
      imports: [SingleHostStyleDir],
    })
    class Cmp {}

    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('div');
    expect(element.style.width).toEqual('100px');
  });

  it('should override class bindings when a directive extends another directive', () => {
    @Component({
      selector: 'parent-comp',
      host: {'class': 'parent-comp', '[class.parent-comp-active]': 'true'},
      template: '...',
    })
    class ParentComp {}

    @Component({
      selector: 'child-comp',
      host: {
        'class': 'child-comp',
        '[class.child-comp-active]': 'true',
        '[class.parent-comp]': 'false',
        '[class.parent-comp-active]': 'false',
      },
      template: '...',
    })
    class ChildComp extends ParentComp {}

    @Component({
      template: `<child-comp class="template"></child-comp>`,
      imports: [ChildComp],
    })
    class Cmp {}

    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('child-comp');
    expect(element.classList.contains('template')).toBeTruthy();

    expect(element.classList.contains('child-comp')).toBeTruthy();
    expect(element.classList.contains('child-comp-active')).toBeTruthy();

    expect(element.classList.contains('parent-comp')).toBeFalsy();
    expect(element.classList.contains('parent-comp-active')).toBeFalsy();
  });

  it('should not set inputs called class if they are not being used in the template', () => {
    const logs: string[] = [];

    @Directive({
      selector: '[test]',
    })
    class MyDir {
      @Input('class')
      set className(value: string) {
        logs.push(value);
      }
    }

    @Component({
      // Note that we shouldn't have a `class` attribute here.
      template: `<div test></div>`,
    })
    class MyComp {}

    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();

    expect(logs).toEqual([]);
  });

  it('should support `styles` as a string', () => {
    if (!isBrowser) {
      return;
    }

    @Component({
      template: `<span>Hello</span>`,
      styles: `
        span {
          font-size: 10px;
        }
      `,
    })
    class Cmp {}
    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('span') as HTMLElement;
    expect(getComputedStyle(span).getPropertyValue('font-size')).toBe('10px');
  });

  it('should class bindings to classes with special characters in a template', async () => {
    const className = `data-active:text-green-300/80`;

    @Component({
      template: `<div [class.${className}]="value()"></div>`,
    })
    class Cmp {
      value = signal(false);
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();

    const div = fixture.nativeElement.querySelector('div');
    expect(div.classList).not.toContain(className);

    fixture.componentInstance.value.set(true);
    await fixture.whenStable();
    expect(div.classList).toContain(className);

    fixture.componentInstance.value.set(false);
    await fixture.whenStable();
    expect(div.classList).not.toContain(className);
  });

  it('should support class bindings to classes with special characters in a host binding', async () => {
    const className = `data-active:text-green-300/80`;

    @Component({
      template: ``,
      host: {
        [`[class.${className}]`]: 'value()',
      },
    })
    class Cmp {
      value = signal(false);
    }

    const fixture = TestBed.createComponent(Cmp);
    await fixture.whenStable();

    expect(fixture.nativeElement.classList).not.toContain(className);

    fixture.componentInstance.value.set(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.classList).toContain(className);

    fixture.componentInstance.value.set(false);
    await fixture.whenStable();
    expect(fixture.nativeElement.classList).not.toContain(className);
  });

  it('should support Set in a class binding', () => {
    @Component({
      template: '<div [class]="classes" [class.extra]="true"></div>',
    })
    class Cmp {
      classes = new Set(['a', 'b', 'c']);
    }

    const fixture = TestBed.createComponent(Cmp);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('div');
    expect(div.getAttribute('class')).toBe('a b c extra');
  });

  describe('regression', () => {
    it('should support sanitizer value in the [style] bindings', () => {
      @Component({
        template: `<div [style]="style"></div>`,
      })
      class HostBindingTestComponent {
        style: SafeStyle;
        constructor(private sanitizer: DomSanitizer) {
          this.style = this.sanitizer.bypassSecurityTrustStyle('color: white; display: block;');
        }
      }
      const fixture = TestBed.createComponent(HostBindingTestComponent);
      fixture.detectChanges();
      const div: HTMLElement = fixture.nativeElement.querySelector('div');
      expectStyle(div).toEqual({color: 'white', display: 'block'});
    });

    it('should allow lookahead binding on second pass #35118', () => {
      @Component({
        selector: 'my-cmp',
        template: ``,
        host: {
          '[class.foo]': 'hostClass',
        },
      })
      class MyCmp {
        hostClass = true;
      }

      @Directive({
        selector: '[host-styling]',
        host: {
          '[class]': 'hostClass',
        },
      })
      class HostStylingsDir {
        hostClass = {'bar': true};
      }

      @Component({
        template: `<my-cmp *ngFor="let i of [1, 2]" host-styling></my-cmp>`,
        imports: [MyCmp, HostStylingsDir, NgFor],
      })
      class MyApp {
        // When the first view in the list gets CD-ed, everything works.
        // When the second view gets CD-ed, the styling has already created the data structures
        // in the `TView`. As a result when `[class.foo]` runs it already knows that `[class]`
        // is a duplicate and hence it can overwrite the `[class.foo]` binding. While the
        // styling resolution is happening the algorithm  reads the value of the `[class]`
        // (because it overwrites `[class.foo]`), however  `[class]` has not yet executed and
        // therefore it does not have normalized value in its `LView`. The result is that the
        // assertions fails as it expects an `KeyValueArray`.
      }

      const fixture = TestBed.createComponent(MyApp);
      expect(() => fixture.detectChanges()).not.toThrow();
      const [cmp1, cmp2] = fixture.nativeElement.querySelectorAll('my-cmp');
      expectClass(cmp1).toEqual({foo: true, bar: true});
      expectClass(cmp2).toEqual({foo: true, bar: true});
    });

    it('should not bind [class] to @Input("className")', () => {
      @Component({
        selector: 'my-cmp',
        template: `className = {{ className }}`,
      })
      class MyCmp {
        @Input() className: string = 'unbound';
      }

      @Component({
        template: `<my-cmp [class]="'bound'"></my-cmp>`,
        imports: [MyCmp],
      })
      class MyApp {}
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toEqual('className = unbound');
    });

    it('should not bind class to @Input("className")', () => {
      @Component({
        selector: 'my-cmp',
        template: `className = {{ className }}`,
      })
      class MyCmp {
        @Input() className: string = 'unbound';
      }

      @Component({
        template: `<my-cmp class="bound"></my-cmp>`,
        imports: [MyCmp],
      })
      class MyApp {}
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toEqual('className = unbound');
    });
  });
});

function assertStyle(element: HTMLElement, prop: string, value: any) {
  expect((element.style as any)[prop]).toEqual(value);
}

function expectStyle(element: HTMLElement) {
  return expect(getElementStyles(element));
}

function expectClass(element: HTMLElement) {
  return expect(getElementClasses(element));
}
