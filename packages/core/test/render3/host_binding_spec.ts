/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, QueryList, ViewContainerRef} from '@angular/core';

import {AttributeMarker, ɵɵInheritDefinitionFeature, ɵɵNgOnChangesFeature, ɵɵProvidersFeature, ɵɵdefineComponent, ɵɵdefineDirective, ɵɵtemplate} from '../../src/render3/index';
import {ɵɵallocHostVars, ɵɵbind, ɵɵdirectiveInject, ɵɵelement, ɵɵelementAttribute, ɵɵelementEnd, ɵɵelementHostAttrs, ɵɵelementHostStyleProp, ɵɵelementHostStyling, ɵɵelementHostStylingApply, ɵɵelementProperty, ɵɵelementStart, ɵɵelementStyleProp, ɵɵelementStyling, ɵɵelementStylingApply, ɵɵlistener, ɵɵload, ɵɵtext, ɵɵtextBinding} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {ɵɵpureFunction1, ɵɵpureFunction2} from '../../src/render3/pure_function';
import {ɵɵcontentQuery, ɵɵloadContentQuery, ɵɵqueryRefresh} from '../../src/render3/query';
import {bypassSanitizationTrustHtml, bypassSanitizationTrustResourceUrl, bypassSanitizationTrustUrl} from '../../src/sanitization/bypass';
import {ɵɵsanitizeHtml, ɵɵsanitizeUrl, ɵɵsanitizeUrlOrResourceUrl} from '../../src/sanitization/sanitization';

import {NgForOf} from './common_with_def';
import {ComponentFixture, TemplateFixture, createComponent, createDirective} from './render_util';

describe('host bindings', () => {
  let nameComp: NameComp|null;
  let hostBindingDir: HostBindingDir|null;

  beforeEach(() => {
    nameComp = null;
    nameComp = null;
    hostBindingDir = null;
  });

  class NameComp {
    names !: string[];

    static ngComponentDef = ɵɵdefineComponent({
      type: NameComp,
      selectors: [['name-comp']],
      factory: function NameComp_Factory() { return nameComp = new NameComp(); },
      consts: 0,
      vars: 0,
      template: function NameComp_Template(rf: RenderFlags, ctx: NameComp) {},
      inputs: {names: 'names'}
    });
  }

  class HostBindingDir {
    // @HostBinding()
    id = 'foo';

    static ngDirectiveDef = ɵɵdefineDirective({
      type: HostBindingDir,
      selectors: [['', 'hostBindingDir', '']],
      factory: () => hostBindingDir = new HostBindingDir(),
      hostBindings: (rf: RenderFlags, ctx: any, elementIndex: number) => {
        if (rf & RenderFlags.Create) {
          ɵɵallocHostVars(1);
        }
        if (rf & RenderFlags.Update) {
          ɵɵelementProperty(elementIndex, 'id', ɵɵbind(ctx.id), null, true);
        }
      }
    });
  }

  class HostBindingComp {
    // @HostBinding()
    id = 'my-id';

    static ngComponentDef = ɵɵdefineComponent({
      type: HostBindingComp,
      selectors: [['host-binding-comp']],
      factory: () => new HostBindingComp(),
      consts: 0,
      vars: 0,
      hostBindings: (rf: RenderFlags, ctx: HostBindingComp, elIndex: number) => {
        if (rf & RenderFlags.Create) {
          ɵɵallocHostVars(1);
        }
        if (rf & RenderFlags.Update) {
          ɵɵelementProperty(elIndex, 'id', ɵɵbind(ctx.id), null, true);
        }
      },
      template: (rf: RenderFlags, ctx: HostBindingComp) => {}
    });
  }

  it('should support host bindings in directives', () => {
    let directiveInstance: Directive|undefined;
    const elementIndices: number[] = [];
    class Directive {
      // @HostBinding('className')
      klass = 'foo';

      static ngDirectiveDef = ɵɵdefineDirective({
        type: Directive,
        selectors: [['', 'dir', '']],
        factory: () => directiveInstance = new Directive,
        hostBindings: (rf: RenderFlags, ctx: any, elementIndex: number) => {
          elementIndices.push(elementIndex);
          if (rf & RenderFlags.Create) {
            ɵɵallocHostVars(1);
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(elementIndex, 'className', ɵɵbind(ctx.klass), null, true);
          }
        }
      });
    }

    function Template() { ɵɵelement(0, 'span', [AttributeMarker.Bindings, 'dir']); }

    const fixture = new TemplateFixture(Template, () => {}, 1, 0, [Directive]);
    expect(fixture.html).toEqual('<span class="foo"></span>');

    directiveInstance !.klass = 'bar';
    fixture.update();
    expect(fixture.html).toEqual('<span class="bar"></span>');

    // verify that we always call `hostBindings` function with the same element index
    expect(elementIndices.every(id => id === elementIndices[0])).toBeTruthy();
  });

  it('should support host bindings on root component', () => {
    const elementIndices: number[] = [];

    class HostBindingComp {
      // @HostBinding()
      id = 'my-id';

      static ngComponentDef = ɵɵdefineComponent({
        type: HostBindingComp,
        selectors: [['host-binding-comp']],
        factory: () => new HostBindingComp(),
        consts: 0,
        vars: 0,
        hostBindings: (rf: RenderFlags, ctx: HostBindingComp, elIndex: number) => {
          elementIndices.push(elIndex);
          if (rf & RenderFlags.Create) {
            ɵɵallocHostVars(1);
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(elIndex, 'id', ɵɵbind(ctx.id), null, true);
          }
        },
        template: (rf: RenderFlags, ctx: HostBindingComp) => {}
      });
    }

    const fixture = new ComponentFixture(HostBindingComp);
    expect(fixture.hostElement.id).toBe('my-id');

    fixture.component.id = 'other-id';
    fixture.update();
    expect(fixture.hostElement.id).toBe('other-id');

    // verify that we always call `hostBindings` function with the same element index
    expect(elementIndices.every(id => id === elementIndices[0])).toBeTruthy();
  });

  it('should support host bindings on nodes with providers', () => {

    class ServiceOne {
      value = 'one';
    }
    class ServiceTwo {
      value = 'two';
    }

    class CompWithProviders {
      // @HostBinding()
      id = 'my-id';

      constructor(public serviceOne: ServiceOne, public serviceTwo: ServiceTwo) {}

      static ngComponentDef = ɵɵdefineComponent({
        type: CompWithProviders,
        selectors: [['comp-with-providers']],
        factory: () => new CompWithProviders(
                     ɵɵdirectiveInject(ServiceOne), ɵɵdirectiveInject(ServiceTwo)),
        consts: 0,
        vars: 0,
        hostBindings: (rf: RenderFlags, ctx: CompWithProviders, elIndex: number) => {
          if (rf & RenderFlags.Create) {
            ɵɵallocHostVars(1);
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(elIndex, 'id', ɵɵbind(ctx.id), null, true);
          }
        },
        template: (rf: RenderFlags, ctx: CompWithProviders) => {},
        features: [ɵɵProvidersFeature([[ServiceOne], [ServiceTwo]])]
      });
    }

    const fixture = new ComponentFixture(CompWithProviders);
    expect(fixture.hostElement.id).toBe('my-id');
    expect(fixture.component.serviceOne.value).toEqual('one');
    expect(fixture.component.serviceTwo.value).toEqual('two');

    fixture.component.id = 'other-id';
    fixture.update();
    expect(fixture.hostElement.id).toBe('other-id');
  });

  it('should support host bindings on multiple nodes', () => {
    const SomeDir = createDirective('someDir');

    class HostTitleComp {
      // @HostBinding()
      title = 'my-title';

      static ngComponentDef = ɵɵdefineComponent({
        type: HostTitleComp,
        selectors: [['host-title-comp']],
        factory: () => new HostTitleComp(),
        consts: 0,
        vars: 0,
        hostBindings: (rf: RenderFlags, ctx: HostTitleComp, elIndex: number) => {
          if (rf & RenderFlags.Create) {
            ɵɵallocHostVars(1);
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(elIndex, 'title', ɵɵbind(ctx.title), null, true);
          }
        },
        template: (rf: RenderFlags, ctx: HostTitleComp) => {}
      });
    }

    /**
     * <div hostBindingDir></div>
     * <div someDir></div>
     * <host-title-comp></host-title-comp>
     */
    const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        ɵɵelement(0, 'div', ['hostBindingDir', '']);
        ɵɵelement(1, 'div', ['someDir', '']);
        ɵɵelement(2, 'host-title-comp');
      }
    }, 3, 0, [HostBindingDir, SomeDir, HostTitleComp]);

    const fixture = new ComponentFixture(App);
    const hostBindingDiv = fixture.hostElement.querySelector('div') as HTMLElement;
    const hostTitleComp = fixture.hostElement.querySelector('host-title-comp') as HTMLElement;
    expect(hostBindingDiv.id).toEqual('foo');
    expect(hostTitleComp.title).toEqual('my-title');

    hostBindingDir !.id = 'bar';
    fixture.update();
    expect(hostBindingDiv.id).toEqual('bar');
  });

  it('should support consecutive components with host bindings', () => {
    let comps: HostBindingComp[] = [];

    class HostBindingComp {
      // @HostBinding()
      id = 'blue';

      static ngComponentDef = ɵɵdefineComponent({
        type: HostBindingComp,
        selectors: [['host-binding-comp']],
        factory: () => {
          const comp = new HostBindingComp();
          comps.push(comp);
          return comp;
        },
        consts: 0,
        vars: 0,
        hostBindings: (rf: RenderFlags, ctx: HostBindingComp, elIndex: number) => {
          if (rf & RenderFlags.Create) {
            ɵɵallocHostVars(1);
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(elIndex, 'id', ɵɵbind(ctx.id), null, true);
          }
        },
        template: (rf: RenderFlags, ctx: HostBindingComp) => {}
      });
    }

    /**
     * <host-binding-comp></host-binding-comp>
     * <host-binding-comp></host-binding-comp>
     * */
    const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        ɵɵelement(0, 'host-binding-comp');
        ɵɵelement(1, 'host-binding-comp');
      }
    }, 2, 0, [HostBindingComp]);

    const fixture = new ComponentFixture(App);
    const hostBindingEls =
        fixture.hostElement.querySelectorAll('host-binding-comp') as NodeListOf<HTMLElement>;

    expect(hostBindingEls.length).toBe(2);

    comps[0].id = 'red';
    fixture.update();
    expect(hostBindingEls[0].id).toBe('red');

    // second element should not be affected
    expect(hostBindingEls[1].id).toBe('blue');

    comps[1].id = 'red';
    fixture.update();

    // now second element should take updated value
    expect(hostBindingEls[1].id).toBe('red');
  });

  it('should support dirs with host bindings on the same node as dirs without host bindings',
     () => {
       const SomeDir = createDirective('someDir');

       /** <div someDir hostBindingDir></div> */
       const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
         if (rf & RenderFlags.Create) {
           ɵɵelement(0, 'div', ['someDir', '', 'hostBindingDir', '']);
         }
       }, 1, 0, [SomeDir, HostBindingDir]);

       const fixture = new ComponentFixture(App);
       const hostBindingDiv = fixture.hostElement.querySelector('div') as HTMLElement;
       expect(hostBindingDiv.id).toEqual('foo');

       hostBindingDir !.id = 'bar';
       fixture.update();
       expect(hostBindingDiv.id).toEqual('bar');
     });

  it('should support host bindings that rely on values from init hooks', () => {
    class InitHookComp {
      // @Input()
      inputValue = '';

      changesValue = '';
      initValue = '';
      checkValue = '';

      ngOnChanges() { this.changesValue = 'changes'; }

      ngOnInit() { this.initValue = 'init'; }

      ngDoCheck() { this.checkValue = 'check'; }

      get value() {
        return `${this.inputValue}-${this.changesValue}-${this.initValue}-${this.checkValue}`;
      }

      static ngComponentDef = ɵɵdefineComponent({
        type: InitHookComp,
        selectors: [['init-hook-comp']],
        factory: () => new InitHookComp(),
        template: (rf: RenderFlags, ctx: InitHookComp) => {},
        consts: 0,
        vars: 0,
        features: [ɵɵNgOnChangesFeature()],
        hostBindings: (rf: RenderFlags, ctx: InitHookComp, elIndex: number) => {
          if (rf & RenderFlags.Create) {
            ɵɵallocHostVars(1);
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(elIndex, 'title', ɵɵbind(ctx.value), null, true);
          }
        },
        inputs: {inputValue: 'inputValue'}
      });
    }

    /** <init-hook-comp [inputValue]="value"></init-hook-comp> */
    class App {
      value = 'input';

      static ngComponentDef = ɵɵdefineComponent({
        type: App,
        selectors: [['app']],
        factory: () => new App(),
        template: (rf: RenderFlags, ctx: App) => {
          if (rf & RenderFlags.Create) {
            ɵɵelement(0, 'init-hook-comp');
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(0, 'inputValue', ɵɵbind(ctx.value));
          }
        },
        consts: 1,
        vars: 1,
        directives: [InitHookComp]
      });
    }

    const fixture = new ComponentFixture(App);
    const initHookComp = fixture.hostElement.querySelector('init-hook-comp') as HTMLElement;
    expect(initHookComp.title).toEqual('input-changes-init-check');

    fixture.component.value = 'input2';
    fixture.update();
    expect(initHookComp.title).toEqual('input2-changes-init-check');
  });

  it('should support host bindings with the same name as inputs', () => {
    let hostBindingInputDir !: HostBindingInputDir;

    class HostBindingInputDir {
      // @Input()
      disabled = false;

      // @HostBinding('disabled')
      hostDisabled = false;

      static ngDirectiveDef = ɵɵdefineDirective({
        type: HostBindingInputDir,
        selectors: [['', 'hostBindingDir', '']],
        factory: () => hostBindingInputDir = new HostBindingInputDir(),
        hostBindings: (rf: RenderFlags, ctx: HostBindingInputDir, elIndex: number) => {
          if (rf & RenderFlags.Create) {
            ɵɵallocHostVars(1);
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(elIndex, 'disabled', ɵɵbind(ctx.hostDisabled), null, true);
          }
        },
        inputs: {disabled: 'disabled'}
      });
    }

    /** <input hostBindingDir [disabled]="isDisabled"> */
    class App {
      isDisabled = true;

      static ngComponentDef = ɵɵdefineComponent({
        type: App,
        selectors: [['app']],
        factory: () => new App(),
        template: (rf: RenderFlags, ctx: App) => {
          if (rf & RenderFlags.Create) {
            ɵɵelement(0, 'input', ['hostBindingDir', '']);
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(0, 'disabled', ɵɵbind(ctx.isDisabled));
          }
        },
        consts: 1,
        vars: 1,
        directives: [HostBindingInputDir]
      });
    }

    const fixture = new ComponentFixture(App);
    const hostBindingEl = fixture.hostElement.querySelector('input') as HTMLInputElement;
    expect(hostBindingInputDir.disabled).toBe(true);
    expect(hostBindingEl.disabled).toBe(false);

    fixture.component.isDisabled = false;
    fixture.update();
    expect(hostBindingInputDir.disabled).toBe(false);
    expect(hostBindingEl.disabled).toBe(false);

    hostBindingInputDir.hostDisabled = true;
    fixture.update();
    expect(hostBindingInputDir.disabled).toBe(false);
    expect(hostBindingEl.disabled).toBe(true);
  });

  it('should support host bindings on second template pass', () => {
    /** <div hostBindingDir></div> */
    const Parent = createComponent('parent', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        ɵɵelement(0, 'div', ['hostBindingDir', '']);
      }
    }, 1, 0, [HostBindingDir]);

    /**
     * <parent></parent>
     * <parent></parent>
     */
    const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        ɵɵelement(0, 'parent');
        ɵɵelement(1, 'parent');
      }
    }, 2, 0, [Parent]);

    const fixture = new ComponentFixture(App);
    const divs = fixture.hostElement.querySelectorAll('div');
    expect(divs[0].id).toEqual('foo');
    expect(divs[1].id).toEqual('foo');
  });

  it('should support host bindings in for loop', () => {
    function NgForTemplate(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelementStart(0, 'div');
        { ɵɵelement(1, 'p', ['hostBindingDir', '']); }
        ɵɵelementEnd();
      }
    }

    /**
     * <div *ngFor="let row of rows">
     *   <p hostBindingDir></p>
     * </div>
     */
    const App = createComponent('parent', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        ɵɵtemplate(0, NgForTemplate, 2, 0, 'div', [AttributeMarker.Template, 'ngFor', 'ngForOf']);
      }
      if (rf & RenderFlags.Update) {
        ɵɵelementProperty(0, 'ngForOf', ɵɵbind(ctx.rows));
      }
    }, 1, 1, [HostBindingDir, NgForOf]);

    const fixture = new ComponentFixture(App);
    fixture.component.rows = [1, 2, 3];
    fixture.update();

    const paragraphs = fixture.hostElement.querySelectorAll('p');
    expect(paragraphs[0].id).toEqual('foo');
    expect(paragraphs[1].id).toEqual('foo');
    expect(paragraphs[2].id).toEqual('foo');
  });

  it('should support component with host bindings and array literals', () => {
    const ff = (v: any) => ['Nancy', v, 'Ned'];

    /**
     * <name-comp [names]="['Nancy', name, 'Ned']"></name-comp>
     * <host-binding-comp></host-binding-comp>
     */
    const AppComponent = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelement(0, 'name-comp');
        ɵɵelement(1, 'host-binding-comp');
      }
      if (rf & RenderFlags.Update) {
        ɵɵelementProperty(0, 'names', ɵɵbind(ɵɵpureFunction1(1, ff, ctx.name)));
      }
    }, 2, 3, [HostBindingComp, NameComp]);

    const fixture = new ComponentFixture(AppComponent);
    const hostBindingEl = fixture.hostElement.querySelector('host-binding-comp') as HTMLElement;
    fixture.component.name = 'Betty';
    fixture.update();
    expect(hostBindingEl.id).toBe('my-id');
    expect(nameComp !.names).toEqual(['Nancy', 'Betty', 'Ned']);

    const firstArray = nameComp !.names;
    fixture.update();
    expect(firstArray).toBe(nameComp !.names);

    fixture.component.name = 'my-id';
    fixture.update();
    expect(hostBindingEl.id).toBe('my-id');
    expect(nameComp !.names).toEqual(['Nancy', 'my-id', 'Ned']);
  });

  // Note: This is a contrived example. For feature parity with render2, we should make sure it
  // works in this way (see https://stackblitz.com/edit/angular-cbqpbe), but a more realistic
  // example would be an animation host binding with a literal defining the animation config.
  // When animation support is added, we should add another test for that case.
  it('should support host bindings that contain array literals', () => {
    const ff = (v: any) => ['red', v];
    const ff2 = (v: any, v2: any) => [v, v2];
    const ff3 = (v: any, v2: any) => [v, 'Nancy', v2];
    let hostBindingComp !: HostBindingComp;

    /**
     * @Component({
     *   ...
     *   host: {
     *     `[id]`: `['red', id]`,
     *     `[dir]`: `dir`,
     *     `[title]`: `[title, otherTitle]`
     *   }
     * })
     *
     */
    class HostBindingComp {
      id = 'blue';
      dir = 'ltr';
      title = 'my title';
      otherTitle = 'other title';

      static ngComponentDef = ɵɵdefineComponent({
        type: HostBindingComp,
        selectors: [['host-binding-comp']],
        factory: () => hostBindingComp = new HostBindingComp(),
        consts: 0,
        vars: 0,
        hostBindings: (rf: RenderFlags, ctx: HostBindingComp, elIndex: number) => {
          // LView: [..., id, dir, title, ctx.id, pf1, ctx.title, ctx.otherTitle, pf2]
          if (rf & RenderFlags.Create) {
            ɵɵallocHostVars(8);
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(elIndex, 'id', ɵɵbind(ɵɵpureFunction1(3, ff, ctx.id)), null, true);
            ɵɵelementProperty(elIndex, 'dir', ɵɵbind(ctx.dir), null, true);
            ɵɵelementProperty(
                elIndex, 'title', ɵɵbind(ɵɵpureFunction2(5, ff2, ctx.title, ctx.otherTitle)), null,
                true);
          }
        },
        template: (rf: RenderFlags, ctx: HostBindingComp) => {}
      });
    }

    /**
     * <name-comp [names]="[name, 'Nancy', otherName]"></name-comp>
     * <host-binding-comp></host-binding-comp>
     */
    const AppComponent = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelement(0, 'name-comp');
        ɵɵelement(1, 'host-binding-comp');
      }
      if (rf & RenderFlags.Update) {
        ɵɵelementProperty(0, 'names', ɵɵbind(ɵɵpureFunction2(1, ff3, ctx.name, ctx.otherName)));
      }
    }, 2, 4, [HostBindingComp, NameComp]);

    const fixture = new ComponentFixture(AppComponent);
    fixture.component.name = 'Frank';
    fixture.component.otherName = 'Joe';
    fixture.update();

    const hostBindingEl = fixture.hostElement.querySelector('host-binding-comp') as HTMLElement;
    expect(hostBindingEl.id).toBe('red,blue');
    expect(hostBindingEl.dir).toBe('ltr');
    expect(hostBindingEl.title).toBe('my title,other title');
    expect(nameComp !.names).toEqual(['Frank', 'Nancy', 'Joe']);

    const firstArray = nameComp !.names;
    fixture.update();
    expect(firstArray).toBe(nameComp !.names);

    hostBindingComp.id = 'green';
    hostBindingComp.dir = 'rtl';
    hostBindingComp.title = 'TITLE';
    fixture.update();
    expect(hostBindingEl.id).toBe('red,green');
    expect(hostBindingEl.dir).toBe('rtl');
    expect(hostBindingEl.title).toBe('TITLE,other title');
  });

  it('should support host bindings with literals from multiple directives', () => {
    let hostBindingComp !: HostBindingComp;
    let hostBindingDir !: HostBindingDir;

    const ff = (v: any) => ['red', v];

    /**
     * @Component({
     *   ...
     *   host: {
     *     '[id]': '['red', id]'
     *   }
     * })
     *
     */
    class HostBindingComp {
      id = 'blue';

      static ngComponentDef = ɵɵdefineComponent({
        type: HostBindingComp,
        selectors: [['host-binding-comp']],
        factory: () => hostBindingComp = new HostBindingComp(),
        consts: 0,
        vars: 0,
        hostBindings: (rf: RenderFlags, ctx: HostBindingComp, elIndex: number) => {
          // LView: [..., id, ctx.id, pf1]
          if (rf & RenderFlags.Create) {
            ɵɵallocHostVars(3);
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(elIndex, 'id', ɵɵbind(ɵɵpureFunction1(1, ff, ctx.id)), null, true);
          }
        },
        template: (rf: RenderFlags, ctx: HostBindingComp) => {}
      });
    }

    const ff1 = (v: any) => [v, 'other title'];

    /**
     * @Directive({
     *   ...
     *   host: {
     *     '[title]': '[title, 'other title']'
     *   }
     * })
     *
     */
    class HostBindingDir {
      title = 'my title';

      static ngDirectiveDef = ɵɵdefineDirective({
        type: HostBindingDir,
        selectors: [['', 'hostDir', '']],
        factory: () => hostBindingDir = new HostBindingDir(),
        hostBindings: (rf: RenderFlags, ctx: HostBindingDir, elIndex: number) => {
          // LView: [..., title, ctx.title, pf1]
          if (rf & RenderFlags.Create) {
            ɵɵallocHostVars(3);
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(
                elIndex, 'title', ɵɵbind(ɵɵpureFunction1(1, ff1, ctx.title)), null, true);
          }
        }
      });
    }

    /**
     * <host-binding-comp hostDir>
     * </host-binding-comp>
     */
    const AppComponent = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelement(0, 'host-binding-comp', ['hostDir', '']);
      }
    }, 1, 0, [HostBindingComp, HostBindingDir]);

    const fixture = new ComponentFixture(AppComponent);
    const hostElement = fixture.hostElement.querySelector('host-binding-comp') as HTMLElement;
    expect(hostElement.id).toBe('red,blue');
    expect(hostElement.title).toBe('my title,other title');

    hostBindingDir.title = 'blue';
    fixture.update();
    expect(hostElement.title).toBe('blue,other title');

    hostBindingComp.id = 'green';
    fixture.update();
    expect(hostElement.id).toBe('red,green');
  });

  it('should support directives with and without allocHostVars on the same component', () => {
    let events: string[] = [];

    const ff1 = (v: any) => [v, 'other title'];

    /**
     * @Directive({
     *   ...
     *   host: {
     *     '[title]': '[title, 'other title']'
     *   }
     * })
     *
     */
    class HostBindingDir {
      title = 'my title';

      static ngDirectiveDef = ɵɵdefineDirective({
        type: HostBindingDir,
        selectors: [['', 'hostDir', '']],
        factory: () => new HostBindingDir(),
        hostBindings: (rf: RenderFlags, ctx: HostBindingDir, elIndex: number) => {
          // LView [..., title, ctx.title, pf1]
          if (rf & RenderFlags.Create) {
            ɵɵallocHostVars(3);
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(
                elIndex, 'title', ɵɵbind(ɵɵpureFunction1(1, ff1, ctx.title)), null, true);
          }
        }
      });
    }

    class HostListenerDir {
      /* @HostListener('click') */
      onClick() { events.push('click!'); }

      static ngDirectiveDef = ɵɵdefineDirective({
        type: HostListenerDir,
        selectors: [['', 'hostListenerDir', '']],
        factory: function HostListenerDir_Factory() { return new HostListenerDir(); },
        hostBindings: function HostListenerDir_HostBindings(
            rf: RenderFlags, ctx: any, elIndex: number) {
          if (rf & RenderFlags.Create) {
            ɵɵlistener('click', function() { return ctx.onClick(); });
          }
        }
      });
    }

    // <button hostListenerDir hostDir>Click</button>
    const fixture = new TemplateFixture(() => {
      ɵɵelementStart(0, 'button', ['hostListenerDir', '', 'hostDir', '']);
      ɵɵtext(1, 'Click');
      ɵɵelementEnd();
    }, () => {}, 2, 0, [HostListenerDir, HostBindingDir]);

    const button = fixture.hostElement.querySelector('button') !;
    button.click();
    expect(events).toEqual(['click!']);
    expect(button.title).toEqual('my title,other title');
  });

  it('should support ternary expressions in host bindings', () => {
    let hostBindingComp !: HostBindingComp;

    const ff = (v: any) => ['red', v];
    const ff1 = (v: any) => [v];

    /**
     * @Component({
     *   ...
     *   host: {
     *     `[id]`: `condition ? ['red', id] : 'green'`,
     *     `[title]`: `otherCondition ? [title] : 'other title'`
     *   }
     * })
     *
     */
    class HostBindingComp {
      condition = true;
      otherCondition = true;
      id = 'blue';
      title = 'blue';

      static ngComponentDef = ɵɵdefineComponent({
        type: HostBindingComp,
        selectors: [['host-binding-comp']],
        factory: () => hostBindingComp = new HostBindingComp(),
        consts: 0,
        vars: 0,
        hostBindings: (rf: RenderFlags, ctx: HostBindingComp, elIndex: number) => {
          // LView: [..., id, title, ctx.id, pf1, ctx.title, pf1]
          if (rf & RenderFlags.Create) {
            ɵɵallocHostVars(6);
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(
                elIndex, 'id', ɵɵbind(ctx.condition ? ɵɵpureFunction1(2, ff, ctx.id) : 'green'),
                null, true);
            ɵɵelementProperty(
                elIndex, 'title',
                ɵɵbind(ctx.otherCondition ? ɵɵpureFunction1(4, ff1, ctx.title) : 'other title'),
                null, true);
          }
        },
        template: (rf: RenderFlags, ctx: HostBindingComp) => {}
      });
    }

    /**
     * <host-binding-comp></host-binding-comp>
     * {{ name }}
     */
    const AppComponent = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        ɵɵelement(0, 'host-binding-comp');
        ɵɵtext(1);
      }
      if (rf & RenderFlags.Update) {
        ɵɵtextBinding(1, ɵɵbind(ctx.name));
      }
    }, 2, 1, [HostBindingComp]);

    const fixture = new ComponentFixture(AppComponent);
    const hostElement = fixture.hostElement.querySelector('host-binding-comp') as HTMLElement;
    fixture.component.name = 'Ned';
    fixture.update();
    expect(hostElement.id).toBe('red,blue');
    expect(hostElement.title).toBe('blue');
    expect(fixture.html)
        .toEqual(`<host-binding-comp id="red,blue" title="blue"></host-binding-comp>Ned`);

    hostBindingComp.condition = false;
    hostBindingComp.title = 'TITLE';
    fixture.update();
    expect(hostElement.id).toBe('green');
    expect(hostElement.title).toBe('TITLE');

    hostBindingComp.otherCondition = false;
    fixture.update();
    expect(hostElement.id).toBe('green');
    expect(hostElement.title).toBe('other title');
  });

  it('should work correctly with inherited directives with hostBindings', () => {
    let subDir !: SubDirective;
    let superDir !: SuperDirective;

    class SuperDirective {
      id = 'my-id';

      static ngDirectiveDef = ɵɵdefineDirective({
        type: SuperDirective,
        selectors: [['', 'superDir', '']],
        hostBindings: (rf: RenderFlags, ctx: SuperDirective, elementIndex: number) => {
          if (rf & RenderFlags.Create) {
            ɵɵallocHostVars(1);
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(elementIndex, 'id', ɵɵbind(ctx.id), null, true);
          }
        },
        factory: () => superDir = new SuperDirective(),
      });
    }

    class SubDirective extends SuperDirective {
      title = 'my-title';

      static ngDirectiveDef = ɵɵdefineDirective({
        type: SubDirective,
        selectors: [['', 'subDir', '']],
        hostBindings: (rf: RenderFlags, ctx: SubDirective, elementIndex: number) => {
          if (rf & RenderFlags.Create) {
            ɵɵallocHostVars(1);
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(elementIndex, 'title', ɵɵbind(ctx.title), null, true);
          }
        },
        factory: () => subDir = new SubDirective(),
        features: [ɵɵInheritDefinitionFeature]
      });
    }

    const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        ɵɵelement(0, 'div', ['subDir', '']);
        ɵɵelement(1, 'div', ['superDir', '']);
      }
    }, 2, 0, [SubDirective, SuperDirective]);

    const fixture = new ComponentFixture(App);
    const els = fixture.hostElement.querySelectorAll('div') as NodeListOf<HTMLElement>;

    const firstDivEl = els[0];
    const secondDivEl = els[1];

    // checking first div element with inherited directive
    expect(firstDivEl.id).toEqual('my-id');
    expect(firstDivEl.title).toEqual('my-title');

    subDir.title = 'new-title';
    fixture.update();
    expect(firstDivEl.id).toEqual('my-id');
    expect(firstDivEl.title).toEqual('new-title');

    subDir.id = 'new-id';
    fixture.update();
    expect(firstDivEl.id).toEqual('new-id');
    expect(firstDivEl.title).toEqual('new-title');

    // checking second div element with simple directive
    expect(secondDivEl.id).toEqual('my-id');

    superDir.id = 'new-id';
    fixture.update();
    expect(secondDivEl.id).toEqual('new-id');
  });

  it('should support host attributes', () => {
    // host: {
    //  'role': 'listbox'
    // }
    class HostAttributeDir {
      static ngDirectiveDef = ɵɵdefineDirective({
        selectors: [['', 'hostAttributeDir', '']],
        type: HostAttributeDir,
        factory: () => new HostAttributeDir(),
        hostBindings: function(rf, ctx, elIndex) {
          if (rf & RenderFlags.Create) {
            ɵɵelementHostAttrs(['role', 'listbox']);
          }
        }
      });
    }

    // <div hostAttributeDir></div>
    const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        ɵɵelement(0, 'div', ['hostAttributeDir', '']);
      }
    }, 1, 0, [HostAttributeDir]);

    const fixture = new ComponentFixture(App);
    expect(fixture.html).toEqual(`<div hostattributedir="" role="listbox"></div>`);
  });

  it('should support content children in host bindings', () => {
    /**
     * host: {
     *   '[id]': 'foos.length'
     * }
     */
    class HostBindingWithContentChildren {
      // @ContentChildren('foo')
      foos !: QueryList<any>;

      static ngComponentDef = ɵɵdefineComponent({
        type: HostBindingWithContentChildren,
        selectors: [['host-binding-comp']],
        factory: () => new HostBindingWithContentChildren(),
        consts: 0,
        vars: 0,
        hostBindings: (rf: RenderFlags, ctx: HostBindingWithContentChildren, elIndex: number) => {
          if (rf & RenderFlags.Create) {
            ɵɵallocHostVars(1);
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(elIndex, 'id', ɵɵbind(ctx.foos.length), null, true);
          }
        },
        contentQueries: (rf: RenderFlags, ctx: any, dirIndex: number) => {
          if (rf & RenderFlags.Create) {
            ɵɵcontentQuery(dirIndex, ['foo'], false, null);
          }
          if (rf & RenderFlags.Update) {
            let tmp: any;
            ɵɵqueryRefresh(tmp = ɵɵloadContentQuery<ElementRef>()) && (ctx.foos = tmp);
          }
        },
        template: (rf: RenderFlags, cmp: HostBindingWithContentChildren) => {}
      });
    }

    /**
     * <host-binding-comp>
     *   <div #foo></div>
     *   <div #foo></div>
     * </host-binding-comp>
     */
    const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        ɵɵelementStart(0, 'host-binding-comp');
        {
          ɵɵelement(1, 'div', null, ['foo', '']);
          ɵɵelement(3, 'div', null, ['foo', '']);
        }
        ɵɵelementEnd();
      }
    }, 5, 0, [HostBindingWithContentChildren]);

    const fixture = new ComponentFixture(App);
    const hostBindingEl = fixture.hostElement.querySelector('host-binding-comp') as HTMLElement;
    expect(hostBindingEl.id).toEqual('2');
  });

  it('should support host bindings dependent on content hooks', () => {
    /**
     * host: {
     *   '[id]': 'myValue'
     * }
     */
    class HostBindingWithContentHooks {
      myValue = 'initial';

      ngAfterContentInit() { this.myValue = 'after-content'; }

      ngAfterViewInit() { this.myValue = 'after-view'; }

      static ngComponentDef = ɵɵdefineComponent({
        type: HostBindingWithContentHooks,
        selectors: [['host-binding-comp']],
        factory: () => new HostBindingWithContentHooks(),
        consts: 0,
        vars: 0,
        hostBindings: (rf: RenderFlags, ctx: HostBindingWithContentHooks, elIndex: number) => {
          if (rf & RenderFlags.Create) {
            ɵɵallocHostVars(1);
          }
          if (rf & RenderFlags.Update) {
            ɵɵelementProperty(elIndex, 'id', ɵɵbind(ctx.myValue), null, true);
          }
        },
        template: (rf: RenderFlags, cmp: HostBindingWithContentHooks) => {}
      });
    }

    /** <host-binding-comp></host-binding-comp> */
    const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
      if (rf & RenderFlags.Create) {
        ɵɵelement(0, 'host-binding-comp');
      }
    }, 1, 0, [HostBindingWithContentHooks]);

    const fixture = new ComponentFixture(App);
    const hostBindingEl = fixture.hostElement.querySelector('host-binding-comp') as HTMLElement;
    expect(hostBindingEl.id).toEqual('after-content');
  });

  describe('styles', () => {

    it('should bind to host styles', () => {
      let hostBindingDir !: HostBindingToStyles;
      /**
       * host: {
       *   '[style.width.px]': 'width'
       * }
       */
      class HostBindingToStyles {
        width = 2;

        static ngComponentDef = ɵɵdefineComponent({
          type: HostBindingToStyles,
          selectors: [['host-binding-to-styles']],
          factory: () => hostBindingDir = new HostBindingToStyles(),
          consts: 0,
          vars: 0,
          hostBindings: (rf: RenderFlags, ctx: HostBindingToStyles, elIndex: number) => {
            if (rf & RenderFlags.Create) {
              ɵɵelementHostStyling(null, ['width']);
            }
            if (rf & RenderFlags.Update) {
              ɵɵelementHostStyleProp(0, ctx.width, 'px');
              ɵɵelementHostStylingApply();
            }
          },
          template: (rf: RenderFlags, cmp: HostBindingToStyles) => {}
        });
      }

      /** <host-binding-to-styles></host-binding-to-styles> */
      const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
        if (rf & RenderFlags.Create) {
          ɵɵelement(0, 'host-binding-to-styles');
        }
      }, 1, 0, [HostBindingToStyles]);

      const fixture = new ComponentFixture(App);
      const hostBindingEl =
          fixture.hostElement.querySelector('host-binding-to-styles') as HTMLElement;
      expect(hostBindingEl.style.width).toEqual('2px');

      hostBindingDir.width = 5;
      fixture.update();
      expect(hostBindingEl.style.width).toEqual('5px');
    });

    it('should bind to host styles on containers', () => {
      let hostBindingDir !: HostBindingToStyles;
      /**
       * host: {
       *   '[style.width.px]': 'width'
       * }
       */
      class HostBindingToStyles {
        width = 2;

        static ngDirectiveDef = ɵɵdefineDirective({
          type: HostBindingToStyles,
          selectors: [['', 'hostStyles', '']],
          factory: () => hostBindingDir = new HostBindingToStyles(),
          hostBindings: (rf: RenderFlags, ctx: HostBindingToStyles, elIndex: number) => {
            if (rf & RenderFlags.Create) {
              ɵɵelementHostStyling(null, ['width']);
            }
            if (rf & RenderFlags.Update) {
              ɵɵelementHostStyleProp(0, ctx.width, 'px');
              ɵɵelementHostStylingApply();
            }
          }
        });
      }

      class ContainerDir {
        constructor(public vcr: ViewContainerRef) {}

        static ngDirectiveDef = ɵɵdefineDirective({
          type: ContainerDir,
          selectors: [['', 'containerDir', '']],
          factory: () => new ContainerDir(ɵɵdirectiveInject(ViewContainerRef as any)),
        });
      }

      /** <div hostStyles containerDir></div> */
      const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
        if (rf & RenderFlags.Create) {
          ɵɵelement(0, 'div', ['containerDir', '', 'hostStyles', '']);
        }
      }, 1, 0, [ContainerDir, HostBindingToStyles]);

      const fixture = new ComponentFixture(App);
      const hostBindingEl = fixture.hostElement.querySelector('div') as HTMLElement;
      expect(hostBindingEl.style.width).toEqual('2px');

      hostBindingDir.width = 5;
      fixture.update();
      expect(hostBindingEl.style.width).toEqual('5px');
    });

    it('should apply static host classes', () => {
      /**
       * host: {
       *   'class': 'mat-toolbar'
       * }
       */
      class StaticHostClass {
        static ngComponentDef = ɵɵdefineComponent({
          type: StaticHostClass,
          selectors: [['static-host-class']],
          factory: () => new StaticHostClass(),
          consts: 0,
          vars: 0,
          hostBindings: (rf: RenderFlags, ctx: StaticHostClass, elIndex: number) => {
            if (rf & RenderFlags.Create) {
              ɵɵelementHostAttrs([AttributeMarker.Classes, 'mat-toolbar']);
              ɵɵelementHostStyling(['mat-toolbar']);
            }
            if (rf & RenderFlags.Update) {
              ɵɵelementHostStylingApply();
            }
          },
          template: (rf: RenderFlags, cmp: StaticHostClass) => {}
        });
      }

      /** <static-host-class></static-host-class> */
      const App = createComponent('app', (rf: RenderFlags, ctx: any) => {
        if (rf & RenderFlags.Create) {
          ɵɵelement(0, 'static-host-class');
        }
      }, 1, 0, [StaticHostClass]);

      const fixture = new ComponentFixture(App);
      const hostBindingEl = fixture.hostElement.querySelector('static-host-class') as HTMLElement;
      expect(hostBindingEl.className).toEqual('mat-toolbar');
    });
  });

  describe('sanitization', () => {
    function verify(
        tag: string, prop: string, value: any, expectedSanitizedValue: any, sanitizeFn: any,
        bypassFn: any, isAttribute: boolean = true) {
      it('should sanitize potentially unsafe properties and attributes', () => {
        let hostBindingDir: UnsafeUrlHostBindingDir;
        class UnsafeUrlHostBindingDir {
          // val: any = value;
          static ngDirectiveDef = ɵɵdefineDirective({
            type: UnsafeUrlHostBindingDir,
            selectors: [['', 'unsafeUrlHostBindingDir', '']],
            factory: () => hostBindingDir = new UnsafeUrlHostBindingDir(),
            hostBindings: (rf: RenderFlags, ctx: any, elementIndex: number) => {
              if (rf & RenderFlags.Create) {
                ɵɵallocHostVars(1);
              }
              if (rf & RenderFlags.Update) {
                const fn = isAttribute ? ɵɵelementAttribute : ɵɵelementProperty;
                (fn as any)(elementIndex, prop, ɵɵbind(ctx[prop]), sanitizeFn, true);
              }
            }
          });
        }

        const fixture = new TemplateFixture(() => {
          ɵɵelement(0, tag, ['unsafeUrlHostBindingDir', '']);
        }, () => {}, 1, 0, [UnsafeUrlHostBindingDir]);

        const el = fixture.hostElement.querySelector(tag) !;
        const current = () => isAttribute ? el.getAttribute(prop) : (el as any)[prop];

        (hostBindingDir !as any)[prop] = value;
        fixture.update();
        expect(current()).toEqual(expectedSanitizedValue);

        (hostBindingDir !as any)[prop] = bypassFn(value);
        fixture.update();
        expect(current()).toEqual(value);
      });
    }

    verify(
        'a', 'href', 'javascript:alert(1)', 'unsafe:javascript:alert(1)',
        ɵɵsanitizeUrlOrResourceUrl, bypassSanitizationTrustUrl);
    verify(
        'script', 'src', bypassSanitizationTrustResourceUrl('javascript:alert(2)'),
        'javascript:alert(2)', ɵɵsanitizeUrlOrResourceUrl, bypassSanitizationTrustResourceUrl);
    verify(
        'blockquote', 'cite', 'javascript:alert(3)', 'unsafe:javascript:alert(3)', ɵɵsanitizeUrl,
        bypassSanitizationTrustUrl);
    verify(
        'b', 'innerHTML', '<img src="javascript:alert(4)">',
        '<img src="unsafe:javascript:alert(4)">', ɵɵsanitizeHtml, bypassSanitizationTrustHtml,
        /* isAttribute */ false);
  });
});
