/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  Directive,
  DoCheck,
  ElementRef,
  EventEmitter,
  inject,
  InjectionToken,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  provideZoneChangeDetection,
  QueryList,
  SimpleChanges,
  Type,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
  ViewEncapsulation,
  ɵNG_COMP_DEF,
  ɵɵreplaceMetadata,
  ɵɵsetComponentScope,
} from '../../src/core';
import {TestBed} from '../../testing';
import {compileComponent} from '../../src/render3/jit/directive';
import {angularCoreEnv} from '../../src/render3/jit/environment';
import {clearTranslations, loadTranslations} from '@angular/localize';
import {computeMsgId} from '@angular/compiler';
import {EVENT_MANAGER_PLUGINS} from '@angular/platform-browser';
import {ComponentType} from '../../src/render3';
import {isNode} from '@angular/private/testing';

describe('hot module replacement', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
    });
  });
  it('should recreate a single usage of a basic component', () => {
    let instance!: ChildCmp;
    const initialMetadata: Component = {
      selector: 'child-cmp',
      template: 'Hello <strong>{{state}}</strong>',
    };

    @Component(initialMetadata)
    class ChildCmp {
      state = 0;

      constructor() {
        instance = this;
      }
    }

    @Component({
      imports: [ChildCmp],
      template: '<child-cmp/>',
    })
    class RootCmp {}

    const fixture = TestBed.createComponent(RootCmp);
    fixture.detectChanges();
    markNodesAsCreatedInitially(fixture.nativeElement);

    expectHTML(
      fixture.nativeElement,
      `
        <child-cmp>
          Hello <strong>0</strong>
        </child-cmp>
      `,
    );

    instance.state = 1;
    fixture.detectChanges();
    expectHTML(
      fixture.nativeElement,
      `
        <child-cmp>
          Hello <strong>1</strong>
        </child-cmp>
      `,
    );

    replaceMetadata(ChildCmp, {
      ...initialMetadata,
      template: `Changed <strong>{{state}}</strong>!`,
    });
    fixture.detectChanges();

    const recreatedNodes = childrenOf(...fixture.nativeElement.querySelectorAll('child-cmp'));
    verifyNodesRemainUntouched(fixture.nativeElement, recreatedNodes);
    verifyNodesWereRecreated(recreatedNodes);

    expectHTML(
      fixture.nativeElement,
      `
        <child-cmp>
          Changed <strong>1</strong>!
        </child-cmp>
      `,
    );
  });

  it('should recreate multiple usages of a complex component', () => {
    const initialMetadata: Component = {
      selector: 'child-cmp',
      template: '<span>ChildCmp (orig)</span><h1>{{ text }}</h1>',
    };

    @Component(initialMetadata)
    class ChildCmp {
      @Input() text = '[empty]';
    }

    @Component({
      imports: [ChildCmp],
      template: `
        <i>Unrelated node #1</i>
        <child-cmp text="A"/>
        <u>Unrelated node #2</u>
        <child-cmp text="B"/>
        <b>Unrelated node #3</b>
        <main>
          <child-cmp text="C"/>
        </main>
      `,
    })
    class RootCmp {}

    const fixture = TestBed.createComponent(RootCmp);
    fixture.detectChanges();
    markNodesAsCreatedInitially(fixture.nativeElement);

    expectHTML(
      fixture.nativeElement,
      `
        <i>Unrelated node #1</i>
        <child-cmp text="A">
          <span>ChildCmp (orig)</span><h1>A</h1>
        </child-cmp>
        <u>Unrelated node #2</u>
        <child-cmp text="B">
          <span>ChildCmp (orig)</span><h1>B</h1>
        </child-cmp>
        <b>Unrelated node #3</b>
        <main>
          <child-cmp text="C">
            <span>ChildCmp (orig)</span><h1>C</h1>
          </child-cmp>
        </main>
      `,
    );

    replaceMetadata(ChildCmp, {
      ...initialMetadata,
      template: `
        <p title="extra attr">ChildCmp (hmr)</p>
        <h2>{{ text }}</h2>
        <div>Extra node!</div>
      `,
    });
    fixture.detectChanges();

    const recreatedNodes = childrenOf(...fixture.nativeElement.querySelectorAll('child-cmp'));
    verifyNodesRemainUntouched(fixture.nativeElement, recreatedNodes);
    verifyNodesWereRecreated(recreatedNodes);

    expectHTML(
      fixture.nativeElement,
      `
        <i>Unrelated node #1</i>
        <child-cmp text="A">
          <p title="extra attr">ChildCmp (hmr)</p>
          <h2>A</h2>
          <div>Extra node!</div>
        </child-cmp>
        <u>Unrelated node #2</u>
        <child-cmp text="B">
          <p title="extra attr">ChildCmp (hmr)</p>
          <h2>B</h2>
          <div>Extra node!</div>
        </child-cmp>
        <b>Unrelated node #3</b>
        <main>
          <child-cmp text="C">
            <p title="extra attr">ChildCmp (hmr)</p>
            <h2>C</h2>
            <div>Extra node!</div>
          </child-cmp>
        </main>
      `,
    );
  });

  it('should not recreate sub-classes of a component being replaced', () => {
    const initialMetadata: Component = {
      selector: 'child-cmp',
      template: 'Base class',
    };

    @Component(initialMetadata)
    class ChildCmp {}

    @Component({
      selector: 'child-sub-cmp',
      template: 'Sub class',
    })
    class ChildSubCmp extends ChildCmp {}

    @Component({
      imports: [ChildCmp, ChildSubCmp],
      template: `<child-cmp/>|<child-sub-cmp/>`,
    })
    class RootCmp {}

    const fixture = TestBed.createComponent(RootCmp);
    fixture.detectChanges();

    expectHTML(
      fixture.nativeElement,
      `
        <child-cmp>Base class</child-cmp>|
        <child-sub-cmp>Sub class</child-sub-cmp>
      `,
    );

    replaceMetadata(ChildCmp, {
      ...initialMetadata,
      template: `Replaced!`,
    });
    fixture.detectChanges();

    expectHTML(
      fixture.nativeElement,
      `
        <child-cmp>Replaced!</child-cmp>|
        <child-sub-cmp>Sub class</child-sub-cmp>
      `,
    );
  });

  it('should replace a component using shadow DOM encapsulation', () => {
    // Domino doesn't support shadow DOM.
    if (isNode) {
      return;
    }

    let instance!: ChildCmp;
    const initialMetadata: Component = {
      encapsulation: ViewEncapsulation.ShadowDom,
      selector: 'child-cmp',
      template: 'Hello <strong>{{state}}</strong>',
      styles: `strong {color: red;}`,
    };

    @Component(initialMetadata)
    class ChildCmp {
      state = 0;

      constructor() {
        instance = this;
      }
    }

    @Component({
      imports: [ChildCmp],
      template: '<child-cmp/>',
    })
    class RootCmp {}

    const fixture = TestBed.createComponent(RootCmp);
    fixture.detectChanges();
    const getShadowRoot = () => fixture.nativeElement.querySelector('child-cmp').shadowRoot;

    markNodesAsCreatedInitially(getShadowRoot());
    expectHTML(getShadowRoot(), `<style>strong {color: red;}</style>Hello <strong>0</strong>`);

    instance.state = 1;
    fixture.detectChanges();
    expectHTML(getShadowRoot(), `<style>strong {color: red;}</style>Hello <strong>1</strong>`);

    replaceMetadata(ChildCmp, {
      ...initialMetadata,
      template: `Changed <strong>{{state}}</strong>!`,
      styles: `strong {background: pink;}`,
    });
    fixture.detectChanges();

    verifyNodesWereRecreated([
      fixture.nativeElement.querySelector('child-cmp'),
      ...childrenOf(getShadowRoot()),
    ]);

    expectHTML(
      getShadowRoot(),
      `<style>strong {background: pink;}</style>Changed <strong>1</strong>!`,
    );
  });

  it('should continue binding inputs to a component that is replaced', () => {
    const initialMetadata: Component = {
      selector: 'child-cmp',
      template: '<span>{{staticValue}}</span><strong>{{dynamicValue}}</strong>',
    };

    @Component(initialMetadata)
    class ChildCmp {
      @Input() staticValue = '0';
      @Input() dynamicValue = '0';
    }

    @Component({
      imports: [ChildCmp],
      template: `<child-cmp staticValue="1" [dynamicValue]="dynamicValue"/>`,
    })
    class RootCmp {
      dynamicValue = '1';
    }

    const fixture = TestBed.createComponent(RootCmp);
    fixture.detectChanges();

    expectHTML(
      fixture.nativeElement,
      `
        <child-cmp staticvalue="1">
          <span>1</span>
          <strong>1</strong>
        </child-cmp>
      `,
    );

    fixture.componentInstance.dynamicValue = '2';
    fixture.detectChanges();
    expectHTML(
      fixture.nativeElement,
      `
        <child-cmp staticvalue="1">
          <span>1</span>
          <strong>2</strong>
        </child-cmp>
      `,
    );

    replaceMetadata(ChildCmp, {
      ...initialMetadata,
      template: `
        <main>
          <span>{{staticValue}}</span>
          <strong>{{dynamicValue}}</strong>
        </main>
      `,
    });
    fixture.detectChanges();
    expectHTML(
      fixture.nativeElement,
      `
        <child-cmp staticvalue="1">
          <main>
            <span>1</span>
            <strong>2</strong>
          </main>
        </child-cmp>
      `,
    );

    fixture.componentInstance.dynamicValue = '3';
    fixture.detectChanges();
    expectHTML(
      fixture.nativeElement,
      `
        <child-cmp staticvalue="1">
          <main>
            <span>1</span>
            <strong>3</strong>
          </main>
        </child-cmp>
      `,
    );
  });

  it('should recreate a component used inside @for', () => {
    const initialMetadata: Component = {
      selector: 'child-cmp',
      template: 'Hello <strong>{{value}}</strong>',
    };

    @Component(initialMetadata)
    class ChildCmp {
      @Input() value = '[empty]';
    }

    @Component({
      imports: [ChildCmp],
      template: `
        @for (current of items; track current.id) {
          <child-cmp [value]="current.name"/>
          <hr>
        }
      `,
    })
    class RootCmp {
      items = [
        {name: 'A', id: 1},
        {name: 'B', id: 2},
        {name: 'C', id: 3},
      ];
    }

    const fixture = TestBed.createComponent(RootCmp);
    fixture.detectChanges();
    markNodesAsCreatedInitially(fixture.nativeElement);

    expectHTML(
      fixture.nativeElement,
      `
        <child-cmp>Hello <strong>A</strong></child-cmp>
        <hr>
        <child-cmp>Hello <strong>B</strong></child-cmp>
        <hr>
        <child-cmp>Hello <strong>C</strong></child-cmp>
        <hr>
      `,
    );

    replaceMetadata(ChildCmp, {
      ...initialMetadata,
      template: `Changed <strong>{{value}}</strong>!`,
    });
    fixture.detectChanges();

    let recreatedNodes = childrenOf(...fixture.nativeElement.querySelectorAll('child-cmp'));
    verifyNodesRemainUntouched(fixture.nativeElement, recreatedNodes);
    verifyNodesWereRecreated(recreatedNodes);

    expectHTML(
      fixture.nativeElement,
      `
        <child-cmp>Changed <strong>A</strong>!</child-cmp>
        <hr>
        <child-cmp>Changed <strong>B</strong>!</child-cmp>
        <hr>
        <child-cmp>Changed <strong>C</strong>!</child-cmp>
        <hr>
      `,
    );

    fixture.componentInstance.items.pop();
    fixture.detectChanges();

    expectHTML(
      fixture.nativeElement,
      `
        <child-cmp>Changed <strong>A</strong>!</child-cmp>
        <hr>
        <child-cmp>Changed <strong>B</strong>!</child-cmp>
        <hr>
      `,
    );
    recreatedNodes = childrenOf(...fixture.nativeElement.querySelectorAll('child-cmp'));
    verifyNodesRemainUntouched(fixture.nativeElement, recreatedNodes);
    verifyNodesWereRecreated(recreatedNodes);
  });

  it('should be able to replace a component that injects ViewContainerRef', () => {
    const initialMetadata: Component = {
      selector: 'child-cmp',
      template: 'Hello <strong>world</strong>',
    };

    @Component(initialMetadata)
    class ChildCmp {
      vcr = inject(ViewContainerRef);
    }

    @Component({
      imports: [ChildCmp],
      template: '<child-cmp/>',
    })
    class RootCmp {}

    const fixture = TestBed.createComponent(RootCmp);
    fixture.detectChanges();
    markNodesAsCreatedInitially(fixture.nativeElement);

    expectHTML(
      fixture.nativeElement,
      `
        <child-cmp>
          Hello <strong>world</strong>
        </child-cmp>
      `,
    );

    replaceMetadata(ChildCmp, {
      ...initialMetadata,
      template: `Hello <i>Bob</i>!`,
    });
    fixture.detectChanges();

    const recreatedNodes = childrenOf(...fixture.nativeElement.querySelectorAll('child-cmp'));
    verifyNodesRemainUntouched(fixture.nativeElement, recreatedNodes);
    verifyNodesWereRecreated(recreatedNodes);

    expectHTML(
      fixture.nativeElement,
      `
        <child-cmp>
          Hello <i>Bob</i>!
        </child-cmp>
      `,
    );
  });

  it('should carry over dependencies defined by setComponentScope', () => {
    // In some cases the AoT compiler produces a `setComponentScope` for non-standalone
    // components. We simulate it here by declaring two components that are not standalone
    // and manually calling `setComponentScope`.
    @Component({selector: 'child-cmp', template: 'hello', standalone: false})
    class ChildCmp {}

    @Component({template: 'Initial <child-cmp/>', standalone: false})
    class RootCmp {}

    ɵɵsetComponentScope(RootCmp as ComponentType<RootCmp>, [ChildCmp], []);

    const fixture = TestBed.createComponent(RootCmp);
    fixture.detectChanges();
    markNodesAsCreatedInitially(fixture.nativeElement);
    expectHTML(fixture.nativeElement, 'Initial <child-cmp>hello</child-cmp>');

    replaceMetadata(RootCmp, {
      standalone: false,
      template: 'Changed <child-cmp/>',
    });
    fixture.detectChanges();

    const recreatedNodes = childrenOf(fixture.nativeElement);
    verifyNodesRemainUntouched(fixture.nativeElement, recreatedNodes);
    verifyNodesWereRecreated(recreatedNodes);

    expectHTML(fixture.nativeElement, 'Changed <child-cmp>hello</child-cmp>');
  });

  describe('queries', () => {
    it('should update ViewChildren query results', async () => {
      @Component({
        selector: 'child-cmp',
        template: '<span>ChildCmp {{ text }}</span>',
      })
      class ChildCmp {
        @Input() text = '[empty]';
      }

      let instance!: ParentCmp;
      const initialMetadata: Component = {
        selector: 'parent-cmp',
        imports: [ChildCmp],
        template: `
          <child-cmp text="A"/>
          <child-cmp text="B"/>
        `,
      };

      @Component(initialMetadata)
      class ParentCmp {
        @ViewChildren(ChildCmp) childCmps!: QueryList<ChildCmp>;

        constructor() {
          instance = this;
        }
      }

      @Component({
        imports: [ParentCmp],
        template: `<parent-cmp/>`,
      })
      class RootCmp {}

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      const initialComps = instance.childCmps.toArray().slice();
      expect(initialComps.length).toBe(2);

      replaceMetadata(ParentCmp, {
        ...initialMetadata,
        template: `
          <child-cmp text="A"/>
          <child-cmp text="B"/>
          <child-cmp text="C"/>
          <child-cmp text="D"/>
        `,
      });
      fixture.detectChanges();

      expect(instance.childCmps.length).toBe(4);
      expect(instance.childCmps.toArray().every((c) => !initialComps.includes(c))).toBe(true);
    });

    it('should update ViewChild when the string points to a different element', async () => {
      let instance!: ParentCmp;
      const initialMetadata: Component = {
        selector: 'parent-cmp',
        template: `
          <div>
            <span>
              <strong #ref></strong>
            </span>
          </div>
        `,
      };

      @Component(initialMetadata)
      class ParentCmp {
        @ViewChild('ref') ref!: ElementRef<HTMLElement>;

        constructor() {
          instance = this;
        }
      }

      @Component({
        imports: [ParentCmp],
        template: `<parent-cmp/>`,
      })
      class RootCmp {}

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      expect(instance.ref.nativeElement.tagName).toBe('STRONG');

      replaceMetadata(ParentCmp, {
        ...initialMetadata,
        template: `
          <div>
            <span>
              <strong></strong>
            </span>
          </div>

          <main>
            <span #ref></span>
          </main>
        `,
      });
      fixture.detectChanges();

      expect(instance.ref.nativeElement.tagName).toBe('SPAN');
    });

    it('should update ViewChild when the injection token points to a different directive', async () => {
      const token = new InjectionToken<DirA | DirB>('token');

      @Directive({
        selector: '[dir-a]',
        providers: [{provide: token, useExisting: DirA}],
      })
      class DirA {}

      @Directive({
        selector: '[dir-b]',
        providers: [{provide: token, useExisting: DirB}],
      })
      class DirB {}

      let instance!: ParentCmp;
      const initialMetadata: Component = {
        selector: 'parent-cmp',
        imports: [DirA, DirB],
        template: `<div #ref dir-a></div>`,
      };

      @Component(initialMetadata)
      class ParentCmp {
        @ViewChild('ref', {read: token}) ref!: DirA | DirB;

        constructor() {
          instance = this;
        }
      }

      @Component({
        imports: [ParentCmp],
        template: `<parent-cmp/>`,
      })
      class RootCmp {}

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      expect(instance.ref).toBeInstanceOf(DirA);

      replaceMetadata(ParentCmp, {
        ...initialMetadata,
        template: `
          <section>
            <div #ref dir-b></div>
          </section>
        `,
      });
      fixture.detectChanges();

      expect(instance.ref).toBeInstanceOf(DirB);
    });

    it('should update ViewChild when the injection token stops pointing to anything', async () => {
      const token = new InjectionToken<Dir>('token');

      @Directive({
        selector: '[dir]',
        providers: [{provide: token, useExisting: Dir}],
      })
      class Dir {}

      let instance!: ParentCmp;
      const initialMetadata: Component = {
        selector: 'parent-cmp',
        imports: [Dir],
        template: `<div #ref dir></div>`,
      };

      @Component(initialMetadata)
      class ParentCmp {
        @ViewChild('ref', {read: token}) ref!: Dir;

        constructor() {
          instance = this;
        }
      }

      @Component({
        imports: [ParentCmp],
        template: `<parent-cmp/>`,
      })
      class RootCmp {}

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      expect(instance.ref).toBeInstanceOf(Dir);

      replaceMetadata(ParentCmp, {
        ...initialMetadata,
        template: `<div #ref></div>`,
      });
      fixture.detectChanges();

      expect(instance.ref).toBeFalsy();
    });
  });

  describe('content projection', () => {
    it('should work with content projection', () => {
      const initialMetadata: Component = {
        selector: 'parent-cmp',
        template: `<ng-content/>`,
      };

      @Component(initialMetadata)
      class ParentCmp {}

      @Component({
        imports: [ParentCmp],
        template: `
          <parent-cmp>
            <h1>Projected H1</h1>
            <h2>Projected H2</h2>
          </parent-cmp>
        `,
      })
      class RootCmp {}

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      markNodesAsCreatedInitially(fixture.nativeElement);
      expectHTML(
        fixture.nativeElement,
        `
          <parent-cmp>
            <h1>Projected H1</h1>
            <h2>Projected H2</h2>
          </parent-cmp>
        `,
      );

      replaceMetadata(ParentCmp, {
        ...initialMetadata,
        template: `
          <section>
            <ng-content/>
          </section>
        `,
      });
      fixture.detectChanges();

      // <h1> and <h2> nodes were not re-created, since they
      // belong to a parent component, which wasn't HMR'ed.
      verifyNodesRemainUntouched(fixture.nativeElement.querySelector('h1'));
      verifyNodesRemainUntouched(fixture.nativeElement.querySelector('h2'));
      verifyNodesWereRecreated(fixture.nativeElement.querySelectorAll('section'));

      expectHTML(
        fixture.nativeElement,
        `
          <parent-cmp>
            <section>
              <h1>Projected H1</h1>
              <h2>Projected H2</h2>
            </section>
          </parent-cmp>
        `,
      );
    });

    it('should handle elements moving around into different slots', () => {
      // Start off with a single catch-all slot.
      const initialMetadata: Component = {
        selector: 'parent-cmp',
        template: `<ng-content/>`,
      };

      @Component(initialMetadata)
      class ParentCmp {}

      @Component({
        imports: [ParentCmp],
        template: `
          <parent-cmp>
            <div one="1">one</div>
            <div two="2">two</div>
          </parent-cmp>
        `,
      })
      class RootCmp {}

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      markNodesAsCreatedInitially(fixture.nativeElement);
      expectHTML(
        fixture.nativeElement,
        `
          <parent-cmp>
            <div one="1">one</div>
            <div two="2">two</div>
          </parent-cmp>
        `,
      );

      // Swap out the catch-all slot with two specific slots.
      // Note that we also changed the order of `one` and `two`.
      replaceMetadata(ParentCmp, {
        ...initialMetadata,
        template: `
          <section><ng-content select="[two]"/></section>
          <main><ng-content select="[one]"/></main>
        `,
      });
      fixture.detectChanges();

      verifyNodesRemainUntouched(fixture.nativeElement.querySelector('[one]'));
      verifyNodesRemainUntouched(fixture.nativeElement.querySelector('[two]'));
      verifyNodesWereRecreated(fixture.nativeElement.querySelectorAll('section, main'));
      expectHTML(
        fixture.nativeElement,
        `
          <parent-cmp>
            <section><div two="2">two</div></section>
            <main><div one="1">one</div></main>
          </parent-cmp>
        `,
      );

      // Swap with a slot that matches nothing.
      replaceMetadata(ParentCmp, {
        ...initialMetadata,
        template: `<ng-content select="does-not-match"/>`,
      });
      fixture.detectChanges();
      expectHTML(fixture.nativeElement, '<parent-cmp></parent-cmp>');

      // Swap with a slot that only one of the nodes matches.
      replaceMetadata(ParentCmp, {
        ...initialMetadata,
        template: `<span><ng-content select="[one]"/></span>`,
      });
      fixture.detectChanges();

      expectHTML(
        fixture.nativeElement,
        `
        <parent-cmp>
          <span><div one="1">one</div></span>
        </parent-cmp>
      `,
      );
      verifyNodesRemainUntouched(fixture.nativeElement.querySelector('[one]'));
      verifyNodesWereRecreated(fixture.nativeElement.querySelectorAll('span'));
    });

    it('should handle default content for ng-content', () => {
      const initialMetadata: Component = {
        selector: 'parent-cmp',
        template: `
          <ng-content select="will-not-match">
            <div class="default-content">Default content</div>
          </ng-content>
        `,
      };

      @Component(initialMetadata)
      class ParentCmp {}

      @Component({
        imports: [ParentCmp],
        template: `
          <parent-cmp>
            <span>Some content</span>
          </parent-cmp>
        `,
      })
      class RootCmp {}

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expectHTML(
        fixture.nativeElement,
        `
          <parent-cmp>
            <div class="default-content">Default content</div>
          </parent-cmp>
        `,
      );

      replaceMetadata(ParentCmp, {
        ...initialMetadata,
        template: `
          <ng-content>
            <div class="default-content">Default content</div>
          </ng-content>
        `,
      });
      fixture.detectChanges();
      expectHTML(
        fixture.nativeElement,
        `
          <parent-cmp>
            <span>Some content</span>
          </parent-cmp>
        `,
      );
    });
  });

  describe('lifecycle hooks', () => {
    it('should only invoke the init/destroy hooks inside the content when replacing the template', () => {
      @Component({
        template: '',
        selector: 'child-cmp',
      })
      class ChildCmp implements OnInit, OnDestroy {
        @Input() text = '[empty]';

        ngOnInit() {
          logs.push(`ChildCmp ${this.text} init`);
        }

        ngOnDestroy() {
          logs.push(`ChildCmp ${this.text} destroy`);
        }
      }

      const initialMetadata: Component = {
        template: `
          <child-cmp text="A"/>
          <child-cmp text="B"/>
        `,
        imports: [ChildCmp],
        selector: 'parent-cmp',
      };
      let logs: string[] = [];

      @Component(initialMetadata)
      class ParentCmp implements OnInit, OnDestroy {
        @Input() text = '[empty]';

        ngOnInit() {
          logs.push(`ParentCmp ${this.text} init`);
        }

        ngOnDestroy() {
          logs.push(`ParentCmp ${this.text} destroy`);
        }
      }

      @Component({
        // Note that we test two of the same component one after the other
        // specifically because during testing it was a problematic pattern.
        template: `
          <parent-cmp text="A"/>
          <parent-cmp text="B"/>
        `,
        imports: [ParentCmp],
      })
      class RootCmp {}

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expect(logs).toEqual([
        'ParentCmp A init',
        'ParentCmp B init',
        'ChildCmp A init',
        'ChildCmp B init',
        'ChildCmp A init',
        'ChildCmp B init',
      ]);

      logs = [];
      replaceMetadata(ParentCmp, {
        ...initialMetadata,
        template: `
          <child-cmp text="C"/>
          <child-cmp text="D"/>
          <child-cmp text="E"/>
        `,
      });
      fixture.detectChanges();

      expect(logs).toEqual([
        'ChildCmp A destroy',
        'ChildCmp B destroy',
        'ChildCmp C init',
        'ChildCmp D init',
        'ChildCmp E init',
        'ChildCmp A destroy',
        'ChildCmp B destroy',
        'ChildCmp C init',
        'ChildCmp D init',
        'ChildCmp E init',
      ]);

      logs = [];
      replaceMetadata(ParentCmp, {
        ...initialMetadata,
        template: '',
      });
      fixture.detectChanges();
      expect(logs).toEqual([
        'ChildCmp C destroy',
        'ChildCmp D destroy',
        'ChildCmp E destroy',
        'ChildCmp C destroy',
        'ChildCmp D destroy',
        'ChildCmp E destroy',
      ]);
    });

    it('should invoke checked hooks both on the host and the content being replaced', () => {
      @Component({
        template: '',
        selector: 'child-cmp',
      })
      class ChildCmp implements DoCheck {
        @Input() text = '[empty]';

        ngDoCheck() {
          logs.push(`ChildCmp ${this.text} checked`);
        }
      }

      const initialMetadata: Component = {
        template: `<child-cmp text="A"/>`,
        imports: [ChildCmp],
        selector: 'parent-cmp',
      };
      let logs: string[] = [];

      @Component(initialMetadata)
      class ParentCmp implements DoCheck {
        ngDoCheck() {
          logs.push(`ParentCmp checked`);
        }
      }

      @Component({
        template: `<parent-cmp/>`,
        imports: [ParentCmp],
      })
      class RootCmp {}

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      expect(logs).toEqual(['ParentCmp checked', 'ChildCmp A checked']);

      fixture.detectChanges();
      expect(logs).toEqual([
        'ParentCmp checked',
        'ChildCmp A checked',
        'ParentCmp checked',
        'ChildCmp A checked',
      ]);

      logs = [];
      replaceMetadata(ParentCmp, {
        ...initialMetadata,
        template: '',
      });
      fixture.detectChanges();
      expect(logs).toEqual(['ParentCmp checked']);
      fixture.detectChanges();
      expect(logs).toEqual(['ParentCmp checked', 'ParentCmp checked']);

      logs = [];
      replaceMetadata(ParentCmp, {
        ...initialMetadata,
        template: `
          <child-cmp text="A"/>
          <child-cmp text="B"/>
        `,
      });
      fixture.detectChanges();
      expect(logs).toEqual([
        'ChildCmp A checked',
        'ChildCmp B checked',
        'ParentCmp checked',
        'ChildCmp A checked',
        'ChildCmp B checked',
      ]);
      fixture.detectChanges();
      expect(logs).toEqual([
        'ChildCmp A checked',
        'ChildCmp B checked',
        'ParentCmp checked',
        'ChildCmp A checked',
        'ChildCmp B checked',
        'ParentCmp checked',
        'ChildCmp A checked',
        'ChildCmp B checked',
      ]);
    });

    it('should dispatch ngOnChanges on a replaced component', () => {
      const values: string[] = [];
      const initialMetadata: Component = {
        selector: 'child-cmp',
        template: '',
      };

      @Component(initialMetadata)
      class ChildCmp implements OnChanges {
        @Input() value = 0;

        ngOnChanges(changes: SimpleChanges) {
          const change = changes['value'];
          values.push(
            `${change.previousValue} - ${change.currentValue} - ${change.isFirstChange()}`,
          );
        }
      }

      @Component({
        imports: [ChildCmp],
        template: `<child-cmp [value]="value"/>`,
      })
      class RootCmp {
        value = 1;
      }

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      expect(values).toEqual(['undefined - 1 - true']);

      fixture.componentInstance.value++;
      fixture.detectChanges();
      expect(values).toEqual(['undefined - 1 - true', '1 - 2 - false']);

      replaceMetadata(ChildCmp, {
        ...initialMetadata,
        template: 'Changed',
      });
      fixture.detectChanges();

      fixture.componentInstance.value++;
      fixture.detectChanges();
      expect(values).toEqual(['undefined - 1 - true', '1 - 2 - false', '2 - 3 - false']);

      fixture.componentInstance.value++;
      fixture.detectChanges();
      expect(values).toEqual([
        'undefined - 1 - true',
        '1 - 2 - false',
        '2 - 3 - false',
        '3 - 4 - false',
      ]);

      replaceMetadata(ChildCmp, {
        ...initialMetadata,
        template: 'Changed!!!',
      });
      fixture.detectChanges();
      fixture.componentInstance.value++;
      fixture.detectChanges();
      expect(values).toEqual([
        'undefined - 1 - true',
        '1 - 2 - false',
        '2 - 3 - false',
        '3 - 4 - false',
        '4 - 5 - false',
      ]);
    });
  });

  describe('event listeners', () => {
    it('should continue emitting to output after component has been replaced', () => {
      let count = 0;
      const initialMetadata: Component = {
        selector: 'child-cmp',
        template: '<button (click)="clicked()"></button>',
      };

      @Component(initialMetadata)
      class ChildCmp {
        @Output() changed = new EventEmitter();

        clicked() {
          this.changed.emit();
        }
      }

      @Component({
        imports: [ChildCmp],
        template: `<child-cmp (changed)="onChange()"/>`,
      })
      class RootCmp {
        onChange() {
          count++;
        }
      }

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      markNodesAsCreatedInitially(fixture.nativeElement);
      expect(count).toBe(0);

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();
      expect(count).toBe(1);

      replaceMetadata(ChildCmp, {
        ...initialMetadata,
        template: '<button class="replacement" (click)="clicked()"></button>',
      });
      fixture.detectChanges();

      const recreatedNodes = childrenOf(...fixture.nativeElement.querySelectorAll('child-cmp'));
      verifyNodesRemainUntouched(fixture.nativeElement, recreatedNodes);
      verifyNodesWereRecreated(recreatedNodes);

      fixture.nativeElement.querySelector('.replacement').click();
      fixture.detectChanges();
      expect(count).toBe(2);
    });

    it('should stop emitting if replaced with an element that no longer has the listener', () => {
      let count = 0;
      const initialMetadata: Component = {
        selector: 'child-cmp',
        template: '<button (click)="clicked()"></button>',
      };

      @Component(initialMetadata)
      class ChildCmp {
        @Output() changed = new EventEmitter();

        clicked() {
          this.changed.emit();
        }
      }

      @Component({
        imports: [ChildCmp],
        template: `<child-cmp (changed)="onChange()"/>`,
      })
      class RootCmp {
        onChange() {
          count++;
        }
      }

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      markNodesAsCreatedInitially(fixture.nativeElement);
      expect(count).toBe(0);

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();
      expect(count).toBe(1);

      replaceMetadata(ChildCmp, {
        ...initialMetadata,
        template: '<button (click)="clicked()"></button>',
      });
      fixture.detectChanges();

      const recreatedNodes = childrenOf(...fixture.nativeElement.querySelectorAll('child-cmp'));
      verifyNodesRemainUntouched(fixture.nativeElement, recreatedNodes);
      verifyNodesWereRecreated(recreatedNodes);

      fixture.nativeElement.querySelector('button').click();
      fixture.detectChanges();
      expect(count).toBe(2);
    });

    it('should bind events inside the NgZone after a replacement', () => {
      const calls: {name: string; inZone: boolean}[] = [];

      @Component({template: `<button (click)="clicked()"></button>`})
      class App {
        clicked() {}
      }

      TestBed.configureTestingModule({
        providers: [
          {
            // Note: TestBed brings things into the zone even if they aren't which makes this
            // test hard to write. We have to intercept the listener being bound at the renderer
            // level in order to get a true sense if it'll be bound inside or outside the zone.
            // We do so with a custom event manager.
            provide: EVENT_MANAGER_PLUGINS,
            multi: true,
            useValue: {
              supports: () => true,
              addEventListener: (_: unknown, name: string) => {
                calls.push({name, inZone: NgZone.isInAngularZone()});
                return () => {};
              },
            },
          },
        ],
      });

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(calls).toEqual([{name: 'click', inZone: true}]);

      replaceMetadata(App, {template: '<button class="foo" (click)="clicked()"></button>'});
      fixture.detectChanges();

      expect(calls).toEqual([
        {name: 'click', inZone: true},
        {name: 'click', inZone: true},
      ]);
    });
  });

  describe('directives', () => {
    it('should not destroy template-matched directives on a component being replaced', () => {
      const initLog: string[] = [];
      let destroyCount = 0;
      const initialMetadata: Component = {
        selector: 'child-cmp',
        template: '',
      };

      @Component(initialMetadata)
      class ChildCmp implements OnDestroy {
        constructor() {
          initLog.push('ChildCmp init');
        }

        ngOnDestroy() {
          destroyCount++;
        }
      }

      @Directive({selector: '[dir-a]'})
      class DirA implements OnDestroy {
        constructor() {
          initLog.push('DirA init');
        }

        ngOnDestroy() {
          destroyCount++;
        }
      }

      @Directive({selector: '[dir-b]'})
      class DirB implements OnDestroy {
        constructor() {
          initLog.push('DirB init');
        }

        ngOnDestroy() {
          destroyCount++;
        }
      }

      @Component({
        imports: [ChildCmp, DirA, DirB],
        template: `<child-cmp dir-a dir-b/>`,
      })
      class RootCmp {}

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      markNodesAsCreatedInitially(fixture.nativeElement);
      expect(initLog).toEqual(['ChildCmp init', 'DirA init', 'DirB init']);
      expect(destroyCount).toBe(0);

      replaceMetadata(ChildCmp, {
        ...initialMetadata,
        template: 'Hello!',
      });
      fixture.detectChanges();
      expect(initLog).toEqual(['ChildCmp init', 'DirA init', 'DirB init']);
      expect(destroyCount).toBe(0);
    });

    it('should not destroy host directives on a component being replaced', () => {
      const initLog: string[] = [];
      let destroyCount = 0;

      @Directive({selector: '[dir-a]'})
      class DirA implements OnDestroy {
        constructor() {
          initLog.push('DirA init');
        }

        ngOnDestroy() {
          destroyCount++;
        }
      }

      @Directive({selector: '[dir-b]'})
      class DirB implements OnDestroy {
        constructor() {
          initLog.push('DirB init');
        }

        ngOnDestroy() {
          destroyCount++;
        }
      }

      const initialMetadata: Component = {
        selector: 'child-cmp',
        template: '',
        hostDirectives: [DirA, DirB],
      };

      @Component(initialMetadata)
      class ChildCmp implements OnDestroy {
        constructor() {
          initLog.push('ChildCmp init');
        }

        ngOnDestroy() {
          destroyCount++;
        }
      }

      @Component({
        imports: [ChildCmp],
        template: '<child-cmp/>',
      })
      class RootCmp {}

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      markNodesAsCreatedInitially(fixture.nativeElement);
      expect(initLog).toEqual(['DirA init', 'DirB init', 'ChildCmp init']);
      expect(destroyCount).toBe(0);

      replaceMetadata(ChildCmp, {
        ...initialMetadata,
        template: 'Hello!',
      });
      fixture.detectChanges();
      expect(initLog).toEqual(['DirA init', 'DirB init', 'ChildCmp init']);
      expect(destroyCount).toBe(0);
    });
  });

  describe('dependency injection', () => {
    it('should be able to inject a component that is replaced', () => {
      let instance!: ChildCmp;
      const injectedInstances: [unknown, ChildCmp][] = [];

      @Directive({selector: '[dir-a]'})
      class DirA {
        constructor() {
          injectedInstances.push([this, inject(ChildCmp)]);
        }
      }

      @Directive({selector: '[dir-b]'})
      class DirB {
        constructor() {
          injectedInstances.push([this, inject(ChildCmp)]);
        }
      }

      const initialMetadata: Component = {
        selector: 'child-cmp',
        template: '<div dir-a></div>',
        imports: [DirA, DirB],
      };

      @Component(initialMetadata)
      class ChildCmp {
        constructor() {
          instance = this;
        }
      }

      @Component({
        imports: [ChildCmp],
        template: '<child-cmp/>',
      })
      class RootCmp {}

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      expect(instance).toBeInstanceOf(ChildCmp);
      expect(injectedInstances).toEqual([[jasmine.any(DirA), instance]]);

      replaceMetadata(ChildCmp, {
        ...initialMetadata,
        template: '<div dir-b></div>',
      });
      fixture.detectChanges();

      expect(injectedInstances).toEqual([
        [jasmine.any(DirA), instance],
        [jasmine.any(DirB), instance],
      ]);
    });

    it('should be able to inject a token coming from a component that is replaced', () => {
      const token = new InjectionToken<string>('TEST_TOKEN');
      const injectedValues: [unknown, string][] = [];

      @Directive({selector: '[dir-a]'})
      class DirA {
        constructor() {
          injectedValues.push([this, inject(token)]);
        }
      }

      @Directive({selector: '[dir-b]'})
      class DirB {
        constructor() {
          injectedValues.push([this, inject(token)]);
        }
      }

      const initialMetadata: Component = {
        selector: 'child-cmp',
        template: '<div dir-a></div>',
        imports: [DirA, DirB],
        providers: [{provide: token, useValue: 'provided value'}],
      };

      @Component(initialMetadata)
      class ChildCmp {}

      @Component({
        imports: [ChildCmp],
        template: '<child-cmp/>',
      })
      class RootCmp {}

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      expect(injectedValues).toEqual([[jasmine.any(DirA), 'provided value']]);

      replaceMetadata(ChildCmp, {
        ...initialMetadata,
        template: '<div dir-b></div>',
      });
      fixture.detectChanges();

      expect(injectedValues).toEqual([
        [jasmine.any(DirA), 'provided value'],
        [jasmine.any(DirB), 'provided value'],
      ]);
    });

    it('should be able to access the viewProviders of a component that is being replaced', () => {
      const token = new InjectionToken<string>('TEST_TOKEN');
      const injectedValues: [unknown, string][] = [];

      @Directive({selector: '[dir-a]'})
      class DirA {
        constructor() {
          injectedValues.push([this, inject(token)]);
        }
      }

      @Directive({selector: '[dir-b]'})
      class DirB {
        constructor() {
          injectedValues.push([this, inject(token)]);
        }
      }

      const initialMetadata: Component = {
        selector: 'child-cmp',
        template: '<div dir-a></div>',
        imports: [DirA, DirB],
        viewProviders: [{provide: token, useValue: 'provided value'}],
      };

      @Component(initialMetadata)
      class ChildCmp {}

      @Component({
        imports: [ChildCmp],
        template: '<child-cmp/>',
      })
      class RootCmp {}

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      expect(injectedValues).toEqual([[jasmine.any(DirA), 'provided value']]);

      replaceMetadata(ChildCmp, {
        ...initialMetadata,
        template: '<div dir-b></div>',
      });
      fixture.detectChanges();

      expect(injectedValues).toEqual([
        [jasmine.any(DirA), 'provided value'],
        [jasmine.any(DirB), 'provided value'],
      ]);
    });
  });

  describe('host bindings', () => {
    it('should maintain attribute host bindings on a replaced component', () => {
      const initialMetadata: Component = {
        selector: 'child-cmp',
        template: 'Hello',
        host: {
          '[attr.bar]': 'state',
        },
      };

      @Component(initialMetadata)
      class ChildCmp {
        @Input() state = 0;
      }

      @Component({
        imports: [ChildCmp],
        template: `<child-cmp [state]="state" [attr.foo]="'The state is ' + state"/>`,
      })
      class RootCmp {
        state = 0;
      }

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();

      expectHTML(
        fixture.nativeElement,
        `<child-cmp foo="The state is 0" bar="0">Hello</child-cmp>`,
      );

      fixture.componentInstance.state = 1;
      fixture.detectChanges();
      expectHTML(
        fixture.nativeElement,
        `<child-cmp foo="The state is 1" bar="1">Hello</child-cmp>`,
      );

      replaceMetadata(ChildCmp, {...initialMetadata, template: `Changed`});
      fixture.detectChanges();
      expectHTML(
        fixture.nativeElement,
        `<child-cmp foo="The state is 1" bar="1">Changed</child-cmp>`,
      );

      fixture.componentInstance.state = 2;
      fixture.detectChanges();
      expectHTML(
        fixture.nativeElement,
        `<child-cmp foo="The state is 2" bar="2">Changed</child-cmp>`,
      );
    });

    it('should maintain class host bindings on a replaced component', () => {
      const initialMetadata: Component = {
        selector: 'child-cmp',
        template: 'Hello',
        host: {
          '[class.bar]': 'state',
        },
      };

      @Component(initialMetadata)
      class ChildCmp {
        @Input() state = false;
      }

      @Component({
        imports: [ChildCmp],
        template: `<child-cmp class="static" [state]="state" [class.foo]="state"/>`,
      })
      class RootCmp {
        state = false;
      }

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      expectHTML(fixture.nativeElement, `<child-cmp class="static">Hello</child-cmp>`);

      fixture.componentInstance.state = true;
      fixture.detectChanges();
      expectHTML(fixture.nativeElement, `<child-cmp class="static foo bar">Hello</child-cmp>`);

      replaceMetadata(ChildCmp, {...initialMetadata, template: `Changed`});
      fixture.detectChanges();
      expectHTML(fixture.nativeElement, `<child-cmp class="static foo bar">Changed</child-cmp>`);

      fixture.componentInstance.state = false;
      fixture.detectChanges();
      expectHTML(fixture.nativeElement, `<child-cmp class="static">Changed</child-cmp>`);
    });

    it('should maintain style host bindings on a replaced component', () => {
      const initialMetadata: Component = {
        selector: 'child-cmp',
        template: 'Hello',
        host: {
          '[style.height]': 'state ? "5px" : "20px"',
        },
      };

      @Component(initialMetadata)
      class ChildCmp {
        @Input() state = false;
      }

      @Component({
        imports: [ChildCmp],
        template: `<child-cmp style="opacity: 0.5;" [state]="state" [style.width]="state ? '3px' : '12px'"/>`,
      })
      class RootCmp {
        state = false;
      }

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      expectHTML(
        fixture.nativeElement,
        `<child-cmp style="opacity: 0.5; width: 12px; height: 20px;">Hello</child-cmp>`,
      );

      fixture.componentInstance.state = true;
      fixture.detectChanges();
      expectHTML(
        fixture.nativeElement,
        `<child-cmp style="opacity: 0.5; width: 3px; height: 5px;">Hello</child-cmp>`,
      );

      replaceMetadata(ChildCmp, {...initialMetadata, template: `Changed`});
      fixture.detectChanges();
      expectHTML(
        fixture.nativeElement,
        `<child-cmp style="opacity: 0.5; width: 3px; height: 5px;">Changed</child-cmp>`,
      );

      fixture.componentInstance.state = false;
      fixture.detectChanges();
      expectHTML(
        fixture.nativeElement,
        `<child-cmp style="opacity: 0.5; width: 12px; height: 20px;">Changed</child-cmp>`,
      );
    });
  });

  describe('i18n', () => {
    afterEach(() => {
      clearTranslations();
    });

    it('should replace components that use i18n within their template', () => {
      loadTranslations({
        [computeMsgId('hello')]: 'здравей',
        [computeMsgId('goodbye')]: 'довиждане',
      });

      const initialMetadata: Component = {
        selector: 'child-cmp',
        template: '<span i18n>hello</span>',
      };

      @Component(initialMetadata)
      class ChildCmp {}

      @Component({
        imports: [ChildCmp],
        template: '<child-cmp/>',
      })
      class RootCmp {}

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      expectHTML(fixture.nativeElement, '<child-cmp><span>здравей</span></child-cmp>');

      replaceMetadata(ChildCmp, {...initialMetadata, template: '<strong i18n>goodbye</strong>!'});
      fixture.detectChanges();
      expectHTML(fixture.nativeElement, '<child-cmp><strong>довиждане</strong>!</child-cmp>');
    });

    it('should replace components that use i18n in their projected content', () => {
      loadTranslations({[computeMsgId('hello')]: 'здравей'});

      const initialMetadata: Component = {
        selector: 'child-cmp',
        template: '<ng-content/>',
      };

      @Component(initialMetadata)
      class ChildCmp {}

      @Component({
        imports: [ChildCmp],
        template: `<child-cmp i18n>hello</child-cmp>`,
      })
      class RootCmp {}

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      markNodesAsCreatedInitially(fixture.nativeElement);
      expectHTML(fixture.nativeElement, '<child-cmp>здравей</child-cmp>');

      replaceMetadata(ChildCmp, {
        ...initialMetadata,
        template: 'Hello translates to <strong><ng-content/></strong>!',
      });
      fixture.detectChanges();

      const recreatedNodes = childrenOf(...fixture.nativeElement.querySelectorAll('child-cmp'));
      verifyNodesRemainUntouched(fixture.nativeElement, recreatedNodes);
      verifyNodesWereRecreated(recreatedNodes);
      expectHTML(
        fixture.nativeElement,
        '<child-cmp>Hello translates to <strong>здравей</strong>!</child-cmp>',
      );
    });

    it('should replace components that use i18n with interpolations', () => {
      loadTranslations({
        [computeMsgId('hello')]: 'здравей',
        [computeMsgId('Hello {$INTERPOLATION}!')]: 'Здравей {$INTERPOLATION}!',
      });

      let instance!: ChildCmp;
      const initialMetadata: Component = {
        selector: 'child-cmp',
        template: '<span i18n>Hello {{name}}!</span>',
      };

      @Component(initialMetadata)
      class ChildCmp {
        name = 'Frodo';

        constructor() {
          instance = this;
        }
      }

      @Component({
        imports: [ChildCmp],
        template: '<child-cmp/>',
      })
      class RootCmp {}

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      expectHTML(fixture.nativeElement, '<child-cmp><span>Здравей Frodo!</span></child-cmp>');

      replaceMetadata(ChildCmp, {...initialMetadata, template: '<strong i18n>hello</strong>'});
      fixture.detectChanges();
      expectHTML(fixture.nativeElement, '<child-cmp><strong>здравей</strong></child-cmp>');

      replaceMetadata(ChildCmp, {
        ...initialMetadata,
        template: '<main><section i18n>Hello {{name}}!</section></main>',
      });
      fixture.detectChanges();
      expectHTML(
        fixture.nativeElement,
        '<child-cmp><main><section>Здравей Frodo!</section></main></child-cmp>',
      );

      instance.name = 'Bilbo';
      fixture.detectChanges();
      expectHTML(
        fixture.nativeElement,
        '<child-cmp><main><section>Здравей Bilbo!</section></main></child-cmp>',
      );
    });

    it('should replace components that use i18n with interpolations in their projected content', () => {
      loadTranslations({
        [computeMsgId('Hello {$INTERPOLATION}!')]: 'Здравей {$INTERPOLATION}!',
      });

      const initialMetadata: Component = {
        selector: 'child-cmp',
        template: '<ng-content/>',
      };

      @Component(initialMetadata)
      class ChildCmp {}

      @Component({
        imports: [ChildCmp],
        template: '<child-cmp i18n>Hello {{name}}!</child-cmp>',
      })
      class RootCmp {
        name = 'Frodo';
      }

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      markNodesAsCreatedInitially(fixture.nativeElement);
      expectHTML(fixture.nativeElement, '<child-cmp>Здравей Frodo!</child-cmp>');

      replaceMetadata(ChildCmp, {
        ...initialMetadata,
        template: 'The text translates to <strong><ng-content/></strong>!',
      });
      fixture.detectChanges();
      expectHTML(
        fixture.nativeElement,
        '<child-cmp>The text translates to <strong>Здравей Frodo!</strong>!</child-cmp>',
      );

      const recreatedNodes = childrenOf(...fixture.nativeElement.querySelectorAll('child-cmp'));
      verifyNodesRemainUntouched(fixture.nativeElement, recreatedNodes);
      verifyNodesWereRecreated(recreatedNodes);

      fixture.componentInstance.name = 'Bilbo';
      fixture.detectChanges();
      expectHTML(
        fixture.nativeElement,
        '<child-cmp>The text translates to <strong>Здравей Bilbo!</strong>!</child-cmp>',
      );
    });

    it('should replace components that use i18n with ICUs', () => {
      loadTranslations({
        [computeMsgId('hello')]: 'здравей',
        [computeMsgId('{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}')]:
          '{VAR_SELECT, select, 10 {десет} 20 {двадесет} other {друго}}',
      });

      let instance!: ChildCmp;
      const initialMetadata: Component = {
        selector: 'child-cmp',
        template: '<span i18n>{count, select, 10 {ten} 20 {twenty} other {other}}</span>',
      };

      @Component(initialMetadata)
      class ChildCmp {
        count = 10;

        constructor() {
          instance = this;
        }
      }

      @Component({
        imports: [ChildCmp],
        template: '<child-cmp/>',
      })
      class RootCmp {}

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      expectHTML(fixture.nativeElement, '<child-cmp><span>десет</span></child-cmp>');

      replaceMetadata(ChildCmp, {...initialMetadata, template: '<strong i18n>hello</strong>'});
      fixture.detectChanges();
      expectHTML(fixture.nativeElement, '<child-cmp><strong>здравей</strong></child-cmp>');

      replaceMetadata(ChildCmp, {
        ...initialMetadata,
        template:
          '<main><section i18n>{count, select, 10 {ten} 20 {twenty} other {other}}</section></main>',
      });
      fixture.detectChanges();
      expectHTML(
        fixture.nativeElement,
        '<child-cmp><main><section>десет</section></main></child-cmp>',
      );

      instance.count = 20;
      fixture.detectChanges();
      expectHTML(
        fixture.nativeElement,
        '<child-cmp><main><section>двадесет</section></main></child-cmp>',
      );
    });

    it('should replace components that use i18n with ICUs in their projected content', () => {
      loadTranslations({
        [computeMsgId('{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}')]:
          '{VAR_SELECT, select, 10 {десет} 20 {двадесет} other {друго}}',
      });

      const initialMetadata: Component = {
        selector: 'child-cmp',
        template: '<ng-content/>',
      };

      @Component(initialMetadata)
      class ChildCmp {}

      @Component({
        imports: [ChildCmp],
        template: '<child-cmp i18n>{count, select, 10 {ten} 20 {twenty} other {other}}</child-cmp>',
      })
      class RootCmp {
        count = 10;
      }

      const fixture = TestBed.createComponent(RootCmp);
      fixture.detectChanges();
      markNodesAsCreatedInitially(fixture.nativeElement);
      expectHTML(fixture.nativeElement, '<child-cmp>десет</child-cmp>');

      replaceMetadata(ChildCmp, {
        ...initialMetadata,
        template: 'The text translates to <strong><ng-content/></strong>!',
      });
      fixture.detectChanges();

      const recreatedNodes = childrenOf(...fixture.nativeElement.querySelectorAll('child-cmp'));
      verifyNodesRemainUntouched(fixture.nativeElement, recreatedNodes);
      verifyNodesWereRecreated(recreatedNodes);
      expectHTML(
        fixture.nativeElement,
        '<child-cmp>The text translates to <strong>десет</strong>!</child-cmp>',
      );

      fixture.componentInstance.count = 20;
      fixture.detectChanges();
      expectHTML(
        fixture.nativeElement,
        '<child-cmp>The text translates to <strong>двадесет</strong>!</child-cmp>',
      );
    });
  });

  // Testing utilities

  // Field that we'll monkey-patch onto DOM elements that were created
  // initially, so that we can verify that some nodes were *not* re-created
  // during HMR operation. We do it for *testing* purposes only.
  const CREATED_INITIALLY_MARKER = '__ngCreatedInitially__';

  function replaceMetadata(type: Type<unknown>, metadata: Component) {
    ɵɵreplaceMetadata(
      type,
      () => {
        // TODO: the content of this callback is a hacky workaround to invoke the compiler in a test.
        // in reality the callback will be generated by the compiler to be something along the lines
        // of `MyComp[ɵcmp] = /* metadata */`.
        // TODO: in reality this callback should also include `setClassMetadata` and
        // `setClassDebugInfo`.
        (type as any)[ɵNG_COMP_DEF] = null;
        compileComponent(type, metadata);
      },
      [angularCoreEnv],
      [],
      null,
      '',
    );
  }

  function expectHTML(element: HTMLElement, expectation: string) {
    const actual = element.innerHTML
      .replace(/<!--(\W|\w)*?-->/g, '')
      .replace(/\s(ng-reflect|_nghost|_ngcontent)-\S*="[^"]*"/g, '');
    expect(actual.replace(/\s/g, '') === expectation.replace(/\s/g, ''))
      .withContext(`HTML does not match expectation. Actual HTML:\n${actual}`)
      .toBe(true);
  }

  function setMarker(node: Node) {
    (node as any)[CREATED_INITIALLY_MARKER] = true;
  }

  function hasMarker(node: Node): boolean {
    return !!(node as any)[CREATED_INITIALLY_MARKER];
  }

  function markNodesAsCreatedInitially(root: HTMLElement) {
    let current: Node | null = root;
    while (current) {
      setMarker(current);
      if (current.firstChild) {
        markNodesAsCreatedInitially(current.firstChild as HTMLElement);
      }
      current = current.nextSibling;
    }
  }

  function childrenOf(...nodes: Node[]): Node[] {
    const result: Node[] = [];
    for (const node of nodes) {
      let current: Node | null = node.firstChild;
      while (current) {
        result.push(current);
        current = current.nextSibling;
      }
    }
    return result;
  }

  function verifyNodesRemainUntouched(root: HTMLElement, exceptions: Node[] = []) {
    if (!root) {
      throw new Error('Root node must be provided');
    }

    let current: Node | null = root;
    while (current) {
      if (!hasMarker(current)) {
        if (exceptions.includes(current)) {
          // This node was re-created intentionally,
          // do not inspect child nodes.
          break;
        } else {
          throw new Error(`Unexpected state: node was re-created: ${(current as any).innerHTML}`);
        }
      }
      if (current.firstChild) {
        verifyNodesRemainUntouched(current.firstChild as HTMLElement, exceptions);
      }
      current = current.nextSibling;
    }
  }

  function verifyNodesWereRecreated(nodes: Iterable<Node>) {
    nodes = Array.from(nodes);

    for (const node of nodes) {
      if (hasMarker(node)) {
        throw new Error(`Unexpected state: node was *not* re-created: ${(node as any).innerHTML}`);
      }
    }
  }
});
