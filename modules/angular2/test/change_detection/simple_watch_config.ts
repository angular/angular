import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent} from 'angular2/src/facade/lang';
import {
  BindingRecord,
  ChangeDetectorDefinition,
  Lexer,
  Locals,
  Parser
} from 'angular2/change_detection';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';

var _parser = new Parser(new Lexer());

function _createBindingRecords(expression: string): List<BindingRecord> {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  var ast = _parser.parseBinding(expression, 'location');
  return [BindingRecord.createForElement(ast, 0, PROP_NAME)];
}

function _convertLocalsToVariableBindings(locals: Locals): List<any> {
  var variableBindings = [];
  var loc = locals;
  while (isPresent(loc) && isPresent(loc.current)) {
    MapWrapper.forEach(loc.current, (v, k) => ListWrapper.push(variableBindings, k));
    loc = loc.parent;
  }
  return variableBindings;
}

export var PROP_NAME = 'propName';

/**
 * In this case, we expect `id` and `expression` to be the same string.
 */
export function getDefinition(id: string): TestDefinition {
  var expression = null;
  var locals = null;
  if (MapWrapper.contains(_availableDefinitionsWithLocals, id)) {
    var val = MapWrapper.get(_availableDefinitionsWithLocals, id);
    expression = val.expression;
    locals = val.locals;
  } else if (ListWrapper.indexOf(_availableDefinitions, id) >= 0) {
    expression = id;
  }
  if (isBlank(expression)) {
    throw `No ChangeDetectorDefinition for ${id} available. Please modify this file if necessary.`;
  }

  var strategy = null;
  var variableBindings = isPresent(locals) ? _convertLocalsToVariableBindings(locals) : [];
  var bindingRecords = _createBindingRecords(expression);
  var directiveRecords = [];
  var cdDef = new ChangeDetectorDefinition(id, strategy, variableBindings, bindingRecords,
                                           directiveRecords);
  return new TestDefinition(id, cdDef, locals);
}

export class TestDefinition {
  constructor(public id: string, public cdDef: ChangeDetectorDefinition, public locals: Locals) {}
}

/**
 * Get all available ChangeDetectorDefinition objects. Used to pre-generate Dart
 * `ChangeDetector` classes.
 */
export function getAllDefinitions(): List<TestDefinition> {
  return ListWrapper.map(_availableDefinitions, (id) => getDefinition(id));
}

/**
 * The list of all test definitions this config supplies.
 * Items in this list that do not appear in other structures define tests with expressions
 * equivalent to their ids.
 */
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
  'a.sayHi("Jim")',
  'valueFromLocals',
  'functionFromLocals',
  'nestedLocals',
  'fallbackLocals',
  'contextNestedPropertyWithLocals',
  'localPropertyWithSimilarContext'
];

class _ExpressionWithLocals {
  constructor(public expression: string, public locals: Locals) {}
}

/**
 * Map from test id to _ExpressionWithLocals.
 * Tests in this map define an expression and local values which those expressions refer to.
 */
var _availableDefinitionsWithLocals = MapWrapper.createFromPairs([
  [
    'valueFromLocals',
    new _ExpressionWithLocals('key',
                              new Locals(null, MapWrapper.createFromPairs([['key', 'value']])))
  ],
  [
    'functionFromLocals',
    new _ExpressionWithLocals(
        'key()', new Locals(null, MapWrapper.createFromPairs([['key', () => 'value']])))
  ],
  [
    'nestedLocals',
    new _ExpressionWithLocals(
        'key', new Locals(new Locals(null, MapWrapper.createFromPairs([['key', 'value']])),
                          MapWrapper.create()))
  ],
  [
    'fallbackLocals',
    new _ExpressionWithLocals('name',
                              new Locals(null, MapWrapper.createFromPairs([['key', 'value']])))
  ],
  [
    'contextNestedPropertyWithLocals',
    new _ExpressionWithLocals('address.city',
                              new Locals(null, MapWrapper.createFromPairs([['city', 'MTV']])))
  ],
  [
    'localPropertyWithSimilarContext',
    new _ExpressionWithLocals('city',
                              new Locals(null, MapWrapper.createFromPairs([['city', 'MTV']])))
  ]
]);
