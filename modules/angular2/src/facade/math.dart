library angular.core.facade.math;

import 'dart:math' as math;

class Math {
  static num pow(num x, num exponent) {
    return math.pow(x, exponent);
  }

  static num min(num a, num b) => math.min(a, b);

  static num floor(num a) => a.floor();
}
