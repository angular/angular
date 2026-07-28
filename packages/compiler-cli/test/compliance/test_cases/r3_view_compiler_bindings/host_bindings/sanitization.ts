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
    '[sandbox]': 'evil',
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

@Directive({
  selector: 'safe-srcdoc-carrier',
  host: {
    '[attr.srcdoc]': 'evil',
  },
})
export class HostBindingCustomSrcdocDir {
  evil = 'evil';
}

@Directive({
  selector: 'safe-src-carrier',
  host: {
    '[attr.src]': 'evil',
  },
})
export class HostBindingCustomSrcDir {
  evil = 'evil';
}

@Directive({
  selector: 'safe-data-carrier',
  host: {
    '[attr.data]': 'evil',
  },
})
export class HostBindingCustomDataDir {
  evil = 'evil';
}
