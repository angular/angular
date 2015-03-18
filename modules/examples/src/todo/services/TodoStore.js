import {ListWrapper} from 'angular2/src/facade/collection';

// base model for RecordStore
export class KeyModel {
  _key: number;
  constructor(key: number) {
    this._key = key;
  }
}

export class Todo extends KeyModel {
  title: string;
  completed: boolean;

  constructor(key: number, theTitle: string, isCompleted: boolean) {
    super(key);
    this.title = theTitle;
    this.completed = isCompleted;
  }
}

export class TodoFactory {
  _uid: number;

  constructor() {
    this._uid = 0;
  }

  nextUid() {
    this._uid = this._uid + 1;
    return this._uid;
  }

  create(title: string, isCompleted: boolean) {
    return new Todo(this.nextUid(), title, isCompleted);
  }
}

// Store manages any generic item that inherits from KeyModel
export class Store {
  list: List<KeyModel>;

  constructor() {
    this.list = [];
  }

  add(record: KeyModel) {
    this.list.push(record);
  }

  remove(record: KeyModel) {
    this.spliceOut(record);
  }

  removeBy(callback: Function) {
    var records = ListWrapper.filter(this.list, callback);
    ListWrapper.removeAll(this.list, records);
  }

  spliceOut(record: KeyModel) {
    var i = this.indexFor(record);
    if( i > -1 ) {
      return this.list.splice(i, 1)[0];
    }
    return null;
  }

  indexFor(record: KeyModel) {
    return this.list.indexOf(record);
  }

}
