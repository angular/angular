/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CommonModule} from '@angular/common';
import {Component, Directive, Input, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {onlyInIvy} from '@angular/private/testing';

describe('components using pure function instructions internally', () => {
  describe('with array literals', () => {
    @Component({
      selector: 'my-comp',
      template: ``,
    })
    class MyComp {
      @Input() names: string[] = [];
    }


    it('should support an array literal with a binding', () => {
      @Component({
        template: `
                <my-comp [names]="['Nancy', customName, 'Bess']"></my-comp>
              `,
      })
      class App {
        showing = true;
        customName = 'Carson';
      }

      TestBed.configureTestingModule({
        declarations: [App, MyComp],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const myComp = fixture.debugElement.query(By.directive(MyComp)).componentInstance;

      const firstArray = myComp.names;
      expect(firstArray).toEqual(['Nancy', 'Carson', 'Bess']);

      fixture.detectChanges();
      expect(myComp.names).toEqual(['Nancy', 'Carson', 'Bess']);
      expect(firstArray).toBe(myComp.names);

      fixture.componentInstance.customName = 'Hannah';
      fixture.detectChanges();
      expect(myComp.names).toEqual(['Nancy', 'Hannah', 'Bess']);

      // Identity must change if binding changes
      expect(firstArray).not.toBe(myComp.names);

      // The property should not be set if the exp value is the same, so artificially
      // setting the property to ensure it's not overwritten.
      myComp.names = ['should not be overwritten'];
      fixture.detectChanges();

      expect(myComp!.names).toEqual(['should not be overwritten']);
    });


    it('should support array literals in dynamic views', () => {
      @Component({
        template: `
                <my-comp *ngIf="showing" [names]="['Nancy', customName, 'Bess']"></my-comp>
              `,
      })
      class App {
        showing = true;
        customName = 'Carson';
      }

      TestBed.configureTestingModule({
        declarations: [App, MyComp],
        imports: [CommonModule],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const myComp = fixture.debugElement.query(By.directive(MyComp)).componentInstance;
      expect(myComp.names).toEqual(['Nancy', 'Carson', 'Bess']);
    });

    it('should support multiple array literals passed through to one node', () => {
      @Component({
        selector: 'many-prop-comp',
        template: ``,
      })
      class ManyPropComp {
        @Input() names1: string[] = [];

        @Input() names2: string[] = [];
      }

      @Component({
        template: `
                <many-prop-comp [names1]="['Nancy', customName]" [names2]="[customName2]">
                </many-prop-comp>
              `,
      })
      class App {
        showing = true;
        customName = 'Carson';
        customName2 = 'George';
      }

      TestBed.configureTestingModule({
        declarations: [App, ManyPropComp],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const manyPropComp = fixture.debugElement.query(By.directive(ManyPropComp)).componentInstance;

      expect(manyPropComp!.names1).toEqual(['Nancy', 'Carson']);
      expect(manyPropComp!.names2).toEqual(['George']);

      fixture.componentInstance.customName = 'George';
      fixture.componentInstance.customName2 = 'Carson';
      fixture.detectChanges();
      expect(manyPropComp!.names1).toEqual(['Nancy', 'George']);
      expect(manyPropComp!.names2).toEqual(['Carson']);
    });


    it('should support an array literals inside fn calls', () => {
      @Component({
        selector: 'parent-comp',
        template: `
                <my-comp [names]="someFn(['Nancy', customName])"></my-comp>
              `
      })
      class ParentComp {
        customName = 'Bess';

        someFn(arr: string[]): string[] {
          arr[0] = arr[0].toUpperCase();
          return arr;
        }
      }

      @Component({
        template: `
                <parent-comp></parent-comp>
                <parent-comp></parent-comp>
              `
      })
      class App {
      }

      TestBed.configureTestingModule({
        declarations: [App, MyComp, ParentComp],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const myComps =
          fixture.debugElement.queryAll(By.directive(MyComp)).map(f => f.componentInstance);


      const firstArray = myComps[0].names;
      const secondArray = myComps[1].names;
      expect(firstArray).toEqual(['NANCY', 'Bess']);
      expect(secondArray).toEqual(['NANCY', 'Bess']);
      expect(firstArray).not.toBe(secondArray);

      fixture.detectChanges();
      expect(firstArray).toEqual(['NANCY', 'Bess']);
      expect(secondArray).toEqual(['NANCY', 'Bess']);
      expect(firstArray).toBe(myComps[0].names);
      expect(secondArray).toBe(myComps[1].names);
    });


    it('should support an array literal with more than 1 binding', () => {
      @Component({
        template: `
                <my-comp *ngIf="showing" [names]="['Nancy', customName, 'Bess', customName2]"></my-comp>
              `,
      })
      class App {
        showing = true;
        customName = 'Carson';
        customName2 = 'Hannah';
      }

      TestBed.configureTestingModule({
        declarations: [App, MyComp],
        imports: [CommonModule],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const myComp = fixture.debugElement.query(By.directive(MyComp)).componentInstance;

      const firstArray = myComp.names;
      expect(firstArray).toEqual(['Nancy', 'Carson', 'Bess', 'Hannah']);

      fixture.detectChanges();
      expect(myComp.names).toEqual(['Nancy', 'Carson', 'Bess', 'Hannah']);
      expect(firstArray).toBe(myComp.names);

      fixture.componentInstance.customName = 'George';
      fixture.detectChanges();
      expect(myComp.names).toEqual(['Nancy', 'George', 'Bess', 'Hannah']);
      expect(firstArray).not.toBe(myComp.names);

      fixture.componentInstance.customName = 'Frank';
      fixture.componentInstance.customName2 = 'Ned';
      fixture.detectChanges();
      expect(myComp.names).toEqual(['Nancy', 'Frank', 'Bess', 'Ned']);

      // The property should not be set if the exp value is the same, so artificially
      // setting the property to ensure it's not overwritten.
      myComp.names = ['should not be overwritten'];
      fixture.detectChanges();
      expect(myComp.names).toEqual(['should not be overwritten']);
    });


    it('should work up to 8 bindings', () => {
      @Component({
        template: `
                <my-comp [names]="['a', 'b', 'c', 'd', 'e', 'f', 'g', v8]"></my-comp>
                <my-comp [names]="['a', 'b', 'c', 'd', 'e', 'f', v7, v8]"></my-comp>
                <my-comp [names]="['a', 'b', 'c', 'd', 'e', v6, v7, v8]"></my-comp>
                <my-comp [names]="['a', 'b', 'c', 'd', v5, v6, v7, v8]"></my-comp>
                <my-comp [names]="['a', 'b', 'c', v4, v5, v6, v7, v8]"></my-comp>
                <my-comp [names]="['a', 'b', v3, v4, v5, v6, v7, v8]"></my-comp>
                <my-comp [names]="['a', v2, v3, v4, v5, v6, v7, v8]"></my-comp>
                <my-comp [names]="[v1, v2, v3, v4, v5, v6, v7, v8]"></my-comp>
              `
      })
      class App {
        v1 = 'a';
        v2 = 'b';
        v3 = 'c';
        v4 = 'd';
        v5 = 'e';
        v6 = 'f';
        v7 = 'g';
        v8 = 'h';
      }

      TestBed.configureTestingModule({
        declarations: [App, MyComp],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const myComps =
          fixture.debugElement.queryAll(By.directive(MyComp)).map(f => f.componentInstance);

      myComps.forEach(myComp => {
        expect(myComp.names).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
      });

      const app = fixture.componentInstance;

      app.v1 = 'a1';
      app.v2 = 'b1';
      app.v3 = 'c1';
      app.v4 = 'd1';
      app.v5 = 'e1';
      app.v6 = 'f1';
      app.v7 = 'g1';
      app.v8 = 'h1';

      fixture.detectChanges();

      expect(myComps[0].names).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h1']);
      expect(myComps[1].names).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g1', 'h1']);
      expect(myComps[2].names).toEqual(['a', 'b', 'c', 'd', 'e', 'f1', 'g1', 'h1']);
      expect(myComps[3].names).toEqual(['a', 'b', 'c', 'd', 'e1', 'f1', 'g1', 'h1']);
      expect(myComps[4].names).toEqual(['a', 'b', 'c', 'd1', 'e1', 'f1', 'g1', 'h1']);
      expect(myComps[5].names).toEqual(['a', 'b', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1']);
      expect(myComps[6].names).toEqual(['a', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1']);
      expect(myComps[7].names).toEqual(['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1']);

      app.v8 = 'h2';
      fixture.detectChanges();

      expect(myComps[0].names).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h2']);
      expect(myComps[1].names).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g1', 'h2']);
      expect(myComps[2].names).toEqual(['a', 'b', 'c', 'd', 'e', 'f1', 'g1', 'h2']);
      expect(myComps[3].names).toEqual(['a', 'b', 'c', 'd', 'e1', 'f1', 'g1', 'h2']);
      expect(myComps[4].names).toEqual(['a', 'b', 'c', 'd1', 'e1', 'f1', 'g1', 'h2']);
      expect(myComps[5].names).toEqual(['a', 'b', 'c1', 'd1', 'e1', 'f1', 'g1', 'h2']);
      expect(myComps[6].names).toEqual(['a', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h2']);
      expect(myComps[7].names).toEqual(['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h2']);
    });

    it('should work with pureFunctionV for 9+ bindings', () => {
      @Component({
        template: `
                <my-comp [names]="['start', v0, v1, v2, v3, 'modified_' + v4, v5, v6, v7, v8, 'end']">
                </my-comp>
              `
      })
      class App {
        v0 = 'a';
        v1 = 'b';
        v2 = 'c';
        v3 = 'd';
        v4 = 'e';
        v5 = 'f';
        v6 = 'g';
        v7 = 'h';
        v8 = 'i';
      }
      TestBed.configureTestingModule({
        declarations: [App, MyComp],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const myComp = fixture.debugElement.query(By.directive(MyComp)).componentInstance;
      const app = fixture.componentInstance;

      expect(myComp.names).toEqual([
        'start', 'a', 'b', 'c', 'd', 'modified_e', 'f', 'g', 'h', 'i', 'end'
      ]);

      app.v0 = 'a1';
      fixture.detectChanges();

      expect(myComp.names).toEqual([
        'start', 'a1', 'b', 'c', 'd', 'modified_e', 'f', 'g', 'h', 'i', 'end'
      ]);

      app.v4 = 'e5';
      fixture.detectChanges();

      expect(myComp.names).toEqual([
        'start', 'a1', 'b', 'c', 'd', 'modified_e5', 'f', 'g', 'h', 'i', 'end'
      ]);
    });
  });

  describe('with object literals', () => {
    @Component({
      selector: 'object-comp',
      template: ``,
    })
    class ObjectComp {
      @Input() config: any = [];
    }

    it('should support an object literal', () => {
      @Component({
        template: '<object-comp [config]="{duration: 500, animation: name}"></object-comp>',
      })
      class App {
        name = 'slide';
      }

      TestBed.configureTestingModule({
        declarations: [App, ObjectComp],
      });

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const objectComp = fixture.debugElement.query(By.directive(ObjectComp)).componentInstance;

      const firstObj = objectComp.config;
      expect(objectComp.config).toEqual({duration: 500, animation: 'slide'});

      fixture.detectChanges();
      expect(objectComp.config).toEqual({duration: 500, animation: 'slide'});
      expect(firstObj).toBe(objectComp.config);

      fixture.componentInstance.name = 'tap';
      fixture.detectChanges();
      expect(objectComp.config).toEqual({duration: 500, animation: 'tap'});

      // Identity must change if binding changes
      expect(firstObj).not.toBe(objectComp.config);
    });


    it('should support expressions nested deeply in object/array literals', () => {
      @Component({
        template: `
        <object-comp [config]="{animation: name, actions: [{ opacity: 0, duration: 0}, {opacity: 1,
        duration: duration }]}">
        </object-comp>
      `,
      })
      class App {
        name = 'slide';
        duration = 100;
      }

      TestBed.configureTestingModule({
        declarations: [App, ObjectComp],
      });

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const objectComp = fixture.debugElement.query(By.directive(ObjectComp)).componentInstance;

      expect(objectComp.config).toEqual({
        animation: 'slide',
        actions: [{opacity: 0, duration: 0}, {opacity: 1, duration: 100}]
      });
      const firstConfig = objectComp.config;

      fixture.detectChanges();
      expect(objectComp.config).toEqual({
        animation: 'slide',
        actions: [{opacity: 0, duration: 0}, {opacity: 1, duration: 100}]
      });
      expect(objectComp.config).toBe(firstConfig);

      fixture.componentInstance.duration = 50;
      fixture.detectChanges();
      expect(objectComp.config).toEqual({
        animation: 'slide',
        actions: [{opacity: 0, duration: 0}, {opacity: 1, duration: 50}]
      });
      expect(objectComp.config).not.toBe(firstConfig);

      fixture.componentInstance.name = 'tap';
      fixture.detectChanges();
      expect(objectComp.config).toEqual({
        animation: 'tap',
        actions: [{opacity: 0, duration: 0}, {opacity: 1, duration: 50}]
      });

      fixture.componentInstance.name = 'drag';
      fixture.componentInstance.duration = 500;
      fixture.detectChanges();
      expect(objectComp.config).toEqual({
        animation: 'drag',
        actions: [{opacity: 0, duration: 0}, {opacity: 1, duration: 500}]
      });

      // The property should not be set if the exp value is the same, so artificially
      // setting the property to ensure it's not overwritten.
      objectComp.config = ['should not be overwritten'];
      fixture.detectChanges();
      expect(objectComp.config).toEqual(['should not be overwritten']);
    });

    it('should support multiple view instances with multiple bindings', () => {
      @Component({
        template: `
        <object-comp *ngFor="let config of configs" [config]="config">
        </object-comp>
      `,
      })
      class App {
        configs = [
          {opacity: 0, duration: 500},
          {opacity: 1, duration: 600},
        ];
      }

      TestBed.configureTestingModule({
        declarations: [App, ObjectComp],
        imports: [CommonModule],
      });

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const app = fixture.componentInstance;
      const objectComps =
          fixture.debugElement.queryAll(By.directive(ObjectComp)).map(f => f.componentInstance);

      expect(objectComps[0].config).toEqual({opacity: 0, duration: 500});
      expect(objectComps[1].config).toEqual({opacity: 1, duration: 600});

      app.configs[0].duration = 1000;
      fixture.detectChanges();
      expect(objectComps[0].config).toEqual({opacity: 0, duration: 1000});
      expect(objectComps[1].config).toEqual({opacity: 1, duration: 600});
    });
  });

  onlyInIvy('issue has only been fixed for Ivy').describe('identical literals', () => {
    @Directive({selector: '[dir]'})
    class Dir {
      @Input('dir') value: any;
    }

    it('should not share object literals across elements', () => {
      @Component({
        template: `
          <div [dir]="{}"></div>
          <div [dir]="{}"></div>
        `
      })
      class App {
        @ViewChildren(Dir) directives!: QueryList<Dir>;
      }

      TestBed.configureTestingModule({declarations: [Dir, App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const directives = fixture.componentInstance.directives.toArray();
      expect(directives[0].value).not.toBe(directives[1].value);
    });

    it('should not share array literals across elements', () => {
      @Component({
        template: `
          <div [dir]="[]"></div>
          <div [dir]="[]"></div>
        `
      })
      class App {
        @ViewChildren(Dir) directives!: QueryList<Dir>;
      }

      TestBed.configureTestingModule({declarations: [Dir, App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const directives = fixture.componentInstance.directives.toArray();
      expect(directives[0].value).not.toBe(directives[1].value);
    });

    it('should not share object literals across component instances', () => {
      @Component({template: `<div [dir]="{}"></div>`})
      class App {
        @ViewChild(Dir) directive!: Dir;
      }

      TestBed.configureTestingModule({declarations: [Dir, App]});
      const firstFixture = TestBed.createComponent(App);
      firstFixture.detectChanges();

      const secondFixture = TestBed.createComponent(App);
      secondFixture.detectChanges();

      expect(firstFixture.componentInstance.directive.value)
          .not.toBe(secondFixture.componentInstance.directive.value);
    });

    it('should not share array literals across component instances', () => {
      @Component({template: `<div [dir]="[]"></div>`})
      class App {
        @ViewChild(Dir) directive!: Dir;
      }

      TestBed.configureTestingModule({declarations: [Dir, App]});
      const firstFixture = TestBed.createComponent(App);
      firstFixture.detectChanges();

      const secondFixture = TestBed.createComponent(App);
      secondFixture.detectChanges();

      expect(firstFixture.componentInstance.directive.value)
          .not.toBe(secondFixture.componentInstance.directive.value);
    });

    it('should not confuse object literals and null inside of a literal', () => {
      @Component({
        template: `
          <div [dir]="{foo: null}"></div>
          <div [dir]="{foo: {}}"></div>
        `
      })
      class App {
        @ViewChildren(Dir) directives!: QueryList<Dir>;
      }

      TestBed.configureTestingModule({declarations: [Dir, App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const values = fixture.componentInstance.directives.map(directive => directive.value);

      expect(values).toEqual([{foo: null}, {foo: {}}]);
    });

    it('should not confuse array literals and null inside of a literal', () => {
      @Component({
        template: `
          <div [dir]="{foo: null}"></div>
          <div [dir]="{foo: []}"></div>
        `
      })
      class App {
        @ViewChildren(Dir) directives!: QueryList<Dir>;
      }

      TestBed.configureTestingModule({declarations: [Dir, App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const values = fixture.componentInstance.directives.map(directive => directive.value);

      expect(values).toEqual([{foo: null}, {foo: []}]);
    });

    it('should not confuse function calls and null inside of a literal', () => {
      @Component({
        template: `
          <div [dir]="{foo: null}"></div>
          <div [dir]="{foo: getFoo()}"></div>
        `
      })
      class App {
        @ViewChildren(Dir) directives!: QueryList<Dir>;
        getFoo() {
          return 'foo!';
        }
      }

      TestBed.configureTestingModule({declarations: [Dir, App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const values = fixture.componentInstance.directives.map(directive => directive.value);

      expect(values).toEqual([{foo: null}, {foo: 'foo!'}]);
    });
  });
});
