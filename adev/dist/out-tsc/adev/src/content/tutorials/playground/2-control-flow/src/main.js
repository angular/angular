import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
let Todos = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      template: `
    <h2>Todos</h2>
    <input #text />
    <button (click)="add(text.value)">Add</button>

    @for (todo of todos; track $index) {
    <p>
      <input type="checkbox" (change)="toggle($index)" />
      @if (todo.done) {
      <s>{{ todo.text }}</s>
      } @else {
      <span>{{ todo.text }}</span>
      }
    </p>
    } @empty {
    <p>No todos</p>
    }
  `,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Todos = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      Todos = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    todos = [];
    add(text) {
      this.todos.push({text, done: false});
    }
    toggle(index) {
      this.todos[index].done = !this.todos[index].done;
    }
  };
  return (Todos = _classThis);
})();
export {Todos};
bootstrapApplication(Todos);
//# sourceMappingURL=main.js.map
