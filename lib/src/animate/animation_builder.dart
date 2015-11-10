library angular2.src.animate.animation_builder;

import "package:angular2/src/core/di.dart" show Injectable;
import "css_animation_builder.dart" show CssAnimationBuilder;
import "browser_details.dart" show BrowserDetails;

@Injectable()
class AnimationBuilder {
  BrowserDetails browserDetails;
  /**
   * Used for DI
   * @param browserDetails
   */
  AnimationBuilder(this.browserDetails) {}
  /**
   * Creates a new CSS Animation
   * @returns {CssAnimationBuilder}
   */
  CssAnimationBuilder css() {
    return new CssAnimationBuilder(this.browserDetails);
  }
}
