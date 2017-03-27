/* tslint:disable:class-name component-class-suffix */
// #docplaster
// #docregion
import { Component } from '@angular/core';

// #docregion key-up-component-1
@Component({
  selector: 'key-up1',
// #docregion key-up-component-1-template
  template: `
    <input (keyup)="onKey($event)">
    <p>{{values}}</p>
  `
// #enddocregion key-up-component-1-template
})
// #docregion key-up-component-1-class, key-up-component-1-class-no-type
export class KeyUpComponent_v1 {
  values = '';

// #enddocregion key-up-component-1-class, key-up-component-1-class-no-type
  /*
  // #docregion key-up-component-1-class-no-type
  onKey(event: any) { // without type info
    this.values += event.target.value + ' | ';
  }
  // #enddocregion key-up-component-1-class-no-type
  */
  // #docregion key-up-component-1-class

  onKey(event: KeyboardEvent) { // with type info
    this.values += (<HTMLInputElement>event.target).value + ' | ';
  }
// #docregion key-up-component-1-class-no-type
}
// #enddocregion key-up-component-1,key-up-component-1-class, key-up-component-1-class-no-type

//////////////////////////////////////////

// #docregion key-up-component-2
@Component({
  selector: 'key-up2',
  template: `
    <input #box (keyup)="onKey(box.value)">
    <p>{{values}}</p>
  `
})
export class KeyUpComponent_v2 {
  values = '';
  onKey(value: string) {
    this.values += value + ' | ';
  }
}
// #enddocregion key-up-component-2

//////////////////////////////////////////

// #docregion key-up-component-3
@Component({
  selector: 'key-up3',
  template: `
    <input #box (keyup.enter)="onEnter(box.value)">
    <p>{{value}}</p>
  `
})
export class KeyUpComponent_v3 {
  value = '';
  onEnter(value: string) { this.value = value; }
}
// #enddocregion key-up-component-3

//////////////////////////////////////////

// #docregion key-up-component-4
@Component({
  selector: 'key-up4',
  template: `
    <input #box
      (keyup.enter)="update(box.value)"
      (blur)="update(box.value)">

    <p>{{value}}</p>
  `
})
export class KeyUpComponent_v4 {
  value = '';
  update(value: string) { this.value = value; }
}
// #enddocregion key-up-component-4
