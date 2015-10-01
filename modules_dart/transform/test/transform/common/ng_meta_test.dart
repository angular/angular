library angular2.test.transform.common.ng_meta_test;

import 'package:guinness/guinness.dart';

import 'ng_meta_helper.dart';

main() => allTests();

void allTests() {
  var mockData = [
    createDirectiveMetadataForTest(name: 'N1'),
    createDirectiveMetadataForTest(name: 'N2'),
    createDirectiveMetadataForTest(name: 'N3'),
    createDirectiveMetadataForTest(name: 'N4')
  ];

  it('should allow empty data.', () {
    var ngMeta = new NgMeta.empty();
    expect(ngMeta.isEmpty).toBeTrue();
  });

  describe('serialization', () {
    it('should parse empty data correctly.', () {
      var ngMeta = new NgMeta.fromJson({});
      expect(ngMeta.isEmpty).toBeTrue();
    });

    it('should be lossless', () {
      var a = new NgMeta.empty();
      a.types['T0'] = mockData[0];
      a.types['T1'] = mockData[1];
      a.types['T2'] = mockData[2];
      a.types['T3'] = mockData[3];
      a.aliases['a1'] = ['T1'];
      a.aliases['a2'] = ['a1'];
      a.aliases['a3'] = ['T3', 'a2'];
      a.aliases['a4'] = ['a3', 'T3'];
      _checkSimilar(a, new NgMeta.fromJson(a.toJson()));
    });
  });

  describe('flatten', () {
    it('should include recursive aliases.', () {
      var a = new NgMeta.empty();
      a.types['T0'] = mockData[0];
      a.types['T1'] = mockData[1];
      a.types['T2'] = mockData[2];
      a.types['T3'] = mockData[3];
      a.aliases['a1'] = ['T1'];
      a.aliases['a2'] = ['a1'];
      a.aliases['a3'] = ['T3', 'a2'];
      a.aliases['a4'] = ['a3', 'T0'];
      expect(a.flatten('a4')).toEqual([mockData[3], mockData[1], mockData[0]]);
    });

    it('should detect cycles.', () {
      var a = new NgMeta.empty();
      a.types['T0'] = mockData[0];
      a.aliases['a1'] = ['T0', 'a1'];
      a.aliases['a2'] = ['a1'];
      expect(a.flatten('a1')).toEqual([mockData[0]]);
    });
  });

  describe('merge', () {
    it('should merge all types on addAll', () {
      var a = new NgMeta.empty();
      var b = new NgMeta.empty();
      a.types['T0'] = mockData[0];
      b.types['T1'] = mockData[1];
      a.addAll(b);
      expect(a.types).toContain('T1');
      expect(a.types['T1']).toEqual(mockData[1]);
    });

    it('should merge all aliases on addAll', () {
      var a = new NgMeta.empty();
      var b = new NgMeta.empty();
      a.aliases['a'] = ['x'];
      b.aliases['b'] = ['y'];
      a.addAll(b);
      expect(a.aliases).toContain('b');
      expect(a.aliases['b']).toEqual(['y']);
    });
  });
}

_checkSimilar(NgMeta a, NgMeta b) {
  expect(a.types.length).toEqual(b.types.length);
  expect(a.aliases.length).toEqual(b.aliases.length);
  for (var k in a.types.keys) {
    expect(b.types).toContain(k);
    var at = a.types[k];
    var bt = b.types[k];
    expect(at.type.name).toEqual(bt.type.name);
  }
  for (var k in a.aliases.keys) {
    expect(b.aliases).toContain(k);
    expect(b.aliases[k]).toEqual(a.aliases[k]);
  }
}
