import {Component} from '@angular/core';

@Component({
  template: 'outer',
})
class Outer {
  constructor() {
    @Component({
      template: 'inner',
    })
    class Inner {}
  }
}
