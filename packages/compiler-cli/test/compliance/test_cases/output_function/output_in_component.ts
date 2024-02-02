import {Component, output} from '@angular/core';

@Component({
  standalone: true,
  template: 'Works',
})
export class TestComp {
  a = output();
  b = output<string>({});
  c = output<void>({alias: 'cPublic'});
}
