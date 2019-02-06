import * as fs from 'fs';

describe('ngtsc plugin', () => {
  it('should include Angular emit in .d.ts', () => {
    const actualDts = 'angular/packages/compiler-cli/test/ngtsc/tsc_plugin/example_app.d.ts';
    const actual = fs.readFileSync(require.resolve(actualDts), {encoding: 'utf-8'});
    expect(actual).toContain('export declare class NEWNAME');
  });
});
