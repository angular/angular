import { BaseException, print, CONST } from 'angular2/src/facade/lang';

class TestAnnotation {
  @CONST()
  constructor() {}
}

// Use a class with an annotation,
// as this is where we expect the most source code changes
// through compilation.
@TestAnnotation()
class Test {
  run() {
    try {
      throw new BaseException('Sourcemap test');
    } catch (e) {
      print(e);
    }
  }
}

export function main() {
  new Test().run();
}
