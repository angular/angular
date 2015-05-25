import {bootstrap, NgFor, Component, View} from 'angular2/angular2';
import {Store, Todo, TodoFactory} from './services/TodoStore';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';

@Component({selector: 'todo-app', appInjector: [Store, TodoFactory]})
@View({templateUrl: 'todo.html', directives: [NgFor]})
class TodoApp {
  todoEdit: Todo = null;

  constructor(public todoStore: Store, public factory: TodoFactory) {}

  enterTodo(inputElement): void {
    this.addTodo(inputElement.value);
    inputElement.value = '';
  }

  editTodo(todo: Todo): void { this.todoEdit = todo; }

  doneEditing($event, todo: Todo): void {
    var which = $event.which;
    var target = $event.target;
    if (which === 13) {
      todo.title = target.value;
      this.todoEdit = null;
    } else if (which === 27) {
      this.todoEdit = null;
      target.value = todo.title;
    }
  }

  addTodo(newTitle: string): void { this.todoStore.add(this.factory.create(newTitle, false)); }

  completeMe(todo: Todo): void { todo.completed = !todo.completed; }

  deleteMe(todo: Todo): void { this.todoStore.remove(todo); }

  toggleAll($event): void {
    var isComplete = $event.target.checked;
    this.todoStore.list.forEach((todo: Todo) => { todo.completed = isComplete; });
  }

  clearCompleted(): void { this.todoStore.removeBy((todo) => todo.completed); }
}

export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();  // for the Dart version
  bootstrap(TodoApp);
}
