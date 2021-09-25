/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import mapHelpers from 'convert-source-map';

import {absoluteFrom, FileSystem, getFileSystem} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {MockLogger} from '../../logging/testing';
import {RawSourceMap} from '../src/raw_source_map';
import {SourceFileLoader} from '../src/source_file_loader';

runInEachFileSystem(() => {
  describe('SourceFileLoader', () => {
    let fs: FileSystem;
    let logger: MockLogger;
    let _: typeof absoluteFrom;
    let registry: SourceFileLoader;
    beforeEach(() => {
      fs = getFileSystem();
      logger = new MockLogger();
      _ = absoluteFrom;
      registry = new SourceFileLoader(fs, logger, {webpack: _('/foo')});
    });

    describe('loadSourceFile', () => {
      it('should load a file with no source map and inline contents', () => {
        const sourceFile = registry.loadSourceFile(_('/foo/src/index.js'), 'some inline content');
        if (sourceFile === null) {
          return fail('Expected source file to be defined');
        }
        expect(sourceFile.contents).toEqual('some inline content');
        expect(sourceFile.sourcePath).toEqual(_('/foo/src/index.js'));
        expect(sourceFile.rawMap).toBe(null);
        expect(sourceFile.sources).toEqual([]);
      });

      it('should load a file with no source map and read its contents from disk', () => {
        fs.ensureDir(_('/foo/src'));
        fs.writeFile(_('/foo/src/index.js'), 'some external content');
        const sourceFile = registry.loadSourceFile(_('/foo/src/index.js'));
        if (sourceFile === null) {
          return fail('Expected source file to be defined');
        }
        expect(sourceFile.contents).toEqual('some external content');
        expect(sourceFile.sourcePath).toEqual(_('/foo/src/index.js'));
        expect(sourceFile.rawMap).toBe(null);
        expect(sourceFile.sources).toEqual([]);
      });

      it('should load a file with an external source map', () => {
        fs.ensureDir(_('/foo/src'));
        const sourceMap = createRawSourceMap({file: 'index.js'});
        fs.writeFile(_('/foo/src/external.js.map'), JSON.stringify(sourceMap));
        const sourceFile = registry.loadSourceFile(
            _('/foo/src/index.js'), 'some inline content\n//# sourceMappingURL=external.js.map');
        if (sourceFile === null) {
          return fail('Expected source file to be defined');
        }
        if (sourceFile.rawMap === null) {
          return fail('Expected source map to be defined');
        }
        expect(sourceFile.rawMap.map).toEqual(sourceMap);
      });

      it('should only read source-map comments from the last line of a file', () => {
        fs.ensureDir(_('/foo/src'));
        const sourceMap = createRawSourceMap({file: 'index.js'});
        fs.writeFile(_('/foo/src/external.js.map'), JSON.stringify(sourceMap));
        const sourceFile = registry.loadSourceFile(_('/foo/src/index.js'), [
          'some content',
          '//# sourceMappingURL=bad.js.map',
          'some more content',
          '//# sourceMappingURL=external.js.map',
        ].join('\n'));
        if (sourceFile === null) {
          return fail('Expected source file to be defined');
        }
        if (sourceFile.rawMap === null) {
          return fail('Expected source map to be defined');
        }
        expect(sourceFile.rawMap.map).toEqual(sourceMap);
      });

      for (const eolMarker of ['\n', '\r\n']) {
        it(`should only read source-map comments from the last non-blank line of a file [EOL marker: ${
               eolMarker === '\n' ? '\\n' : '\\r\\n'}]`,
           () => {
             fs.ensureDir(_('/foo/src'));
             const sourceMap = createRawSourceMap({file: 'index.js'});
             fs.writeFile(_('/foo/src/external.js.map'), JSON.stringify(sourceMap));
             const sourceFile = registry.loadSourceFile(_('/foo/src/index.js'), [
               'some content',
               '//# sourceMappingURL=bad.js.map',
               'some more content',
               '//# sourceMappingURL=external.js.map',
               '',
               '',
             ].join(eolMarker));
             if (sourceFile === null) {
               return fail('Expected source file to be defined');
             }
             if (sourceFile.rawMap === null) {
               return fail('Expected source map to be defined');
             }
             expect(sourceFile.rawMap.map).toEqual(sourceMap);
           });
      }

      it('should handle a missing external source map', () => {
        fs.ensureDir(_('/foo/src'));
        const sourceFile = registry.loadSourceFile(
            _('/foo/src/index.js'), 'some inline content\n//# sourceMappingURL=external.js.map');
        if (sourceFile === null) {
          return fail('Expected source file to be defined');
        }
        expect(sourceFile.rawMap).toBe(null);
      });

      it('should load a file with an inline encoded source map', () => {
        const sourceMap = createRawSourceMap({file: 'index.js'});
        const encodedSourceMap = Buffer.from(JSON.stringify(sourceMap)).toString('base64');
        const sourceFile = registry.loadSourceFile(
            _('/foo/src/index.js'),
            `some inline content\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${
                encodedSourceMap}`);
        if (sourceFile === null) {
          return fail('Expected source file to be defined');
        }
        if (sourceFile.rawMap === null) {
          return fail('Expected source map to be defined');
        }
        expect(sourceFile.rawMap.map).toEqual(sourceMap);
      });

      it('should load a file with an implied source map', () => {
        const sourceMap = createRawSourceMap({file: 'index.js'});
        fs.ensureDir(_('/foo/src'));
        fs.writeFile(_('/foo/src/index.js.map'), JSON.stringify(sourceMap));
        const sourceFile = registry.loadSourceFile(_('/foo/src/index.js'), 'some inline content');
        if (sourceFile === null) {
          return fail('Expected source file to be defined');
        }
        if (sourceFile.rawMap === null) {
          return fail('Expected source map to be defined');
        }
        expect(sourceFile.rawMap.map).toEqual(sourceMap);
      });

      it('should handle missing implied source-map file', () => {
        fs.ensureDir(_('/foo/src'));
        const sourceFile = registry.loadSourceFile(_('/foo/src/index.js'), 'some inline content');
        if (sourceFile === null) {
          return fail('Expected source file to be defined');
        }
        expect(sourceFile.rawMap).toBe(null);
      });

      it('should recurse into external original source files that are referenced from source maps',
         () => {
           // Setup a scenario where the generated files reference previous files:
           //
           // index.js
           //  -> x.js
           //  -> y.js
           //       -> a.js
           //  -> z.js (inline content)
           fs.ensureDir(_('/foo/src'));

           const indexSourceMap = createRawSourceMap({
             file: 'index.js',
             sources: ['x.js', 'y.js', 'z.js'],
             'sourcesContent': [null, null, 'z content']
           });
           fs.writeFile(_('/foo/src/index.js.map'), JSON.stringify(indexSourceMap));

           fs.writeFile(_('/foo/src/x.js'), 'x content');

           const ySourceMap = createRawSourceMap({file: 'y.js', sources: ['a.js']});
           fs.writeFile(_('/foo/src/y.js'), 'y content');
           fs.writeFile(_('/foo/src/y.js.map'), JSON.stringify(ySourceMap));
           fs.writeFile(_('/foo/src/z.js'), 'z content');
           fs.writeFile(_('/foo/src/a.js'), 'a content');

           const sourceFile = registry.loadSourceFile(_('/foo/src/index.js'), 'index content');
           if (sourceFile === null) {
             return fail('Expected source file to be defined');
           }

           expect(sourceFile.contents).toEqual('index content');
           expect(sourceFile.sourcePath).toEqual(_('/foo/src/index.js'));
           if (sourceFile.rawMap === null) {
             return fail('Expected source map to be defined');
           }
           expect(sourceFile.rawMap.map).toEqual(indexSourceMap);

           expect(sourceFile.sources.length).toEqual(3);

           expect(sourceFile.sources[0]!.contents).toEqual('x content');
           expect(sourceFile.sources[0]!.sourcePath).toEqual(_('/foo/src/x.js'));
           expect(sourceFile.sources[0]!.rawMap).toBe(null);
           expect(sourceFile.sources[0]!.sources).toEqual([]);


           expect(sourceFile.sources[1]!.contents).toEqual('y content');
           expect(sourceFile.sources[1]!.sourcePath).toEqual(_('/foo/src/y.js'));
           expect(sourceFile.sources[1]!.rawMap!.map).toEqual(ySourceMap);

           expect(sourceFile.sources[1]!.sources.length).toEqual(1);
           expect(sourceFile.sources[1]!.sources[0]!.contents).toEqual('a content');
           expect(sourceFile.sources[1]!.sources[0]!.sourcePath).toEqual(_('/foo/src/a.js'));
           expect(sourceFile.sources[1]!.sources[0]!.rawMap).toBe(null);
           expect(sourceFile.sources[1]!.sources[0]!.sources).toEqual([]);

           expect(sourceFile.sources[2]!.contents).toEqual('z content');
           expect(sourceFile.sources[2]!.sourcePath).toEqual(_('/foo/src/z.js'));
           expect(sourceFile.sources[2]!.rawMap).toBe(null);
           expect(sourceFile.sources[2]!.sources).toEqual([]);
         });

      it('should handle a missing source file referenced from a source-map', () => {
        fs.ensureDir(_('/foo/src'));

        const indexSourceMap =
            createRawSourceMap({file: 'index.js', sources: ['x.js'], 'sourcesContent': [null]});
        fs.writeFile(_('/foo/src/index.js.map'), JSON.stringify(indexSourceMap));

        const sourceFile = registry.loadSourceFile(_('/foo/src/index.js'), 'index content');
        if (sourceFile === null) {
          return fail('Expected source file to be defined');
        }

        expect(sourceFile.contents).toEqual('index content');
        expect(sourceFile.sourcePath).toEqual(_('/foo/src/index.js'));
        if (sourceFile.rawMap === null) {
          return fail('Expected source map to be defined');
        }
        expect(sourceFile.rawMap.map).toEqual(indexSourceMap);
        expect(sourceFile.sources.length).toEqual(1);
        expect(sourceFile.sources[0]).toBe(null);
      });
    });

    it('should log a warning if there is a cyclic dependency in source files loaded from disk',
       () => {
         // a.js -> a.js.map -> b.js -> b.js.map -> c.js -> c.js.map -> (external) a.js
         //                                                             ^^^^^^^^^^^^^^^
         // c.js.map incorrectly links to a.js, creating a cycle

         fs.ensureDir(_('/foo/src'));

         const aMap = createRawSourceMap({file: 'a.js', sources: ['b.js']});

         const aPath = _('/foo/src/a.js');
         fs.writeFile(aPath, 'a content\n' + mapHelpers.fromObject(aMap).toComment());

         const bPath = _('/foo/src/b.js');
         fs.writeFile(
             bPath,
             'b content\n' +
                 mapHelpers.fromObject(createRawSourceMap({file: 'b.js', sources: ['c.js']}))
                     .toComment());

         const cPath = _('/foo/src/c.js');
         fs.writeFile(
             cPath,
             'c content\n' +
                 mapHelpers.fromObject(createRawSourceMap({file: 'c.js', sources: ['a.js']}))
                     .toComment());

         const sourceFile = registry.loadSourceFile(aPath)!;
         expect(sourceFile).not.toBe(null!);
         expect(sourceFile.contents).toEqual('a content\n');
         expect(sourceFile.sourcePath).toEqual(_('/foo/src/a.js'));
         if (sourceFile.rawMap === null) {
           return fail('Expected source map to be defined');
         }
         expect(sourceFile.rawMap.map).toEqual(aMap);
         expect(sourceFile.sources.length).toEqual(1);

         expect(logger.logs.warn[0][0])
             .toContain(
                 `Circular source file mapping dependency: ` +
                 `${aPath} -> ${bPath} -> ${cPath} -> ${aPath}`);
       });

    it('should log a warning if there is a cyclic dependency in source maps loaded from disk',
       () => {
         // a.js -> a.js.map -> b.js -> a.js.map -> c.js
         //                             ^^^^^^^^
         // b.js incorrectly links to a.js.map, creating a cycle

         fs.ensureDir(_('/foo/src'));
         const aPath = _('/foo/src/a.js');
         fs.writeFile(aPath, 'a.js content\n//# sourceMappingURL=a.js.map');

         const aMap = createRawSourceMap({file: 'a.js', sources: ['b.js']});
         const aMapPath = _('/foo/src/a.js.map');
         fs.writeFile(aMapPath, JSON.stringify(aMap));

         const bPath = _('/foo/src/b.js');
         fs.writeFile(bPath, 'b.js content\n//# sourceMappingURL=a.js.map');

         const sourceFile = registry.loadSourceFile(aPath);
         if (sourceFile === null) {
           return fail('Expected source file to be defined');
         }
         expect(sourceFile.contents).toEqual('a.js content\n');
         expect(sourceFile.sourcePath).toEqual(_('/foo/src/a.js'));
         if (sourceFile.rawMap === null) {
           return fail('Expected source map to be defined');
         }
         expect(sourceFile.rawMap.map).toEqual(aMap);
         expect(sourceFile.sources.length).toEqual(1);

         expect(logger.logs.warn[0][0])
             .toContain(
                 `Circular source file mapping dependency: ` +
                 `${aPath} -> ${aMapPath} -> ${bPath} -> ${aMapPath}`);
         const innerSourceFile = sourceFile.sources[0];
         if (innerSourceFile === null) {
           return fail('Expected source file to be defined');
         }
         expect(innerSourceFile.contents).toEqual('b.js content\n');
         expect(innerSourceFile.sourcePath).toEqual(_('/foo/src/b.js'));
         // The source-map from b.js was not loaded as it would have caused a cycle
         expect(innerSourceFile.rawMap).toBe(null);
         expect(innerSourceFile.sources.length).toEqual(0);
       });

    it('should not fail if the filename of an inline source looks like a cyclic dependency', () => {
      // a.js -> (inline) a.js.map -> (inline) a.js
      //                              ^^^^^^^^^^^^^
      // a.js loads despite same name as previous file because it is inline

      fs.ensureDir(_('/foo/src'));
      const aPath = _('/foo/src/a.js');
      const aMap = createRawSourceMap(
          {file: 'a.js', sources: ['a.js'], sourcesContent: ['inline original a.js content']});
      fs.writeFile(aPath, 'a content\n' + mapHelpers.fromObject(aMap).toComment());

      const sourceFile = registry.loadSourceFile(aPath);
      if (sourceFile === null) {
        return fail('Expected source file to be defined');
      }
      expect(sourceFile.sources.length).toEqual(1);
      expect(sourceFile.sources[0]!.contents).toEqual('inline original a.js content');
      expect(sourceFile.sources[0]!.sourcePath).toEqual(aPath);
      expect(sourceFile.sources[0]!.rawMap).toBe(null);
      expect(sourceFile.sources[0]!.sources).toEqual([]);

      expect(logger.logs.warn.length).toEqual(0);
    });

    it('should not load source-maps (after the initial map) from disk if the source file was inline',
       () => {
         // a.js -> (initial) a.js.map -> b.js -> b.js.map -> (inline) c.js -> c.js.map
         //                                                                    ^^^^^^^^
         // c.js.map is not loaded because the referencing source file (c.js) was inline

         fs.ensureDir(_('/foo/src'));

         const aPath = _('/foo/src/a.js');
         fs.writeFile(aPath, 'a.js content\n//# sourceMappingURL=a.js.map');
         const aMapPath = _('/foo/src/a.js.map');
         const aMap = createRawSourceMap({file: 'a.js', sources: ['b.js']});
         fs.writeFile(aMapPath, JSON.stringify(aMap));

         const bPath = _('/foo/src/b.js');
         fs.writeFile(bPath, 'b.js content\n//# sourceMappingURL=b.js.map');
         const bMapPath = _('/foo/src/b.js.map');
         const bMap = createRawSourceMap({
           file: 'b.js',
           sources: ['c.js'],
           sourcesContent: ['c content\n//# sourceMappingURL=c.js.map']
         });
         fs.writeFile(bMapPath, JSON.stringify(bMap));

         const cMapPath = _('/foo/src/c.js.map');
         const cMap = createRawSourceMap({file: 'c.js', sources: ['d.js']});
         fs.writeFile(cMapPath, JSON.stringify(cMap));

         const sourceFile = registry.loadSourceFile(aPath);
         if (sourceFile === null) {
           return fail('Expected source file to be defined');
         }
         const bSource = sourceFile.sources[0];
         if (!bSource) {
           return fail('Expected source file to be defined');
         }
         const cSource = bSource.sources[0];
         if (!cSource) {
           return fail('Expected source file to be defined');
         }
         // External c.js.map never gets loaded because c.js was inline source
         expect(cSource.rawMap).toBe(null);
         expect(cSource.sources).toEqual([]);

         expect(logger.logs.warn.length).toEqual(0);
       });

    for (const {scheme, mappedPath} of
             [{scheme: 'WEBPACK://', mappedPath: '/foo/src/index.ts'},
              {scheme: 'webpack://', mappedPath: '/foo/src/index.ts'},
              {scheme: 'missing://', mappedPath: '/src/index.ts'},
    ]) {
      it(`should handle source paths that are protocol mapped [scheme:"${scheme}"]`, () => {
        fs.ensureDir(_('/foo/src'));

        const indexSourceMap = createRawSourceMap({
          file: 'index.js',
          sources: [`${scheme}/src/index.ts`],
          'sourcesContent': ['original content']
        });
        fs.writeFile(_('/foo/src/index.js.map'), JSON.stringify(indexSourceMap));
        const sourceFile = registry.loadSourceFile(_('/foo/src/index.js'), 'generated content');
        if (sourceFile === null) {
          return fail('Expected source file to be defined');
        }
        const originalSource = sourceFile.sources[0];
        if (originalSource === null) {
          return fail('Expected source file to be defined');
        }
        expect(originalSource.contents).toEqual('original content');
        expect(originalSource.sourcePath).toEqual(_(mappedPath));
        expect(originalSource.rawMap).toBe(null);
        expect(originalSource.sources).toEqual([]);
      });

      it(`should handle source roots that are protocol mapped [scheme:"${scheme}"]`, () => {
        fs.ensureDir(_('/foo/src'));

        const indexSourceMap = createRawSourceMap({
          file: 'index.js',
          sources: ['index.ts'],
          'sourcesContent': ['original content'],
          sourceRoot: `${scheme}/src`,
        });
        fs.writeFile(_('/foo/src/index.js.map'), JSON.stringify(indexSourceMap));
        const sourceFile = registry.loadSourceFile(_('/foo/src/index.js'), 'generated content');
        if (sourceFile === null) {
          return fail('Expected source file to be defined');
        }
        const originalSource = sourceFile.sources[0];
        if (originalSource === null) {
          return fail('Expected source file to be defined');
        }
        expect(originalSource.contents).toEqual('original content');
        expect(originalSource.sourcePath).toEqual(_(mappedPath));
        expect(originalSource.rawMap).toBe(null);
        expect(originalSource.sources).toEqual([]);
      });
    }
  });
});


function createRawSourceMap(custom: Partial<RawSourceMap>): RawSourceMap {
  return {
    'version': 3,
    'sourceRoot': '',
    'sources': [],
    'sourcesContent': [],
    'names': [],
    'mappings': '',
    ...custom
  };
}
