import {describe, it, expect} from 'test_lib/test_lib';
import {ProtoWatchGroup, WatchGroup, WatchGroupDispatcher} from 'change_detection/watch_group';
import {DOM} from 'facade/dom';


export function main() {
  describe('change_detection', function() {
    describe('ChangeDetection', function() {
      it('should do simple watching', function() {
        return; // remove me after getting the test to pass.
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
    this.name = null;
    this.a
  }
}

class Dispatcher extends WatchGroupDispatcher {

}
