/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

// base model for RecordStore
export abstract class KeyModel {
  constructor(public key: number) {}
}

export class Todo extends KeyModel {
  constructor(key: number, public title: string, public completed: boolean) {
    super(key);
  }
}

@Injectable()
export class TodoFactory {
  private _uid: number = 0;

  nextUid(): number {
    return ++this._uid;
  }

  create(title: string, isCompleted: boolean): Todo {
    return new Todo(this.nextUid(), title, isCompleted);
  }
}

// Store manages any generic item that inherits from KeyModel
@Injectable()
export class Store<T extends KeyModel> {
  list: T[] = [];

  add(record: T): void {
    this.list.push(record);
  }

  remove(record: T): void {
    this.removeBy((item) => item === record);
  }

  removeBy(callback: (record: T) => boolean): void {
    this.list = this.list.filter((record) => !callback(record));
  }
}
