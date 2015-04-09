import {bootstrap, Component, View, For} from 'angular2/angular2';
import {Store, Todo, TodoFactory} from './services/TodoStore';

@Component({
  selector: 'todo-app',
  injectables: [
    Store,
    TodoFactory
  ]
})
@View({
  templateUrl: 'todo.html',
  directives: [For]
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
      this.todoStore.save(todo);
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
      this.todoStore.save(todo);
    });
  }

  clearCompleted() {
    this.todoStore.removeBy((todo) => todo.completed);
  }
}

export function main() {
  bootstrap(TodoApp);
}
