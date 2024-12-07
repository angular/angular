import {Directive} from '@angular/core';

@Directive({
  selector: '[hostBindingDir]',
  host: {
    '[class.a]': 'value ?? "class-a"',
    '[class.b]': 'value ?? "class-b"',
  },
})
export class HostBindingDir {
  value: number|null = null;
}
