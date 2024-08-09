import {Component, Input} from '@angular/core';

@Component({
  template: `
    {{bla?.myInput}}
  `,
})
class WithSafePropertyReads {
  @Input() myInput = 0;

  bla: this | undefined = this;
}
