/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOf, NgForOfContext} from '@angular/common';
import {Component, ContentChild, Directive, EventEmitter, Injectable, Input, NgModule, OnDestroy, Optional, Output, Pipe, PipeTransform, QueryList, SimpleChanges, TemplateRef, Type, ViewChild, ViewContainerRef, defineInjectable, defineInjector} from '@angular/core';
import {withBody} from '@angular/private/testing';

import * as r3 from '../../../src/render3/index';

/// See: `normative.md`



interface ToDo {
  text: string;
  done: boolean;
}

type $RenderFlags$ = r3.RenderFlags;

@Injectable()
class AppState {
  todos: ToDo[] = [
    {text: 'Demonstrate Components', done: false},
    {text: 'Demonstrate Structural Directives', done: false},
    {text: 'Demonstrate NgModules', done: false},
    {text: 'Demonstrate zoneless changed detection', done: false},
    {text: 'Demonstrate internationalization', done: false},
  ];

  // NORMATIVE
  static ngInjectableDef = defineInjectable({factory: () => new AppState()});
  // /NORMATIVE
}

const ToDoAppComponent_NgForOf_Template = function ToDoAppComponent_NgForOf_Template(
    rf: $RenderFlags$, ctx1: NgForOfContext<ToDo>) {
  if (rf & 1) {
    const $comp$ = r3.nextContext();
    r3.elementStart(0, 'todo');
    r3.listener('archive', $comp$.onArchive.bind($comp$));
    r3.elementEnd();
  }
  if (rf & 2) {
    r3.elementProperty(0, 'todo', r3.bind(ctx1.$implicit));
  }
};

@Component({
  selector: 'todo-app',
  template: `
  <h1>ToDo Application</h1>
  <div>
    <todo *ngFor="let todo of appState.todos" [todo]="todo" (archive)="onArchive($event)"></todo>
  </div>
  <span>count: {{appState.todos.length}}.</span>
  `
})
class ToDoAppComponent {
  constructor(public appState: AppState) {}

  onArchive(item: ToDo) {
    const todos = this.appState.todos;
    todos.splice(todos.indexOf(item));
    r3.markDirty(this);
  }

  // NORMATIVE
  static ngComponentDef = r3.defineComponent({
    type: ToDoAppComponent,
    selectors: [['todo-app']],
    factory: function ToDoAppComponent_Factory(t) {
      return new (t || ToDoAppComponent)(r3.directiveInject(AppState));
    },
    consts: 6,
    vars: 1,
    template: function ToDoAppComponent_Template(rf: $RenderFlags$, ctx: ToDoAppComponent) {
      if (rf & 1) {
        r3.elementStart(0, 'h1');
        r3.text(1, 'ToDo Application');
        r3.elementEnd();
        r3.elementStart(2, 'div');
        r3.template(3, ToDoAppComponent_NgForOf_Template, 1, 1, '', ['ngForOf', '']);
        r3.elementEnd();
        r3.elementStart(4, 'span');
        r3.text(5);
        r3.elementEnd();
      }
      if (rf & 2) {
        r3.textBinding(5, r3.interpolation1('count: ', ctx.appState.todos.length, ''));
      }
    }
  });
  // /NORMATIVE
}

// NON-NORMATIVE
(ToDoAppComponent.ngComponentDef as r3.ComponentDef<any>).directiveDefs = () =>
    [ToDoItemComponent.ngComponentDef,
     (NgForOf as unknown as r3.DirectiveType<NgForOf<any>>).ngDirectiveDef];
// /NON-NORMATIVE

@Component({
  selector: 'todo',
  template: `
    <div [class.done]="todo.done">
      <input type="checkbox" [value]="todo.done" (click)="onCheckboxClick()">
      <span>{{todo.text}}</span>
      <button (click)="onArchiveClick()">archive</button>
    </div>
  `
})
class ToDoItemComponent {
  static DEFAULT_TODO: ToDo = {text: '', done: false};

  @Input()
  todo: ToDo = ToDoItemComponent.DEFAULT_TODO;

  @Output()
  archive = new EventEmitter();

  onCheckboxClick() {
    this.todo.done = !this.todo.done;
    r3.markDirty(this);
  }

  onArchiveClick() { this.archive.emit(this.todo); }

  // NORMATIVE
  static ngComponentDef = r3.defineComponent({
    type: ToDoItemComponent,
    selectors: [['todo']],
    factory: function ToDoItemComponent_Factory(t) { return new (t || ToDoItemComponent)(); },
    consts: 6,
    vars: 2,
    template: function ToDoItemComponent_Template(rf: $RenderFlags$, ctx: ToDoItemComponent) {
      if (rf & 1) {
        r3.elementStart(0, 'div');
        r3.elementStart(1, 'input', e1_attrs);
        r3.listener('click', ctx.onCheckboxClick.bind(ctx));
        r3.elementEnd();
        r3.elementStart(2, 'span');
        r3.text(3);
        r3.elementEnd();
        r3.elementStart(4, 'button');
        r3.listener('click', ctx.onArchiveClick.bind(ctx));
        r3.text(5, 'archive');
        r3.elementEnd();
        r3.elementEnd();
      }
      if (rf & 2) {
        r3.elementProperty(1, 'value', r3.bind(ctx.todo.done));
        r3.textBinding(3, r3.bind(ctx.todo.text));
      }
    },
    inputs: {todo: 'todo'},
  });
  // /NORMATIVE
}
// NORMATIVE
const e1_attrs = ['type', 'checkbox'];
// /NORMATIVE


@NgModule({
  declarations: [ToDoAppComponent, ToDoItemComponent],
  providers: [AppState],
})
class ToDoAppModule {
  // NORMATIVE
  static ngInjectorDef = defineInjector({
    factory: function ToDoAppModule_Factory() { return new ToDoAppModule(); },
    providers: [AppState],
  });
  // /NORMATIVE
}


describe('small_app', () => {
  xit('should render',
      () => withBody('<todo-app></todo-app>', async() => {
        // TODO: Implement this method once all of the pieces of this application can execute.
        // TODO: add i18n example by translating to french.
        const todoApp = r3.renderComponent(ToDoAppComponent);
        await r3.whenRendered(todoApp);
        expect(r3.getRenderedText(todoApp)).toEqual('...');
        const firstCheckBox =
            r3.getHostElement(todoApp).querySelector('input[type=checkbox]') as HTMLElement;
        firstCheckBox.click();
        await r3.whenRendered(todoApp);
        expect(r3.getRenderedText(todoApp)).toEqual('...');
        const firstArchive = r3.getHostElement(todoApp).querySelector('button') as HTMLElement;
        firstArchive.click;
        await r3.whenRendered(todoApp);
        expect(r3.getRenderedText(todoApp)).toEqual('...');
      }));
});
