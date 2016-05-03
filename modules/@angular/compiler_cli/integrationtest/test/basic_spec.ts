import * as fs from 'fs';
import * as path from 'path';

describe("template codegen output", () => {
  const outDir = path.join('dist', 'all', '@angular', 'compiler_cli', 'integrationtest', 'src');

  it("should lower Decorators without reflect-metadata", () => {
    const jsOutput = path.join(outDir, 'basic.js');
    expect(fs.existsSync(jsOutput)).toBeTruthy();
    expect(fs.readFileSync(jsOutput, {encoding: 'utf-8'})).not.toContain('Reflect.decorate');
  });

  it("should produce metadata.json outputs", () => {
    const metadataOutput = path.join(outDir, 'basic.metadata.json');
    expect(fs.existsSync(metadataOutput)).toBeTruthy();
    const output = fs.readFileSync(metadataOutput, {encoding: 'utf-8'});
    expect(output).toContain('"decorators":');
    expect(output).toContain('"name":"Component","module":"@angular/core"');
  });

  it("should write .d.ts files", () => {
    const dtsOutput = path.join(outDir, 'basic.d.ts');
    expect(fs.existsSync(dtsOutput)).toBeTruthy();
    expect(fs.readFileSync(dtsOutput, {encoding: 'utf-8'})).toContain('Basic');
  });
});