import {Component, Pipe} from '@angular/core';

@Pipe({standalone: true, name: 'testPipe'})
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
  standalone: true,
  imports: [TestPipe],
})
export class MyApp {
  message = 'hello';
  isReady = true;

  isVisible() {
    return false;
  }
}
