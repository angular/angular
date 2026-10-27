# /out/app.ts
```ts
import { Injectable } from '@angular/core';
import {
  Direct,
  ImportedAsType,
  ExportedAsType,
  InlineExportedAsType,
  ReexportedAsType,
  DeclaredAsType,
  RenamedType,
  Renamed,
} from './barrel';
import * as barrel from './barrel';
import { ForwardedAsType, ForwardedDirect } from './forward';
import { PkgAsType, PkgValue } from 'pkg';
// @ts-ignore
import * as i0 from '@angular/core';
// @ts-ignore
import * as i1 from './barrel';
// @ts-ignore
import * as i2 from './forward';
// @ts-ignore
import * as i3 from 'pkg';

export class BarrelService {
  constructor(
    private readonly importedAsType: ImportedAsType,
    private readonly direct: Direct,
    private readonly exportedAsType: ExportedAsType,
    private readonly renamed: Renamed,
    private readonly inlineExportedAsType: InlineExportedAsType,
    private readonly reexportedAsType: ReexportedAsType,
    private readonly declaredAsType: DeclaredAsType,
    private readonly renamedType: RenamedType,
    private readonly forwardedAsType: ForwardedAsType,
    private readonly forwardedDirect: ForwardedDirect,
    private readonly qualifiedAsType: barrel.ExportedAsType,
    private readonly qualifiedDirect: barrel.Direct,
    private readonly pkgAsType: PkgAsType,
    private readonly pkgValue: PkgValue,
  ) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BarrelService, never> = function BarrelService_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || BarrelService)(
      i0.ɵɵinject(i1.ImportedAsType),
      i0.ɵɵinject(i1.Direct),
      i0.ɵɵinject(i1.ExportedAsType),
      i0.ɵɵinject(i1.Renamed),
      i0.ɵɵinject(i1.InlineExportedAsType),
      i0.ɵɵinject(i1.ReexportedAsType),
      i0.ɵɵinject(i1.DeclaredAsType),
      i0.ɵɵinject(i1.RenamedType),
      i0.ɵɵinject(i2.ForwardedAsType),
      i0.ɵɵinject(i2.ForwardedDirect),
      i0.ɵɵinject(barrel.ExportedAsType),
      i0.ɵɵinject(barrel.Direct),
      i0.ɵɵinject(i3.PkgAsType),
      i0.ɵɵinject(i3.PkgValue),
    );
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjectable({
      token: BarrelService,
      factory: BarrelService.ɵfac,
      providedIn: 'root',
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BarrelService,
        [{ type: Injectable, args: [{ providedIn: 'root' }] }],
        (): any => [
          {
            /* @ts-ignore */
            type: i1.ImportedAsType,
          },
          { type: i1.Direct },
          {
            /* @ts-ignore */
            type: i1.ExportedAsType,
          },
          { type: i1.Renamed },
          {
            /* @ts-ignore */
            type: i1.InlineExportedAsType,
          },
          {
            /* @ts-ignore */
            type: i1.ReexportedAsType,
          },
          {
            /* @ts-ignore */
            type: i1.DeclaredAsType,
          },
          {
            /* @ts-ignore */
            type: i1.RenamedType,
          },
          {
            /* @ts-ignore */
            type: i2.ForwardedAsType,
          },
          { type: i2.ForwardedDirect },
          {
            /* @ts-ignore */
            type: barrel.ExportedAsType,
          },
          { type: barrel.Direct },
          {
            /* @ts-ignore */
            type: i3.PkgAsType,
          },
          { type: i3.PkgValue },
        ],
        null,
      );
  }
}

```