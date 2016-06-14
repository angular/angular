import {beforeEach, ddescribe, describe, expect, iit, it} from '@angular/core/testing/testing_internal';
import {AngularCompilerOptions} from '@angular/tsc-wrapped';
import * as ts from 'typescript';

import {GeneratedComponentResolverOutput, buildComponentResolverSource} from '../src/component_resolver';

describe('buildComponentResolverSource', () => {
  var output: GeneratedComponentResolverOutput;

  beforeEach(() => {
    var options = {
      genDir: '.',
      basePath: '.',
      skipMetadataEmit: false,
      skipTemplateCodegen: false,
      trace: false,
      componentResolver: {
        out: './some-file',
        imports: {'./some/app': 'App', './some/3rd-party': ['OtherApp', 'AnotherApp']}
      }
    };

    output = buildComponentResolverSource(<AngularCompilerOptions>options);
  });

  it('should use the provided `out` path as the filename for the compiled content',
     () => { expect(output.filePath).toEqual('./some-file'); });

  it('should export a class that can be used as a component resolver', () => {
    expect(output.content).toMatchPattern(/export\s+class\s+\w+\s+extends\s+ComponentResolver\s+{/);
  });
});
