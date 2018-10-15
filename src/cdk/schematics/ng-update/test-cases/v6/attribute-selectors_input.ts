import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';

const a = By.css('[cdkPortalHost]');
const b = By.css('[portalHost]');

// These should not change because we only update string literals that are
// inside of a call expression.
const c = 'cdkPortalHost';
const d = 'portalHost';

@Component({
  template: `
    <div cdkPortalHost="E"></div>
    <div [cdkPortalHost]="myPortal"></div>
  `,
  styles: [
    '[cdkPortalHost] {background: red}',
    'div[cdkPortalHost] {color: blue}'
  ]
})
class E {}

@Component({
  template: `
    <div portalHost="F"></div>
    <div [portalHost]="myPortal"></div>
  `,
  styles: [
    '[portalHost] {background: red}',
    'div[portalHost] {color: blue}'
  ]
})
class F {}