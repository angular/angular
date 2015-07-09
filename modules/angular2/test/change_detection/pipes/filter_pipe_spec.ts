import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach} from 'angular2/test_lib';
import {StringWrapper, isString} from 'angular2/src/facade/lang';
import {FilterPipe} from 'angular2/src/change_detection/pipes/filter_pipe';

class Name {
  constructor(public firstName: string, public lastName: string) {}
}

export function main() {
  describe("FilterPipe", () => {
    var pipe;

    beforeEach(() => { pipe = new FilterPipe(); });

    describe("supports", () => {
      it("should support lists", () => { expect(pipe.supports([])).toBe(true); });

      it("should not support other objects", () => {
        expect(pipe.supports(new Object())).toBe(false);
        expect(pipe.supports('str')).toBe(false);
        expect(pipe.supports(null)).toBe(false);
      });
    });

    describe("transform", () => {
      it("should filter by string", () => {
        var items = ['MIsKO', {name: 'shyam'}, ['adam']];
        expect(pipe.transform(items, ['']).length).toBe(3);
        expect(pipe.transform(items, [null]).length).toBe(3);

        expect(pipe.transform(items, ['isk'])).toEqual(['MIsKO']);
        expect(pipe.transform(items, ['yam'])).toEqual([{name: 'shyam'}]);
        expect(pipe.transform(items, ['da'])).toEqual([['adam']]);
        expect(pipe.transform(items, ["I don't exist"])).toEqual([]);
      });

      it('should filter on specific property', () => {
        var items = [{ignore: 'a', name: 'a'}, {ignore: 'a', name: 'abc'}];
        expect(pipe.transform(items, [{}]).length).toBe(2);

        expect(pipe.transform(items, [{name: 'a'}]).length).toBe(2);

        expect(pipe.transform(items, [{name: 'b'}]).length).toBe(1);
        expect(pipe.transform(items, [{name: 'b'}])[0]['name']).toBe('abc');
      });

      it('should take function as predicate', () => {
        var items = [{name: 'a'}, {name: 'abc', done: true}];
        expect(pipe.transform(items, [function(i) { return i['done'] == true; }]).length).toBe(1);
      });

      it('should match items with array properties containing one or more matching items', () => {
        var items, expr;

        items = [
          {tags: ['web', 'html', 'css', 'js']},
          {tags: ['hybrid', 'html', 'css', 'js', 'ios', 'android']},
          {tags: ['mobile', 'ios', 'android']}
        ];
        expr = {tags: 'html'};
        expect(pipe.transform(items, [expr])).toEqual([items[0], items[1]]);

        items = [{nums: [1, 345, 12]}, {nums: [0, 46, 78]}, {nums: [12, 4, 67]}];
        expr = {nums: 12};
        expect(pipe.transform(items, [expr])).toEqual([items[0], items[2]]);

        items = [
          {customers: [{name: 'John'}, {name: 'Elena'}, {name: 'Bill'}]},
          {customers: [{name: 'Sam'}, {name: 'Klara'}, {name: 'Bill'}]},
          {customers: [{name: 'Molli'}, {name: 'Elena'}, {name: 'Lora'}]}
        ];
        expr = {customers: {name: 'Bill'}};
        expect(pipe.transform(items, [expr])).toEqual([items[0], items[1]]);
      });

      it('should take object as predicate', () => {
        var items = [{first: 'misko', last: 'hevery'}, {first: 'adam', last: 'abrons'}];

        expect(pipe.transform(items, [{first: '', last: ''}]).length).toBe(2);
        expect(pipe.transform(items, [{first: '', last: 'hevery'}]).length).toBe(1);
        expect(pipe.transform(items, [{first: 'adam', last: 'hevery'}]).length).toBe(0);
        expect(pipe.transform(items, [{first: 'misko', last: 'hevery'}])).toEqual([items[0]]);
      });

      it('should support deep predicate objects', () => {
        var items = [
          {person: {name: 'John'}},
          {person: {name: 'Rita'}},
          {person: {name: 'Billy'}},
          {person: {name: 'Joan'}}
        ];
        expect(pipe.transform(items, [{person: {name: 'Jo'}}]))
            .toEqual([{person: {name: 'John'}}, {person: {name: 'Joan'}}]);
      });

      it('should support deep expression objects with multiple properties', () => {
        var items = [
          {person: {name: 'Annet', email: 'annet@example.com'}},
          {person: {name: 'Billy', email: 'me@billy.com'}},
          {person: {name: 'Joan', email: 'joan@example.net'}},
          {person: {name: 'John', email: 'john@example.com'}},
          {person: {name: 'Rita', email: 'rita@example.com'}}
        ];
        var expr = {person: {name: 'Jo', email: '!example.com'}};

        expect(pipe.transform(items, [expr])).toEqual([items[2]]);
      });

      it('should match any properties for given "$" property', () => {
        var items = [
          {first: 'tom', last: 'hevery'},
          {first: 'adam', last: 'hevery', alias: 'tom', done: false},
          {first: 'john', last: 'clark', middle: 'tommy'}
        ];
        expect(pipe.transform(items, [{'$': 'tom'}]).length).toBe(3);
        expect(pipe.transform(items, [{'$': 'a'}]).length).toBe(2);
        expect(pipe.transform(items, [{'$': false}]).length).toBe(1);
        expect(pipe.transform(items, [{'$': 10}]).length).toBe(0);
        expect(pipe.transform(items, [{'$': 'hevery'}])[0]).toEqual(items[0]);
      });

      it('should match any properties in the nested object for given deep "$" property', () => {
        var items = [
          {person: {name: 'Annet', email: 'annet@example.com'}},
          {person: {name: 'Billy', email: 'me@billy.com'}},
          {person: {name: 'Joan', email: 'joan@example.net'}},
          {person: {name: 'John', email: 'john@example.com'}},
          {person: {name: 'Rita', email: 'rita@example.com'}}
        ];
        var expr = {person: {'$': 'net'}};

        expect(pipe.transform(items, [expr])).toEqual([items[0], items[2]]);
      });

      it('should match named properties only against named properties on the same level', () => {
        var expr = {person: {name: 'John'}};
        var items = [
          {person: 'John'},                               // No match (1 level higher)
          {person: {name: 'John'}},                       // Match (same level)
          {person: {name: {first: 'John', last: 'Doe'}}}  // No match (1 level deeper)
        ];

        expect(pipe.transform(items, [expr])).toEqual([items[1]]);
      });

      it('should match any properties on same or deeper level for given "$" property', () => {
        var items = [
          {level1: 'test', foo1: 'bar1'},
          {level1: {level2: 'test', foo2: 'bar2'}, foo1: 'bar1'},
          {level1: {level2: {level3: 'test', foo3: 'bar3'}, foo2: 'bar2'}, foo1: 'bar1'}
        ];

        expect(pipe.transform(items, [{'$': 'ES'}])).toEqual([items[0], items[1], items[2]]);
        expect(pipe.transform(items, [{level1: {'$': 'ES'}}])).toEqual([items[1], items[2]]);
        expect(pipe.transform(items, [{level1: {level2: {'$': 'ES'}}}])).toEqual([items[2]]);
      });

      it('should respect the nesting level of "$"', () => {
        var items = [
          {supervisor: 'me', person: {name: 'Annet', email: 'annet@example.com'}},
          {supervisor: 'me', person: {name: 'Billy', email: 'me@billy.com'}},
          {supervisor: 'me', person: {name: 'Joan', email: 'joan@example.net'}},
          {supervisor: 'me', person: {name: 'John', email: 'john@example.com'}},
          {supervisor: 'me', person: {name: 'Rita', email: 'rita@example.com'}}
        ];
        var expr = {'$': {'$': 'me'}};

        expect(pipe.transform(items, [expr])).toEqual([items[1]]);
      });

      it('should support boolean properties', () => {
        var items = [{name: 'tom', current: true}, {name: 'demi', current: false}, {name: 'sofia'}];

        expect(pipe.transform(items, [{current: true}])).toEqual([items[0]]);
        expect(pipe.transform(items, [{current: false}])).toEqual([items[1]]);
      });

      it('should support negation operator', () => {
        var items = ['misko', 'adam'];
        expect(pipe.transform(items, ['!isk'])).toEqual([items[1]]);
      });

      it('should not throw an error if property is null when comparing object', () => {
        var items = [
          {office: 1, people: {name: 'john'}},
          {office: 2, people: {name: 'jane'}},
          {office: 3, people: null}
        ];
        var f = {};
        expect(pipe.transform(items, [f]).length).toBe(3);

        f = {people: null};
        expect(pipe.transform(items, [f]).length).toBe(1);

        f = {people: {}};
        expect(pipe.transform(items, [f]).length).toBe(2);

        f = {people: {name: ''}};
        expect(pipe.transform(items, [f]).length).toBe(2);

        f = {people: {name: 'john'}};
        expect(pipe.transform(items, [f]).length).toBe(1);

        f = {people: {name: 'j'}};
        expect(pipe.transform(items, [f]).length).toBe(2);
      });

      describe('comparator', () => {

        it('as equality when true', function() {
          var items = ['misko', 'adam', 'adamson'];
          var expr = 'adam';
          expect(pipe.transform(items, [expr, true])).toEqual([items[1]]);
          expect(pipe.transform(items, [expr, false])).toEqual([items[1], items[2]]);
        });

        it('and use the function given to compare values', () => {
          var items = [
            {key: 1, nonkey: 1},
            {key: 2, nonkey: 2},
            {key: 12, nonkey: 3},
            {key: 1, nonkey: 14}
          ];
          var comparator = function(obj, value) { return obj > value; };
          expect(pipe.transform(items, [{key: 10}, comparator])).toEqual([items[2]]);
          expect(pipe.transform(items, [10, comparator])).toEqual([items[2], items[3]]);
        });

        it('and use it correctly with deep expression objects', () => {
          var items = [
            {id: 0, details: {email: 'admin@example.com', role: 'admin'}},
            {id: 1, details: {email: 'user1@example.com', role: 'user'}},
            {id: 2, details: {email: 'user2@example.com', role: 'user'}}
          ];
          var expr, comp;

          expr = {details: {email: 'user@example.com', role: 'adm'}};
          expect(pipe.transform(items, [expr])).toEqual([]);

          expr = {details: {email: 'admin@example.com', role: 'adm'}};
          expect(pipe.transform(items, [expr])).toEqual([items[0]]);

          expr = {details: {email: 'admin@example.com', role: 'adm'}};
          expect(pipe.transform(items, [expr, true])).toEqual([]);

          expr = {details: {email: 'admin@example.com', role: 'admin'}};
          expect(pipe.transform(items, [expr, true])).toEqual([items[0]]);

          expr = {details: {email: 'user', role: 'us'}};
          expect(pipe.transform(items, [expr])).toEqual([items[1], items[2]]);

          expr = {id: 0, details: {email: 'user', role: 'us'}};
          expect(pipe.transform(items, [expr])).toEqual([]);

          expr = {id: 1, details: {email: 'user', role: 'us'}};
          expect(pipe.transform(items, [expr])).toEqual([items[1]]);

          comp = function(actual, expected) {
            return isString(actual) && isString(expected) &&
                   (StringWrapper.startsWith(actual, expected));
          };

          expr = {details: {email: 'admin@example.com', role: 'min'}};
          expect(pipe.transform(items, [expr, comp])).toEqual([]);

          expr = {details: {email: 'admin@example.com', role: 'adm'}};
          expect(pipe.transform(items, [expr, comp])).toEqual([items[0]]);
        });
      });

    });
  });
}
