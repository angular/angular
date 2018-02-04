/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgForOf, NgForOfContext} from '@angular/common';
import {Component, ContentChild, Directive, EventEmitter, Injectable, Input, NgModule, OnDestroy, Optional, Output, Pipe, PipeTransform, QueryList, SimpleChanges, TemplateRef, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {withBody} from '@angular/core/testing';

import * as r3 from '../../../src/render3/index';



// TODO: remove once https://github.com/angular/angular/pull/22005 lands
export class pending_pull_22005 {
  static defineInjectable<T>({scope, factory}: {scope?: Type<any>, factory: () => T}):
      {scope: Type<any>| null, factory: () => T} {
    return {scope: scope || null, factory: factory};
  }

  static defineInjector<T>({factory, providers}: {factory: () => T, providers: any[]}):
      {factory: () => T, providers: any[]} {
    return {factory: factory, providers: providers};
  }
}



interface ToDo {
  text: string;
  done: boolean;
}

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
  static ngInjectableDef = pending_pull_22005.defineInjectable({factory: () => new AppState()});
  // /NORMATIVE
}

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
    tag: 'todo-app',
    factory: function ToDoAppComponent_Factory() {
      return new ToDoAppComponent(r3.inject(AppState));
    },
    template: function ToDoAppComponent_Template(ctx: ToDoAppComponent, cm: boolean) {
      if (cm) {
        const ToDoAppComponent_NgForOf_Template = function ToDoAppComponent_NgForOf_Template(
            ctx1: NgForOfContext<ToDo>, cm: boolean) {
          if (cm) {
            r3.E(0, ToDoItemComponent);
            r3.L('archive', ctx.onArchive.bind(ctx));
            r3.e();
          }
          r3.p(0, 'todo', r3.b(ctx1.$implicit));
        };
        r3.E(0, 'h1');
        r3.T(1, 'ToDo Application');
        r3.e();
        r3.E(2, 'div');
        r3.C(3, c3_directives, ToDoAppComponent_NgForOf_Template);
        r3.e();
        r3.E(4, 'span');
        r3.T(5);
        r3.e();
      }
      r3.t(5, r3.i1('count: ', ctx.appState.todos.length, ''));
    }
  });
  // /NORMATIVE
}

// NORMATIVE
const c3_directives = [NgForOf as r3.DirectiveType<NgForOf<ToDo>>];
// /NORMATIVE

@Component({
  selector: 'todo',
  template: `
    <div [class.done]="todo.done">
      <input type="checkbox" [value]="todo.done" (click)="onCheckboxClick()"></input>
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
    tag: 'todo',
    factory: function ToDoItemComponent_Factory() { return new ToDoItemComponent(); },
    template: function ToDoItemComponent_Template(ctx: ToDoItemComponent, cm: boolean) {
      if (cm) {
        r3.E(0, 'div');
        r3.E(1, 'input', e1_attrs);
        r3.L('click', ctx.onCheckboxClick.bind(ctx));
        r3.e();
        r3.E(2, 'span');
        r3.T(3);
        r3.e();
        r3.E(4, 'button');
        r3.L('click', ctx.onArchiveClick.bind(ctx));
        r3.T(5, 'archive');
        r3.e();
        r3.e();
      }
      r3.p(1, 'value', r3.b(ctx.todo.done));
      r3.t(3, r3.b(ctx.todo.text));
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
  static ngInjectorDef = pending_pull_22005.defineInjector({
    factory: () => new ToDoAppModule(),
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
