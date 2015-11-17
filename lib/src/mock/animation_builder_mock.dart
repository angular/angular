library angular2.src.mock.animation_builder_mock;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/animate/animation_builder.dart"
    show AnimationBuilder;
import "package:angular2/src/animate/css_animation_builder.dart"
    show CssAnimationBuilder;
import "package:angular2/src/animate/css_animation_options.dart"
    show CssAnimationOptions;
import "package:angular2/src/animate/animation.dart" show Animation;
import "package:angular2/src/animate/browser_details.dart" show BrowserDetails;

@Injectable()
class MockAnimationBuilder extends AnimationBuilder {
  MockAnimationBuilder() : super(null) {
    /* super call moved to initializer */;
  }
  CssAnimationBuilder css() {
    return new MockCssAnimationBuilder();
  }
}

class MockCssAnimationBuilder extends CssAnimationBuilder {
  MockCssAnimationBuilder() : super(null) {
    /* super call moved to initializer */;
  }
  Animation start(dynamic element) {
    return new MockAnimation(element, this.data);
  }
}

class MockBrowserAbstraction extends BrowserDetails {
  void doesElapsedTimeIncludesDelay() {
    this.elapsedTimeIncludesDelay = false;
  }
}

class MockAnimation extends Animation {
  Function _callback;
  MockAnimation(dynamic element, CssAnimationOptions data)
      : super(element, data, new MockBrowserAbstraction()) {
    /* super call moved to initializer */;
  }
  wait(Function callback) {
    this._callback = callback;
  }

  flush() {
    this._callback(0);
    this._callback = null;
  }
}
