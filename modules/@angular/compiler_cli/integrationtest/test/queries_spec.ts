import * as fs from 'fs';
import * as path from 'path';
import {CompWithQueryNgFactory} from '../src/queries.ngfactory';
import {CompWithQuery, CompWithQueryChild} from '../src/queries';
import {ReflectiveInjector, DebugElement, getDebugNode} from '@angular/core';
import {browserPlatform, BROWSER_APP_PROVIDERS} from '@angular/platform-browser';

describe("view query codegen output", () => {
  const outDir = path.join('dist', 'all', '@angular', 'compiler_cli', 'integrationtest', 'src');

  it("should be able to create the basic component", () => {
    const appInjector = ReflectiveInjector.resolveAndCreate(BROWSER_APP_PROVIDERS,
      browserPlatform().injector);
    var comp = CompWithQueryNgFactory.create(appInjector);
    comp.changeDetectorRef.detectChanges();
    expect(comp.instance.ref).toBeTruthy();
    expect(comp.instance.ref.constructor).toBe(CompWithQueryChild);
  });
});
