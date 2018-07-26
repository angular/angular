/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter} from '@angular/core';

import {defineComponent, defineDirective, tick} from '../../src/render3/index';
import {NO_CHANGE, bind, container, containerRefreshEnd, containerRefreshStart, element, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, interpolation1, listener, loadDirective, reference, text, textBinding} from '../../src/render3/instructions';
import {RenderFlags} from '../../src/render3/interfaces/definition';

import {ComponentFixture, renderToHtml} from './render_util';

describe('elementProperty', () => {

  it('should support bindings to properties', () => {
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        element(0, 'span');
      }
      if (rf & RenderFlags.Update) {
        elementProperty(0, 'id', bind(ctx));
      }
    }

    expect(renderToHtml(Template, 'testId')).toEqual('<span id="testId"></span>');
    expect(renderToHtml(Template, 'otherId')).toEqual('<span id="otherId"></span>');
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

    expect(renderToHtml(Template, 'cheapId')).toEqual('<span id="cheapId"></span>');
    expect(renderToHtml(Template, 'expensiveId')).toEqual('<span id="cheapId"></span>');
  });

  it('should support interpolation for properties', () => {
    function Template(rf: RenderFlags, ctx: any) {
      if (rf & RenderFlags.Create) {
        element(0, 'span');
      }
      if (rf & RenderFlags.Update) {
        elementProperty(0, 'id', interpolation1('_', ctx, '_'));
      }
    }

    expect(renderToHtml(Template, 'testId')).toEqual('<span id="_testId_"></span>');
    expect(renderToHtml(Template, 'otherId')).toEqual('<span id="_otherId_"></span>');
  });

  it('should support host bindings on root component', () => {
    class HostBindingComp {
      id = 'my-id';

      static ngComponentDef = defineComponent({
        type: HostBindingComp,
        selectors: [['host-binding-comp']],
        factory: () => new HostBindingComp(),
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
    tick(fixture.component);
    expect(fixture.hostElement.id).toBe('other-id');
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
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'button', ['otherDir', '', 'myButton', '']);
          { text(1, 'Click me'); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'disabled', bind(ctx.isDisabled));
          elementProperty(0, 'id', bind(ctx.id));
        }
      }

      const ctx: any = {isDisabled: true, id: 0};
      expect(renderToHtml(Template, ctx, deps))
          .toEqual(`<button mybutton="" otherdir="">Click me</button>`);
      expect(button !.disabled).toEqual(true);
      expect(otherDir !.id).toEqual(0);

      ctx.isDisabled = false;
      ctx.id = 1;
      expect(renderToHtml(Template, ctx, deps))
          .toEqual(`<button mybutton="" otherdir="">Click me</button>`);
      expect(button !.disabled).toEqual(false);
      expect(otherDir !.id).toEqual(1);
    });

    it('should support mixed element properties and input properties', () => {

      /** <button myButton [id]="id" [disabled]="isDisabled">Click me</button> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'button', ['myButton', '']);
          { text(1, 'Click me'); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'disabled', bind(ctx.isDisabled));
          elementProperty(0, 'id', bind(ctx.id));
        }
      }

      const ctx: any = {isDisabled: true, id: 0};

      expect(renderToHtml(Template, ctx, deps))
          .toEqual(`<button id="0" mybutton="">Click me</button>`);
      expect(button !.disabled).toEqual(true);

      ctx.isDisabled = false;
      ctx.id = 1;
      expect(renderToHtml(Template, ctx, deps))
          .toEqual(`<button id="1" mybutton="">Click me</button>`);
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
          template: function(rf: RenderFlags, ctx: any) {},
          factory: () => comp = new Comp(),
          inputs: {id: 'id'}
        });
      }

      /** <comp [id]="id"></comp> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'comp');
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'id', bind(ctx.id));
        }
      }

      const deps = [Comp];
      expect(renderToHtml(Template, {id: 1}, deps)).toEqual(`<comp></comp>`);
      expect(comp !.id).toEqual(1);

      expect(renderToHtml(Template, {id: 2}, deps)).toEqual(`<comp></comp>`);
      expect(comp !.id).toEqual(2);
    });

    it('should support two input properties with the same name', () => {

      /** <button myButton otherDisabledDir [disabled]="isDisabled">Click me</button> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'button', ['myButton', '', 'otherDisabledDir', '']);
          { text(1, 'Click me'); }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'disabled', bind(ctx.isDisabled));
        }
      }

      const ctx: any = {isDisabled: true};
      expect(renderToHtml(Template, ctx, deps))
          .toEqual(`<button mybutton="" otherdisableddir="">Click me</button>`);
      expect(button !.disabled).toEqual(true);
      expect(otherDisabledDir !.disabled).toEqual(true);

      ctx.isDisabled = false;
      expect(renderToHtml(Template, ctx, deps))
          .toEqual(`<button mybutton="" otherdisableddir="">Click me</button>`);
      expect(button !.disabled).toEqual(false);
      expect(otherDisabledDir !.disabled).toEqual(false);
    });

    it('should set input property if there is an output first', () => {
      /** <button otherDir [id]="id" (click)="onClick()">Click me</button> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'button', ['otherDir', '']);
          {
            listener('click', ctx.onClick.bind(ctx));
            text(1, 'Click me');
          }
          elementEnd();
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'id', bind(ctx.id));
        }
      }

      let counter = 0;
      const ctx: any = {id: 1, onClick: () => counter++};
      expect(renderToHtml(Template, ctx, deps)).toEqual(`<button otherdir="">Click me</button>`);
      expect(otherDir !.id).toEqual(1);

      otherDir !.clickStream.next();
      expect(counter).toEqual(1);

      ctx.id = 2;
      renderToHtml(Template, ctx, deps);
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
      function Template(rf: RenderFlags, ctx: any) {
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
              let rf0 = embeddedViewStart(0);
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
              let rf1 = embeddedViewStart(1);
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
      }

      expect(renderToHtml(Template, {condition: true, id1: 'one', id2: 'two', id3: 3}, deps))
          .toEqual(`<button iddir="">Click me</button><button id="two">Click me too</button>`);
      expect(idDir !.idNumber).toEqual('one');

      expect(renderToHtml(Template, {condition: false, id1: 'four', id2: 'two', id3: 3}, deps))
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
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['role', 'button', 'myDir', '']);
        }
      }

      expect(renderToHtml(Template, {}, deps)).toEqual(`<div mydir="" role="button"></div>`);
      expect(myDir !.role).toEqual('button');
    });

    it('should set input property and attribute if both defined', () => {

      /** <div role="button" [role]="role" myDir></div> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['role', 'button', 'myDir', '']);
        }
        if (rf & RenderFlags.Update) {
          elementProperty(0, 'role', bind(ctx.role));
        }
      }

      expect(renderToHtml(Template, {role: 'listbox'}, deps))
          .toEqual(`<div mydir="" role="button"></div>`);
      expect(myDir !.role).toEqual('listbox');

      renderToHtml(Template, {role: 'button'}, deps);
      expect(myDir !.role).toEqual('button');
    });

    it('should set two directive input properties based on same attribute', () => {

      /** <div role="button" myDir myDirB></div> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['role', 'button', 'myDir', '', 'myDirB', '']);
        }
      }

      expect(renderToHtml(Template, {}, deps))
          .toEqual(`<div mydir="" mydirb="" role="button"></div>`);
      expect(myDir !.role).toEqual('button');
      expect(dirB !.roleB).toEqual('button');
    });

    it('should process two attributes on same directive', () => {

      /** <div role="button" dir="rtl" myDir></div> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['role', 'button', 'dir', 'rtl', 'myDir', '']);
        }
      }

      expect(renderToHtml(Template, {}, deps))
          .toEqual(`<div dir="rtl" mydir="" role="button"></div>`);
      expect(myDir !.role).toEqual('button');
      expect(myDir !.direction).toEqual('rtl');
    });

    it('should process attributes and outputs properly together', () => {

      /** <div role="button" (change)="onChange()" myDir></div> */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          elementStart(0, 'div', ['role', 'button', 'myDir', '']);
          { listener('change', ctx.onChange.bind(ctx)); }
          elementEnd();
        }
      }

      let counter = 0;
      expect(renderToHtml(Template, {onChange: () => counter++}, deps))
          .toEqual(`<div mydir="" role="button"></div>`);
      expect(myDir !.role).toEqual('button');

      myDir !.changeStream.next();
      expect(counter).toEqual(1);
    });

    it('should process attributes properly for directives with later indices', () => {

      /**
       * <div role="button" dir="rtl" myDir></div>
       * <div role="listbox" myDirB></div>
       */
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['role', 'button', 'dir', 'rtl', 'myDir', '']);
          element(1, 'div', ['role', 'listbox', 'myDirB', '']);
        }
      }

      expect(renderToHtml(Template, {}, deps))
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
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          element(0, 'div', ['role', 'listbox', 'myDir', '']);
          container(1);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(1);
          {
            if (ctx.condition) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'div', ['role', 'button', 'myDirB', '']);
              }
              embeddedViewEnd();
            } else {
              let rf2 = embeddedViewStart(1);
              if (rf2 & RenderFlags.Create) {
                element(0, 'div', ['role', 'menu']);
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      expect(renderToHtml(Template, {condition: true}, deps))
          .toEqual(`<div mydir="" role="listbox"></div><div mydirb="" role="button"></div>`);
      expect(myDir !.role).toEqual('listbox');
      expect(dirB !.roleB).toEqual('button');
      expect((dirB !as any).role).toBeUndefined();

      expect(renderToHtml(Template, {condition: false}, deps))
          .toEqual(`<div mydir="" role="listbox"></div><div role="menu"></div>`);
      expect(myDir !.role).toEqual('listbox');
    });

    it('should process attributes properly inside a for loop', () => {

      class Comp {
        static ngComponentDef = defineComponent({
          type: Comp,
          selectors: [['comp']],
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
      function Template(rf: RenderFlags, ctx: any) {
        if (rf & RenderFlags.Create) {
          container(0);
        }
        if (rf & RenderFlags.Update) {
          containerRefreshStart(0);
          {
            for (let i = 0; i < 2; i++) {
              let rf1 = embeddedViewStart(0);
              if (rf1 & RenderFlags.Create) {
                element(0, 'comp');
              }
              embeddedViewEnd();
            }
          }
          containerRefreshEnd();
        }
      }

      expect(renderToHtml(Template, {}, [Comp]))
          .toEqual(
              `<comp><div mydir="" role="button"></div>button</comp><comp><div mydir="" role="button"></div>button</comp>`);
    });

  });

});
