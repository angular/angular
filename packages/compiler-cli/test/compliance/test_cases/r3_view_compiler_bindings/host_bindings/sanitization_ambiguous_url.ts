import {Directive} from '@angular/core';

// An attribute-only selector: the directive can be placed on ANY element, so `src`/`href` belong
// to both the URL and RESOURCE_URL security contexts. The compiler must defer the choice to
// runtime via ɵɵsanitizeUrlOrResourceUrl.
@Directive({
  selector: '[ambiguousUrl]',
  host: {
    '[attr.src]': 'value',
    '[attr.href]': 'value',
  },
})
export class AmbiguousUrlDirective {
  value = '';
}
