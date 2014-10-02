import {describe, it, xit, expect} from 'test_lib/test_lib';

import {List, ListWrapper} from 'facade/collection';

import {
  ChangeDetector,
  ProtoWatchGroup,
  WatchGroup,
  WatchGroupDispatcher
} from 'change_detection/change_detector';

import {Record} from 'change_detection/record';

export function main() {
  describe('change_detection', function() {
    describe('ChangeDetection', function() {
      it('should do simple watching', function() {
        var person = new Person('misko', 38);
        var pwg = new ProtoWatchGroup();
        pwg.watch('name', 'name', false); // TODO(vicb): remove opt shallow when supported
        pwg.watch('age', 'age', false);
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
    });
  });
}

class Person {
  constructor(name:string, age:number) {
    this.name = name;
    this.age = age;
  }

  toString() {
    return 'name=' + this.name + ' age=' + this.age.toString();
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
