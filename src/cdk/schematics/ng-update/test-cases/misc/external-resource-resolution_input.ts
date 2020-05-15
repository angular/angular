import {Component} from '@angular/core';

@Component({
  selector: 'test-cmp',
  templateUrl: '/projects/material/test.html',
})
export class MyTestComp {}

@Component({
  selector: 'test-cmp2',
  templateUrl: '../some-tmpl.html',
})
export class MyTestComp2 {}

@Component({
  selector: 'test-cmp3',
  templateUrl: 'local.html',
})
export class MyTestComp3 {}
