/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SourceMapGenerator, toBase64String} from '../../src/output/source_map';

describe('source map generation', () => {
  describe('generation', () => {
    it('should generate a valid source map', () => {
      const map = new SourceMapGenerator('out.js')
        .addSource('a.js', null)
        .addLine()
        .addMapping(0, 'a.js', 0, 0)
        .addMapping(4, 'a.js', 0, 6)
        .addMapping(5, 'a.js', 0, 7)
        .addMapping(8, 'a.js', 0, 22)
        .addMapping(9, 'a.js', 0, 23)
        .addMapping(10, 'a.js', 0, 24)
        .addLine()
        .addMapping(0, 'a.js', 1, 0)
        .addMapping(4, 'a.js', 1, 6)
        .addMapping(5, 'a.js', 1, 7)
        .addMapping(8, 'a.js', 1, 10)
        .addMapping(9, 'a.js', 1, 11)
        .addMapping(10, 'a.js', 1, 12)
        .addLine()
        .addMapping(0, 'a.js', 3, 0)
        .addMapping(2, 'a.js', 3, 2)
        .addMapping(3, 'a.js', 3, 3)
        .addMapping(10, 'a.js', 3, 10)
        .addMapping(11, 'a.js', 3, 11)
        .addMapping(21, 'a.js', 3, 11)
        .addMapping(22, 'a.js', 3, 12)
        .addLine()
        .addMapping(4, 'a.js', 4, 4)
        .addMapping(11, 'a.js', 4, 11)
        .addMapping(12, 'a.js', 4, 12)
        .addMapping(15, 'a.js', 4, 15)
        .addMapping(16, 'a.js', 4, 16)
        .addMapping(21, 'a.js', 4, 21)
        .addMapping(22, 'a.js', 4, 22)
        .addMapping(23, 'a.js', 4, 23)
        .addLine()
        .addMapping(0, 'a.js', 5, 0)
        .addMapping(1, 'a.js', 5, 1)
        .addMapping(2, 'a.js', 5, 2)
        .addMapping(3, 'a.js', 5, 2);

      // Generated with https://sokra.github.io/source-map-visualization using a TS source map
      expect(map.toJSON()!.mappings).toEqual(
        'AAAA,IAAM,CAAC,GAAe,CAAC,CAAC;AACxB,IAAM,CAAC,GAAG,CAAC,CAAC;AAEZ,EAAE,CAAC,OAAO,CAAC,UAAA,CAAC;IACR,OAAO,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC;AACvB,CAAC,CAAC,CAAA',
      );
    });

    it('should include the files and their contents', () => {
      const map = new SourceMapGenerator('out.js')
        .addSource('inline.ts', 'inline')
        .addSource('inline.ts', 'inline') // make sur the sources are dedup
        .addSource('url.ts', null)
        .addLine()
        .addMapping(0, 'inline.ts', 0, 0)
        .toJSON()!;

      expect(map.file).toEqual('out.js');
      expect(map.sources).toEqual(['inline.ts', 'url.ts']);
      expect(map.sourcesContent).toEqual(['inline', null]);
    });

    it('should not generate source maps when there is no mapping', () => {
      const smg = new SourceMapGenerator('out.js').addSource('inline.ts', 'inline').addLine();

      expect(smg.toJSON()).toEqual(null);
      expect(smg.toJsComment()).toEqual('');
    });
  });

  describe('encodeB64String', () => {
    it('should return the b64 encoded value', () => {
      [
        ['', ''],
        ['a', 'YQ=='],
        ['Foo', 'Rm9v'],
        ['Foo1', 'Rm9vMQ=='],
        ['Foo12', 'Rm9vMTI='],
        ['Foo123', 'Rm9vMTIz'],
      ].forEach(([src, b64]) => expect(toBase64String(src)).toEqual(b64));
    });
  });

  describe('errors', () => {
    it('should throw when mappings are added out of order', () => {
      expect(() => {
        new SourceMapGenerator('out.js')
          .addSource('in.js')
          .addLine()
          .addMapping(10, 'in.js', 0, 0)
          .addMapping(0, 'in.js', 0, 0);
      }).toThrowError('Mapping should be added in output order');
    });

    it('should throw when adding segments before any line is created', () => {
      expect(() => {
        new SourceMapGenerator('out.js').addSource('in.js').addMapping(0, 'in.js', 0, 0);
      }).toThrowError('A line must be added before mappings can be added');
    });

    it('should throw when adding segments referencing unknown sources', () => {
      expect(() => {
        new SourceMapGenerator('out.js').addSource('in.js').addLine().addMapping(0, 'in_.js', 0, 0);
      }).toThrowError('Unknown source file "in_.js"');
    });

    it('should throw when adding segments without column', () => {
      expect(() => {
        new SourceMapGenerator('out.js').addSource('in.js').addLine().addMapping(null!);
      }).toThrowError('The column in the generated code must be provided');
    });

    it('should throw when adding segments with a source url but no position', () => {
      expect(() => {
        new SourceMapGenerator('out.js').addSource('in.js').addLine().addMapping(0, 'in.js');
      }).toThrowError('The source location must be provided when a source url is provided');
      expect(() => {
        new SourceMapGenerator('out.js').addSource('in.js').addLine().addMapping(0, 'in.js', 0);
      }).toThrowError('The source location must be provided when a source url is provided');
    });
  });
});
