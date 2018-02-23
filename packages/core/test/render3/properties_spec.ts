/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter} from '@angular/core';

import {defineComponent, defineDirective} from '../../src/render3/index';
import {NO_CHANGE, bind, container, containerRefreshEnd, containerRefreshStart, directiveRefresh, elementEnd, elementProperty, elementStart, embeddedViewEnd, embeddedViewStart, interpolation1, listener, load, text, textBinding} from '../../src/render3/instructions';

import {renderToHtml} from './render_util';

describe('elementProperty', () => {

  it('should support bindings to properties', () => {
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'span');
        elementEnd();
      }
      elementProperty(0, 'id', bind(ctx));
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

    function Template(ctx: string, cm: boolean) {
      if (cm) {
        elementStart(0, 'span');
        elementEnd();
      }
      elementProperty(0, 'id', cm ? expensive(ctx) : NO_CHANGE);
    }

    expect(renderToHtml(Template, 'cheapId')).toEqual('<span id="cheapId"></span>');
    expect(renderToHtml(Template, 'expensiveId')).toEqual('<span id="cheapId"></span>');
  });

  it('should support interpolation for properties', () => {
    function Template(ctx: any, cm: boolean) {
      if (cm) {
        elementStart(0, 'span');
        elementEnd();
      }
      elementProperty(0, 'id', interpolation1('_', ctx, '_'));
    }

    expect(renderToHtml(Template, 'testId')).toEqual('<span id="_testId_"></span>');
    expect(renderToHtml(Template, 'otherId')).toEqual('<span id="_otherId_"></span>');
  });

  describe('input properties', () => {
    let button: MyButton;
    let otherDir: OtherDir;

    class MyButton {
      disabled: boolean;

      static ngDirectiveDef = defineDirective(
          {type: MyButton, factory: () => button = new MyButton(), inputs: {disabled: 'disabled'}});
    }

    class OtherDir {
      id: boolean;
      clickStream = new EventEmitter();

      static ngDirectiveDef = defineDirective({
        type: OtherDir,
        factory: () => otherDir = new OtherDir(),
        inputs: {id: 'id'},
        outputs: {clickStream: 'click'}
      });
    }

    it('should check input properties before setting (directives)', () => {

      /** <button myButton [id]="id" [disabled]="isDisabled">Click me</button> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'button', null, [MyButton, OtherDir]);
          { text(3, 'Click me'); }
          elementEnd();
        }

        elementProperty(0, 'disabled', bind(ctx.isDisabled));
        elementProperty(0, 'id', bind(ctx.id));
      }

      const ctx: any = {isDisabled: true, id: 0};
      expect(renderToHtml(Template, ctx)).toEqual(`<button>Click me</button>`);
      expect(button !.disabled).toEqual(true);
      expect(otherDir !.id).toEqual(0);

      ctx.isDisabled = false;
      ctx.id = 1;
      expect(renderToHtml(Template, ctx)).toEqual(`<button>Click me</button>`);
      expect(button !.disabled).toEqual(false);
      expect(otherDir !.id).toEqual(1);
    });

    it('should support mixed element properties and input properties', () => {

      /** <button myButton [id]="id" [disabled]="isDisabled">Click me</button> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'button', null, [MyButton]);
          { text(2, 'Click me'); }
          elementEnd();
        }

        elementProperty(0, 'disabled', bind(ctx.isDisabled));
        elementProperty(0, 'id', bind(ctx.id));
      }

      const ctx: any = {isDisabled: true, id: 0};
      expect(renderToHtml(Template, ctx)).toEqual(`<button id="0">Click me</button>`);
      expect(button !.disabled).toEqual(true);

      ctx.isDisabled = false;
      ctx.id = 1;
      expect(renderToHtml(Template, ctx)).toEqual(`<button id="1">Click me</button>`);
      expect(button !.disabled).toEqual(false);
    });

    it('should check that property is not an input property before setting (component)', () => {
      let comp: Comp;
      class Comp {
        id: number;

        static ngComponentDef = defineComponent({
          type: Comp,
          tag: 'comp',
          template: function(ctx: any, cm: boolean) {},
          factory: () => comp = new Comp(),
          inputs: {id: 'id'}
        });
      }

      /** <comp [id]="id"></comp> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, Comp);
          elementEnd();
        }
        elementProperty(0, 'id', bind(ctx.id));
        Comp.ngComponentDef.h(1, 0);
        directiveRefresh(1, 0);
      }

      expect(renderToHtml(Template, {id: 1})).toEqual(`<comp></comp>`);
      expect(comp !.id).toEqual(1);

      expect(renderToHtml(Template, {id: 2})).toEqual(`<comp></comp>`);
      expect(comp !.id).toEqual(2);
    });

    it('should support two input properties with the same name', () => {
      let otherDisabledDir: OtherDisabledDir;

      class OtherDisabledDir {
        disabled: boolean;

        static ngDirectiveDef = defineDirective({
          type: OtherDisabledDir,
          factory: () => otherDisabledDir = new OtherDisabledDir(),
          inputs: {disabled: 'disabled'}
        });
      }

      /** <button myButton otherDisabledDir [disabled]="isDisabled">Click me</button> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'button', null, [MyButton, OtherDisabledDir]);
          { text(3, 'Click me'); }
          elementEnd();
        }
        elementProperty(0, 'disabled', bind(ctx.isDisabled));
      }

      const ctx: any = {isDisabled: true};
      expect(renderToHtml(Template, ctx)).toEqual(`<button>Click me</button>`);
      expect(button !.disabled).toEqual(true);
      expect(otherDisabledDir !.disabled).toEqual(true);

      ctx.isDisabled = false;
      expect(renderToHtml(Template, ctx)).toEqual(`<button>Click me</button>`);
      expect(button !.disabled).toEqual(false);
      expect(otherDisabledDir !.disabled).toEqual(false);
    });

    it('should set input property if there is an output first', () => {
      /** <button otherDir [id]="id" (click)="onClick()">Click me</button> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'button', null, [OtherDir]);
          {
            listener('click', ctx.onClick.bind(ctx));
            text(2, 'Click me');
          }
          elementEnd();
        }
        elementProperty(0, 'id', bind(ctx.id));
      }

      let counter = 0;
      const ctx: any = {id: 1, onClick: () => counter++};
      expect(renderToHtml(Template, ctx)).toEqual(`<button>Click me</button>`);
      expect(otherDir !.id).toEqual(1);

      otherDir !.clickStream.next();
      expect(counter).toEqual(1);

      ctx.id = 2;
      renderToHtml(Template, ctx);
      expect(otherDir !.id).toEqual(2);
    });

    it('should support unrelated element properties at same index in if-else block', () => {
      let idDir: IdDir;

      class IdDir {
        idNumber: number;

        static ngDirectiveDef = defineDirective(
            {type: IdDir, factory: () => idDir = new IdDir(), inputs: {idNumber: 'id'}});
      }

      /**
       * <button idDir [id]="id1">Click me</button>             // inputs: {'id': [0, 'idNumber']}
       * % if (condition) {
       *   <button [id]="id2">Click me too</button>             // inputs: null
       * % } else {
       *   <button otherDir [id]="id3">Click me too</button>   // inputs: {'id': [0, 'id']}
       * % }
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'button', null, [IdDir]);
          { text(2, 'Click me'); }
          elementEnd();
          container(3);
        }
        elementProperty(0, 'id', bind(ctx.id1));
        containerRefreshStart(3);
        {
          if (ctx.condition) {
            if (embeddedViewStart(0)) {
              elementStart(0, 'button');
              { text(1, 'Click me too'); }
              elementEnd();
            }
            elementProperty(0, 'id', bind(ctx.id2));
            embeddedViewEnd();
          } else {
            if (embeddedViewStart(1)) {
              elementStart(0, 'button', null, [OtherDir]);
              { text(2, 'Click me too'); }
              elementEnd();
            }
            elementProperty(0, 'id', bind(ctx.id3));
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }

      expect(renderToHtml(Template, {condition: true, id1: 'one', id2: 'two', id3: 'three'}))
          .toEqual(`<button>Click me</button><button id="two">Click me too</button>`);
      expect(idDir !.idNumber).toEqual('one');

      expect(renderToHtml(Template, {condition: false, id1: 'four', id2: 'two', id3: 'three'}))
          .toEqual(`<button>Click me</button><button>Click me too</button>`);
      expect(idDir !.idNumber).toEqual('four');
      expect(otherDir !.id).toEqual('three');
    });

  });

  describe('attributes and input properties', () => {
    let myDir: MyDir;
    class MyDir {
      role: string;
      direction: string;
      changeStream = new EventEmitter();

      static ngDirectiveDef = defineDirective({
        type: MyDir,
        factory: () => myDir = new MyDir(),
        inputs: {role: 'role', direction: 'dir'},
        outputs: {changeStream: 'change'}
      });
    }

    let dirB: MyDirB;
    class MyDirB {
      roleB: string;

      static ngDirectiveDef = defineDirective(
          {type: MyDirB, factory: () => dirB = new MyDirB(), inputs: {roleB: 'role'}});
    }

    it('should set input property based on attribute if existing', () => {

      /** <div role="button" myDir></div> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div', ['role', 'button'], [MyDir]);
          elementEnd();
        }
      }

      expect(renderToHtml(Template, {})).toEqual(`<div role="button"></div>`);
      expect(myDir !.role).toEqual('button');
    });

    it('should set input property and attribute if both defined', () => {

      /** <div role="button" [role]="role" myDir></div> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div', ['role', 'button'], [MyDir]);
          elementEnd();
        }
        elementProperty(0, 'role', bind(ctx.role));
      }

      expect(renderToHtml(Template, {role: 'listbox'})).toEqual(`<div role="button"></div>`);
      expect(myDir !.role).toEqual('listbox');

      renderToHtml(Template, {role: 'button'});
      expect(myDir !.role).toEqual('button');
    });

    it('should set two directive input properties based on same attribute', () => {

      /** <div role="button" myDir myDirB></div> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div', ['role', 'button'], [MyDir, MyDirB]);
          elementEnd();
        }
      }

      expect(renderToHtml(Template, {})).toEqual(`<div role="button"></div>`);
      expect(myDir !.role).toEqual('button');
      expect(dirB !.roleB).toEqual('button');
    });

    it('should process two attributes on same directive', () => {

      /** <div role="button" dir="rtl" myDir></div> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div', ['role', 'button', 'dir', 'rtl'], [MyDir]);
          elementEnd();
        }
      }

      expect(renderToHtml(Template, {})).toEqual(`<div dir="rtl" role="button"></div>`);
      expect(myDir !.role).toEqual('button');
      expect(myDir !.direction).toEqual('rtl');
    });

    it('should process attributes and outputs properly together', () => {

      /** <div role="button" (change)="onChange()" myDir></div> */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div', ['role', 'button'], [MyDir]);
          { listener('change', ctx.onChange.bind(ctx)); }
          elementEnd();
        }
      }

      let counter = 0;
      expect(renderToHtml(Template, {
        onChange: () => counter++
      })).toEqual(`<div role="button"></div>`);
      expect(myDir !.role).toEqual('button');

      myDir !.changeStream.next();
      expect(counter).toEqual(1);
    });

    it('should process attributes properly for directives with later indices', () => {


      /**
       * <div role="button" dir="rtl" myDir></div>
       * <div role="listbox" myDirB></div>
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div', ['role', 'button', 'dir', 'rtl'], [MyDir]);
          elementEnd();
          elementStart(2, 'div', ['role', 'listbox'], [MyDirB]);
          elementEnd();
        }
      }

      expect(renderToHtml(Template, {}))
          .toEqual(`<div dir="rtl" role="button"></div><div role="listbox"></div>`);
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
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          elementStart(0, 'div', ['role', 'listbox'], [MyDir]);
          elementEnd();
          container(2);
        }
        containerRefreshStart(2);
        {
          if (ctx.condition) {
            if (embeddedViewStart(0)) {
              elementStart(0, 'div', ['role', 'button'], [MyDirB]);
              elementEnd();
            }
            embeddedViewEnd();
          } else {
            if (embeddedViewStart(1)) {
              elementStart(0, 'div', ['role', 'menu']);
              {}
              elementEnd();
            }
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }

      expect(renderToHtml(Template, {
        condition: true
      })).toEqual(`<div role="listbox"></div><div role="button"></div>`);
      expect(myDir !.role).toEqual('listbox');
      expect(dirB !.roleB).toEqual('button');
      expect((dirB !as any).role).toBeUndefined();

      expect(renderToHtml(Template, {
        condition: false
      })).toEqual(`<div role="listbox"></div><div role="menu"></div>`);
      expect(myDir !.role).toEqual('listbox');
    });

    it('should process attributes properly inside a for loop', () => {

      class Comp {
        static ngComponentDef = defineComponent({
          type: Comp,
          tag: 'comp',
          template: function(ctx: any, cm: boolean) {
            if (cm) {
              elementStart(0, 'div', ['role', 'button'], [MyDir]);
              elementEnd();
              text(2);
            }
            textBinding(2, bind(load<MyDir>(1).role));
          },
          factory: () => new Comp()
        });
      }

      /**
       * % for (let i = 0; i < 3; i++) {
       *     <comp></comp>
       * % }
       */
      function Template(ctx: any, cm: boolean) {
        if (cm) {
          container(0);
        }
        containerRefreshStart(0);
        {
          for (let i = 0; i < 2; i++) {
            if (embeddedViewStart(0)) {
              elementStart(0, Comp);
              elementEnd();
            }
            Comp.ngComponentDef.h(1, 0);
            directiveRefresh(1, 0);
            embeddedViewEnd();
          }
        }
        containerRefreshEnd();
      }

      expect(renderToHtml(Template, {}))
          .toEqual(
              `<comp><div role="button"></div>button</comp><comp><div role="button"></div>button</comp>`);
    });

  });

});
