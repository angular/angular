/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter} from '@angular/core';

import {ɵɵdefineComponent, ɵɵdefineDirective} from '../../src/render3/index';
import {ɵɵbind, ɵɵcontainer, ɵɵcontainerRefreshEnd, ɵɵcontainerRefreshStart, ɵɵelement, ɵɵelementEnd, ɵɵelementProperty, ɵɵelementStart, ɵɵembeddedViewEnd, ɵɵembeddedViewStart, ɵɵreference, ɵɵtext, ɵɵtextBinding} from '../../src/render3/instructions/all';
import {RenderFlags} from '../../src/render3/interfaces/definition';

import {ComponentFixture, createComponent} from './render_util';

describe('elementProperty', () => {

  describe('input properties', () => {
    let otherDir: OtherDir;
    let idDir: IdDir;

    class OtherDir {
      // TODO(issue/24571): remove '!'.
      id !: number;
      clickStream = new EventEmitter();

      static ngDirectiveDef = ɵɵdefineDirective({
        type: OtherDir,
        selectors: [['', 'otherDir', '']],
        factory: () => otherDir = new OtherDir(),
        inputs: {id: 'id'},
        outputs: {clickStream: 'click'}
      });
    }

    class IdDir {
      // TODO(issue/24571): remove '!'.
      idNumber !: string;

      static ngDirectiveDef = ɵɵdefineDirective({
        type: IdDir,
        selectors: [['', 'idDir', '']],
        factory: () => idDir = new IdDir(),
        inputs: {idNumber: 'id'}
      });
    }

    const deps = [OtherDir, IdDir];

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
          ɵɵelementStart(0, 'button', ['idDir', '']);
          { ɵɵtext(1, 'Click me'); }
          ɵɵelementEnd();
          ɵɵcontainer(2);
        }
        if (rf & RenderFlags.Update) {
          ɵɵelementProperty(0, 'id', ɵɵbind(ctx.id1));
          ɵɵcontainerRefreshStart(2);
          {
            if (ctx.condition) {
              let rf0 = ɵɵembeddedViewStart(0, 2, 1);
              if (rf0 & RenderFlags.Create) {
                ɵɵelementStart(0, 'button');
                { ɵɵtext(1, 'Click me too'); }
                ɵɵelementEnd();
              }
              if (rf0 & RenderFlags.Update) {
                ɵɵelementProperty(0, 'id', ɵɵbind(ctx.id2));
              }
              ɵɵembeddedViewEnd();
            } else {
              let rf1 = ɵɵembeddedViewStart(1, 2, 1);
              if (rf1 & RenderFlags.Create) {
                ɵɵelementStart(0, 'button', ['otherDir', '']);
                { ɵɵtext(1, 'Click me too'); }
                ɵɵelementEnd();
              }
              if (rf1 & RenderFlags.Update) {
                ɵɵelementProperty(0, 'id', ɵɵbind(ctx.id3));
              }
              ɵɵembeddedViewEnd();
            }
          }
          ɵɵcontainerRefreshEnd();
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

      static ngDirectiveDef = ɵɵdefineDirective({
        type: MyDir,
        selectors: [['', 'myDir', '']],
        factory: () => myDir = new MyDir(),
        inputs: {role: 'role', direction: 'dir'},
        outputs: {changeStream: 'change'},
        exportAs: ['myDir']
      });
    }

    let dirB: MyDirB;
    class MyDirB {
      // TODO(issue/24571): remove '!'.
      roleB !: string;

      static ngDirectiveDef = ɵɵdefineDirective({
        type: MyDirB,
        selectors: [['', 'myDirB', '']],
        factory: () => dirB = new MyDirB(),
        inputs: {roleB: 'role'}
      });
    }

    const deps = [MyDir, MyDirB];

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
          ɵɵelement(0, 'div', ['role', 'listbox', 'myDir', '']);
          ɵɵcontainer(1);
        }
        if (rf & RenderFlags.Update) {
          ɵɵcontainerRefreshStart(1);
          {
            if (ctx.condition) {
              let rf1 = ɵɵembeddedViewStart(0, 1, 0);
              if (rf1 & RenderFlags.Create) {
                ɵɵelement(0, 'div', ['role', 'button', 'myDirB', '']);
              }
              ɵɵembeddedViewEnd();
            } else {
              let rf2 = ɵɵembeddedViewStart(1, 1, 0);
              if (rf2 & RenderFlags.Create) {
                ɵɵelement(0, 'div', ['role', 'menu']);
              }
              ɵɵembeddedViewEnd();
            }
          }
          ɵɵcontainerRefreshEnd();
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
        static ngComponentDef = ɵɵdefineComponent({
          type: Comp,
          selectors: [['comp']],
          consts: 3,
          vars: 1,
          /** <div role="button" dir #dir="myDir"></div> {{ dir.role }} */
          template: function(rf: RenderFlags, ctx: any) {
            if (rf & RenderFlags.Create) {
              ɵɵelement(0, 'div', ['role', 'button', 'myDir', ''], ['dir', 'myDir']);
              ɵɵtext(2);
            }
            if (rf & RenderFlags.Update) {
              const tmp = ɵɵreference(1) as any;
              ɵɵtextBinding(2, ɵɵbind(tmp.role));
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
          ɵɵcontainer(0);
        }
        if (rf & RenderFlags.Update) {
          ɵɵcontainerRefreshStart(0);
          {
            for (let i = 0; i < 2; i++) {
              let rf1 = ɵɵembeddedViewStart(0, 1, 0);
              if (rf1 & RenderFlags.Create) {
                ɵɵelement(0, 'comp');
              }
              ɵɵembeddedViewEnd();
            }
          }
          ɵɵcontainerRefreshEnd();
        }
      }, 1, 0, [Comp]);

      const fixture = new ComponentFixture(App);
      expect(fixture.html)
          .toEqual(
              `<comp><div mydir="" role="button"></div>button</comp><comp><div mydir="" role="button"></div>button</comp>`);
    });

  });

});
