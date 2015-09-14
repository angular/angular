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

import {SourceModule, moduleRef} from 'angular2/src/compiler/source_module';

export function main() {
  describe('SourceModule', () => {
    describe('getSourceWithImports', () => {
      it('should generate named imports for modules', () => {
        var sourceWithImports =
            new SourceModule('some/moda', `${moduleRef('some/modb')}A`).getSourceWithImports();
        expect(sourceWithImports.source).toEqual('import0.A');
        expect(sourceWithImports.imports).toEqual([['some/modb', 'import0']]);
      });

      it('should dedupe imports', () => {
        var sourceWithImports =
            new SourceModule('some/moda', `${moduleRef('some/modb')}A + ${moduleRef('some/modb')}B`)
                .getSourceWithImports();
        expect(sourceWithImports.source).toEqual('import0.A + import0.B');
        expect(sourceWithImports.imports).toEqual([['some/modb', 'import0']]);
      });

      it('should not use an import for the moduleId of the SourceModule', () => {
        var sourceWithImports =
            new SourceModule('some/moda', `${moduleRef('some/moda')}A`).getSourceWithImports();
        expect(sourceWithImports.source).toEqual('A');
        expect(sourceWithImports.imports).toEqual([]);
      });
    });
  });
}
