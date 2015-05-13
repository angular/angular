import {bootstrap, NgFor} from 'angular2/angular2';
import {Store, Todo, TodoFactory} from './services/TodoStore';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';

// TODO(radokirov): Once the application is transpiled by TS instead of Traceur,
// add those imports back into 'angular2/angular2';
import {Component, Directive} from 'angular2/src/core/annotations_impl/annotations';
import {View} from 'angular2/src/core/annotations_impl/view';

@Component({
  selector: 'todo-app',
  injectables: [
    Store,
    TodoFactory
  ]
})
@View({
  templateUrl: 'todo.html',
  directives: [NgFor]
})
class TodoApp {
  todoStore: Store;
  todoEdit: Todo;
  factory: TodoFactory;

  constructor(store: Store, factory: TodoFactory) {
    this.todoStore = store;
    this.todoEdit = null;
    this.factory = factory;
  }

  enterTodo($event, inputElement) {
    if($event.which === 13) { // ENTER_KEY
      this.addTodo(inputElement.value);
      inputElement.value = '';
    }
  }

  editTodo(todo: Todo) {
    this.todoEdit = todo;
  }

  doneEditing($event, todo: Todo) {
    var which = $event.which;
    var target = $event.target;
    if(which === 13) {
      todo.title = target.value;
      this.todoEdit = null;
    } else if (which === 27) {
      this.todoEdit = null;
      target.value = todo.title;
    }
  }

  addTodo(newTitle: string) {
    this.todoStore.add(this.factory.create(newTitle, false));
  }

  completeMe(todo: Todo) {
    todo.completed = !todo.completed;
  }

  deleteMe(todo: Todo) {
    this.todoStore.remove(todo);
  }

  toggleAll($event) {
    var isComplete = $event.target.checked;
    this.todoStore.list.forEach((todo) => {
      todo.completed = isComplete;
    });
  }

  clearCompleted() {
    this.todoStore.removeBy((todo) => todo.completed);
  }
}

export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities(); // for the Dart version
  bootstrap(TodoApp);
}
