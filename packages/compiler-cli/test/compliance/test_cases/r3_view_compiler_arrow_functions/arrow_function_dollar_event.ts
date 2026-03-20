import {Component, signal} from '@angular/core';

@Component({
  template: `
    @let topLevelLet = 1;

    @if (true) {
      @let innerLet = 2;

      <button (click)="signal.update(prev => $event.type + prev + innerLet + topLevelLet + componentProp)"></button>
    }
  `
})
export class TestComp {
  componentProp = 0;
  result = signal('');
}
