/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter} from '@angular/core';

import {AttributeMarker, defineComponent, defineDirective, tick} from '../../src/render3/index';
import {NO_CHANGE, bind, container, containerRefreshEnd, containerRefreshStart, element, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, interpolation1, listener, loadDirective, reference, text, textBinding} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';
import {pureFunction1, pureFunction2} from '../../src/render3/pure_function';

import {ComponentFixture, TemplateFixture, createComponent, renderToHtml} from './render_util';

describe('elementProperty', () => {

  it('should support bindings to properties', () => {
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        element(0, 'span');
      }
      if (rf & RenderFlags.Update) {
        elementProperty(0, 'id', bind(ctx.id));
      }
    }, 1, 1);

    const fixture = new ComponentFixture(App);
    fixture.component.id = 'testId';
    fixture.update();
    expect(fixture.html).toEqual('<span id="testId"></span>');

    fixture.component.id = 'otherId';
    fixture.update();
    expect(fixture.html).toEqual('<span id="otherId"></span>');
  });

  it('should support creation time bindings to properties', () => {
    function expensive(ctx: string): any {
      if (ctx === 'cheapId') {
        return ctx;
      } else {
        throw 'Too expensive!';
      }
    }

    function Template(rf: RenderFlags, ctx: string) {
      if (rf & RenderFlags.Create) {
        element(0, 'span');
      }
      if (rf & RenderFlags.Update) {
        elementProperty(0, 'id', rf & RenderFlags.Create ? expensive(ctx) : NO_CHANGE);
      }
    }

    expect(renderToHtml(Template, 'cheapId', 1)).toEqual('<span id="cheapId"></span>');
    expect(renderToHtml(Template, 'expensiveId', 1)).toEqual('<span id="cheapId"></span>');
  });

  it('should support interpolation for properties', () => {
    const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        element(0, 'span');
      }
      if (rf & RenderFlags.Update) {
        elementProperty(0, 'id', interpolation1('_', ctx.id, '_'));
      }
    }, 1, 1);

    const fixture = new ComponentFixture(App);
    fixture.component.id = 'testId';
    fixture.update();
    expect(fixture.html).toEqual('<span id="_testId_"></span>');

    fixture.component.id = 'otherId';
    fixture.update();
    expect(fixture.html).toEqual('<span id="_otherId_"></span>');
  });

  describe('host', () => {
    let nameComp !: NameComp;

    class NameComp {
      names !: string[];

      static ngComponentDef = defineComponent({
        type: NameComp,
        selectors: [['name-comp']],
        factory: function NameComp_Factory() { return nameComp = new NameComp(); },
        consts: 0,
        vars: 0,
        template: function NameComp_Template(rf: RenderFlags, ctx: NameComp) {},
        inputs: {names: 'names'}
      });
    }

    it('should support host bindings in directives', () => {
      let directiveInstance: Directive|undefined;

      class Directive {
        // @HostBinding('className')
        klass = 'foo';

        static ngDirectiveDef = defineDirective({
          type: Directive,
          selectors: [['', 'dir', '']],
          factory: () => directiveInstance = new Directive,
          hostVars: 1,
          hostBindings: (directiveIndex: number, elementIndex: number) => {
            elementProperty(
                elementIndex, 'className', bind(loadDirective<Directive>(directiveIndex).klass));
          }
        });
      }

      function Template() { element(0, 'span', [AttributeMarker.SelectOnly, 'dir']); }

      const fixture = new TemplateFixture(Template, () => {}, 1, 0, [Directive]);
      expect(fixture.html).toEqual('<span class="foo"></span>');

      directiveInstance !.klass = 'bar';
      fixture.update();
      expect(fixture.html).toEqual('<span class="bar"></span>');
    });

    it('should support host bindings on root component', () => {
      class HostBindingComp {
        // @HostBinding()
        id = 'my-id';

        static ngComponentDef = defineComponent({
          type: HostBindingComp,
          selectors: [['host-binding-comp']],
          factory: () => new HostBindingComp(),
          consts: 0,
          vars: 0,
          hostVars: 1,
          hostBindings: (dirIndex: number, elIndex: number) => {
            const instance = loadDirective(dirIndex) as HostBindingComp;
            elementProperty(elIndex, 'id', bind(instance.id));
          },
          template: (rf: RenderFlags, ctx: HostBindingComp) => {}
        });
      }

      const fixture = new ComponentFixture(HostBindingComp);
      expect(fixture.hostElement.id).toBe('my-id');

      fixture.component.id = 'other-id';
      fixture.update();
      expect(fixture.hostElement.id).toBe('other-id');
    });

    it('should support component with host bindings and array literals', () => {
      const ff = (v: any) => ['Nancy', v, 'Ned'];

      class HostBindingComp {
        // @HostBinding()
        id = 'my-id';

        static ngComponentDef = defineComponent({
          type: HostBindingComp,
          selectors: [['host-binding-comp']],
          factory: () => new HostBindingComp(),
          consts: 0,
          vars: 0,
          hostVars: 1,
          hostBindings: (dirIndex: number, elIndex: number) => {
            const ctx = loadDirective(dirIndex) as HostBindingComp;
            elementProperty(elIndex, 'id', bind(ctx.id));
          },
          template: (rf: RenderFlags, ctx: HostBindingComp) => {}
        });
      }

      /**
       * <name-comp [names]="['Nancy', name, 'Ned']"></name-comp>
       * <host-binding-comp></host-binding-comp>
       */
      const AppComponent = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'name-comp');
          element(1, 'host-binding-comp');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'names', bind(pureFunction1(1, ff, ctx.name)));
        }
      }, 2, 3, [HostBindingComp, NameComp]);

      const fixture = new ComponentFixture(AppComponent);
      const hostBindingEl = fixture.hostElement.querySelector('host-binding-comp') as HTMLElement;
      fixture.component.name = 'Betty';
      fixture.update();
      expect(hostBindingEl.id).toBe('my-id');
      expect(nameComp.names).toEqual(['Nancy', 'Betty', 'Ned']);

      const firstArray = nameComp.names;
      fixture.update();
      expect(firstArray).toBe(nameComp.names);

      fixture.component.name = 'my-id';
      fixture.update();
      expect(hostBindingEl.id).toBe('my-id');
      expect(nameComp.names).toEqual(['Nancy', 'my-id', 'Ned']);
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

        static ngComponentDef = defineComponent({
          type: HostBindingComp,
          selectors: [['host-binding-comp']],
          factory: () => hostBindingComp = new HostBindingComp(),
          consts: 0,
          vars: 0,
          hostVars: 8,
          hostBindings: (dirIndex: number, elIndex: number) => {
            const ctx = loadDirective(dirIndex) as HostBindingComp;
            // LViewData: [..., id, dir, title, ctx.id, pf1, ctx.title, ctx.otherTitle, pf2]
            elementProperty(elIndex, 'id', bind(pureFunction1(3, ff, ctx.id)));
            elementProperty(elIndex, 'dir', bind(ctx.dir));
            elementProperty(
                elIndex, 'title', bind(pureFunction2(5, ff2, ctx.title, ctx.otherTitle)));
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
          element(0, 'name-comp');
          element(1, 'host-binding-comp');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'names', bind(pureFunction2(1, ff3, ctx.name, ctx.otherName)));
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
      expect(nameComp.names).toEqual(['Frank', 'Nancy', 'Joe']);

      const firstArray = nameComp.names;
      fixture.update();
      expect(firstArray).toBe(nameComp.names);

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

        static ngComponentDef = defineComponent({
          type: HostBindingComp,
          selectors: [['host-binding-comp']],
          factory: () => hostBindingComp = new HostBindingComp(),
          consts: 0,
          vars: 0,
          hostVars: 3,
          hostBindings: (dirIndex: number, elIndex: number) => {
            // LViewData: [..., id, ctx.id, pf1]
            const ctx = loadDirective(dirIndex) as HostBindingComp;
            elementProperty(elIndex, 'id', bind(pureFunction1(1, ff, ctx.id)));
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

        static ngDirectiveDef = defineDirective({
          type: HostBindingDir,
          selectors: [['', 'hostDir', '']],
          factory: () => hostBindingDir = new HostBindingDir(),
          hostVars: 3,
          hostBindings: (dirIndex: number, elIndex: number) => {
            // LViewData [..., title, ctx.title, pf1]
            const ctx = loadDirective(dirIndex) as HostBindingDir;
            elementProperty(elIndex, 'title', bind(pureFunction1(1, ff1, ctx.title)));
          }
        });
      }

      /**
       * <host-binding-comp hostDir>
       * </host-binding-comp>
       */
      const AppComponent = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'host-binding-comp', ['hostDir', '']);
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

        static ngComponentDef = defineComponent({
          type: HostBindingComp,
          selectors: [['host-binding-comp']],
          factory: () => hostBindingComp = new HostBindingComp(),
          consts: 0,
          vars: 0,
          hostVars: 6,
          hostBindings: (dirIndex: number, elIndex: number) => {
            // LViewData: [..., id, title, ctx.id, pf1, ctx.title, pf1]
            const ctx = loadDirective(dirIndex) as HostBindingComp;
            elementProperty(
                elIndex, 'id', bind(ctx.condition ? pureFunction1(2, ff, ctx.id) : 'green'));
            elementProperty(
                elIndex, 'title',
                bind(ctx.otherCondition ? pureFunction1(4, ff1, ctx.title) : 'other title'));
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
          element(0, 'host-binding-comp');
          text(1);
        }
        if (rf & RenderFlags.Update) {
          textBinding(1, bind(ctx.name));
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

  });

  describe('input properties', () => {
    let button: MyButton;
    let otherDir: OtherDir;
    let otherDisabledDir: OtherDisabledDir;
    let idDir: IdDir;

    class MyButton {
      // TODO(issue/24571): remove '!'.
      disabled !: boolean;

      static ngDirectiveDef = defineDirective({
        type: MyButton,
        selectors: [['', 'myButton', '']],
        factory: () => button = new MyButton(),
        inputs: {disabled: 'disabled'}
      });
    }

    class OtherDir {
      // TODO(issue/24571): remove '!'.
      id !: number;
      clickStream = new EventEmitter();

      static ngDirectiveDef = defineDirective({
        type: OtherDir,
        selectors: [['', 'otherDir', '']],
        factory: () => otherDir = new OtherDir(),
        inputs: {id: 'id'},
        outputs: {clickStream: 'click'}
      });
    }

    class OtherDisabledDir {
      // TODO(issue/24571): remove '!'.
      disabled !: boolean;

      static ngDirectiveDef = defineDirective({
        type: OtherDisabledDir,
        selectors: [['', 'otherDisabledDir', '']],
        factory: () => otherDisabledDir = new OtherDisabledDir(),
        inputs: {disabled: 'disabled'}
      });
    }

    class IdDir {
      // TODO(issue/24571): remove '!'.
      idNumber !: string;

      static ngDirectiveDef = defineDirective({
        type: IdDir,
        selectors: [['', 'idDir', '']],
        factory: () => idDir = new IdDir(),
        inputs: {idNumber: 'id'}
      });
    }


    const deps = [MyButton, OtherDir, OtherDisabledDir, IdDir];

    it('should check input properties before setting (directives)', () => {

      /** <button myButton otherDir [id]="id" [disabled]="isDisabled">Click me</button> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'button', ['otherDir', '', 'myButton', '']);
          { text(1, 'Click me'); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'disabled', bind(ctx.isDisabled));
          elementProperty(0, 'id', bind(ctx.id));
        }
      }, 2, 2, deps);

      const fixture = new ComponentFixture(App);
      fixture.component.isDisabled = true;
      fixture.component.id = 0;
      fixture.update();
      expect(fixture.html).toEqual(`<button mybutton="" otherdir="">Click me</button>`);
      expect(button !.disabled).toEqual(true);
      expect(otherDir !.id).toEqual(0);

      fixture.component.isDisabled = false;
      fixture.component.id = 1;
      fixture.update();
      expect(fixture.html).toEqual(`<button mybutton="" otherdir="">Click me</button>`);
      expect(button !.disabled).toEqual(false);
      expect(otherDir !.id).toEqual(1);
    });

    it('should support mixed element properties and input properties', () => {

      /** <button myButton [id]="id" [disabled]="isDisabled">Click me</button> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'button', ['myButton', '']);
          { text(1, 'Click me'); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'disabled', bind(ctx.isDisabled));
          elementProperty(0, 'id', bind(ctx.id));
        }
      }, 2, 2, deps);


      const fixture = new ComponentFixture(App);
      fixture.component.isDisabled = true;
      fixture.component.id = 0;
      fixture.update();
      expect(fixture.html).toEqual(`<button id="0" mybutton="">Click me</button>`);
      expect(button !.disabled).toEqual(true);

      fixture.component.isDisabled = false;
      fixture.component.id = 1;
      fixture.update();
      expect(fixture.html).toEqual(`<button id="1" mybutton="">Click me</button>`);
      expect(button !.disabled).toEqual(false);
    });

    it('should check that property is not an input property before setting (component)', () => {
      let comp: Comp;

      class Comp {
        // TODO(issue/24571): remove '!'.
        id !: number;

        static ngComponentDef = defineComponent({
          type: Comp,
          selectors: [['comp']],
          consts: 0,
          vars: 0,
          template: function(rf: RenderFlags, ctx: any) {},
          factory: () => comp = new Comp(),
          inputs: {id: 'id'}
        });
      }

      /** <comp [id]="id"></comp> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'comp');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'id', bind(ctx.id));
        }
      }, 1, 1, [Comp]);

      const fixture = new ComponentFixture(App);
      fixture.component.id = 1;
      fixture.update();
      expect(fixture.html).toEqual(`<comp></comp>`);
      expect(comp !.id).toEqual(1);

      fixture.component.id = 2;
      fixture.update();
      expect(fixture.html).toEqual(`<comp></comp>`);
      expect(comp !.id).toEqual(2);
    });

    it('should support two input properties with the same name', () => {

      /** <button myButton otherDisabledDir [disabled]="isDisabled">Click me</button> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'button', ['myButton', '', 'otherDisabledDir', '']);
          { text(1, 'Click me'); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'disabled', bind(ctx.isDisabled));
        }
      }, 2, 1, deps);

      const fixture = new ComponentFixture(App);
      fixture.component.isDisabled = true;
      fixture.update();
      expect(fixture.html).toEqual(`<button mybutton="" otherdisableddir="">Click me</button>`);
      expect(button !.disabled).toEqual(true);
      expect(otherDisabledDir !.disabled).toEqual(true);

      fixture.component.isDisabled = false;
      fixture.update();
      expect(fixture.html).toEqual(`<button mybutton="" otherdisableddir="">Click me</button>`);
      expect(button !.disabled).toEqual(false);
      expect(otherDisabledDir !.disabled).toEqual(false);
    });

    it('should set input property if there is an output first', () => {
      /** <button otherDir [id]="id" (click)="onClick()">Click me</button> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'button', ['otherDir', '']);
          {
            listener('click', () => ctx.onClick());
            text(1, 'Click me');
          }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'id', bind(ctx.id));
        }
      }, 2, 1, deps);

      const fixture = new ComponentFixture(App);
      let counter = 0;
      fixture.component.id = 1;
      fixture.component.onClick = () => counter++;
      fixture.update();
      expect(fixture.html).toEqual(`<button otherdir="">Click me</button>`);
      expect(otherDir !.id).toEqual(1);

      otherDir !.clickStream.next();
      expect(counter).toEqual(1);

      fixture.component.id = 2;
      fixture.update();
      fixture.html;
      expect(otherDir !.id).toEqual(2);
    });

    it('should support unrelated element properties at same index in if-else block', () => {
      /**
       * <button idDir [id]="id1">Click me</button>             // inputs: {'id': [0, 'idNumber']}
       * % if (condition) {
       *   <button [id]="id2">Click me too</button>             // inputs: null
       * % } else {
       *   <button otherDir [id]="id3">Click me too</button>   // inputs: {'id': [0, 'id']}
       * % }
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'button', ['idDir', '']);
          { text(1, 'Click me'); }
          elementEnd();
          container(2);
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'id', bind(ctx.id1));
          containerRefreshStart(2);
          {
            if (ctx.condition) {
              let rf0 = embeddedViewStart(0, 2, 1);
              if (rf0 & RenderFlags.Create) {
                elementStart(0, 'button');
                { text(1, 'Click me too'); }
                elementEnd();
              }
              if (rf0 & RenderFlags.Update) {
                elementProperty(0, 'id', bind(ctx.id2));
              }
              embeddedViewEnd();
            } else {
              let rf1 = embeddedViewStart(1, 2, 1);
              if (rf1 & RenderFlags.Create) {
                elementStart(0, 'button', ['otherDir', '']);
                { text(1, 'Click me too'); }
                elementEnd();
              }
              if (rf1 & RenderFlags.Update) {
                elementProperty(0, 'id', bind(ctx.id3));
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }, 3, 1, deps);

      const fixture = new ComponentFixture(App);
      fixture.component.condition = true;
      fixture.component.id1 = 'one';
      fixture.component.id2 = 'two';
      fixture.component.id3 = 3;
      fixture.update();
      expect(fixture.html)
          .toEqual(`<button iddir="">Click me</button><button id="two">Click me too</button>`);
      expect(idDir !.idNumber).toEqual('one');

      fixture.component.condition = false;
      fixture.component.id1 = 'four';
      fixture.update();
      expect(fixture.html)
          .toEqual(`<button iddir="">Click me</button><button otherdir="">Click me too</button>`);
      expect(idDir !.idNumber).toEqual('four');
      expect(otherDir !.id).toEqual(3);
    });

  });

  describe('attributes and input properties', () => {
    let myDir: MyDir;
    class MyDir {
      // TODO(issue/24571): remove '!'.
      role !: string;
      // TODO(issue/24571): remove '!'.
      direction !: string;
      changeStream = new EventEmitter();

      static ngDirectiveDef = defineDirective({
        type: MyDir,
        selectors: [['', 'myDir', '']],
        factory: () => myDir = new MyDir(),
        inputs: {role: 'role', direction: 'dir'},
        outputs: {changeStream: 'change'},
        exportAs: 'myDir'
      });
    }

    let dirB: MyDirB;
    class MyDirB {
      // TODO(issue/24571): remove '!'.
      roleB !: string;

      static ngDirectiveDef = defineDirective({
        type: MyDirB,
        selectors: [['', 'myDirB', '']],
        factory: () => dirB = new MyDirB(),
        inputs: {roleB: 'role'}
      });
    }

    const deps = [MyDir, MyDirB];

    it('should set input property based on attribute if existing', () => {

      /** <div role="button" myDir></div> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['role', 'button', 'myDir', '']);
        }
      }, 1, 0, deps);

      const fixture = new ComponentFixture(App);
      expect(fixture.html).toEqual(`<div mydir="" role="button"></div>`);
      expect(myDir !.role).toEqual('button');
    });

    it('should set input property and attribute if both defined', () => {

      /** <div role="button" [role]="role" myDir></div> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['role', 'button', 'myDir', '']);
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'role', bind(ctx.role));
        }
      }, 1, 1, deps);

      const fixture = new ComponentFixture(App);
      fixture.component.role = 'listbox';
      fixture.update();
      expect(fixture.html).toEqual(`<div mydir="" role="button"></div>`);
      expect(myDir !.role).toEqual('listbox');

      fixture.component.role = 'button';
      fixture.update();
      expect(myDir !.role).toEqual('button');
    });

    it('should set two directive input properties based on same attribute', () => {

      /** <div role="button" myDir myDirB></div> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['role', 'button', 'myDir', '', 'myDirB', '']);
        }
      }, 1, 0, deps);

      const fixture = new ComponentFixture(App);
      expect(fixture.html).toEqual(`<div mydir="" mydirb="" role="button"></div>`);
      expect(myDir !.role).toEqual('button');
      expect(dirB !.roleB).toEqual('button');
    });

    it('should process two attributes on same directive', () => {

      /** <div role="button" dir="rtl" myDir></div> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['role', 'button', 'dir', 'rtl', 'myDir', '']);
        }
      }, 1, 0, deps);

      const fixture = new ComponentFixture(App);
      expect(fixture.html).toEqual(`<div dir="rtl" mydir="" role="button"></div>`);
      expect(myDir !.role).toEqual('button');
      expect(myDir !.direction).toEqual('rtl');
    });

    it('should process attributes and outputs properly together', () => {

      /** <div role="button" (change)="onChange()" myDir></div> */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div', ['role', 'button', 'myDir', '']);
          { listener('change', () => ctx.onChange()); }
          elementEnd();
        }
      }, 1, 0, deps);

      const fixture = new ComponentFixture(App);
      let counter = 0;
      fixture.component.onChange = () => counter++;
      fixture.update();
      expect(fixture.html).toEqual(`<div mydir="" role="button"></div>`);
      expect(myDir !.role).toEqual('button');

      myDir !.changeStream.next();
      expect(counter).toEqual(1);
    });

    it('should process attributes properly for directives with later indices', () => {

      /**
       * <div role="button" dir="rtl" myDir></div>
       * <div role="listbox" myDirB></div>
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['role', 'button', 'dir', 'rtl', 'myDir', '']);
          element(1, 'div', ['role', 'listbox', 'myDirB', '']);
        }
      }, 2, 0, deps);

      const fixture = new ComponentFixture(App);
      expect(fixture.html)
          .toEqual(
              `<div dir="rtl" mydir="" role="button"></div><div mydirb="" role="listbox"></div>`);
      expect(myDir !.role).toEqual('button');
      expect(myDir !.direction).toEqual('rtl');
      expect(dirB !.roleB).toEqual('listbox');
    });

    it('should support attributes at same index inside an if-else block', () => {
      /**
       * <div role="listbox" myDir></div>          // initialInputs: [['role', 'listbox']]
       *
       * % if (condition) {
       *   <div role="button" myDirB></div>       // initialInputs: [['role', 'button']]
       * % } else {
       *   <div role="menu"></div>               // initialInputs: [null]
       * % }
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['role', 'listbox', 'myDir', '']);
          container(1);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(1);
          {
            if (ctx.condition) {
              let rf1 = embeddedViewStart(0, 1, 0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'div', ['role', 'button', 'myDirB', '']);
              }
              embeddedViewEnd();
            } else {
              let rf2 = embeddedViewStart(1, 1, 0);
              if (rf2 & RenderFlags.Create) {
                element(0, 'div', ['role', 'menu']);
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }, 2, 0, deps);

      const fixture = new ComponentFixture(App);
      fixture.component.condition = true;
      fixture.update();
      expect(fixture.html)
          .toEqual(`<div mydir="" role="listbox"></div><div mydirb="" role="button"></div>`);
      expect(myDir !.role).toEqual('listbox');
      expect(dirB !.roleB).toEqual('button');
      expect((dirB !as any).role).toBeUndefined();

      fixture.component.condition = false;
      fixture.update();
      expect(fixture.html).toEqual(`<div mydir="" role="listbox"></div><div role="menu"></div>`);
      expect(myDir !.role).toEqual('listbox');
    });

    it('should process attributes properly inside a for loop', () => {

      class Comp {
        static ngComponentDef = defineComponent({
          type: Comp,
          selectors: [['comp']],
          consts: 3,
          vars: 1,
          /** <div role="button" dir #dir="myDir"></div> {{ dir.role }} */
          template: function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              element(0, 'div', ['role', 'button', 'myDir', ''], ['dir', 'myDir']);
              text(2);
            }
            if (rf & RenderFlags.Update) {
              const tmp = reference(1) as any;
              textBinding(2, bind(tmp.role));
            }
          },
          factory: () => new Comp(),
          directives: () => [MyDir]
        });
      }

      /**
       * % for (let i = 0; i < 3; i++) {
       *     <comp></comp>
       * % }
       */
      const App = createComponent('app', function(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            for (let i = 0; i < 2; i++) {
              let rf1 = embeddedViewStart(0, 1, 0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'comp');
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }, 1, 0, [Comp]);

      const fixture = new ComponentFixture(App);
      expect(fixture.html)
          .toEqual(
              `<comp><div mydir="" role="button"></div>button</comp><comp><div mydir="" role="button"></div>button</comp>`);
    });

  });

});
