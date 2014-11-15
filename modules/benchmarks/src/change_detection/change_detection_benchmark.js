import {ListWrapper, MapWrapper} from 'facade/collection';
import {Parser} from 'change_detection/parser/parser';
import {Lexer} from 'change_detection/parser/lexer';
import {reflector} from 'reflection/reflection';

import {
  ChangeDetector,
  ProtoRecordRange,
  WatchGroupDispatcher,
} from 'change_detection/change_detector';


var ITERATIONS = 100000;

export function run () {
  reflector.registerGetters({
    'a': function(obj){return obj.a},
    'b': function(obj){return obj.b},
    'c': function(obj){return obj.c}
  });

  reflector.registerSetters({
    'a': function(obj, v){return obj.a = v},
    'b': function(obj, v){return obj.b = v},
    'c': function(obj, v){return obj.c = v}
  });

  var parser = new Parser(new Lexer());
  var astWithSource = parser.parseBinding('a + b * c');

  var prr = new ProtoRecordRange();
  prr.addRecordsFromAST(astWithSource.ast, 'memo', false);

  var dispatcher = new DummyDispatcher();
  var rr = prr.instantiate(dispatcher, MapWrapper.create());
  rr.setContext(new Component());

  var cd = new ChangeDetector(rr);
  for (var i = 0; i < ITERATIONS; ++i) {
    cd.detectChanges();
  }
}


class DummyDispatcher extends WatchGroupDispatcher {
  onRecordChange(record, context) {
  }
}

class Component {
  a:number;
  b:number;
  c:number;

  constructor() {
    this.a = 1;
    this.b = 2;
    this.c = 3;
  }
}