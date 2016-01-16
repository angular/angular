import {Injectable} from 'angular2/src/core/di';

import {CssAnimationBuilder} from './css_animation_builder';
import {BrowserDetails} from './browser_details';

@Injectable()
export class AnimationBuilder {
  /**
   * Used for DI
   * @param browserDetails
   */
  constructor(public browserDetails: BrowserDetails) {}

  /**
   * Creates a new CSS Animation
   * @returns {CssAnimationBuilder}
   */
  css(): CssAnimationBuilder { return new CssAnimationBuilder(this.browserDetails); }
}
