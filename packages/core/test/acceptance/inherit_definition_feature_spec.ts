/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {state, style, trigger} from '@angular/animations';
import {Component, ContentChildren, Directive, EventEmitter, HostBinding, HostListener, Input, OnChanges, Output, QueryList, ViewChildren} from '@angular/core';
import {ivyEnabled} from '@angular/core/src/ivy_switch';
import {getDirectiveDef} from '@angular/core/src/render3/definition';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {onlyInIvy} from '@angular/private/testing';

describe('inheritance', () => {
  onlyInIvy('View Engine does not provide this check')
      .it('should throw when trying to inherit a component from a directive', () => {
        @Component({
          selector: 'my-comp',
          template: '<div></div>',
        })
        class MyComponent {
        }

        @Directive({
          selector: '[my-dir]',
        })
        class MyDirective extends MyComponent {
        }

        @Component({
          template: `<div my-dir></div>`,
        })
        class App {
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent, MyDirective],
        });

        expect(() => {
          TestBed.createComponent(App);
        }).toThrowError('Directives cannot inherit Components');
      });

  describe('multiple children', () => {
    it('should ensure that multiple child classes don\'t cause multiple parent execution', () => {
      // Assume this inheritance:
      //         Base
      //           |
      //         Super
      //        /     \
      //     Sub1    Sub2
      //
      // In the above case:
      //  1.  Sub1 as will walk the inheritance Sub1, Super, Base
      //  2.  Sub2 as will walk the inheritance Sub2, Super, Base
      //
      // Notice that Super, Base will get walked twice. Because inheritance works by wrapping parent
      // hostBindings function in a delegate which calls the hostBindings of the directive as well
      // as super, we need to ensure that we don't double wrap the hostBindings function. Doing so
      // would result in calling the hostBindings multiple times (unnecessarily). This would be
      // especially an issue if we have a lot of sub-classes (as is common in component libraries)
      const log: string[] = [];

      @Directive({selector: '[superDir]'})
      class BaseDirective {
        @HostBinding('style.background-color')
        get backgroundColor() {
          log.push('Base.backgroundColor');
          return 'white';
        }
      }

      @Directive({selector: '[superDir]'})
      class SuperDirective extends BaseDirective {
        @HostBinding('style.color')
        get color() {
          log.push('Super.color');
          return 'blue';
        }
      }

      @Directive({selector: '[subDir1]'})
      class Sub1Directive extends SuperDirective {
        @HostBinding('style.height')
        get height() {
          log.push('Sub1.height');
          return '200px';
        }
      }

      @Directive({selector: '[subDir2]'})
      class Sub2Directive extends SuperDirective {
        @HostBinding('style.width')
        get width() {
          log.push('Sub2.width');
          return '100px';
        }
      }

      @Component({template: `<div subDir1 subDir2></div>`})
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, Sub1Directive, Sub2Directive, SuperDirective],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges(false);  // Don't check for no changes (so that assertion does not need
                                     // to worry about it.)

      expect(log).toEqual([
        'Base.backgroundColor', 'Super.color', 'Sub1.height',  //
        'Base.backgroundColor', 'Super.color', 'Sub2.width',   //
      ]);
      if (ivyEnabled) {
        expect(getDirectiveDef(BaseDirective)!.hostVars).toEqual(2);
        expect(getDirectiveDef(SuperDirective)!.hostVars).toEqual(4);
        expect(getDirectiveDef(Sub1Directive)!.hostVars).toEqual(6);
        expect(getDirectiveDef(Sub2Directive)!.hostVars).toEqual(6);
      }
    });
  });

  describe('ngOnChanges', () => {
    it('should be inherited when super is a directive', () => {
      const log: string[] = [];

      @Directive({selector: '[superDir]'})
      class SuperDirective implements OnChanges {
        @Input() someInput = '';

        ngOnChanges() {
          log.push('on changes!');
        }
      }

      @Directive({selector: '[subDir]'})
      class SubDirective extends SuperDirective {
      }

      @Component({template: `<div subDir [someInput]="1"></div>`})
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, SubDirective, SuperDirective],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(log).toEqual(['on changes!']);
    });

    it('should be inherited when super is a simple class', () => {
      const log: string[] = [];

      class SuperClass {
        ngOnChanges() {
          log.push('on changes!');
        }
      }

      @Directive({selector: '[subDir]'})
      class SubDirective extends SuperClass {
        @Input() someInput = '';
      }

      @Component({template: `<div subDir [someInput]="1"></div>`})
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, SubDirective],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(log).toEqual(['on changes!']);
    });

    it('should be inherited when super is a directive and grand-super is a directive', () => {
      const log: string[] = [];

      @Directive({selector: '[grandSuperDir]'})
      class GrandSuperDirective implements OnChanges {
        @Input() someInput = '';

        ngOnChanges() {
          log.push('on changes!');
        }
      }

      @Directive({selector: '[superDir]'})
      class SuperDirective extends GrandSuperDirective {
      }

      @Directive({selector: '[subDir]'})
      class SubDirective extends SuperDirective {
      }


      @Component({template: `<div subDir [someInput]="1"></div>`})
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, SubDirective, SuperDirective, GrandSuperDirective],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(log).toEqual(['on changes!']);
    });

    it('should be inherited when super is a directive and grand-super is a simple class', () => {
      const log: string[] = [];

      class GrandSuperClass {
        ngOnChanges() {
          log.push('on changes!');
        }
      }

      @Directive({selector: '[superDir]'})
      class SuperDirective extends GrandSuperClass {
        @Input() someInput = '';
      }

      @Directive({selector: '[subDir]'})
      class SubDirective extends SuperDirective {
      }


      @Component({template: `<div subDir [someInput]="1"></div>`})
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, SubDirective, SuperDirective],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(log).toEqual(['on changes!']);
    });

    it('should be inherited when super is a simple class and grand-super is a directive', () => {
      const log: string[] = [];

      @Directive({selector: '[grandSuperDir]'})
      class GrandSuperDirective implements OnChanges {
        @Input() someInput = '';

        ngOnChanges() {
          log.push('on changes!');
        }
      }

      class SuperClass extends GrandSuperDirective {}

      @Directive({selector: '[subDir]'})
      class SubDirective extends SuperClass {
      }


      @Component({template: `<div subDir [someInput]="1"></div>`})
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, SubDirective, GrandSuperDirective],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(log).toEqual(['on changes!']);
    });

    it('should be inherited when super is a simple class and grand-super is a simple class', () => {
      const log: string[] = [];

      class GrandSuperClass {
        ngOnChanges() {
          log.push('on changes!');
        }
      }

      class SuperClass extends GrandSuperClass {}

      @Directive({selector: '[subDir]'})
      class SubDirective extends SuperClass {
        @Input() someInput = '';
      }


      @Component({template: `<div subDir [someInput]="1"></div>`})
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, SubDirective],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(log).toEqual(['on changes!']);
    });

    it('should be inherited from undecorated super class which inherits from decorated one', () => {
      let changes = 0;

      abstract class Base {
        // Add an Input so that we have at least one Angular decorator on a class field.
        @Input() inputBase: any;
        abstract input: any;
      }

      abstract class UndecoratedBase extends Base {
        abstract override input: any;
        ngOnChanges() {
          changes++;
        }
      }

      @Component({selector: 'my-comp', template: ''})
      class MyComp extends UndecoratedBase {
        @Input() override input: any;
      }

      @Component({template: '<my-comp [input]="value"></my-comp>'})
      class App {
        value = 'hello';
      }

      TestBed.configureTestingModule({declarations: [MyComp, App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(changes).toBe(1);
    });
  });

  describe('of bare super class by a directive', () => {
    // TODO: Add tests for ContentChild
    // TODO: Add tests for ViewChild

    describe('lifecycle hooks', () => {
      const fired: string[] = [];

      class SuperDirective {
        ngOnInit() {
          fired.push('super init');
        }
        ngOnDestroy() {
          fired.push('super destroy');
        }
        ngAfterContentInit() {
          fired.push('super after content init');
        }
        ngAfterContentChecked() {
          fired.push('super after content checked');
        }
        ngAfterViewInit() {
          fired.push('super after view init');
        }
        ngAfterViewChecked() {
          fired.push('super after view checked');
        }
        ngDoCheck() {
          fired.push('super do check');
        }
      }

      beforeEach(() => fired.length = 0);

      it('ngOnInit', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngOnInit() {
            fired.push('sub init');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'sub init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngDoCheck', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngDoCheck() {
            fired.push('sub do check');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'sub do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterContentInit', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngAfterContentInit() {
            fired.push('sub after content init');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'sub after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterContentChecked', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngAfterContentChecked() {
            fired.push('sub after content checked');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'sub after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterViewInit', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngAfterViewInit() {
            fired.push('sub after view init');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'sub after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterViewChecked', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngAfterViewChecked() {
            fired.push('sub after view checked');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'sub after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngOnDestroy', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngOnDestroy() {
            fired.push('sub destroy');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'sub destroy',
        ]);
      });
    });

    describe('inputs', () => {
      // TODO: add test where the two inputs have a different alias
      // TODO: add test where super has an @Input() on the property, and sub does not
      // TODO: add test where super has an @Input('alias') on the property and sub has no alias

      it('should inherit inputs', () => {
        class SuperDirective {
          @Input() foo = '';

          @Input() bar = '';

          @Input() baz = '';
        }

        @Directive({
          selector: '[sub-dir]',
        })
        class SubDirective extends SuperDirective {
          @Input() override baz = '';

          @Input() qux = '';
        }

        @Component({template: `<p sub-dir [foo]="a" [bar]="b" [baz]="c" [qux]="d"></p>`})
        class App {
          a = 'a';
          b = 'b';
          c = 'c';
          d = 'd';
        }

        TestBed.configureTestingModule({
          declarations: [App, SubDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        const subDir =
            fixture.debugElement.query(By.directive(SubDirective)).injector.get(SubDirective);

        expect(subDir.foo).toBe('a');
        expect(subDir.bar).toBe('b');
        expect(subDir.baz).toBe('c');
        expect(subDir.qux).toBe('d');
      });
    });

    describe('outputs', () => {
      // TODO: add tests where both sub and super have Output on same property with different
      // aliases
      // TODO: add test where super has property with alias and sub has property with no alias
      // TODO: add test where super has an @Input() on the property, and sub does not

      it('should inherit outputs', () => {
        class SuperDirective {
          @Output() foo = new EventEmitter<string>();
        }

        @Directive({
          selector: '[sub-dir]',
        })
        class SubDirective extends SuperDirective {
          ngOnInit() {
            this.foo.emit('test');
          }
        }

        @Component({
          template: `
        <div sub-dir (foo)="handleFoo($event)"></div>
      `
        })
        class App {
          foo = '';

          handleFoo(event: string) {
            this.foo = event;
          }
        }

        TestBed.configureTestingModule({
          declarations: [App, SubDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const app = fixture.componentInstance;

        expect(app.foo).toBe('test');
      });
    });

    describe('host bindings (style related)', () => {
      // TODO: sub and super HostBinding same property but different bindings
      // TODO: sub and super HostBinding same binding on two different properties
      it('should compose host bindings for styles', () => {
        class SuperDirective {
          @HostBinding('style.color') color = 'red';

          @HostBinding('style.backgroundColor') bg = 'black';
        }

        @Directive({
          selector: '[sub-dir]',
        })
        class SubDirective extends SuperDirective {
        }

        @Component({
          template: `
          <p sub-dir>test</p>
        `
        })
        class App {
        }

        TestBed.configureTestingModule({
          declarations: [App, SubDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const queryResult = fixture.debugElement.query(By.directive(SubDirective));

        expect(queryResult.nativeElement.tagName).toBe('P');
        expect(queryResult.nativeElement.style.color).toBe('red');
        expect(queryResult.nativeElement.style.backgroundColor).toBe('black');
      });
    });

    describe('host bindings (non-style related)', () => {
      // TODO: sub and super HostBinding same property but different bindings
      // TODO: sub and super HostBinding same binding on two different properties
      it('should compose host bindings (non-style related)', () => {
        class SuperDirective {
          @HostBinding('title')
          get boundTitle() {
            return this.superTitle + '!!!';
          }

          @Input() superTitle = '';
        }

        @Directive({
          selector: '[sub-dir]',
        })
        class SubDirective extends SuperDirective {
        }
        @Component({
          template: `
        <p sub-dir superTitle="test">test</p>
      `
        })
        class App {
        }

        TestBed.configureTestingModule({
          declarations: [App, SubDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const queryResult = fixture.debugElement.query(By.directive(SubDirective));

        expect(queryResult.nativeElement.title).toBe('test!!!');
      });
    });

    describe('ContentChildren', () => {
      // TODO: sub and super HostBinding same property but different bindings
      // TODO: sub and super HostBinding same binding on two different properties
      it('should inherit ContentChildren queries', () => {
        let foundQueryList: QueryList<ChildDir>;

        @Directive({selector: '[child-dir]'})
        class ChildDir {
        }

        class SuperDirective {
          @ContentChildren(ChildDir) customDirs!: QueryList<ChildDir>;
        }

        @Directive({
          selector: '[sub-dir]',
        })
        class SubDirective extends SuperDirective {
          ngAfterViewInit() {
            foundQueryList = this.customDirs;
          }
        }

        @Component({
          template: `
        <ul sub-dir>
          <li child-dir>one</li>
          <li child-dir>two</li>
        </ul>
      `
        })
        class App {
        }

        TestBed.configureTestingModule({
          declarations: [App, SubDirective, ChildDir],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(foundQueryList!.length).toBe(2);
      });
    });

    xdescribe(
        'what happens when...',
        () => {
            // TODO: sub has Input and super has Output on same property
            // TODO: sub has Input and super has HostBinding on same property
            // TODO: sub has Input and super has ViewChild on same property
            // TODO: sub has Input and super has ViewChildren on same property
            // TODO: sub has Input and super has ContentChild on same property
            // TODO: sub has Input and super has ContentChildren on same property
            // TODO: sub has Output and super has HostBinding on same property
            // TODO: sub has Output and super has ViewChild on same property
            // TODO: sub has Output and super has ViewChildren on same property
            // TODO: sub has Output and super has ContentChild on same property
            // TODO: sub has Output and super has ContentChildren on same property
            // TODO: sub has HostBinding and super has ViewChild on same property
            // TODO: sub has HostBinding and super has ViewChildren on same property
            // TODO: sub has HostBinding and super has ContentChild on same property
            // TODO: sub has HostBinding and super has ContentChildren on same property
            // TODO: sub has ViewChild and super has ViewChildren on same property
            // TODO: sub has ViewChild and super has ContentChild on same property
            // TODO: sub has ViewChild and super has ContentChildren on same property
            // TODO: sub has ViewChildren and super has ContentChild on same property
            // TODO: sub has ViewChildren and super has ContentChildren on same property
            // TODO: sub has ContentChild and super has ContentChildren on same property
        });
  });

  describe('of a directive by another directive', () => {
    // TODO: Add tests for ContentChild
    // TODO: Add tests for ViewChild

    describe('lifecycle hooks', () => {
      const fired: string[] = [];

      @Directive({
        selector: '[super-dir]',
      })
      class SuperDirective {
        ngOnInit() {
          fired.push('super init');
        }
        ngOnDestroy() {
          fired.push('super destroy');
        }
        ngAfterContentInit() {
          fired.push('super after content init');
        }
        ngAfterContentChecked() {
          fired.push('super after content checked');
        }
        ngAfterViewInit() {
          fired.push('super after view init');
        }
        ngAfterViewChecked() {
          fired.push('super after view checked');
        }
        ngDoCheck() {
          fired.push('super do check');
        }
      }

      beforeEach(() => fired.length = 0);

      it('ngOnInit', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngOnInit() {
            fired.push('sub init');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'sub init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngDoCheck', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngDoCheck() {
            fired.push('sub do check');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'sub do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterContentInit', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngAfterContentInit() {
            fired.push('sub after content init');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'sub after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterContentChecked', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngAfterContentChecked() {
            fired.push('sub after content checked');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'sub after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterViewInit', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngAfterViewInit() {
            fired.push('sub after view init');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'sub after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterViewChecked', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngAfterViewChecked() {
            fired.push('sub after view checked');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'sub after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngOnDestroy', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngOnDestroy() {
            fired.push('sub destroy');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'sub destroy',
        ]);
      });
    });

    describe('inputs', () => {
      // TODO: add test where the two inputs have a different alias
      // TODO: add test where super has an @Input() on the property, and sub does not
      // TODO: add test where super has an @Input('alias') on the property and sub has no alias

      it('should inherit inputs', () => {
        @Directive({selector: '[super-dir]'})
        class SuperDirective {
          @Input() foo = '';

          @Input() bar = '';

          @Input() baz = '';
        }

        @Directive({
          selector: '[sub-dir]',
        })
        class SubDirective extends SuperDirective {
          @Input() override baz = '';

          @Input() qux = '';
        }

        @Component({template: `<p sub-dir [foo]="a" [bar]="b" [baz]="c" [qux]="d"></p>`})
        class App {
          a = 'a';
          b = 'b';
          c = 'c';
          d = 'd';
        }

        TestBed.configureTestingModule({
          declarations: [App, SubDirective, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        const subDir =
            fixture.debugElement.query(By.directive(SubDirective)).injector.get(SubDirective);

        expect(subDir.foo).toBe('a');
        expect(subDir.bar).toBe('b');
        expect(subDir.baz).toBe('c');
        expect(subDir.qux).toBe('d');
      });
    });

    describe('outputs', () => {
      // TODO: add tests where both sub and super have Output on same property with different
      // aliases
      // TODO: add test where super has property with alias and sub has property with no alias
      // TODO: add test where super has an @Input() on the property, and sub does not

      it('should inherit outputs', () => {
        @Directive({
          selector: '[super-dir]',
        })
        class SuperDirective {
          @Output() foo = new EventEmitter<string>();
        }

        @Directive({
          selector: '[sub-dir]',
        })
        class SubDirective extends SuperDirective {
          ngOnInit() {
            this.foo.emit('test');
          }
        }

        @Component({
          template: `
        <div sub-dir (foo)="handleFoo($event)"></div>
      `
        })
        class App {
          foo = '';

          handleFoo(event: string) {
            this.foo = event;
          }
        }

        TestBed.configureTestingModule({
          declarations: [App, SubDirective, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const app = fixture.componentInstance;

        expect(app.foo).toBe('test');
      });
    });

    describe('host bindings (style related)', () => {
      // TODO: sub and super HostBinding same property but different bindings
      // TODO: sub and super HostBinding same binding on two different properties
      it('should compose host bindings for styles', () => {
        @Directive({
          selector: '[super-dir]',
        })
        class SuperDirective {
          @HostBinding('style.color') color = 'red';

          @HostBinding('style.backgroundColor') bg = 'black';
        }

        @Directive({
          selector: '[sub-dir]',
        })
        class SubDirective extends SuperDirective {
        }

        @Component({
          template: `
        <p sub-dir>test</p>
      `
        })
        class App {
        }

        TestBed.configureTestingModule({
          declarations: [App, SubDirective, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const queryResult = fixture.debugElement.query(By.directive(SubDirective));

        expect(queryResult.nativeElement.tagName).toBe('P');
        expect(queryResult.nativeElement.style.color).toBe('red');
        expect(queryResult.nativeElement.style.backgroundColor).toBe('black');
      });
    });

    describe('host bindings (non-style related)', () => {
      // TODO: sub and super HostBinding same property but different bindings
      // TODO: sub and super HostBinding same binding on two different properties
      it('should compose host bindings (non-style related)', () => {
        @Directive({
          selector: '[super-dir]',
        })
        class SuperDirective {
          @HostBinding('title')
          get boundTitle() {
            return this.superTitle + '!!!';
          }

          @Input() superTitle = '';
        }

        @Directive({
          selector: '[sub-dir]',
        })
        class SubDirective extends SuperDirective {
        }
        @Component({
          template: `
        <p sub-dir superTitle="test">test</p>
      `
        })
        class App {
        }

        TestBed.configureTestingModule({
          declarations: [App, SubDirective, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const queryResult = fixture.debugElement.query(By.directive(SubDirective));

        expect(queryResult.nativeElement.title).toBe('test!!!');
      });
    });

    it('should inherit ContentChildren queries', () => {
      let foundQueryList: QueryList<ChildDir>;

      @Directive({selector: '[child-dir]'})
      class ChildDir {
      }

      @Directive({
        selector: '[super-dir]',
      })
      class SuperDirective {
        @ContentChildren(ChildDir) customDirs!: QueryList<ChildDir>;
      }

      @Directive({
        selector: '[sub-dir]',
      })
      class SubDirective extends SuperDirective {
        ngAfterViewInit() {
          foundQueryList = this.customDirs;
        }
      }

      @Component({
        template: `
        <ul sub-dir>
          <li child-dir>one</li>
          <li child-dir>two</li>
        </ul>
      `
      })
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, SubDirective, ChildDir, SuperDirective],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(foundQueryList!.length).toBe(2);
    });

    xdescribe(
        'what happens when...',
        () => {
            // TODO: sub has Input and super has Output on same property
            // TODO: sub has Input and super has HostBinding on same property
            // TODO: sub has Input and super has ViewChild on same property
            // TODO: sub has Input and super has ViewChildren on same property
            // TODO: sub has Input and super has ContentChild on same property
            // TODO: sub has Input and super has ContentChildren on same property
            // TODO: sub has Output and super has HostBinding on same property
            // TODO: sub has Output and super has ViewChild on same property
            // TODO: sub has Output and super has ViewChildren on same property
            // TODO: sub has Output and super has ContentChild on same property
            // TODO: sub has Output and super has ContentChildren on same property
            // TODO: sub has HostBinding and super has ViewChild on same property
            // TODO: sub has HostBinding and super has ViewChildren on same property
            // TODO: sub has HostBinding and super has ContentChild on same property
            // TODO: sub has HostBinding and super has ContentChildren on same property
            // TODO: sub has ViewChild and super has ViewChildren on same property
            // TODO: sub has ViewChild and super has ContentChild on same property
            // TODO: sub has ViewChild and super has ContentChildren on same property
            // TODO: sub has ViewChildren and super has ContentChild on same property
            // TODO: sub has ViewChildren and super has ContentChildren on same property
            // TODO: sub has ContentChild and super has ContentChildren on same property
        });
  });

  describe('of a directive by a bare class then by another directive', () => {
    // TODO: Add tests for ContentChild
    // TODO: Add tests for ViewChild
    describe('lifecycle hooks', () => {
      const fired: string[] = [];

      @Directive({
        selector: '[super-dir]',
      })
      class SuperSuperDirective {
        ngOnInit() {
          fired.push('super init');
        }
        ngOnDestroy() {
          fired.push('super destroy');
        }
        ngAfterContentInit() {
          fired.push('super after content init');
        }
        ngAfterContentChecked() {
          fired.push('super after content checked');
        }
        ngAfterViewInit() {
          fired.push('super after view init');
        }
        ngAfterViewChecked() {
          fired.push('super after view checked');
        }
        ngDoCheck() {
          fired.push('super do check');
        }
      }

      class SuperDirective extends SuperSuperDirective {}

      beforeEach(() => fired.length = 0);

      it('ngOnInit', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngOnInit() {
            fired.push('sub init');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App, SuperSuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'sub init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngDoCheck', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngDoCheck() {
            fired.push('sub do check');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App, SuperSuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'sub do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterContentInit', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngAfterContentInit() {
            fired.push('sub after content init');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App, SuperSuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'sub after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterContentChecked', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngAfterContentChecked() {
            fired.push('sub after content checked');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App, SuperSuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'sub after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterViewInit', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngAfterViewInit() {
            fired.push('sub after view init');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App, SuperSuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'sub after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterViewChecked', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngAfterViewChecked() {
            fired.push('sub after view checked');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App, SuperSuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'sub after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngOnDestroy', () => {
        @Directive({
          selector: '[subDir]',
        })
        class SubDirective extends SuperDirective {
          override ngOnDestroy() {
            fired.push('sub destroy');
          }
        }

        @Component({
          template: `<p *ngIf="showing" subDir></p>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [SubDirective, App, SuperSuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'sub destroy',
        ]);
      });
    });

    describe('inputs', () => {
      // TODO: add test where the two inputs have a different alias
      // TODO: add test where super has an @Input() on the property, and sub does not
      // TODO: add test where super has an @Input('alias') on the property and sub has no alias

      it('should inherit inputs', () => {
        @Directive({selector: '[super-dir]'})
        class SuperSuperDirective {
          @Input() foo = '';

          @Input() baz = '';
        }

        class SuperDirective extends SuperSuperDirective {
          @Input() bar = '';
        }

        @Directive({
          selector: '[sub-dir]',
        })
        class SubDirective extends SuperDirective {
          @Input() override baz = '';

          @Input() qux = '';
        }

        @Component({
          selector: 'my-app',
          template: `<p sub-dir [foo]="a" [bar]="b" [baz]="c" [qux]="d"></p>`,
        })
        class App {
          a = 'a';
          b = 'b';
          c = 'c';
          d = 'd';
        }

        TestBed.configureTestingModule({
          declarations: [App, SubDirective, SuperDirective, SuperSuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        const subDir =
            fixture.debugElement.query(By.directive(SubDirective)).injector.get(SubDirective);

        expect(subDir.foo).toBe('a');
        expect(subDir.bar).toBe('b');
        expect(subDir.baz).toBe('c');
        expect(subDir.qux).toBe('d');
      });
    });

    describe('outputs', () => {
      // TODO: add tests where both sub and super have Output on same property with different
      // aliases
      // TODO: add test where super has property with alias and sub has property with no alias
      // TODO: add test where super has an @Input() on the property, and sub does not

      it('should inherit outputs', () => {
        @Directive({
          selector: '[super-dir]',
        })
        class SuperSuperDirective {
          @Output() foo = new EventEmitter<string>();
        }

        class SuperDirective extends SuperSuperDirective {
          @Output() bar = new EventEmitter<string>();
        }

        @Directive({
          selector: '[sub-dir]',
        })
        class SubDirective extends SuperDirective {
          ngOnInit() {
            this.foo.emit('test1');
            this.bar.emit('test2');
          }
        }

        @Component({
          template: `
          <div sub-dir (foo)="handleFoo($event)" (bar)="handleBar($event)"></div>
        `
        })
        class App {
          foo = '';

          bar = '';

          handleFoo(event: string) {
            this.foo = event;
          }

          handleBar(event: string) {
            this.bar = event;
          }
        }

        TestBed.configureTestingModule({
          declarations: [App, SubDirective, SuperDirective, SuperSuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const app = fixture.componentInstance;

        expect(app.foo).toBe('test1');
        expect(app.bar).toBe('test2');
      });
    });

    describe('host bindings (style related)', () => {
      // TODO: sub and super HostBinding same property but different bindings
      // TODO: sub and super HostBinding same binding on two different properties
      it('should compose host bindings for styles', () => {
        @Directive({
          selector: '[super-dir]',
        })
        class SuperSuperDirective {
          @HostBinding('style.color') color = 'red';
        }

        class SuperDirective extends SuperSuperDirective {
          @HostBinding('style.backgroundColor') bg = 'black';
        }

        @Directive({
          selector: '[sub-dir]',
        })
        class SubDirective extends SuperDirective {
        }

        @Component({
          template: `
          <p sub-dir>test</p>
        `
        })
        class App {
        }

        TestBed.configureTestingModule({
          declarations: [App, SubDirective, SuperDirective, SuperSuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const queryResult = fixture.debugElement.query(By.directive(SubDirective));

        expect(queryResult.nativeElement.tagName).toBe('P');
        expect(queryResult.nativeElement.style.color).toBe('red');
        expect(queryResult.nativeElement.style.backgroundColor).toBe('black');
      });
    });

    describe('host bindings (non-style related)', () => {
      // TODO: sub and super HostBinding same property but different bindings
      // TODO: sub and super HostBinding same binding on two different properties
      it('should compose host bindings (non-style related)', () => {
        @Directive({
          selector: '[super-dir]',
        })
        class SuperSuperDirective {
          @HostBinding('title')
          get boundTitle() {
            return this.superTitle + '!!!';
          }

          @Input() superTitle = '';
        }

        class SuperDirective extends SuperSuperDirective {
          @HostBinding('accessKey')
          get boundAltKey() {
            return this.superAccessKey + '???';
          }

          @Input() superAccessKey = '';
        }

        @Directive({
          selector: '[sub-dir]',
        })
        class SubDirective extends SuperDirective {
        }
        @Component({
          template: `
        <p sub-dir superTitle="test1" superAccessKey="test2">test</p>
      `
        })
        class App {
        }

        TestBed.configureTestingModule({
          declarations: [App, SubDirective, SuperDirective, SuperSuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const p: HTMLParagraphElement =
            fixture.debugElement.query(By.directive(SubDirective)).nativeElement;

        expect(p.title).toBe('test1!!!');
        expect(p.accessKey).toBe('test2???');
      });
    });

    it('should inherit ContentChildren queries', () => {
      let foundChildDir1s: QueryList<ChildDir1>;
      let foundChildDir2s: QueryList<ChildDir2>;

      @Directive({selector: '[child-dir-one]'})
      class ChildDir1 {
      }

      @Directive({selector: '[child-dir-two]'})
      class ChildDir2 {
      }

      @Directive({
        selector: '[super-dir]',
      })
      class SuperSuperDirective {
        @ContentChildren(ChildDir1) childDir1s!: QueryList<ChildDir1>;
      }

      class SuperDirective extends SuperSuperDirective {
        @ContentChildren(ChildDir1) childDir2s!: QueryList<ChildDir2>;
      }

      @Directive({
        selector: '[sub-dir]',
      })
      class SubDirective extends SuperDirective {
        ngAfterViewInit() {
          foundChildDir1s = this.childDir1s;
          foundChildDir2s = this.childDir2s;
        }
      }

      @Component({
        template: `
        <ul sub-dir>
          <li child-dir-one child-dir-two>one</li>
          <li child-dir-one>two</li>
          <li child-dir-two>three</li>
        </ul>
      `
      })
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, SubDirective, ChildDir1, SuperDirective],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(foundChildDir1s!.length).toBe(2);
      expect(foundChildDir2s!.length).toBe(2);
    });

    xdescribe(
        'what happens when...',
        () => {
            // TODO: sub has Input and super has Output on same property
            // TODO: sub has Input and super has HostBinding on same property
            // TODO: sub has Input and super has ViewChild on same property
            // TODO: sub has Input and super has ViewChildren on same property
            // TODO: sub has Input and super has ContentChild on same property
            // TODO: sub has Input and super has ContentChildren on same property
            // TODO: sub has Output and super has HostBinding on same property
            // TODO: sub has Output and super has ViewChild on same property
            // TODO: sub has Output and super has ViewChildren on same property
            // TODO: sub has Output and super has ContentChild on same property
            // TODO: sub has Output and super has ContentChildren on same property
            // TODO: sub has HostBinding and super has ViewChild on same property
            // TODO: sub has HostBinding and super has ViewChildren on same property
            // TODO: sub has HostBinding and super has ContentChild on same property
            // TODO: sub has HostBinding and super has ContentChildren on same property
            // TODO: sub has ViewChild and super has ViewChildren on same property
            // TODO: sub has ViewChild and super has ContentChild on same property
            // TODO: sub has ViewChild and super has ContentChildren on same property
            // TODO: sub has ViewChildren and super has ContentChild on same property
            // TODO: sub has ViewChildren and super has ContentChildren on same property
            // TODO: sub has ContentChild and super has ContentChildren on same property
        });
  });

  describe('of bare super class by a component', () => {
    // TODO: Add tests for ContentChild
    // TODO: Add tests for ViewChild
    describe('lifecycle hooks', () => {
      const fired: string[] = [];

      class SuperComponent {
        ngOnInit() {
          fired.push('super init');
        }
        ngOnDestroy() {
          fired.push('super destroy');
        }
        ngAfterContentInit() {
          fired.push('super after content init');
        }
        ngAfterContentChecked() {
          fired.push('super after content checked');
        }
        ngAfterViewInit() {
          fired.push('super after view init');
        }
        ngAfterViewChecked() {
          fired.push('super after view checked');
        }
        ngDoCheck() {
          fired.push('super do check');
        }
      }

      beforeEach(() => fired.length = 0);

      it('ngOnInit', () => {
        @Component({selector: 'my-comp', template: `<p>test</p>`})
        class MyComponent extends SuperComponent {
          override ngOnInit() {
            fired.push('sub init');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'sub init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngDoCheck', () => {
        @Directive({
          selector: 'my-comp',
        })
        class MyComponent extends SuperComponent {
          override ngDoCheck() {
            fired.push('sub do check');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'sub do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterContentInit', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngAfterContentInit() {
            fired.push('sub after content init');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'sub after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterContentChecked', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngAfterContentChecked() {
            fired.push('sub after content checked');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'sub after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterViewInit', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngAfterViewInit() {
            fired.push('sub after view init');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'sub after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterViewChecked', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngAfterViewChecked() {
            fired.push('sub after view checked');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'sub after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngOnDestroy', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngOnDestroy() {
            fired.push('sub destroy');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'sub destroy',
        ]);
      });
    });

    describe('inputs', () => {
      // TODO: add test where the two inputs have a different alias
      // TODO: add test where super has an @Input() on the property, and sub does not
      // TODO: add test where super has an @Input('alias') on the property and sub has no alias

      it('should inherit inputs', () => {
        class SuperComponent {
          @Input() foo = '';

          @Input() bar = '';

          @Input() baz = '';
        }

        @Component({selector: 'my-comp', template: `<p>test</p>`})
        class MyComponent extends SuperComponent {
          @Input() override baz = '';

          @Input() qux = '';
        }

        @Component({template: `<my-comp [foo]="a" [bar]="b" [baz]="c" [qux]="d"></my-comp>`})
        class App {
          a = 'a';
          b = 'b';
          c = 'c';
          d = 'd';
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        const subDir: MyComponent =
            fixture.debugElement.query(By.directive(MyComponent)).componentInstance;

        expect(subDir.foo).toEqual('a');
        expect(subDir.bar).toEqual('b');
        expect(subDir.baz).toEqual('c');
        expect(subDir.qux).toEqual('d');
      });
    });

    describe('outputs', () => {
      // TODO: add tests where both sub and super have Output on same property with different
      // aliases
      // TODO: add test where super has property with alias and sub has property with no alias
      // TODO: add test where super has an @Input() on the property, and sub does not

      it('should inherit outputs', () => {
        class SuperComponent {
          @Output() foo = new EventEmitter<string>();
        }

        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          ngOnInit() {
            this.foo.emit('test');
          }
        }

        @Component({
          template: `
          <my-comp (foo)="handleFoo($event)"></my-comp>
        `
        })
        class App {
          foo = '';

          handleFoo(event: string) {
            this.foo = event;
          }
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const app = fixture.componentInstance;

        expect(app.foo).toBe('test');
      });
    });

    describe('host bindings (style related)', () => {
      // TODO: sub and super HostBinding same property but different bindings
      // TODO: sub and super HostBinding same binding on two different properties
      it('should compose host bindings for styles', () => {
        class SuperComponent {
          @HostBinding('style.color') color = 'red';

          @HostBinding('style.backgroundColor') bg = 'black';
        }

        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
        }

        @Component({
          template: `
          <my-comp>test</my-comp>
        `
        })
        class App {
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const queryResult = fixture.debugElement.query(By.directive(MyComponent));

        expect(queryResult.nativeElement.tagName).toBe('MY-COMP');
        expect(queryResult.nativeElement.style.color).toBe('red');
        expect(queryResult.nativeElement.style.backgroundColor).toBe('black');
      });
    });

    describe('host bindings (non-style related)', () => {
      // TODO: sub and super HostBinding same property but different bindings
      // TODO: sub and super HostBinding same binding on two different properties
      it('should compose host bindings (non-style related)', () => {
        class SuperComponent {
          @HostBinding('title')
          get boundTitle() {
            return this.superTitle + '!!!';
          }

          @Input() superTitle = '';
        }

        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
        }
        @Component({
          template: `
        <my-comp superTitle="test">test</my-comp>
      `
        })
        class App {
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const queryResult = fixture.debugElement.query(By.directive(MyComponent));

        expect(queryResult.nativeElement.title).toBe('test!!!');
      });
    });

    it('should inherit ContentChildren queries', () => {
      let foundQueryList: QueryList<ChildDir>;

      @Directive({selector: '[child-dir]'})
      class ChildDir {
      }

      class SuperComponent {
        @ContentChildren(ChildDir) customDirs!: QueryList<ChildDir>;
      }

      @Component({selector: 'my-comp', template: `<ul><ng-content></ng-content></ul>`})
      class MyComponent extends SuperComponent {
        ngAfterViewInit() {
          foundQueryList = this.customDirs;
        }
      }

      @Component({
        template: `
        <my-comp>
          <li child-dir>one</li>
          <li child-dir>two</li>
        </my-comp>
      `
      })
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, MyComponent, ChildDir],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(foundQueryList!.length).toBe(2);
    });

    xdescribe(
        'what happens when...',
        () => {
            // TODO: sub has Input and super has Output on same property
            // TODO: sub has Input and super has HostBinding on same property
            // TODO: sub has Input and super has ViewChild on same property
            // TODO: sub has Input and super has ViewChildren on same property
            // TODO: sub has Input and super has ContentChild on same property
            // TODO: sub has Input and super has ContentChildren on same property
            // TODO: sub has Output and super has HostBinding on same property
            // TODO: sub has Output and super has ViewChild on same property
            // TODO: sub has Output and super has ViewChildren on same property
            // TODO: sub has Output and super has ContentChild on same property
            // TODO: sub has Output and super has ContentChildren on same property
            // TODO: sub has HostBinding and super has ViewChild on same property
            // TODO: sub has HostBinding and super has ViewChildren on same property
            // TODO: sub has HostBinding and super has ContentChild on same property
            // TODO: sub has HostBinding and super has ContentChildren on same property
            // TODO: sub has ViewChild and super has ViewChildren on same property
            // TODO: sub has ViewChild and super has ContentChild on same property
            // TODO: sub has ViewChild and super has ContentChildren on same property
            // TODO: sub has ViewChildren and super has ContentChild on same property
            // TODO: sub has ViewChildren and super has ContentChildren on same property
            // TODO: sub has ContentChild and super has ContentChildren on same property
        });
  });

  describe('of a directive inherited by a component', () => {
    // TODO: Add tests for ContentChild
    // TODO: Add tests for ViewChild
    describe('lifecycle hooks', () => {
      const fired: string[] = [];

      @Directive({
        selector: '[super-dir]',
      })
      class SuperDirective {
        ngOnInit() {
          fired.push('super init');
        }
        ngOnDestroy() {
          fired.push('super destroy');
        }
        ngAfterContentInit() {
          fired.push('super after content init');
        }
        ngAfterContentChecked() {
          fired.push('super after content checked');
        }
        ngAfterViewInit() {
          fired.push('super after view init');
        }
        ngAfterViewChecked() {
          fired.push('super after view checked');
        }
        ngDoCheck() {
          fired.push('super do check');
        }
      }

      beforeEach(() => fired.length = 0);

      it('ngOnInit', () => {
        @Component({selector: 'my-comp', template: `<p>test</p>`})
        class MyComponent extends SuperDirective {
          override ngOnInit() {
            fired.push('sub init');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'sub init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngDoCheck', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperDirective {
          override ngDoCheck() {
            fired.push('sub do check');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'sub do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterContentInit', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperDirective {
          override ngAfterContentInit() {
            fired.push('sub after content init');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'sub after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterContentChecked', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperDirective {
          override ngAfterContentChecked() {
            fired.push('sub after content checked');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'sub after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterViewInit', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperDirective {
          override ngAfterViewInit() {
            fired.push('sub after view init');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'sub after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterViewChecked', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperDirective {
          override ngAfterViewChecked() {
            fired.push('sub after view checked');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'sub after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngOnDestroy', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperDirective {
          override ngOnDestroy() {
            fired.push('sub destroy');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'sub destroy',
        ]);
      });
    });

    describe('inputs', () => {
      // TODO: add test where the two inputs have a different alias
      // TODO: add test where super has an @Input() on the property, and sub does not
      // TODO: add test where super has an @Input('alias') on the property and sub has no alias

      it('should inherit inputs', () => {
        @Directive({
          selector: '[super-dir]',
        })
        class SuperDirective {
          @Input() foo = '';

          @Input() bar = '';

          @Input() baz = '';
        }

        @Component({selector: 'my-comp', template: `<p>test</p>`})
        class MyComponent extends SuperDirective {
          @Input() override baz = '';

          @Input() qux = '';
        }

        @Component({template: `<my-comp [foo]="a" [bar]="b" [baz]="c" [qux]="d"></my-comp>`})
        class App {
          a = 'a';
          b = 'b';
          c = 'c';
          d = 'd';
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        const subDir: MyComponent =
            fixture.debugElement.query(By.directive(MyComponent)).componentInstance;

        expect(subDir.foo).toEqual('a');
        expect(subDir.bar).toEqual('b');
        expect(subDir.baz).toEqual('c');
        expect(subDir.qux).toEqual('d');
      });
    });

    describe('outputs', () => {
      // TODO: add tests where both sub and super have Output on same property with different
      // aliases
      // TODO: add test where super has property with alias and sub has property with no alias
      // TODO: add test where super has an @Input() on the property, and sub does not

      it('should inherit outputs', () => {
        @Directive({
          selector: '[super-dir]',
        })
        class SuperDirective {
          @Output() foo = new EventEmitter<string>();
        }

        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperDirective {
          ngOnInit() {
            this.foo.emit('test');
          }
        }

        @Component({
          template: `
          <my-comp (foo)="handleFoo($event)"></my-comp>
        `
        })
        class App {
          foo = '';

          handleFoo(event: string) {
            this.foo = event;
          }
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const app = fixture.componentInstance;

        expect(app.foo).toBe('test');
      });
    });

    describe('host bindings (style related)', () => {
      // TODO: sub and super HostBinding same property but different bindings
      // TODO: sub and super HostBinding same binding on two different properties
      it('should compose host bindings for styles', () => {
        @Directive({
          selector: '[super-dir]',
        })
        class SuperDirective {
          @HostBinding('style.color') color = 'red';

          @HostBinding('style.backgroundColor') bg = 'black';
        }

        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperDirective {
        }

        @Component({
          template: `
          <my-comp>test</my-comp>
        `
        })
        class App {
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const queryResult = fixture.debugElement.query(By.directive(MyComponent));

        expect(queryResult.nativeElement.tagName).toBe('MY-COMP');
        expect(queryResult.nativeElement.style.color).toBe('red');
        expect(queryResult.nativeElement.style.backgroundColor).toBe('black');
      });
    });

    describe('host bindings (non-style related)', () => {
      // TODO: sub and super HostBinding same property but different bindings
      // TODO: sub and super HostBinding same binding on two different properties
      it('should compose host bindings (non-style related)', () => {
        @Directive({
          selector: '[super-dir]',
        })
        class SuperDirective {
          @HostBinding('title')
          get boundTitle() {
            return this.superTitle + '!!!';
          }

          @Input() superTitle = '';
        }

        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperDirective {
        }
        @Component({
          template: `
        <my-comp superTitle="test">test</my-comp>
      `
        })
        class App {
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const queryResult = fixture.debugElement.query(By.directive(MyComponent));

        expect(queryResult.nativeElement.title).toBe('test!!!');
      });
    });

    it('should inherit ContentChildren queries', () => {
      let foundQueryList: QueryList<ChildDir>;

      @Directive({selector: '[child-dir]'})
      class ChildDir {
      }

      @Directive({
        selector: '[super-dir]',
      })
      class SuperDirective {
        @ContentChildren(ChildDir) customDirs!: QueryList<ChildDir>;
      }

      @Component({selector: 'my-comp', template: `<ul><ng-content></ng-content></ul>`})
      class MyComponent extends SuperDirective {
        ngAfterViewInit() {
          foundQueryList = this.customDirs;
        }
      }

      @Component({
        template: `
        <my-comp>
          <li child-dir>one</li>
          <li child-dir>two</li>
        </my-comp>
      `
      })
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, MyComponent, SuperDirective, ChildDir],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(foundQueryList!.length).toBe(2);
    });

    it('should inherit ViewChildren queries', () => {
      let foundQueryList: QueryList<ChildDir>;

      @Directive({selector: '[child-dir]'})
      class ChildDir {
      }

      @Directive({
        selector: '[super-dir]',
      })
      class SuperDirective {
        @ViewChildren(ChildDir) customDirs!: QueryList<ChildDir>;
      }

      @Component({
        selector: 'my-comp',
        template: `
          <ul>
            <li child-dir *ngFor="let item of items">{{item}}</li>
          </ul>
        `,
      })
      class MyComponent extends SuperDirective {
        items = [1, 2, 3, 4, 5];
        ngAfterViewInit() {
          foundQueryList = this.customDirs;
        }
      }

      @Component({
        template: `
        <my-comp></my-comp>
      `
      })
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, MyComponent, ChildDir, SuperDirective],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(foundQueryList!.length).toBe(5);
    });

    xdescribe(
        'what happens when...',
        () => {
            // TODO: sub has Input and super has Output on same property
            // TODO: sub has Input and super has HostBinding on same property
            // TODO: sub has Input and super has ViewChild on same property
            // TODO: sub has Input and super has ViewChildren on same property
            // TODO: sub has Input and super has ContentChild on same property
            // TODO: sub has Input and super has ContentChildren on same property
            // TODO: sub has Output and super has HostBinding on same property
            // TODO: sub has Output and super has ViewChild on same property
            // TODO: sub has Output and super has ViewChildren on same property
            // TODO: sub has Output and super has ContentChild on same property
            // TODO: sub has Output and super has ContentChildren on same property
            // TODO: sub has HostBinding and super has ViewChild on same property
            // TODO: sub has HostBinding and super has ViewChildren on same property
            // TODO: sub has HostBinding and super has ContentChild on same property
            // TODO: sub has HostBinding and super has ContentChildren on same property
            // TODO: sub has ViewChild and super has ViewChildren on same property
            // TODO: sub has ViewChild and super has ContentChild on same property
            // TODO: sub has ViewChild and super has ContentChildren on same property
            // TODO: sub has ViewChildren and super has ContentChild on same property
            // TODO: sub has ViewChildren and super has ContentChildren on same property
            // TODO: sub has ContentChild and super has ContentChildren on same property
        });
  });

  describe('of a directive inherited by a bare class and then by a component', () => {
    // TODO: Add tests for ContentChild
    // TODO: Add tests for ViewChild
    describe('lifecycle hooks', () => {
      const fired: string[] = [];

      @Directive({
        selector: '[super-dir]',
      })
      class SuperDirective {
        ngOnInit() {
          fired.push('super init');
        }
        ngOnDestroy() {
          fired.push('super destroy');
        }
        ngAfterContentInit() {
          fired.push('super after content init');
        }
        ngAfterContentChecked() {
          fired.push('super after content checked');
        }
        ngAfterViewInit() {
          fired.push('super after view init');
        }
        ngAfterViewChecked() {
          fired.push('super after view checked');
        }
        ngDoCheck() {
          fired.push('super do check');
        }
      }

      class BareClass extends SuperDirective {}

      beforeEach(() => fired.length = 0);

      it('ngOnInit', () => {
        @Component({selector: 'my-comp', template: `<p>test</p>`})
        class MyComponent extends BareClass {
          override ngOnInit() {
            fired.push('sub init');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'sub init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngDoCheck', () => {
        @Directive({
          selector: 'my-comp',
        })
        class MyComponent extends BareClass {
          override ngDoCheck() {
            fired.push('sub do check');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'sub do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterContentInit', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends BareClass {
          override ngAfterContentInit() {
            fired.push('sub after content init');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'sub after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterContentChecked', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends BareClass {
          override ngAfterContentChecked() {
            fired.push('sub after content checked');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'sub after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterViewInit', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends BareClass {
          override ngAfterViewInit() {
            fired.push('sub after view init');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'sub after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterViewChecked', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends BareClass {
          override ngAfterViewChecked() {
            fired.push('sub after view checked');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'sub after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngOnDestroy', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends BareClass {
          override ngOnDestroy() {
            fired.push('sub destroy');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'sub destroy',
        ]);
      });
    });

    describe('inputs', () => {
      // TODO: add test where the two inputs have a different alias
      // TODO: add test where super has an @Input() on the property, and sub does not
      // TODO: add test where super has an @Input('alias') on the property and sub has no alias

      it('should inherit inputs', () => {
        @Directive({
          selector: '[super-dir]',
        })
        class SuperDirective {
          @Input() foo = '';

          @Input() baz = '';
        }

        class BareClass extends SuperDirective {
          @Input() bar = '';
        }

        @Component({selector: 'my-comp', template: `<p>test</p>`})
        class MyComponent extends BareClass {
          @Input() override baz = '';

          @Input() qux = '';
        }

        @Component({template: `<my-comp [foo]="a" [bar]="b" [baz]="c" [qux]="d"></my-comp>`})
        class App {
          a = 'a';
          b = 'b';
          c = 'c';
          d = 'd';
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent, BareClass, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        const subDir: MyComponent =
            fixture.debugElement.query(By.directive(MyComponent)).componentInstance;

        expect(subDir.foo).toEqual('a');
        expect(subDir.bar).toEqual('b');
        expect(subDir.baz).toEqual('c');
        expect(subDir.qux).toEqual('d');
      });
    });

    describe('outputs', () => {
      // TODO: add tests where both sub and super have Output on same property with different
      // aliases
      // TODO: add test where super has property with alias and sub has property with no alias
      // TODO: add test where super has an @Input() on the property, and sub does not

      it('should inherit outputs', () => {
        @Directive({
          selector: '[super-dir]',
        })
        class SuperDirective {
          @Output() foo = new EventEmitter<string>();
        }

        class BareClass extends SuperDirective {}

        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends BareClass {
          ngOnInit() {
            this.foo.emit('test');
          }
        }

        @Component({
          template: `
          <my-comp (foo)="handleFoo($event)"></my-comp>
        `
        })
        class App {
          foo = '';

          handleFoo(event: string) {
            this.foo = event;
          }
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent, SuperDirective],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const app = fixture.componentInstance;

        expect(app.foo).toBe('test');
      });
    });

    describe('host bindings (style related)', () => {
      // TODO: sub and super HostBinding same property but different bindings
      // TODO: sub and super HostBinding same binding on two different properties
      it('should compose host bindings for styles', () => {
        @Directive({
          selector: '[super-dir]',
        })
        class SuperDirective {
          @HostBinding('style.color') color = 'red';

          @HostBinding('style.backgroundColor') bg = 'black';
        }

        class BareClass extends SuperDirective {}

        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends BareClass {
        }

        @Component({
          template: `
          <my-comp>test</my-comp>
        `
        })
        class App {
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const queryResult = fixture.debugElement.query(By.directive(MyComponent));

        expect(queryResult.nativeElement.tagName).toBe('MY-COMP');
        expect(queryResult.nativeElement.style.color).toBe('red');
        expect(queryResult.nativeElement.style.backgroundColor).toBe('black');
      });
    });

    describe('host bindings (non-style related)', () => {
      // TODO: sub and super HostBinding same property but different bindings
      // TODO: sub and super HostBinding same binding on two different properties
      it('should compose host bindings (non-style related)', () => {
        @Directive({
          selector: '[super-dir]',
        })
        class SuperDirective {
          @HostBinding('title')
          get boundTitle() {
            return this.superTitle + '!!!';
          }

          @Input() superTitle = '';
        }

        class BareClass extends SuperDirective {
          @HostBinding('accessKey')
          get boundAccessKey() {
            return this.superAccessKey + '???';
          }

          @Input() superAccessKey = '';
        }

        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends BareClass {
        }
        @Component({
          template: `
          <my-comp superTitle="test1" superAccessKey="test2">test</my-comp>
        `
        })
        class App {
        }

        TestBed.configureTestingModule({
          declarations: [App, SuperDirective, BareClass, MyComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const queryResult = fixture.debugElement.query(By.directive(MyComponent));

        expect(queryResult.nativeElement.title).toBe('test1!!!');
        expect(queryResult.nativeElement.accessKey).toBe('test2???');
      });
    });

    it('should inherit ContentChildren queries', () => {
      let foundQueryList: QueryList<ChildDir>;

      @Directive({selector: '[child-dir]'})
      class ChildDir {
      }

      @Directive({
        selector: '[super-dir]',
      })
      class SuperDirective {
        @ContentChildren(ChildDir) customDirs!: QueryList<ChildDir>;
      }

      class BareClass extends SuperDirective {}

      @Component({
        selector: 'my-comp',
        template: `<ul><ng-content></ng-content></ul>`,
      })
      class MyComponent extends BareClass {
        ngAfterViewInit() {
          foundQueryList = this.customDirs;
        }
      }

      @Component({
        template: `
        <my-comp>
          <li child-dir>one</li>
          <li child-dir>two</li>
        </my-comp>
      `
      })
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, MyComponent, ChildDir, SuperDirective],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(foundQueryList!.length).toBe(2);
    });

    it('should inherit ViewChildren queries', () => {
      let foundQueryList: QueryList<ChildDir>;

      @Directive({selector: '[child-dir]'})
      class ChildDir {
      }

      @Directive({
        selector: '[super-dir]',
      })
      class SuperDirective {
        @ViewChildren(ChildDir) customDirs!: QueryList<ChildDir>;
      }

      class BareClass extends SuperDirective {}

      @Component({
        selector: 'my-comp',
        template: `
          <ul>
            <li child-dir *ngFor="let item of items">{{item}}</li>
          </ul>
        `,
      })
      class MyComponent extends BareClass {
        items = [1, 2, 3, 4, 5];
        ngAfterViewInit() {
          foundQueryList = this.customDirs;
        }
      }

      @Component({
        template: `
        <my-comp></my-comp>
      `
      })
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, MyComponent, ChildDir, SuperDirective],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(foundQueryList!.length).toBe(5);
    });

    xdescribe(
        'what happens when...',
        () => {
            // TODO: sub has Input and super has Output on same property
            // TODO: sub has Input and super has HostBinding on same property
            // TODO: sub has Input and super has ViewChild on same property
            // TODO: sub has Input and super has ViewChildren on same property
            // TODO: sub has Input and super has ContentChild on same property
            // TODO: sub has Input and super has ContentChildren on same property
            // TODO: sub has Output and super has HostBinding on same property
            // TODO: sub has Output and super has ViewChild on same property
            // TODO: sub has Output and super has ViewChildren on same property
            // TODO: sub has Output and super has ContentChild on same property
            // TODO: sub has Output and super has ContentChildren on same property
            // TODO: sub has HostBinding and super has ViewChild on same property
            // TODO: sub has HostBinding and super has ViewChildren on same property
            // TODO: sub has HostBinding and super has ContentChild on same property
            // TODO: sub has HostBinding and super has ContentChildren on same property
            // TODO: sub has ViewChild and super has ViewChildren on same property
            // TODO: sub has ViewChild and super has ContentChild on same property
            // TODO: sub has ViewChild and super has ContentChildren on same property
            // TODO: sub has ViewChildren and super has ContentChild on same property
            // TODO: sub has ViewChildren and super has ContentChildren on same property
            // TODO: sub has ContentChild and super has ContentChildren on same property
        });
  });

  describe('of a component inherited by a component', () => {
    // TODO: Add tests for ContentChild
    // TODO: Add tests for ViewChild
    describe('lifecycle hooks', () => {
      const fired: string[] = [];

      @Component({
        selector: 'super-comp',
        template: `<p>super</p>`,
      })
      class SuperComponent {
        ngOnInit() {
          fired.push('super init');
        }
        ngOnDestroy() {
          fired.push('super destroy');
        }
        ngAfterContentInit() {
          fired.push('super after content init');
        }
        ngAfterContentChecked() {
          fired.push('super after content checked');
        }
        ngAfterViewInit() {
          fired.push('super after view init');
        }
        ngAfterViewChecked() {
          fired.push('super after view checked');
        }
        ngDoCheck() {
          fired.push('super do check');
        }
      }

      beforeEach(() => fired.length = 0);

      it('ngOnInit', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngOnInit() {
            fired.push('sub init');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'sub init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngDoCheck', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngDoCheck() {
            fired.push('sub do check');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'sub do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterContentInit', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngAfterContentInit() {
            fired.push('sub after content init');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'sub after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterContentChecked', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngAfterContentChecked() {
            fired.push('sub after content checked');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'sub after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterViewInit', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngAfterViewInit() {
            fired.push('sub after view init');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'sub after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterViewChecked', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngAfterViewChecked() {
            fired.push('sub after view checked');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'sub after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngOnDestroy', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngOnDestroy() {
            fired.push('sub destroy');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'sub destroy',
        ]);
      });
    });

    describe('inputs', () => {
      // TODO: add test where the two inputs have a different alias
      // TODO: add test where super has an @Input() on the property, and sub does not
      // TODO: add test where super has an @Input('alias') on the property and sub has no alias

      it('should inherit inputs', () => {
        @Component({
          selector: 'super-comp',
          template: `<p>super</p>`,
        })
        class SuperComponent {
          @Input() foo = '';

          @Input() bar = '';

          @Input() baz = '';
        }

        @Component({selector: 'my-comp', template: `<p>test</p>`})
        class MyComponent extends SuperComponent {
          @Input() override baz = '';

          @Input() qux = '';
        }

        @Component({template: `<my-comp [foo]="a" [bar]="b" [baz]="c" [qux]="d"></my-comp>`})
        class App {
          a = 'a';
          b = 'b';
          c = 'c';
          d = 'd';
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent, SuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        const subDir: MyComponent =
            fixture.debugElement.query(By.directive(MyComponent)).componentInstance;

        expect(subDir.foo).toEqual('a');
        expect(subDir.bar).toEqual('b');
        expect(subDir.baz).toEqual('c');
        expect(subDir.qux).toEqual('d');
      });
    });

    describe('outputs', () => {
      // TODO: add tests where both sub and super have Output on same property with different
      // aliases
      // TODO: add test where super has property with alias and sub has property with no alias
      // TODO: add test where super has an @Input() on the property, and sub does not

      it('should inherit outputs', () => {
        @Component({
          selector: 'super-comp',
          template: `<p>super</p>`,
        })
        class SuperComponent {
          @Output() foo = new EventEmitter<string>();
        }

        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          ngOnInit() {
            this.foo.emit('test');
          }
        }

        @Component({
          template: `
          <my-comp (foo)="handleFoo($event)"></my-comp>
        `
        })
        class App {
          foo = '';

          handleFoo(event: string) {
            this.foo = event;
          }
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent, SuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const app = fixture.componentInstance;

        expect(app.foo).toBe('test');
      });
    });

    describe('animations', () => {
      onlyInIvy('View Engine does not inherit `host` metadata from superclass')
          .it('should work with inherited host bindings and animations', () => {
            @Component({
              selector: 'super-comp',
              template: '<div>super-comp</div>',
              host: {
                '[@animation]': 'colorExp',
              },
              animations: [
                trigger('animation', [state('color', style({color: 'red'}))]),
              ],
            })
            class SuperComponent {
              colorExp = 'color';
            }

            @Component({
              selector: 'my-comp',
              template: `<div>my-comp</div>`,
            })
            class MyComponent extends SuperComponent {
            }

            @Component({
              template: '<my-comp>app</my-comp>',
            })
            class App {
            }

            TestBed.configureTestingModule({
              declarations: [App, MyComponent, SuperComponent],
              imports: [NoopAnimationsModule],
            });
            const fixture = TestBed.createComponent(App);
            fixture.detectChanges();
            const queryResult = fixture.debugElement.query(By.css('my-comp'));

            expect(queryResult.nativeElement.style.color).toBe('red');
          });

      onlyInIvy('View Engine does not inherit `host` metadata from superclass')
          .it('should compose animations (from super class)', () => {
            @Component({
              selector: 'super-comp',
              template: '...',
              animations: [
                trigger('animation1', [state('color', style({color: 'red'}))]),
                trigger('animation2', [state('opacity', style({opacity: '0.5'}))]),
              ],
            })
            class SuperComponent {
            }

            @Component({
              selector: 'my-comp',
              template: '<div>my-comp</div>',
              host: {
                '[@animation1]': 'colorExp',
                '[@animation2]': 'opacityExp',
                '[@animation3]': 'bgExp',
              },
              animations: [
                trigger('animation1', [state('color', style({color: 'blue'}))]),
                trigger('animation3', [state('bg', style({backgroundColor: 'green'}))]),
              ],
            })
            class MyComponent extends SuperComponent {
              colorExp = 'color';
              opacityExp = 'opacity';
              bgExp = 'bg';
            }

            @Component({
              template: '<my-comp>app</my-comp>',
            })
            class App {
            }

            TestBed.configureTestingModule({
              declarations: [App, MyComponent, SuperComponent],
              imports: [NoopAnimationsModule],
            });
            const fixture = TestBed.createComponent(App);
            fixture.detectChanges();
            const queryResult = fixture.debugElement.query(By.css('my-comp'));

            expect(queryResult.nativeElement.style.color).toBe('blue');
            expect(queryResult.nativeElement.style.opacity).toBe('0.5');
            expect(queryResult.nativeElement.style.backgroundColor).toBe('green');
          });
    });

    describe('host bindings (style related)', () => {
      // TODO: sub and super HostBinding same property but different bindings
      // TODO: sub and super HostBinding same binding on two different properties
      it('should compose host bindings for styles', () => {
        @Component({
          selector: 'super-comp',
          template: `<p>super</p>`,
        })
        class SuperComponent {
          @HostBinding('style.color') color = 'red';

          @HostBinding('style.backgroundColor') bg = 'black';
        }

        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
        }

        @Component({
          template: `
          <my-comp>test</my-comp>
        `
        })
        class App {
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent, SuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const queryResult = fixture.debugElement.query(By.directive(MyComponent));

        expect(queryResult.nativeElement.tagName).toBe('MY-COMP');
        expect(queryResult.nativeElement.style.color).toBe('red');
        expect(queryResult.nativeElement.style.backgroundColor).toBe('black');
      });
    });

    describe('host bindings (non-style related)', () => {
      // TODO: sub and super HostBinding same property but different bindings
      // TODO: sub and super HostBinding same binding on two different properties
      it('should compose host bindings (non-style related)', () => {
        @Component({
          selector: 'super-comp',
          template: `<p>super</p>`,
        })
        class SuperComponent {
          @HostBinding('title')
          get boundTitle() {
            return this.superTitle + '!!!';
          }

          @Input() superTitle = '';
        }

        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
        }
        @Component({
          template: `
        <my-comp superTitle="test">test</my-comp>
      `
        })
        class App {
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const queryResult = fixture.debugElement.query(By.directive(MyComponent));

        expect(queryResult.nativeElement.title).toBe('test!!!');
      });
    });

    it('should inherit ContentChildren queries', () => {
      let foundQueryList: QueryList<ChildDir>;

      @Directive({selector: '[child-dir]'})
      class ChildDir {
      }

      @Component({
        selector: 'super-comp',
        template: `<p>super</p>`,
      })
      class SuperComponent {
        @ContentChildren(ChildDir) customDirs!: QueryList<ChildDir>;
      }

      @Component({
        selector: 'my-comp',
        template: `<ul><ng-content></ng-content></ul>`,
      })
      class MyComponent extends SuperComponent {
        ngAfterViewInit() {
          foundQueryList = this.customDirs;
        }
      }

      @Component({
        template: `
        <my-comp>
          <li child-dir>one</li>
          <li child-dir>two</li>
        </my-comp>
      `
      })
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, MyComponent, SuperComponent, ChildDir],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(foundQueryList!.length).toBe(2);
    });

    it('should inherit ViewChildren queries', () => {
      let foundQueryList: QueryList<ChildDir>;

      @Directive({selector: '[child-dir]'})
      class ChildDir {
      }

      @Component({
        selector: 'super-comp',
        template: `<p>super</p>`,
      })
      class SuperComponent {
        @ViewChildren(ChildDir) customDirs!: QueryList<ChildDir>;
      }

      @Component({
        selector: 'my-comp',
        template: `
          <ul>
            <li child-dir *ngFor="let item of items">{{item}}</li>
          </ul>
        `,
      })
      class MyComponent extends SuperComponent {
        items = [1, 2, 3, 4, 5];
        ngAfterViewInit() {
          foundQueryList = this.customDirs;
        }
      }

      @Component({
        template: `
        <my-comp></my-comp>
      `
      })
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, MyComponent, ChildDir, SuperComponent],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(foundQueryList!.length).toBe(5);
    });

    it('should inherit host listeners from base class once', () => {
      const events: string[] = [];

      @Component({
        selector: 'app-base',
        template: 'base',
      })
      class BaseComponent {
        @HostListener('click')
        clicked() {
          events.push('BaseComponent.clicked');
        }
      }

      @Component({
        selector: 'app-child',
        template: 'child',
      })
      class ChildComponent extends BaseComponent {
        // additional host listeners are defined here to have `hostBindings` function generated on
        // component def, which would trigger `hostBindings` functions merge operation in
        // InheritDefinitionFeature logic (merging Child and Base host binding functions)
        @HostListener('focus')
        focused() {
        }

        override clicked() {
          events.push('ChildComponent.clicked');
        }
      }

      @Component({
        selector: 'app-grand-child',
        template: 'grand-child',
      })
      class GrandChildComponent extends ChildComponent {
        // additional host listeners are defined here to have `hostBindings` function generated on
        // component def, which would trigger `hostBindings` functions merge operation in
        // InheritDefinitionFeature logic (merging GrandChild and Child host binding functions)
        @HostListener('blur')
        blurred() {
        }

        override clicked() {
          events.push('GrandChildComponent.clicked');
        }
      }

      @Component({
        selector: 'root-app',
        template: `
          <app-base></app-base>
          <app-child></app-child>
          <app-grand-child></app-grand-child>
        `,
      })
      class RootApp {
      }

      const components = [BaseComponent, ChildComponent, GrandChildComponent];
      TestBed.configureTestingModule({
        declarations: [RootApp, ...components],
      });
      const fixture = TestBed.createComponent(RootApp);
      fixture.detectChanges();

      components.forEach(component => {
        fixture.debugElement.query(By.directive(component)).nativeElement.click();
      });
      expect(events).toEqual(
          ['BaseComponent.clicked', 'ChildComponent.clicked', 'GrandChildComponent.clicked']);
    });

    xdescribe(
        'what happens when...',
        () => {
            // TODO: sub has Input and super has Output on same property
            // TODO: sub has Input and super has HostBinding on same property
            // TODO: sub has Input and super has ViewChild on same property
            // TODO: sub has Input and super has ViewChildren on same property
            // TODO: sub has Input and super has ContentChild on same property
            // TODO: sub has Input and super has ContentChildren on same property
            // TODO: sub has Output and super has HostBinding on same property
            // TODO: sub has Output and super has ViewChild on same property
            // TODO: sub has Output and super has ViewChildren on same property
            // TODO: sub has Output and super has ContentChild on same property
            // TODO: sub has Output and super has ContentChildren on same property
            // TODO: sub has HostBinding and super has ViewChild on same property
            // TODO: sub has HostBinding and super has ViewChildren on same property
            // TODO: sub has HostBinding and super has ContentChild on same property
            // TODO: sub has HostBinding and super has ContentChildren on same property
            // TODO: sub has ViewChild and super has ViewChildren on same property
            // TODO: sub has ViewChild and super has ContentChild on same property
            // TODO: sub has ViewChild and super has ContentChildren on same property
            // TODO: sub has ViewChildren and super has ContentChild on same property
            // TODO: sub has ViewChildren and super has ContentChildren on same property
            // TODO: sub has ContentChild and super has ContentChildren on same property
        });
  });

  describe('of a component inherited by a bare class then by a component', () => {
    // TODO: Add tests for ContentChild
    // TODO: Add tests for ViewChild
    describe('lifecycle hooks', () => {
      const fired: string[] = [];

      @Component({
        selector: 'super-comp',
        template: `<p>super</p>`,
      })
      class SuperSuperComponent {
        ngOnInit() {
          fired.push('super init');
        }
        ngOnDestroy() {
          fired.push('super destroy');
        }
        ngAfterContentInit() {
          fired.push('super after content init');
        }
        ngAfterContentChecked() {
          fired.push('super after content checked');
        }
        ngAfterViewInit() {
          fired.push('super after view init');
        }
        ngAfterViewChecked() {
          fired.push('super after view checked');
        }
        ngDoCheck() {
          fired.push('super do check');
        }
      }

      class SuperComponent extends SuperSuperComponent {}

      beforeEach(() => fired.length = 0);

      it('ngOnInit', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngOnInit() {
            fired.push('sub init');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'sub init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngDoCheck', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngDoCheck() {
            fired.push('sub do check');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'sub do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterContentInit', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngAfterContentInit() {
            fired.push('sub after content init');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'sub after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterContentChecked', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngAfterContentChecked() {
            fired.push('sub after content checked');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'sub after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterViewInit', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngAfterViewInit() {
            fired.push('sub after view init');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'sub after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngAfterViewChecked', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngAfterViewChecked() {
            fired.push('sub after view checked');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'sub after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'super destroy',
        ]);
      });

      it('ngOnDestroy', () => {
        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          override ngOnDestroy() {
            fired.push('sub destroy');
          }
        }

        @Component({
          template: `<my-comp *ngIf="showing"></my-comp>`,
        })
        class App {
          showing = true;
        }

        TestBed.configureTestingModule({
          declarations: [MyComponent, App, SuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        expect(fired).toEqual([
          'super init',
          'super do check',
          'super after content init',
          'super after content checked',
          'super after view init',
          'super after view checked',
        ]);

        fired.length = 0;
        fixture.componentInstance.showing = false;
        fixture.detectChanges();

        expect(fired).toEqual([
          'sub destroy',
        ]);
      });
    });

    describe('inputs', () => {
      // TODO: add test where the two inputs have a different alias
      // TODO: add test where super has an @Input() on the property, and sub does not
      // TODO: add test where super has an @Input('alias') on the property and sub has no alias

      it('should inherit inputs', () => {
        @Component({
          selector: 'super-comp',
          template: `<p>super</p>`,
        })
        class SuperSuperComponent {
          @Input() foo = '';

          @Input() baz = '';
        }

        class BareClass extends SuperSuperComponent {
          @Input() bar = '';
        }

        @Component({selector: 'my-comp', template: `<p>test</p>`})
        class MyComponent extends BareClass {
          @Input() override baz = '';

          @Input() qux = '';
        }

        @Component({template: `<my-comp [foo]="a" [bar]="b" [baz]="c" [qux]="d"></my-comp>`})
        class App {
          a = 'a';
          b = 'b';
          c = 'c';
          d = 'd';
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent, SuperSuperComponent, BareClass],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();

        const myComp: MyComponent =
            fixture.debugElement.query(By.directive(MyComponent)).componentInstance;

        expect(myComp.foo).toEqual('a');
        expect(myComp.bar).toEqual('b');
        expect(myComp.baz).toEqual('c');
        expect(myComp.qux).toEqual('d');
      });
    });

    describe('outputs', () => {
      // TODO: add tests where both sub and super have Output on same property with different
      // aliases
      // TODO: add test where super has property with alias and sub has property with no alias
      // TODO: add test where super has an @Input() on the property, and sub does not

      it('should inherit outputs', () => {
        @Component({
          selector: 'super-comp',
          template: `<p>super</p>`,
        })
        class SuperSuperComponent {
          @Output() foo = new EventEmitter<string>();
        }

        class SuperComponent extends SuperSuperComponent {
          @Output() bar = new EventEmitter<string>();
        }

        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
          ngOnInit() {
            this.foo.emit('test1');
            this.bar.emit('test2');
          }
        }

        @Component({
          template: `
          <my-comp (foo)="handleFoo($event)" (bar)="handleBar($event)"></my-comp>
        `
        })
        class App {
          foo = '';

          handleFoo(event: string) {
            this.foo = event;
          }

          bar = '';

          handleBar(event: string) {
            this.bar = event;
          }
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent, SuperComponent, SuperSuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const app = fixture.componentInstance;

        expect(app.foo).toBe('test1');
        expect(app.bar).toBe('test2');
      });
    });

    describe('animations', () => {
      onlyInIvy('View Engine does not inherit `host` metadata from superclass')
          .it('should compose animations across multiple inheritance levels', () => {
            @Component({
              selector: 'super-comp',
              template: '...',
              host: {
                '[@animation1]': 'colorExp',
                '[@animation2]': 'opacityExp',
              },
              animations: [
                trigger('animation1', [state('color', style({color: 'red'}))]),
                trigger('animation2', [state('opacity', style({opacity: '0.5'}))]),
              ],
            })
            class SuperComponent {
              colorExp = 'color';
              opacityExp = 'opacity';
            }

            @Component({
              selector: 'intermediate-comp',
              template: '...',
            })
            class IntermediateComponent extends SuperComponent {
            }

            @Component({
              selector: 'my-comp',
              template: '<div>my-comp</div>',
              host: {
                '[@animation1]': 'colorExp',
                '[@animation3]': 'bgExp',
              },
              animations: [
                trigger('animation1', [state('color', style({color: 'blue'}))]),
                trigger('animation3', [state('bg', style({backgroundColor: 'green'}))]),
              ],
            })
            class MyComponent extends IntermediateComponent {
              override colorExp = 'color';
              override opacityExp = 'opacity';
              bgExp = 'bg';
            }

            @Component({
              template: '<my-comp>app</my-comp>',
            })
            class App {
            }

            TestBed.configureTestingModule({
              declarations: [App, MyComponent, IntermediateComponent, SuperComponent],
              imports: [NoopAnimationsModule],
            });
            const fixture = TestBed.createComponent(App);
            fixture.detectChanges();
            const queryResult = fixture.debugElement.query(By.css('my-comp'));

            expect(queryResult.nativeElement.style.color).toBe('blue');
            expect(queryResult.nativeElement.style.opacity).toBe('0.5');
            expect(queryResult.nativeElement.style.backgroundColor).toBe('green');
          });
    });
    describe('host bindings (style related)', () => {
      // TODO: sub and super HostBinding same property but different bindings
      // TODO: sub and super HostBinding same binding on two different properties
      it('should compose host bindings for styles', () => {
        @Component({
          selector: 'super-comp',
          template: `<p>super</p>`,
        })
        class SuperSuperComponent {
          @HostBinding('style.color') color = 'red';
        }

        class SuperComponent extends SuperSuperComponent {
          @HostBinding('style.backgroundColor') bg = 'black';
        }

        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
        }

        @Component({
          template: `
          <my-comp>test</my-comp>
        `
        })
        class App {
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent, SuperComponent, SuperSuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const queryResult = fixture.debugElement.query(By.directive(MyComponent));

        expect(queryResult.nativeElement.tagName).toBe('MY-COMP');
        expect(queryResult.nativeElement.style.color).toBe('red');
        expect(queryResult.nativeElement.style.backgroundColor).toBe('black');
      });
    });

    describe('host bindings (non-style related)', () => {
      // TODO: sub and super HostBinding same property but different bindings
      // TODO: sub and super HostBinding same binding on two different properties
      it('should compose host bindings (non-style related)', () => {
        @Component({
          selector: 'super-comp',
          template: `<p>super</p>`,
        })
        class SuperSuperComponent {
          @HostBinding('title')
          get boundTitle() {
            return this.superTitle + '!!!';
          }

          @Input() superTitle = '';
        }

        class SuperComponent extends SuperSuperComponent {
          @HostBinding('accessKey')
          get boundAccessKey() {
            return this.superAccessKey + '???';
          }

          @Input() superAccessKey = '';
        }

        @Component({
          selector: 'my-comp',
          template: `<p>test</p>`,
        })
        class MyComponent extends SuperComponent {
        }
        @Component({
          template: `
          <my-comp superTitle="test1" superAccessKey="test2">test</my-comp>
        `
        })
        class App {
        }

        TestBed.configureTestingModule({
          declarations: [App, MyComponent, SuperComponent, SuperSuperComponent],
        });
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const queryResult = fixture.debugElement.query(By.directive(MyComponent));

        expect(queryResult.nativeElement.tagName).toBe('MY-COMP');
        expect(queryResult.nativeElement.title).toBe('test1!!!');
        expect(queryResult.nativeElement.accessKey).toBe('test2???');
      });
    });

    it('should inherit ContentChildren queries', () => {
      let foundQueryList: QueryList<ChildDir>;

      @Directive({selector: '[child-dir]'})
      class ChildDir {
      }

      @Component({
        selector: 'super-comp',
        template: `<p>super</p>`,
      })
      class SuperComponent {
        @ContentChildren(ChildDir) customDirs!: QueryList<ChildDir>;
      }

      @Component({
        selector: 'my-comp',
        template: `<ul><ng-content></ng-content></ul>`,
      })
      class MyComponent extends SuperComponent {
        ngAfterViewInit() {
          foundQueryList = this.customDirs;
        }
      }

      @Component({
        template: `
        <my-comp>
          <li child-dir>one</li>
          <li child-dir>two</li>
        </my-comp>
      `
      })
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, MyComponent, SuperComponent, ChildDir],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(foundQueryList!.length).toBe(2);
    });

    it('should inherit ViewChildren queries', () => {
      let foundQueryList: QueryList<ChildDir>;

      @Directive({selector: '[child-dir]'})
      class ChildDir {
      }

      @Component({
        selector: 'super-comp',
        template: `<p>super</p>`,
      })
      class SuperComponent {
        @ViewChildren(ChildDir) customDirs!: QueryList<ChildDir>;
      }

      @Component({
        selector: 'my-comp',
        template: `
          <ul>
            <li child-dir *ngFor="let item of items">{{item}}</li>
          </ul>
        `,
      })
      class MyComponent extends SuperComponent {
        items = [1, 2, 3, 4, 5];
        ngAfterViewInit() {
          foundQueryList = this.customDirs;
        }
      }

      @Component({
        template: `
        <my-comp></my-comp>
      `
      })
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, MyComponent, ChildDir, SuperComponent],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(foundQueryList!.length).toBe(5);
    });

    xdescribe(
        'what happens when...',
        () => {
            // TODO: sub has Input and super has Output on same property
            // TODO: sub has Input and super has HostBinding on same property
            // TODO: sub has Input and super has ViewChild on same property
            // TODO: sub has Input and super has ViewChildren on same property
            // TODO: sub has Input and super has ContentChild on same property
            // TODO: sub has Input and super has ContentChildren on same property
            // TODO: sub has Output and super has HostBinding on same property
            // TODO: sub has Output and super has ViewChild on same property
            // TODO: sub has Output and super has ViewChildren on same property
            // TODO: sub has Output and super has ContentChild on same property
            // TODO: sub has Output and super has ContentChildren on same property
            // TODO: sub has HostBinding and super has ViewChild on same property
            // TODO: sub has HostBinding and super has ViewChildren on same property
            // TODO: sub has HostBinding and super has ContentChild on same property
            // TODO: sub has HostBinding and super has ContentChildren on same property
            // TODO: sub has ViewChild and super has ViewChildren on same property
            // TODO: sub has ViewChild and super has ContentChild on same property
            // TODO: sub has ViewChild and super has ContentChildren on same property
            // TODO: sub has ViewChildren and super has ContentChild on same property
            // TODO: sub has ViewChildren and super has ContentChildren on same property
            // TODO: sub has ContentChild and super has ContentChildren on same property
        });
  });
});
