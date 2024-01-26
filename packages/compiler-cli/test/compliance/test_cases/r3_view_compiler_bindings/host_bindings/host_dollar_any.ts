import {Component} from '@angular/core';

@Component({
  selector: '[hostBindingDir]',
  host: {
    '[style.color]': '$any("red")',
  },
  template: ``
})
export class HostBindingDir {
}
