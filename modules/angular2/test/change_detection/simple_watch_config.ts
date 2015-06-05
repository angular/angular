import {ListWrapper} from 'angular2/src/facade/collection';
import {BindingRecord, ChangeDetectorDefinition, Lexer, Parser} from 'angular2/change_detection';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';

var _parser = new Parser(new Lexer());

function _createChangeDetectorDefinition(id: string, expression: string): ChangeDetectorDefinition {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  var ast = _parser.parseBinding(expression, 'location');
  var bindingRecords = [BindingRecord.createForElement(ast, 0, PROP_NAME)];

  var strategy = null;
  var variableBindings = [];
  var directiveRecords = [];
  return new ChangeDetectorDefinition(id, strategy, variableBindings, bindingRecords,
                                      directiveRecords);
}

export var PROP_NAME = 'propName';

/**
 * In this case, we expect `id` and `expression` to be the same string.
 */
export function getDefinition(id: string): ChangeDetectorDefinition {
  if (ListWrapper.indexOf(_availableDefinitions, id) < 0) {
    throw `No ChangeDetectorDefinition for ${id} available. Please modify this file if necessary.`;
  }
  return _createChangeDetectorDefinition(id, id);
}

/**
 * Get all available ChangeDetectorDefinition objects. Used to pre-generate Dart
 * `ChangeDetector` classes.
 */
export function getAllDefinitions(): List<ChangeDetectorDefinition> {
  return ListWrapper.map(_availableDefinitions, (id) => getDefinition(id));
}

var _availableDefinitions = [
  '10',
  '"str"',
  '"a\n\nb"',
  '10 + 2',
  '10 - 2',
  '10 * 2',
  '10 / 2',
  '11 % 2',
  '1 == 1',
  '1 != 1',
  '1 == true',
  '1 === 1',
  '1 !== 1',
  '1 === true',
  '1 < 2',
  '2 < 1',
  '1 > 2',
  '2 > 1',
  '1 <= 2',
  '2 <= 2',
  '2 <= 1',
  '2 >= 1',
  '2 >= 2',
  '1 >= 2',
  'true && true',
  'true && false',
  'true || false',
  'false || false',
  '!true',
  '!!true',
  '1 < 2 ? 1 : 2',
  '1 > 2 ? 1 : 2',
  '["foo", "bar"][0]',
  '{"foo": "bar"}["foo"]',
  'value',
  'a',
  'address.city',
  'address?.city',
  'address?.toString()',
  'sayHi("Jim")',
  'a()(99)',
  'a.sayHi("Jim")'
];
