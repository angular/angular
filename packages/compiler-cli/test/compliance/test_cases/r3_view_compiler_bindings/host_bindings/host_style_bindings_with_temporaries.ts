import {Directive} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[hostBindingDir]',
  host: {
    '[style.fontSize]': 'value ?? "15px"',
    '[style.fontWeight]': 'value ?? "bold"',
  },
})
export class HostBindingDir {
  value: number|null = null;
}
