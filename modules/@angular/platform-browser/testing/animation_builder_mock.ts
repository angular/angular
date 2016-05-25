import {Injectable} from '@angular/core';
import {Animation} from '../src/animate/animation';
import {CssAnimationOptions} from '../src/animate/css_animation_options';
import {BrowserDetails} from '../src/animate/browser_details';
import {AnimationBuilder} from '../src/animate/animation_builder';
import {CssAnimationBuilder} from '../src/animate/css_animation_builder';

@Injectable()
export class MockAnimationBuilder extends AnimationBuilder {
  constructor() { super(null); }
  css(): CssAnimationBuilder { return new MockCssAnimationBuilder(); }
}

class MockCssAnimationBuilder extends CssAnimationBuilder {
  constructor() { super(null); }
  start(element: HTMLElement): Animation { return new MockAnimation(element, this.data); }
}

class MockBrowserAbstraction extends BrowserDetails {
  doesElapsedTimeIncludesDelay(): void { this.elapsedTimeIncludesDelay = false; }
}

class MockAnimation extends Animation {
  private _callback: Function;
  constructor(element: HTMLElement, data: CssAnimationOptions) {
    super(element, data, new MockBrowserAbstraction());
  }
  wait(callback: Function) { this._callback = callback; }
  flush() {
    this._callback(0);
    this._callback = null;
  }
}
