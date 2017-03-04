import {NgModule, ModuleWithProviders} from '@angular/core';
import {MdLineModule, CompatibilityModule} from '../core';
import {
  MdGridTile, MdGridTileText, MdGridTileFooterCssMatStyler,
  MdGridTileHeaderCssMatStyler, MdGridAvatarCssMatStyler
} from './grid-tile';
import {MdGridList} from './grid-list';


@NgModule({
  imports: [MdLineModule, CompatibilityModule],
  exports: [
    MdGridList,
    MdGridTile,
    MdGridTileText,
    MdLineModule,
    CompatibilityModule,
    MdGridTileHeaderCssMatStyler,
    MdGridTileFooterCssMatStyler,
    MdGridAvatarCssMatStyler
  ],
  declarations: [
    MdGridList,
    MdGridTile,
    MdGridTileText,
    MdGridTileHeaderCssMatStyler,
    MdGridTileFooterCssMatStyler,
    MdGridAvatarCssMatStyler
  ],
})
export class MdGridListModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdGridListModule,
      providers: []
    };
  }
}


export * from './grid-list';
