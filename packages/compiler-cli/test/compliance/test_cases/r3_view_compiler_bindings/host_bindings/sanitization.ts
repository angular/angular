import {Directive} from '@angular/core';

@Directive({
  selector: 'a[hostBindingLinkDir]',
  host: {
    '[innerHtml]': 'evil',
    '[href]': 'evil',
    '[attr.style]': 'evil',
  },
})
export class HostBindingLinkDir {
  evil = 'evil';
}

@Directive({
  selector: 'img[hostBindingImgDir]',
  host: {
    '[innerHtml]': 'evil',
    '[attr.style]': 'evil',
    '[src]': 'evil',
  },
})
export class HostBindingImageDir {
  evil = 'evil';
}

@Directive({
  selector: 'iframe[hostBindingIframeDir]',
  host: {
    '[innerHtml]': 'evil',
    '[attr.style]': 'evil',
    '[src]': 'evil',
    '[sandbox]': 'evil',
  },
})
export class HostBindingIframeDir {
  evil = 'evil';
}
