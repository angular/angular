// #docregion
import { Component } from '@angular/core';

///////// Using Absolute Paths ///////

// #docregion absolute-config
@Component({
  selector: 'absolute-path',
  templateUrl: 'app/some.component.html',
  styleUrls:  ['app/some.component.css']
})
// #enddocregion absolute-config
export class SomeAbsoluteComponent {
  class = 'absolute';
  type = 'Absolute template & style URLs';
  path = 'app/path.component.html';
}

///////// Using Relative Paths ///////

// #docregion relative-config
@Component({
  // #docregion module-id
  moduleId: module.id,
  // #enddocregion module-id
  selector: 'relative-path',
  templateUrl: './some.component.html',
  styleUrls:  ['./some.component.css']
})
// #enddocregion relative-config

export class SomeRelativeComponent {
  class = 'relative';
  type = 'Component-relative template & style URLs';
  path = 'path.component.html';

}
