import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div i18n>Interpolation: {{ one }}&nbsp;Interpolation: {{ two }}</div>',
    standalone: false
})
export class TestCmp {
  one = 1;
  two = 2;
}
