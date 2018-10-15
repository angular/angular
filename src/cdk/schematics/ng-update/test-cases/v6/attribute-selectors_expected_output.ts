import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';

const a = By.css('[cdkPortalOutlet]');
const b = By.css('[cdkPortalOutlet]');

// These should not change because we only update string literals that are
// inside of a call expression.
const c = 'cdkPortalHost';
const d = 'portalHost';

@Component({
  template: `
    <div cdkPortalOutlet="E"></div>
    <div [cdkPortalOutlet]="myPortal"></div>
  `,
  styles: [
    '[cdkPortalOutlet] {background: red}',
    'div[cdkPortalOutlet] {color: blue}'
  ]
})
class E {}

@Component({
  template: `
    <div cdkPortalOutlet="F"></div>
    <div [cdkPortalOutlet]="myPortal"></div>
  `,
  styles: [
    '[cdkPortalOutlet] {background: red}',
    'div[cdkPortalOutlet] {color: blue}'
  ]
})
class F {}