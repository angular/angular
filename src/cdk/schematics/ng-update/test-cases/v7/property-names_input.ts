import {EventEmitter, OnInit} from '@angular/core';

class SelectionModel {
  onChange = new EventEmitter<void>();
}

class CdkConnectedOverlay {
  flexibleDiemsions: boolean;
}

/* Actual test case using the previously defined definitions. */

class A implements OnInit {
  self = {me: this};

  constructor(private a: SelectionModel, private b: CdkConnectedOverlay) {}

  ngOnInit() {
    this.a.onChange.subscribe(() => console.log('Changed'));
    this.self.me.a.onChange.subscribe(() => console.log('Changed 2'));

    if (this.b.flexibleDiemsions) {
      console.log(this.b.flexibleDiemsions ? 'true' : 'false');
    }

    const _state = this.self.me.b.flexibleDiemsions.toString() || 'not-defined';
  }
}