import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div i18n title="  pre-title {{titleValue}}  post-title" i18n-title>  pre-body {{bodyValue}}  post-body</div>',
    standalone: false
})
export class TestCmp {
  titleValue: string = '';
  bodyValue: string = '';
}
