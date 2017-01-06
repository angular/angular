/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import './init';
import * as fs from 'fs';
import * as path from 'path';

import {MultipleComponentsMyComp} from '../src/a/multiple_components';
import {BasicComp} from '../src/basic';
import {createComponent} from './util';

describe('template codegen output', () => {
  const outDir = 'src';

  it('should lower Decorators without reflect-metadata', () => {
    const jsOutput = path.join(outDir, 'basic.js');
    expect(fs.existsSync(jsOutput)).toBeTruthy();
    expect(fs.readFileSync(jsOutput, {encoding: 'utf-8'})).not.toContain('Reflect.decorate');
  });

  it('should produce metadata.json outputs', () => {
    const metadataOutput = path.join(outDir, 'basic.metadata.json');
    expect(fs.existsSync(metadataOutput)).toBeTruthy();
    const output = fs.readFileSync(metadataOutput, {encoding: 'utf-8'});
    expect(output).toContain('"decorators":');
    expect(output).toContain('"module":"@angular/core","name":"Component"');
  });

  it('should write .d.ts files', () => {
    const dtsOutput = path.join(outDir, 'basic.d.ts');
    expect(fs.existsSync(dtsOutput)).toBeTruthy();
    expect(fs.readFileSync(dtsOutput, {encoding: 'utf-8'})).toContain('Basic');
  });

  it('should write .ngfactory.ts for .d.ts inputs', () => {
    const factoryOutput =
        path.join('node_modules', '@angular2-material', 'button', 'button.ngfactory.ts');
    expect(fs.existsSync(factoryOutput)).toBeTruthy();
  });

  it('should be able to create the basic component', () => {
    const compFixture = createComponent(BasicComp);
    expect(compFixture.componentInstance).toBeTruthy();
  });

  it('should support ngIf', () => {
    const compFixture = createComponent(BasicComp);
    const debugElement = compFixture.debugElement;
    expect(debugElement.children.length).toBe(3);

    compFixture.componentInstance.ctxBool = true;
    compFixture.detectChanges();
    expect(debugElement.children.length).toBe(4);
    expect(debugElement.children[2].injector.get(MultipleComponentsMyComp)).toBeTruthy();
  });

  it('should support ngFor', () => {
    const compFixture = createComponent(BasicComp);
    const debugElement = compFixture.debugElement;
    expect(debugElement.children.length).toBe(3);

    // test NgFor
    compFixture.componentInstance.ctxArr = [1, 2];
    compFixture.detectChanges();
    expect(debugElement.children.length).toBe(5);
    expect(debugElement.children[2].attributes['value']).toBe('1');
    expect(debugElement.children[3].attributes['value']).toBe('2');
  });

  describe('i18n', () => {
    it('should inject the locale into the component', () => {
      const compFixture = createComponent(BasicComp);
      expect(compFixture.componentInstance.localeId).toEqual('fi');
    });

    it('should inject the translations format into the component', () => {
      const compFixture = createComponent(BasicComp);
      expect(compFixture.componentInstance.translationsFormat).toEqual('xlf');
    });

    it('should support i18n for content tags', () => {
      const containerElement = createComponent(BasicComp).nativeElement;
      const pElement = containerElement.children.find((c: any) => c.name == 'p');
      const pText = pElement.children.map((c: any) => c.data).join('').trim();
      expect(pText).toBe('tervetuloa');
    });
  });
});
