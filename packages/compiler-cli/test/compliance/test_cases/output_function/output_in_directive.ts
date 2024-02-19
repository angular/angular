import {Directive, output} from '@angular/core';

@Directive({
  standalone: true,
})
export class TestDir {
  a = output();
  b = output<string>({});
  c = output<void>({alias: 'cPublic'});
}
