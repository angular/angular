import {describe, it, xit, expect} from 'test_lib/test_lib';

import {List, ListWrapper} from 'facade/collection';
import {ImplicitReceiver, FieldRead} from 'change_detection/parser/ast';
import {ClosureMap} from 'change_detection/parser/closure_map';

import {
  ChangeDetector,
  ProtoWatchGroup,
  WatchGroup,
  WatchGroupDispatcher,
  ProtoRecord
} from 'change_detection/change_detector';

import {Record} from 'change_detection/record';

export function main() {
  function ast(exp:string) {
    var parts = exp.split(".");
    var cm = new ClosureMap();
    return ListWrapper.reduce(parts, function (ast, fieldName) {
      return new FieldRead(ast, fieldName, cm.getter(fieldName));
    }, new ImplicitReceiver());
  }

  describe('change_detection', function() {
    describe('ChangeDetection', function() {
      it('should do simple watching', function() {
        var person = new Person('misko', 38);
        var pwg = new ProtoWatchGroup();
        pwg.watch(ast('name'), 'name');
        pwg.watch(ast('age'), 'age');
        var dispatcher = new LoggingDispatcher();
        var wg = pwg.instantiate(dispatcher);
        wg.setContext(person);

        var cd = new ChangeDetector(wg);
        cd.detectChanges();
        expect(dispatcher.log).toEqual(['name=misko', 'age=38']);

        dispatcher.clear();
        cd.detectChanges();
        expect(dispatcher.log).toEqual([]);

        person.age = 1;
        person.name = "Misko";
        cd.detectChanges();
        expect(dispatcher.log).toEqual(['name=Misko', 'age=1']);
      });

      it('should watch chained properties', function() {
        var address = new Address('Grenoble');
        var person = new Person('Victor', 36, address);
        var pwg = new ProtoWatchGroup();
        pwg.watch(ast('address.city'), 'address.city', false);
        var dispatcher = new LoggingDispatcher();
        var wg = pwg.instantiate(dispatcher);
        wg.setContext(person);

        var cd = new ChangeDetector(wg);
        cd.detectChanges();
        expect(dispatcher.log).toEqual(['address.city=Grenoble']);

        dispatcher.clear();
        cd.detectChanges();
        expect(dispatcher.log).toEqual([]);

        address.city = 'Mountain View';
        cd.detectChanges();
        expect(dispatcher.log).toEqual(['address.city=Mountain View']);
      });

    });
  });
}

class Person {
  constructor(name:string, age:number, address:Address = null) {
    this.name = name;
    this.age = age;
    this.address = address;
  }

  toString():string {
    var address = this.address == null ? '' : ' address=' + this.address.toString();

    return 'name=' + this.name +
           ' age=' + this.age.toString() +
           address;
  }
}

class Address {
  constructor(city:string) {
    this.city = city;
  }

  toString():string {
    return this.city;
  }
}

class LoggingDispatcher extends WatchGroupDispatcher {
  constructor() {
    this.log = null;
    this.clear();
  }

  clear() {
    this.log = ListWrapper.create();
  }

  onRecordChange(record:Record, context) {
    ListWrapper.push(this.log, context + '=' + record.currentValue.toString());
  }
}
