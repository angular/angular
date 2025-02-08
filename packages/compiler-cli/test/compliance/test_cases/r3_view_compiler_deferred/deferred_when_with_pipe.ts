import {Component, Pipe} from '@angular/core';

@Pipe({name: 'testPipe'})
export class TestPipe {
  transform() {
    return true;
  }
}

@Component({
  template: `
    {{message}}
    @defer (when isVisible() && (isReady | testPipe)) {
      Hello
    }
  `,
  imports: [TestPipe],
})
export class MyApp {
  message = 'hello';
  isReady = true;

  isVisible() {
    return false;
  }
}
