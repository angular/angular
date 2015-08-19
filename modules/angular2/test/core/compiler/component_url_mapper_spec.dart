library angular2.test.core.compiler.component_url_mapper_spec;

import 'package:angular2/test_lib.dart';
import 'package:angular2/src/core/compiler/component_url_mapper.dart';

main() {
  describe("ComponentUrlMapper", () {
    it("should return the URL of the component's library", () {
      var mapper = new ComponentUrlMapper();
      expect(mapper
          .getUrl(SomeComponent)
          .endsWith("core/compiler/component_url_mapper_spec.dart")).toBeTrue();
    });
  });
}

class SomeComponent {}
