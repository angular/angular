import {Directive} from '@angular/core';

@Directive({
  selector: '[hostBindingDir]',
  host: {'src': 'trusted', 'srcdoc': 'trusted'},
})
export class HostBindingDir {
}

@Directive({
  selector: 'img',
  host: {'src': 'trusted', 'srcdoc': 'trusted'},
})
export class HostBindingDir2 {
}
