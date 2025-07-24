import {Directive} from '@angular/core';

@Directive({
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
