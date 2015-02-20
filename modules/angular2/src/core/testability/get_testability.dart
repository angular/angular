library testability.get_testability;

import './testability.dart';

import 'dart:js' as js;

class GetTestability {
  static addToWindow(TestabilityRegistry registry) {
    js.context['angular'] = new js.JsObject.jsify({'getTestability': 5, 'resumeBootstrap': 6});
  }
}
