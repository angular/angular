import {Component} from '@angular/core';
import {MdPlatform} from '@angular/material';

@Component({
  template: `
    <p>Is Android: {{ platform.ANDROID }}</p>
    <p>Is iOS: {{ platform.IOS }}</p>
    <p>Is Firefox: {{ platform.FIREFOX }}</p>
    <p>Is Blink: {{ platform.BLINK }}</p>
    <p>Is Webkit: {{ platform.WEBKIT }}</p>
    <p>Is Trident: {{ platform.TRIDENT }}</p>
    <p>Is Edge: {{ platform.EDGE }}</p>
  `
})
export class PlatformDemo {
  constructor(public platform: MdPlatform) {}
}
