import {Component} from '@angular/core';

@Component({
  selector: 'test-cmp',
  template:
      '<div i18n title="  pre-title {{title_value}}  post-title" i18n-title>  pre-body {{body_value}}  post-body</div>',
})
export class TestCmp {
}
