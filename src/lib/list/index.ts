import {NgModule, ModuleWithProviders} from '@angular/core';
import {MdLineModule, CompatibilityModule} from '../core';
import {
  MdList,
  MdListItem,
  MdListDivider,
  MdListAvatarCssMatStyler,
  MdListIconCssMatStyler,
  MdListCssMatStyler,
  MdNavListCssMatStyler,
  MdDividerCssMatStyler,
  MdListSubheaderCssMatStyler,
} from './list';


@NgModule({
  imports: [MdLineModule, CompatibilityModule],
  exports: [
    MdList,
    MdListItem,
    MdListDivider,
    MdListAvatarCssMatStyler,
    MdLineModule,
    CompatibilityModule,
    MdListIconCssMatStyler,
    MdListCssMatStyler,
    MdNavListCssMatStyler,
    MdDividerCssMatStyler,
    MdListSubheaderCssMatStyler
  ],
  declarations: [
    MdList,
    MdListItem,
    MdListDivider,
    MdListAvatarCssMatStyler,
    MdListIconCssMatStyler,
    MdListCssMatStyler,
    MdNavListCssMatStyler,
    MdDividerCssMatStyler,
    MdListSubheaderCssMatStyler
  ],
})
export class MdListModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdListModule,
      providers: []
    };
  }
}


export * from './list';
