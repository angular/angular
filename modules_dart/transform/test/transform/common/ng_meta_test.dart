library angular2.test.transform.common.annotation_matcher_test;

import 'package:angular2/src/core/render/api.dart';
import 'package:angular2/src/compiler/directive_metadata.dart';
import 'package:angular2/src/transform/common/ng_meta.dart';
import 'package:guinness/guinness.dart';

main() => allTests();

void allTests() {
  var mockDirMetadata = [
    CompileDirectiveMetadata.create(type: new CompileTypeMetadata(name: 'N1')),
    CompileDirectiveMetadata.create(type: new CompileTypeMetadata(name: 'N2')),
    CompileDirectiveMetadata.create(type: new CompileTypeMetadata(name: 'N3')),
    CompileDirectiveMetadata.create(type: new CompileTypeMetadata(name: 'N4'))
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
      a.identifiers['T0'] = mockDirMetadata[0];
      a.identifiers['T1'] = mockDirMetadata[1];
      a.identifiers['T2'] = mockDirMetadata[2];
      a.identifiers['T3'] = mockDirMetadata[3];

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
      a.identifiers['T0'] = mockDirMetadata[0];
      a.identifiers['T1'] = mockDirMetadata[1];
      a.identifiers['T2'] = mockDirMetadata[2];
      a.identifiers['T3'] = mockDirMetadata[3];
      a.aliases['a1'] = ['T1'];
      a.aliases['a2'] = ['a1'];
      a.aliases['a3'] = ['T3', 'a2'];
      a.aliases['a4'] = ['a3', 'T0'];

      expect(a.flatten('a4')).toEqual([mockDirMetadata[3], mockDirMetadata[1], mockDirMetadata[0]]);
    });

    it('should detect cycles.', () {
      var a = new NgMeta.empty();
      a.identifiers['T0'] = mockDirMetadata[0];
      a.aliases['a1'] = ['T0', 'a2'];
      a.aliases['a2'] = ['a1'];

      expect(() => a.flatten('a1')).toThrowWith(message: new RegExp('Cycle: a1 -> a2 -> a1.'));
    });

    it('should allow duplicates.', () {
      var a = new NgMeta.empty();
      a.identifiers['T0'] = mockDirMetadata[0];
      a.aliases['a1'] = ['T0', 'a2'];
      a.aliases['a2'] = ['T0'];

      expect(() => a.flatten('a1')).not.toThrow();
    });
  });

  describe('merge', () {
    it('should merge all identifiers on addAll', () {
      var a = new NgMeta.empty();
      var b = new NgMeta.empty();
      a.identifiers['T0'] = mockDirMetadata[0];
      b.identifiers['T1'] = mockDirMetadata[1];
      a.addAll(b);
      expect(a.identifiers).toContain('T1');
      expect(a.identifiers['T1']).toEqual(mockDirMetadata[1]);
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
  expect(a.identifiers.length).toEqual(b.identifiers.length);
  expect(a.aliases.length).toEqual(b.aliases.length);
  for (var k in a.identifiers.keys) {
    expect(b.identifiers).toContain(k);
    var at = a.identifiers[k];
    var bt = b.identifiers[k];
    expect(at.type.name).toEqual(bt.type.name);
  }
  for (var k in a.aliases.keys) {
    expect(b.aliases).toContain(k);
    expect(b.aliases[k]).toEqual(a.aliases[k]);
  }
}
