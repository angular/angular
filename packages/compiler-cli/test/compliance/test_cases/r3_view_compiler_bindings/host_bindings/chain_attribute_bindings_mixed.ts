import {Directive} from '@angular/core';

@Directive({
    selector: '[my-dir]',
    host: { '[attr.title]': '"my title"', '[tabindex]': '1', '[attr.id]': '"my-id"' },
    standalone: false
})
export class MyDirective {
}
