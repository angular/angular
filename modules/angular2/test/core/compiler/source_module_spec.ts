import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
  TestComponentBuilder
} from 'angular2/test_lib';

import {SourceModule, moduleRef} from 'angular2/src/core/compiler/source_module';

export function main() {
  describe('SourceModule', () => {
    describe('getSourceWithImports', () => {
      it('should generate named imports for modules', () => {
        var sourceWithImports =
            new SourceModule('package:some/moda', `${moduleRef('package:some/modb')}A`)
                .getSourceWithImports();
        expect(sourceWithImports.source).toEqual('import0.A');
        expect(sourceWithImports.imports).toEqual([['package:some/modb', 'import0']]);
      });

      it('should dedupe imports', () => {
        var sourceWithImports =
            new SourceModule(
                'package:some/moda',
                `${moduleRef('package:some/modb')}A + ${moduleRef('package:some/modb')}B`)
                .getSourceWithImports();
        expect(sourceWithImports.source).toEqual('import0.A + import0.B');
        expect(sourceWithImports.imports).toEqual([['package:some/modb', 'import0']]);
      });

      it('should not use an import for the moduleUrl of the SourceModule', () => {
        var sourceWithImports =
            new SourceModule('package:some/moda', `${moduleRef('package:some/moda')}A`)
                .getSourceWithImports();
        expect(sourceWithImports.source).toEqual('A');
        expect(sourceWithImports.imports).toEqual([]);
      });
    });
  });
}
