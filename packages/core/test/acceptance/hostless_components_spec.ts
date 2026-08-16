/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgIf} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  DestroyRef,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  inject,
  Injectable,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
  Self,
  signal,
  SimpleChanges,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from '@angular/core';
import {DeferBlockBehavior, TestBed} from '@angular/core/testing';
import {isBrowser} from '@angular/private/testing';
import {provideRouter, Router, RouterOutlet} from '@angular/router';

describe('hostless components', () => {
  it('should not render a host element', async () => {
    @Component({
      selector: 'my-hostless',
      hostless: true,
      template: `
        <div class="child-1">Child 1</div>
        <div class="child-2">Child 2</div>
      `,
    })
    class HostlessCmp {}

    @Component({
      template: `
        <div class="before">Before</div>
        <my-hostless />
        <div class="after">After</div>
      `,
      imports: [HostlessCmp],
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const html = fixture.nativeElement.innerHTML;
    expect(html).toContain('<div class="before">Before</div>');
    expect(html).not.toContain('<my-hostless>');
    expect(html).not.toContain('_nghost');
  });

  it('should handle self-closing hostless components', async () => {
    @Component({
      selector: 'my-hostless',
      hostless: true,
      template: `
        <div class="child-1">Child 1</div>
        <div class="child-2">Child 2</div>
      `,
    })
    class HostlessCmp {}

    @Component({
      template: `
        <div class="before">Before</div>
        <my-hostless />
        <div class="after">After</div>
      `,
      imports: [HostlessCmp],
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const html = fixture.nativeElement.innerHTML;
    expect(html).toContain('<div class="before">Before</div>');
    expect(html).toContain('<div class="child-1">Child 1</div>');
    expect(html).toContain('<div class="child-2">Child 2</div>');
    expect(html).toContain('<div class="after">After</div>');
    expect(html).not.toContain('<my-hostless');
  });

  isBrowser &&
    it('should ensure encapsulated styles are applied to hostless child elements and not to siblings', async () => {
      @Component({
        selector: 'my-hostless',
        hostless: true,
        template: `
          <div class="child-1">Child 1</div>
          <div class="child-2">Child 2</div>
        `,
        styles: `
          div {
            color: red;
          }
        `,
      })
      class HostlessCmp {}

      @Component({
        template: `<div>Before</div>
          <my-hostless />
          <div>After</div>`,
        imports: [HostlessCmp],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const html = fixture.nativeElement as HTMLElement;

      const divs = Array.from(html.querySelectorAll('div'));
      expect(getComputedStyle(divs[0]).color).toBe('rgb(0, 0, 0)');
      expect(getComputedStyle(divs[1]).color).toBe('rgb(255, 0, 0)');
      expect(getComputedStyle(divs[2]).color).toBe('rgb(255, 0, 0)');
      expect(getComputedStyle(divs[3]).color).toBe('rgb(0, 0, 0)');
    });

  isBrowser &&
    it('should not inherit styles from parent component', async () => {
      @Component({
        selector: 'my-hostless',
        hostless: true,
        template: ` <div class="child-1">Child 1</div> `,
      })
      class HostlessCmp {}

      @Component({
        template: `<div>Before</div>
          <my-hostless />
          <div>After</div>`,
        styles: `
          div {
            color: blue;
          }
        `,
        imports: [HostlessCmp],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const html = fixture.nativeElement as HTMLElement;

      const divs = Array.from(html.querySelectorAll('div'));
      expect(getComputedStyle(divs[0]).color).toBe('rgb(0, 0, 255)');
      expect(getComputedStyle(divs[1]).color).toBe('rgb(0, 0, 0)');
      expect(getComputedStyle(divs[2]).color).toBe('rgb(0, 0, 255)');
    });

  it('should project content correctly inside a hostless component', async () => {
    @Component({
      selector: 'my-hostless-proj',
      hostless: true,
      template: `
        <div class="wrapper">
          <ng-content></ng-content>
        </div>
      `,
    })
    class HostlessCmp {}

    @Component({
      template: `
        <my-hostless-proj>
          <span class="projected">Projected Content</span>
        </my-hostless-proj>
      `,
      imports: [HostlessCmp],
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const html = fixture.nativeElement.innerHTML;
    expect(html).toContain('<span class="projected">Projected Content</span>');
  });

  describe('View Queries', () => {
    it('should query hostless component instance and ElementRef successfully', async () => {
      @Component({
        selector: 'my-hostless',
        template: '<div>Hostless Content</div>',
        hostless: true,
      })
      class MyHostless {}

      @Component({
        template: '<my-hostless #ref1 /><my-hostless #ref2 />',
        imports: [MyHostless],
      })
      class App {
        @ViewChild('ref1') hostlessChild!: MyHostless;
        @ViewChildren(MyHostless) hostlessChildren!: QueryList<MyHostless>;
        @ViewChild('ref2', {read: ElementRef}) hostlessEl!: ElementRef;
      }

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const app = fixture.componentInstance;

      expect(app.hostlessChild).toBeInstanceOf(MyHostless);
      expect(app.hostlessChildren.length).toBe(2);
      expect(app.hostlessChildren.first).toBeInstanceOf(MyHostless);

      // Querying for ElementRef should return the Comment node that replaces the host
      expect(app.hostlessEl.nativeElement instanceof Comment).toBeTrue();
      expect(app.hostlessEl.nativeElement.textContent).toBe('hostless my-hostless');
    });
  });

  describe('Dependency Injection', () => {
    it('should inject ElementRef pointing to the comment node', async () => {
      @Component({
        selector: 'my-hostless-di',
        template: '<div>DI Test</div>',
        hostless: true,
      })
      class MyHostlessDi {
        constructor(public elementRef: ElementRef) {}
      }

      @Component({
        template: '<my-hostless-di />',
        imports: [MyHostlessDi],
      })
      class App {
        @ViewChild(MyHostlessDi) hostless!: MyHostlessDi;
      }

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const app = fixture.componentInstance;
      const injectedRef = app.hostless.elementRef;

      expect(injectedRef).toBeDefined();
      expect(injectedRef.nativeElement instanceof Comment).toBeTrue();
      expect(injectedRef.nativeElement.textContent).toBe('hostless my-hostless-di');
    });
  });

  describe('Directives on Hostless Components', () => {
    it('should attach directive to the hostless component and inject ElementRef correctly', async () => {
      @Directive({
        selector: '[my-dir]',
      })
      class MyDirective {
        constructor(public elementRef: ElementRef) {}
      }

      @Component({
        selector: 'my-hostless-dir',
        template: '<div>Dir Test</div>',
        hostless: true,
      })
      class MyHostlessDir {}

      @Component({
        template: '<my-hostless-dir my-dir />',
        imports: [MyHostlessDir, MyDirective],
      })
      class App {
        @ViewChild(MyDirective) myDir!: MyDirective;
      }

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const app = fixture.componentInstance;

      // The directive should be instantiated
      expect(app.myDir).toBeInstanceOf(MyDirective);

      // ElementRef inside the directive should point to the Comment node
      expect(app.myDir.elementRef.nativeElement instanceof Comment).toBeTrue();
      expect(app.myDir.elementRef.nativeElement.textContent).toBe('hostless my-hostless-dir');

      // We no longer have a @HostBinding here because it would throw an error
      const html = fixture.nativeElement.innerHTML;
    });

    it('should attach hostDirectives to the hostless component and inject ElementRef correctly', async () => {
      @Directive({
        standalone: true,
      })
      class MyHostDirective {
        constructor(public elementRef: ElementRef) {}
      }

      @Component({
        selector: 'my-hostless-host-dir',
        template: '<div>Host Dir Test</div>',
        hostless: true,
        hostDirectives: [MyHostDirective],
      })
      class MyHostlessHostDir {}

      @Component({
        template: '<my-hostless-host-dir />',
        imports: [MyHostlessHostDir],
      })
      class App {
        @ViewChild(MyHostDirective) myHostDir!: MyHostDirective;
      }

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const app = fixture.componentInstance;

      // The host directive should be instantiated
      expect(app.myHostDir).toBeInstanceOf(MyHostDirective);

      // ElementRef inside the host directive should point to the Comment node
      expect(app.myHostDir.elementRef.nativeElement instanceof Comment).toBeTrue();
      expect(app.myHostDir.elementRef.nativeElement.textContent).toBe(
        'hostless my-hostless-host-dir',
      );
    });
  });

  describe('Change Detection', () => {
    it('should run change detection normally including OnPush and Signals', async () => {
      @Component({
        selector: 'my-onpush',
        template: '<div>OnPush: {{value}}</div>',
        hostless: true,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class MyOnPush {
        @Input() value = 'initial';

        constructor(public cdr: ChangeDetectorRef) {}

        updateValue(newVal: string) {
          this.value = newVal;
          this.cdr.markForCheck();
        }
      }

      @Component({
        selector: 'my-signal',
        template: '<div>Signal: {{sig()}}</div>',
        hostless: true,
      })
      class MySignal {
        sig = signal('initial');
      }

      @Component({
        template: '<my-onpush [value]="appValue()" /><my-signal />',
        imports: [MyOnPush, MySignal],
      })
      class App {
        appValue = signal('app-initial');
        @ViewChild(MyOnPush) myOnPush!: MyOnPush;
        @ViewChild(MySignal) mySignal!: MySignal;
      }

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      expect(fixture.nativeElement.textContent).toContain('OnPush: app-initial');
      expect(fixture.nativeElement.textContent).toContain('Signal: initial');

      const app = fixture.componentInstance;

      // Update app value and re-render
      app.appValue.set('app-updated');
      await fixture.whenStable();
      expect(fixture.nativeElement.textContent).toContain('OnPush: app-updated');

      // Update OnPush component internally and markForCheck
      app.myOnPush.updateValue('internal-updated');
      await fixture.whenStable();
      expect(fixture.nativeElement.textContent).toContain('OnPush: internal-updated');

      // Update Signal
      app.mySignal.sig.set('signal-updated');
      await fixture.whenStable();
      expect(fixture.nativeElement.textContent).toContain('Signal: signal-updated');
    });
  });

  it('should throw a compiler error when host bindings are present on a hostless component', () => {
    @Component({
      selector: 'my-hostless-binding',
      template: '<div>Hostless Content</div>',
      hostless: true,
    })
    class MyHostlessBinding {
      @HostBinding('class.active') isActive = true;
      @HostBinding('attr.role') role = 'presentation';
    }

    @Component({
      template: '<my-hostless-binding />',
      imports: [MyHostlessBinding],
    })
    class App {}

    expect(() => TestBed.createComponent(App)).toThrowError(
      'Hostless components cannot have host bindings.',
    );
  });

  it('should throw a compiler error when host listeners are present on a hostless component', () => {
    @Component({
      selector: 'my-hostless-listener',
      template: '<div>Hostless Content</div>',
      hostless: true,
    })
    class MyHostlessListener {
      @HostListener('click')
      onClick() {}
    }

    @Component({
      template: '<my-hostless-listener />',
      imports: [MyHostlessListener],
    })
    class App {}

    expect(() => TestBed.createComponent(App)).toThrowError(
      'Hostless components cannot have host bindings.',
    );
  });

  it('should project content with select correctly on hostless component', async () => {
    @Component({
      selector: 'my-hostless-proj',
      template: `
        <div class="a"><ng-content select="[a]"></ng-content></div>
        <div class="b"><ng-content></ng-content></div>
      `,
      hostless: true,
    })
    class MyHostlessProj {}

    @Component({
      template: `
        <my-hostless-proj>
          <span a>A</span>
          <span>B</span>
        </my-hostless-proj>
      `,
      imports: [MyHostlessProj],
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const html = fixture.nativeElement.innerHTML;
    expect(html).toContain('<div class="a"><span a="">A</span></div>');
    expect(html).toContain('<div class="b"><span>B</span></div>');
  });

  it('should allow to listen to output', () => {
    @Component({
      selector: 'my-hostless',
      template: '<div>Hostless Content</div>',
      hostless: true,
    })
    class MyHostless {
      @Output() testOutput = new EventEmitter<void>();
    }

    @Component({
      template: '<my-hostless (testOutput)="onTestOutput()" />',
      imports: [MyHostless],
    })
    class App {
      @ViewChild(MyHostless) hostless!: MyHostless;
      onTestOutput() {}
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const app = fixture.componentInstance;
    spyOn(app, 'onTestOutput');
    app.hostless.testOutput.emit();

    expect(app.onTestOutput).toHaveBeenCalled();
  });

  it('should create a virtual host for tests', () => {
    @Component({
      hostless: true,
      template: '<header>hello world</header><footer>hello world</footer>',
    })
    class MyHostless {}

    const fixture = TestBed.createComponent(MyHostless);
    expect(fixture.debugElement).toBeTruthy();
    expect(fixture.nativeElement).toBeTruthy();
    // The virtual host
    expect(fixture.nativeElement.tagName).toBe('DIV');
    expect(fixture.nativeElement.id).toMatch(/^root\d+/);
    // The actual content of our hostless component
    expect(fixture.nativeElement.innerHTML).toContain(
      '<header>hello world</header><footer>hello world</footer>',
    );
  });

  it('should work fine with structural directives', async () => {
    @Component({
      template: '<div *ngIf="true"><my-hostless /></div>',
      imports: [MyHostless, NgIf],
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div><div>Hostless Content</div><!--hostless my-hostless--></div><!--container-->',
    );
  });

  it('should correctly insert hostless components dynamically created via ViewContainerRef', async () => {
    let compRef!: ComponentRef<MyHostless>;
    @Component({
      template: '<div><ng-container #container></ng-container></div>',
    })
    class App {
      @ViewChild('container', {read: ViewContainerRef}) vcr!: ViewContainerRef;
      ngAfterViewInit() {
        compRef = this.vcr.createComponent(MyHostless);
      }
    }

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div><div>Hostless Content</div><!--hostless MyHostless--><!--ng-container--></div>',
    );

    expect(compRef.location.nativeElement.nodeType).toBe(Node.COMMENT_NODE);
  });

  it('should be supported by the router outlet', async () => {
    @Component({
      selector: 'my-hostless',
      hostless: true,
      template: '<div>Hostless Content</div>',
    })
    class MyHostless {}

    @Component({
      imports: [RouterOutlet],
      template: '<router-outlet />',
    })
    class App {}

    TestBed.configureTestingModule({
      providers: [provideRouter([{path: '', component: MyHostless}])],
    });

    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toContain(
      '<div>Hostless Content</div><!--hostless MyHostless-->',
    );
  });

  it('should work smealessly with the SVG namespace', async () => {
    @Component({
      selector: 'my-hostless-svg',
      hostless: true,
      template: '<path d="M0,0 L100,0 L100,100 L0,100 Z"></path>',
    })
    class MyHostlessSvg {}

    @Component({
      template: '<svg><my-hostless-svg /></svg>',
      imports: [MyHostlessSvg],
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerHTML).toContain(
      '<svg><path d="M0,0 L100,0 L100,100 L0,100 Z"></path><!--hostless my-hostless-svg--></svg>',
    );
  });

  it('should render nested svg hostless components', async () => {
    @Component({
      selector: 'my-hostless-svg',
      hostless: true,
      template: '<path d="M0,0 L100,0 L100,100 L0,100 Z"></path>',
    })
    class MyHostlessSvg {}

    @Component({
      selector: 'my-svg-g',
      hostless: true,
      template: `<svg:g><my-hostless-svg /></svg:g>`,
      imports: [MyHostlessSvg],
    })
    class MySvgGroup {}

    @Component({
      template: '<svg><my-svg-g /><my-svg-g /></svg>',
      imports: [MySvgGroup],
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerHTML).toContain(
      `<svg>
        <g><path d="M0,0 L100,0 L100,100 L0,100 Z"></path><!--hostless my-hostless-svg--></g>
        <!--hostless my-svg-g-->
        <g><path d="M0,0 L100,0 L100,100 L0,100 Z"></path><!--hostless my-hostless-svg--></g>
        <!--hostless my-svg-g-->
      </svg>`.replaceAll(/\s{2,}/g, ''),
    );
  });

  it('should support directives on hostless component', async () => {
    @Directive({
      selector: '[testDir]',
    })
    class TestDir {
      @Input('testDir') val!: string;
    }

    @Component({
      selector: 'my-hostless-dir',
      template: '<div>Hostless Content</div>',
      hostless: true,
    })
    class MyHostlessDir {
      constructor(@Self() @Optional() public testDir: TestDir) {}
    }

    @Component({
      template: '<my-hostless-dir testDir="1" />',
      imports: [MyHostlessDir, TestDir],
    })
    class App {
      @ViewChild(MyHostlessDir) hostlessDir!: MyHostlessDir;
    }

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.componentInstance.hostlessDir.testDir).toBeTruthy();
    expect(fixture.componentInstance.hostlessDir.testDir.val).toBe('1');
  });

  isBrowser &&
    it('should apply styling when top level nodes are wrapped by @blocks', async () => {
      @Component({
        selector: 'my-hostless-blocks',
        template: '@if(true) {<div>Hostless Content</div>}',
        hostless: true,
        styles: `
          div {
            color: red;
          }
        `,
      })
      class MyHostlessBlocks {}

      @Component({
        template: '<my-hostless-blocks />',
        imports: [MyHostlessBlocks],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const div = fixture.nativeElement.querySelector('div');
      expect(getComputedStyle(div).color).toBe('rgb(255, 0, 0)');
    });

  describe('Control Flow (@for, @if, @switch)', () => {
    it('should support dynamic mutations in @for loops with hostless components', async () => {
      @Component({
        selector: 'item-hostless',
        template: '<span class="item">{{id}}: {{name}}</span>',
        hostless: true,
      })
      class ItemHostless {
        @Input() id: number = 0;
        @Input() name: string = '';
      }

      @Component({
        template: `
          <div class="list">
            @for (item of items(); track item.id) {
              <item-hostless [id]="item.id" [name]="item.name" />
            }
          </div>
        `,
        imports: [ItemHostless],
      })
      class App {
        items = signal([
          {id: 1, name: 'First'},
          {id: 2, name: 'Second'},
          {id: 3, name: 'Third'},
        ]);
      }

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const getTexts = () =>
        Array.from(fixture.nativeElement.querySelectorAll('.item')).map(
          (el: any) => el.textContent,
        );

      expect(getTexts()).toEqual(['1: First', '2: Second', '3: Third']);

      // Reverse list
      fixture.componentInstance.items.set([
        {id: 3, name: 'Third'},
        {id: 2, name: 'Second'},
        {id: 1, name: 'First'},
      ]);
      await fixture.whenStable();
      expect(getTexts()).toEqual(['3: Third', '2: Second', '1: First']);

      // Remove middle item and add new item
      fixture.componentInstance.items.set([
        {id: 3, name: 'Third'},
        {id: 4, name: 'Fourth'},
        {id: 1, name: 'First'},
      ]);
      await fixture.whenStable();
      expect(getTexts()).toEqual(['3: Third', '4: Fourth', '1: First']);
    });

    it('should support dynamic @if / @else and @switch / @case with hostless components', async () => {
      @Component({
        selector: 'hostless-a',
        template: '<div class="view-a">View A</div>',
        hostless: true,
      })
      class HostlessA {}

      @Component({
        selector: 'hostless-b',
        template: '<div class="view-b">View B</div>',
        hostless: true,
      })
      class HostlessB {}

      @Component({
        template: `
          <div class="container">
            @if (showA()) {
              <hostless-a />
            } @else {
              <hostless-b />
            }

            @switch (tab()) {
              @case ('a') {
                <hostless-a />
              }
              @case ('b') {
                <hostless-b />
              }
              @default {
                <span class="default-view">Default</span>
              }
            }
          </div>
        `,
        imports: [HostlessA, HostlessB],
      })
      class App {
        showA = signal(true);
        tab = signal('a');
      }

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.view-a')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.view-b')).toBeFalsy();

      // Toggle @if
      fixture.componentInstance.showA.set(false);
      fixture.componentInstance.tab.set('b');
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.view-a')).toBeFalsy();
      expect(fixture.nativeElement.querySelectorAll('.view-b').length).toBe(2);

      // Switch to default
      fixture.componentInstance.tab.set('other');
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.default-view')).toBeTruthy();
    });
  });

  describe('@defer blocks', () => {
    it('should correctly render hostless components inside @defer blocks', async () => {
      @Component({
        selector: 'deferred-hostless',
        template: '<div class="deferred-content">Deferred Hostless Content</div>',
        hostless: true,
      })
      class DeferredHostless {}

      @Component({
        template: `
          @defer (when isLoaded()) {
            <deferred-hostless />
          } @placeholder {
            <div class="placeholder">Loading placeholder</div>
          }
        `,
        imports: [DeferredHostless],
      })
      class App {
        isLoaded = signal(false);
      }

      const fixture = TestBed.configureTestingModule({
        deferBlockBehavior: DeferBlockBehavior.Playthrough,
      }).createComponent(App);
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.placeholder')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.deferred-content')).toBeFalsy();

      // Trigger defer block
      fixture.componentInstance.isLoaded.set(true);
      // Yes we need both...
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.deferred-content')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.placeholder')).toBeFalsy();
    });

    it('should support @defer blocks within hostless component templates', async () => {
      @Component({
        selector: 'hostless-with-defer',
        template: `
          <div class="top-hostless">Top</div>
          @defer (when showInner()) {
            <div class="inner-defer">Inner Defer</div>
          } @placeholder {
            <div class="inner-placeholder">Inner Placeholder</div>
          }
        `,
        hostless: true,
      })
      class HostlessWithDefer {
        showInner = signal(false);
      }

      @Component({
        template: '<hostless-with-defer />',
        imports: [HostlessWithDefer],
      })
      class App {
        @ViewChild(HostlessWithDefer) child!: HostlessWithDefer;
      }

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.top-hostless')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.inner-placeholder')).toBeTruthy();

      fixture.componentInstance.child.showInner.set(true);
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.inner-defer')).toBeTruthy();
    });
  });

  describe('Two-Way Data Binding', () => {
    it('should support two-way binding on hostless components', async () => {
      @Component({
        selector: 'hostless-counter',
        template: '<button class="inc-btn" (click)="increment()">Count: {{count}}</button>',
        hostless: true,
      })
      class HostlessCounter {
        @Input() count: number = 0;
        @Output() countChange = new EventEmitter<number>();

        increment() {
          this.countChange.emit(this.count + 1);
        }
      }

      @Component({
        template: `
          <hostless-counter [(count)]="parentCount" />
          <div class="parent-val">Parent: {{ parentCount() }}</div>
        `,
        imports: [HostlessCounter],
      })
      class App {
        parentCount = signal(10);
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.parentCount()).toBe(10);
      expect(fixture.nativeElement.querySelector('.inc-btn').textContent).toBe('Count: 10');
      expect(fixture.nativeElement.querySelector('.parent-val').textContent).toBe('Parent: 10');

      // Click button inside hostless component
      fixture.nativeElement.querySelector('.inc-btn').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.parentCount()).toBe(11);
      expect(fixture.nativeElement.querySelector('.inc-btn').textContent).toBe('Count: 11');
      expect(fixture.nativeElement.querySelector('.parent-val').textContent).toBe('Parent: 11');

      // Update parent value
      fixture.componentInstance.parentCount.set(42);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.inc-btn').textContent).toBe('Count: 42');
      expect(fixture.nativeElement.querySelector('.parent-val').textContent).toBe('Parent: 42');
    });
  });

  describe('ViewContainerRef dynamic lifecycle and cleanup', () => {
    it('should properly insert at index, move, and clean up DOM on destroy', async () => {
      @Component({
        selector: 'dynamic-item',
        template: '<div class="dyn-item">Item {{label}}</div>',
        hostless: true,
      })
      class DynamicItem {
        label = '';
      }

      @Component({
        template: '<div class="container"><ng-container #vcr></ng-container></div>',
      })
      class App {
        @ViewChild('vcr', {read: ViewContainerRef}) vcr!: ViewContainerRef;
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const vcr = fixture.componentInstance.vcr;

      // Create item 1
      const ref1 = vcr.createComponent(DynamicItem);
      ref1.instance.label = '1';
      ref1.changeDetectorRef.detectChanges();

      // Create item 2
      const ref2 = vcr.createComponent(DynamicItem);
      ref2.instance.label = '2';
      ref2.changeDetectorRef.detectChanges();

      let items = Array.from(fixture.nativeElement.querySelectorAll('.dyn-item')).map(
        (el: any) => el.textContent,
      );
      expect(items).toEqual(['Item 1', 'Item 2']);

      // Move ref2 to index 0
      vcr.move(ref2.hostView, 0);
      fixture.detectChanges();

      items = Array.from(fixture.nativeElement.querySelectorAll('.dyn-item')).map(
        (el: any) => el.textContent,
      );
      expect(items).toEqual(['Item 2', 'Item 1']);

      // Destroy ref1 and verify DOM cleanup
      ref1.destroy();
      fixture.detectChanges();

      items = Array.from(fixture.nativeElement.querySelectorAll('.dyn-item')).map(
        (el: any) => el.textContent,
      );
      expect(items).toEqual(['Item 2']);
      expect(fixture.nativeElement.innerHTML).not.toContain('Item 1');
    });
  });

  describe('Multi-slot and nested content projection', () => {
    it('should project multi-slot content and nested hostless projections correctly', async () => {
      @Component({
        selector: 'hostless-card',
        template: `
          <div class="card-header"><ng-content select="[card-header]" /></div>
          <div class="card-body"><ng-content /></div>
          <div class="card-footer"><ng-content select="[card-footer]" /></div>
        `,
        hostless: true,
      })
      class HostlessCard {}

      @Component({
        selector: 'hostless-badge',
        template: '<span class="badge"><ng-content /></span>',
        hostless: true,
      })
      class HostlessBadge {}

      @Component({
        template: `
          <hostless-card>
            <h3 card-header>Card Title <hostless-badge>New</hostless-badge></h3>
            <p>Body Content</p>
            <div card-footer>Footer Content</div>
          </hostless-card>
        `,
        imports: [HostlessCard, HostlessBadge],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      const html = fixture.nativeElement.innerHTML;
      expect(html).toContain(
        '<div class="card-header"><h3 card-header="">Card Title <span class="badge">New</span><!--hostless hostless-badge--></h3></div>',
      );
      expect(html).toContain('<div class="card-body"><p>Body Content</p></div>');
      expect(html).toContain(
        '<div class="card-footer"><div card-footer="">Footer Content</div></div>',
      );
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should invoke lifecycle hooks in correct order for hostless components', async () => {
      const hooks: string[] = [];

      @Component({
        selector: 'lifecycle-hostless',
        template: '<div>Lifecycle: {{val}}</div>',
        hostless: true,
      })
      class LifecycleHostless implements OnInit, OnChanges, AfterViewInit, OnDestroy {
        @Input() val = '';
        private destroyRef = inject(DestroyRef);

        constructor() {
          hooks.push('constructor');
          this.destroyRef.onDestroy(() => hooks.push('destroyRef'));
        }

        ngOnChanges(changes: SimpleChanges) {
          hooks.push(`ngOnChanges:${changes['val'].currentValue}`);
        }

        ngOnInit() {
          hooks.push('ngOnInit');
        }

        ngAfterViewInit() {
          hooks.push('ngAfterViewInit');
        }

        ngOnDestroy() {
          hooks.push('ngOnDestroy');
        }
      }

      @Component({
        template: `
          @if (show()) {
            <lifecycle-hostless [val]="val()" />
          }
        `,
        imports: [LifecycleHostless],
      })
      class App {
        show = signal(true);
        val = signal('v1');
      }

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      expect(hooks).toEqual(['constructor', 'ngOnChanges:v1', 'ngOnInit', 'ngAfterViewInit']);

      // Update input
      fixture.componentInstance.val.set('v2');
      await fixture.whenStable();

      expect(hooks).toContain('ngOnChanges:v2');

      // Destroy
      fixture.componentInstance.show.set(false);
      await fixture.whenStable();

      expect(hooks).toContain('ngOnDestroy');
      expect(hooks).toContain('destroyRef');
    });
  });

  describe('Content Projection Fallback', () => {
    it('should render fallback content when no projected nodes are provided, and override when provided', async () => {
      @Component({
        selector: 'fallback-hostless',
        hostless: true,
        template: `
          <div class="box">
            <ng-content><span>Default Fallback Content</span></ng-content>
          </div>
        `,
      })
      class FallbackHostless {}

      @Component({
        template: `
          <div class="wrapper">
            @if (showCustom()) {
              <fallback-hostless>
                <span class="custom">Custom Projected Content</span>
              </fallback-hostless>
            } @else {
              <fallback-hostless />
            }
          </div>
        `,
        imports: [FallbackHostless],
      })
      class App {
        showCustom = signal(false);
      }

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      expect(fixture.nativeElement.innerHTML).toContain('<span>Default Fallback Content</span>');
      expect(fixture.nativeElement.innerHTML).not.toContain('Custom Projected Content');

      fixture.componentInstance.showCustom.set(true);
      await fixture.whenStable();

      expect(fixture.nativeElement.innerHTML).toContain(
        '<span class="custom">Custom Projected Content</span>',
      );
      expect(fixture.nativeElement.innerHTML).not.toContain('Default Fallback Content');
    });
  });

  describe('Dependency Injection with Component Providers', () => {
    it('should provide services to child components and directives within its template', async () => {
      @Injectable()
      class CounterService {
        val = 42;
      }

      @Component({
        selector: 'child-consumer',
        template: '<span>Value: {{ counter.val }}</span>',
      })
      class ChildConsumer {
        counter = inject(CounterService);
      }

      @Component({
        selector: 'provider-hostless',
        hostless: true,
        providers: [CounterService],
        template: `
          <div class="provider-wrapper">
            <child-consumer />
          </div>
        `,
        imports: [ChildConsumer],
      })
      class ProviderHostless {}

      @Component({
        template: '<provider-hostless />',
        imports: [ProviderHostless],
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      expect(fixture.nativeElement.textContent).toContain('Value: 42');
    });
  });

  describe('Dynamic creation with projectable nodes', () => {
    it('should project nodes into dynamically created hostless component', async () => {
      @Component({
        selector: 'dynamic-proj-hostless',
        hostless: true,
        template: `
          <div class="dyn-header"><ng-content select="[header]" /></div>
          <div class="dyn-body"><ng-content /></div>
        `,
      })
      class DynamicProjHostless {}

      @Component({
        template: '<div class="container"><ng-container #vcr></ng-container></div>',
      })
      class App {
        @ViewChild('vcr', {read: ViewContainerRef}) vcr!: ViewContainerRef;
      }

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const headerNode = document.createElement('h2');
      headerNode.setAttribute('header', '');
      headerNode.textContent = 'Dynamic Header';

      const bodyNode = document.createElement('p');
      bodyNode.textContent = 'Dynamic Body';

      const compRef = fixture.componentInstance.vcr.createComponent(DynamicProjHostless, {
        projectableNodes: [[headerNode], [bodyNode]],
      });
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toContain(
        '<div class="dyn-header"><h2 header="">Dynamic Header</h2></div>',
      );
      expect(fixture.nativeElement.innerHTML).toContain(
        '<div class="dyn-body"><p>Dynamic Body</p></div>',
      );

      compRef.destroy();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.dyn-header')).toBeFalsy();
    });
  });

  describe('Edge cases and potential undefined behaviors', () => {
    it('should not render unprojected content passed to hostless component without ng-content', async () => {
      @Component({
        selector: 'no-proj-hostless',
        hostless: true,
        template: '<div>Only internal content</div>',
      })
      class NoProjHostless {}

      @Component({
        imports: [NoProjHostless],
        template:
          '<no-proj-hostless><p id="unprojected">Should not appear in DOM</p></no-proj-hostless>',
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('#unprojected')).toBeFalsy();
      expect(fixture.nativeElement.innerHTML).toBe(
        '<div>Only internal content</div><!--hostless no-proj-hostless-->',
      );
    });

    it('should only render projected slots and omit unprojected content in hostless multi-slot projection', async () => {
      @Component({
        selector: 'multi-slot-hostless',
        hostless: true,
        template: `
          <div class="projected-header"><ng-content select="[header]" /></div>
          <div class="projected-footer"><ng-content select="[footer]" /></div>
        `,
      })
      class MultiSlotHostless {}

      @Component({
        imports: [MultiSlotHostless],
        template: `
          <multi-slot-hostless>
            <span header>Header Content</span>
            <p id="unprojected-middle">Unprojected middle content</p>
            <span footer>Footer Content</span>
            <div id="unprojected-end">Unprojected trailing content</div>
          </multi-slot-hostless>
        `,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('#unprojected-middle')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('#unprojected-end')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('.projected-header').textContent.trim()).toBe(
        'Header Content',
      );
      expect(fixture.nativeElement.querySelector('.projected-footer').textContent.trim()).toBe(
        'Footer Content',
      );
    });

    it('should handle nested hostless components with unprojected content', async () => {
      @Component({
        selector: 'inner-hostless',
        hostless: true,
        template: '<span>Inner Hostless</span>',
      })
      class InnerHostless {}

      @Component({
        selector: 'outer-hostless',
        hostless: true,
        imports: [InnerHostless],
        template: `
          <div>
            <inner-hostless>
              <em id="inner-unprojected">Inner Unprojected</em>
            </inner-hostless>
          </div>
        `,
      })
      class OuterHostless {}

      @Component({
        imports: [OuterHostless],
        template: `
          <outer-hostless>
            <strong id="outer-unprojected">Outer Unprojected</strong>
          </outer-hostless>
        `,
      })
      class App {}

      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('#outer-unprojected')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('#inner-unprojected')).toBeFalsy();
      expect(fixture.nativeElement.textContent).toContain('Inner Hostless');
    });

    it('should maintain style encapsulation boundary when parent uses child combinators', async () => {
      @Component({
        selector: 'hostless-target',
        hostless: true,
        template: '<span class="target">Child text</span>',
      })
      class HostlessTarget {}

      @Component({
        selector: 'regular-target',
        template: '<span class="target">Child text</span>',
      })
      class RegularTarget {}

      @Component({
        imports: [HostlessTarget],
        styles: ['div > span.target { color: rgb(255, 0, 0); }'],
        template: '<div><hostless-target /></div>',
      })
      class HostlessApp {}

      @Component({
        imports: [RegularTarget],
        styles: ['div > span.target { color: rgb(255, 0, 0); }'],
        template: '<div><regular-target /></div>',
      })
      class RegularApp {}

      const regFixture = TestBed.createComponent(RegularApp);
      await regFixture.whenStable();
      const regSpan = regFixture.nativeElement.querySelector('span.target');
      const regColor = window.getComputedStyle(regSpan).color;

      const hostlessFixture = TestBed.createComponent(HostlessApp);
      await hostlessFixture.whenStable();
      const hostlessSpan = hostlessFixture.nativeElement.querySelector('span.target');
      const hostlessColor = window.getComputedStyle(hostlessSpan).color;
      // it is important to compute the style while the element is attached to the document
      // else we could simply get empty string returned.

      expect(hostlessColor).toBe(regColor);
    });
  });
});

@Component({
  selector: 'my-hostless',
  template: '<div>Hostless Content</div>',
  hostless: true,
})
class MyHostless {}
