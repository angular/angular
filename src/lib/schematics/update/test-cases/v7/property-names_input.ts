import {EventEmitter, OnInit} from '@angular/core';

class SelectionModel {
  onChange = new EventEmitter<void>();
}

/* Actual test case using the previously defined definitions. */

class A implements OnInit {
  self = {me: this};

  constructor(private a: SelectionModel) {}

  ngOnInit() {
    this.a.onChange.subscribe(() => console.log('Changed'));
    this.self.me.a.onChange.subscribe(() => console.log('Changed 2'));
  }
}
