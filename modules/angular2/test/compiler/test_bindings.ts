import {bind, Binding} from 'angular2/src/core/di';
import {TemplateParser} from 'angular2/src/compiler/template_parser';
import {HtmlParser} from 'angular2/src/compiler/html_parser';
import {TemplateNormalizer} from 'angular2/src/compiler/template_normalizer';
import {RuntimeMetadataResolver} from 'angular2/src/compiler/runtime_metadata';
import {ChangeDetectionCompiler} from 'angular2/src/compiler/change_detector_compiler';
import {StyleCompiler} from 'angular2/src/compiler/style_compiler';
import {CommandCompiler} from 'angular2/src/compiler/command_compiler';
import {TemplateCompiler} from 'angular2/src/compiler/template_compiler';
import {ChangeDetectorGenConfig} from 'angular2/src/core/change_detection/change_detection';
import {MockSchemaRegistry} from './schema_registry_mock';
import {ElementSchemaRegistry} from 'angular2/src/core/render/dom/schema/element_schema_registry';

// TODO(tbosch): move this into test_injector once the new compiler pipeline is used fully
export var TEST_BINDINGS = [
  HtmlParser,
  TemplateParser,
  TemplateNormalizer,
  RuntimeMetadataResolver,
  StyleCompiler,
  CommandCompiler,
  ChangeDetectionCompiler,
  bind(ChangeDetectorGenConfig).toValue(new ChangeDetectorGenConfig(true, true, false, false)),
  TemplateCompiler,
  bind(ElementSchemaRegistry).toValue(new MockSchemaRegistry({}, {}))
];
