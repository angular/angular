import {describe, it, xit, expect} from 'test_lib/test_lib';
import {ProtoWatchGroup, WatchGroup, WatchGroupDispatcher, ChangeDetection} from 'change_detection/change_detection';


export function main() {
  describe('change_detection', function() {
    describe('ChangeDetection', function() {
      xit('should do simple watching', function() {
        var person = new Person('misko', 38);
        var pwg = new ProtoWatchGroup();
        pwg.watch('name', 'nameToken');
        pwg.watch('age', 'ageToken');
        var dispatcher = new LoggingDispatcher();
        var wg = pwg.instantiate(dispatcher);
        wg.setContext(person);
        var cd = new ChangeDetection(wg);
        cd.detectChanges();
        expect(dispatcher.log).toEqual(['ageToken=38']);
        dispatcher.clear();
        cd.detectChanges();
        expect(dispatcher.log).toEqual([]);
        person.age=1;
        person.name="Misko";
        cd.detectChanges();
        expect(dispatcher.log).toEqual(['nameToken=Misko', 'ageToken=1']);
      });
    });
  });
}

class Person {
  constructor(name:string, age:number) {
    this.name = name;
    this.age = age;
  }
}

class LoggingDispatcher extends WatchGroupDispatcher {
  constructor() {
    this.log = null;
  }
  clear() {

  }
}
