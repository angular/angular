import {
  describe,
  it,
  expect,
  beforeEach,
  inject,
  beforeEachProviders
} from 'angular2/testing_internal';

import {provide} from 'angular2/src/core/di';
import {CONST_EXPR, stringify, IS_DART} from 'angular2/src/facade/lang';
import {ChangeDetectionCompiler} from 'angular2/src/compiler/change_detector_compiler';
import {CompileTypeMetadata} from 'angular2/src/compiler/directive_metadata';
import {TemplateParser} from 'angular2/src/compiler/template_parser';

import {
  ChangeDetectorGenConfig,
  ChangeDetectionStrategy
} from 'angular2/src/core/change_detection/change_detection';

import {TEST_PROVIDERS} from '../../compiler/test_bindings';
import {MODULE_SUFFIX} from 'angular2/src/compiler/util';
import {createChangeDetectorDefinitions} from "angular2/src/compiler/change_definition_factory";
import {
  UTIL_MODULE,
  ABSTRACT_CHANGE_DETECTOR_MODULE,
  CHANGE_DETECTOR_STATE,
  ABSTRACT_CHANGE_DETECTOR,
  CONSTANTS_MODULE,
  UTIL
} from "angular2/src/compiler/change_detector_compiler";
import {
  ChangeDetectorJITGenerator
} from "angular2/src/core/change_detection/change_detection_jit_generator";

// Attention: These module names have to correspond to real modules!
var THIS_MODULE_ID = 'angular2/test/compiler/change_detector_compiler_spec';
var THIS_MODULE_URL = `package:${THIS_MODULE_ID}${MODULE_SUFFIX}`;

export function main() {
  // Dart's isolate support is broken, and these tests will be obsolote soon with
  if (IS_DART) {
    return;
  }
  describe('CodegenNameUtil', () => {
    var changeDetectorGenConfig = new ChangeDetectorGenConfig(true, false, false);
    beforeEachProviders(() => [
      TEST_PROVIDERS,
      provide(ChangeDetectorGenConfig, {useValue: changeDetectorGenConfig})
    ]);

    var parser: TemplateParser;

    beforeEach(inject([TemplateParser], (_parser) => { parser = _parser; }));

    function createAndRunGenerator(templateBindings: number, maxChunkSize: number) {
      var lines = [];
      for (var i = 0; i < templateBindings; i++) {
        lines.push(`<input type="text" [foo]="c${i}">`)
      }
      var type =
          new CompileTypeMetadata({name: stringify(SomeComponent), moduleUrl: THIS_MODULE_URL});
      var parsedTemplate = parser.parse(lines.join(), CONST_EXPR([]), [], 'TestComp');

      var changeDetectorJITGenerator = new ChangeDetectorJITGenerator(
          createChangeDetectorDefinitions(type, ChangeDetectionStrategy.Default,
                                          new ChangeDetectorGenConfig(true, false, false),
                                          parsedTemplate)[0],
          `${UTIL_MODULE}${UTIL}`, `${ABSTRACT_CHANGE_DETECTOR_MODULE}${ABSTRACT_CHANGE_DETECTOR}`,
          `${CONSTANTS_MODULE}${CHANGE_DETECTOR_STATE}`);
      return changeDetectorJITGenerator._getCodegenNameUtil()
          .genDehydrateFields(maxChunkSize)
          .split('\n');
    };

    it('should not throw on a large number of elements', () => {
      expect(createAndRunGenerator(1, 1).length).toBe(1);
      expect(createAndRunGenerator(10, 1).length).toBe(10);
      expect(createAndRunGenerator(11, 10).length).toBe(2);
      expect(createAndRunGenerator(21, 10).length).toBe(3);
      expect(createAndRunGenerator(500, 100).length).toBe(5);
    });
  });
}

class SomeComponent {}
