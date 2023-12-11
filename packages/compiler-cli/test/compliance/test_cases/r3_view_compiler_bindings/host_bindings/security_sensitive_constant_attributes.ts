import {Directive} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[hostBindingDir]',
  host: {'src': 'trusted', 'srcdoc': 'trusted'},
})
export class HostBindingDir {
}

@Directive({
  standalone: true,
  selector: 'img',
  host: {'src': 'trusted', 'srcdoc': 'trusted'},
})
export class HostBindingDir2 {
}
