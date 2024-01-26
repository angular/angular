import {Directive} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[hostBindingDir]',
  host: {
    '[innerHtml]': 'evil',
    '[href]': 'evil',
    '[attr.style]': 'evil',
    '[src]': 'evil',
    '[sandbox]': 'evil',
  },
})
export class HostBindingDir {
  evil = 'evil';
}

@Directive({
  standalone: true,
  selector: 'a',
  host: {
    '[innerHtml]': 'evil',
    '[href]': 'evil',
    '[attr.style]': 'evil',
    '[src]': 'evil',
    '[sandbox]': 'evil',
  },
})
export class HostBindingDir2 {
  evil = 'evil';
}
