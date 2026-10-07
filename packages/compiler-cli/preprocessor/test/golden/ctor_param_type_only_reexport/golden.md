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
      i0.ɵɵinject(ImportedAsType),
      i0.ɵɵinject(Direct),
      i0.ɵɵinject(ExportedAsType),
      i0.ɵɵinject(Renamed),
      i0.ɵɵinject(InlineExportedAsType),
      i0.ɵɵinject(ReexportedAsType),
      i0.ɵɵinject(DeclaredAsType),
      i0.ɵɵinject(RenamedType),
      i0.ɵɵinject(ForwardedAsType),
      i0.ɵɵinject(ForwardedDirect),
      i0.ɵɵinject(barrel.ExportedAsType),
      i0.ɵɵinject(barrel.Direct),
      i0.ɵɵinject(PkgAsType),
      i0.ɵɵinject(PkgValue),
    );
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
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
            type: ImportedAsType,
          },
          {
            /* @ts-ignore */
            type: Direct,
          },
          {
            /* @ts-ignore */
            type: ExportedAsType,
          },
          {
            /* @ts-ignore */
            type: Renamed,
          },
          {
            /* @ts-ignore */
            type: InlineExportedAsType,
          },
          {
            /* @ts-ignore */
            type: ReexportedAsType,
          },
          {
            /* @ts-ignore */
            type: DeclaredAsType,
          },
          {
            /* @ts-ignore */
            type: RenamedType,
          },
          {
            /* @ts-ignore */
            type: ForwardedAsType,
          },
          {
            /* @ts-ignore */
            type: ForwardedDirect,
          },
          {
            /* @ts-ignore */
            type: barrel.ExportedAsType,
          },
          {
            /* @ts-ignore */
            type: barrel.Direct,
          },
          {
            /* @ts-ignore */
            type: PkgAsType,
          },
          {
            /* @ts-ignore */
            type: PkgValue,
          },
        ],
        null,
      );
  }
}

```