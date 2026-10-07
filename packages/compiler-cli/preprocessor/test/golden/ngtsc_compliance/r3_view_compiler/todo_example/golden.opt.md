# /out/todo_example.ngtypecheck.ts
```ts
/**
 * TCB for /todo_example.ts
 * @generated
 */

import * as i0 from './todo_example';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*107,127*/ = null! as i0.TodoComponent; /*T:VAE*/
    _t1.data /*114,118*/ = this.list /*121,125*/ /*121,125*/ /*113,126*/;
  }
}

/*tcb2*/
function _tcb2(this: i0.TodoComponent) {
  if (true) {
    this.myTitle /*282,289*/ /*282,289*/;
    var _t1 = null! as any; /*T:VAE*/
    {
      var _t2 /*307,311*/ = _t1.$implicit; /*303,312*/
      '' + this.data /*323,327*/ /*323,327*/;
    }
  }
}

```

# /out/todo_example.ts
```ts
import { Component, Input, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function TodoComponent_li_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵelementStart(0, 'li');
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.data);
  }
}

export class MyApp {
  list: any[] = [];
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['my-app']],
    standalone: false,
    decls: 1,
    vars: 1,
    consts: [[3, 'data']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'todo', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('data', ctx.list);
      }
    },
    dependencies: (): any => [TodoComponent],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-app',
                template: '<todo [data]="list"></todo>',
                standalone: false,
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'todo_example.ts',
      lineNumber: 7,
    });
})();

export class TodoComponent {
  data: any[] = [];

  myTitle!: string;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TodoComponent, never> = function TodoComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TodoComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TodoComponent,
    'todo',
    never,
    { 'data': { 'alias': 'data'; 'required': false } },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TodoComponent,
    selectors: [['todo']],
    inputs: { data: 'data' },
    standalone: false,
    decls: 2,
    vars: 2,
    consts: [
      [1, 'list', 3, 'title'],
      [4, 'ngFor', 'ngForOf'],
    ],
    template: function TodoComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'ul', 0);
        i0.ɵɵtemplate(1, TodoComponent_li_1_Template, 2, 1, 'li', 1);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty('title', ctx.myTitle);
        i0.ɵɵadvance();
        i0.ɵɵproperty('ngForOf', ctx.data);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TodoComponent,
        [
          {
            type: Component,
            args: [
              {
                selector: 'todo',
                template:
                  '<ul class="list" [title]="myTitle"><li *ngFor="let item of data">{{data}}</li></ul>',
                standalone: false,
              },
            ],
          },
        ],
        null,
        { data: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(TodoComponent, {
      className: 'TodoComponent',
      filePath: 'todo_example.ts',
      lineNumber: 16,
    });
})();

export class TodoModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TodoModule, never> = function TodoModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TodoModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<
    TodoModule,
    [typeof TodoComponent, typeof MyApp],
    never,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: TodoModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<TodoModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TodoModule,
        [
          {
            type: NgModule,
            args: [
              {
                declarations: [TodoComponent, MyApp],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(TodoModule, { declarations: [TodoComponent, MyApp] });
})();

```