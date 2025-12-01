import {Directive} from '@angular/core';

@Directive({
  selector: '[hostBindingDir]',
  host: {
    '[innerHtml]': 'evil',
    '[href]': 'evil',
    '[attr.style]': 'evil',
    '[src]': 'evil',
    '[sandbox]': 'evil',
    '[attr.attributeName]': 'nonEvil',
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
    '[sandbox]': 'nonEvil',
  },
})
export class HostBindingDir2 {
  evil = 'evil';
  nonEvil = 'nonEvil';
}

@Directive({
  selector: 'animateMotion[hostBindingSvgAnimateDir]',
  host: {
    '[attr.attributeName]': 'evil',
  },
})
export class HostBindingSvgAnimateDir {
  evil = 'evil';
}
