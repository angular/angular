import {NgModule, ModuleWithProviders} from '@angular/core';
import {CompatibilityModule} from '../core';
import {
  MdCard,
  MdCardHeader,
  MdCardTitleGroup,
  MdCardContent,
  MdCardTitle,
  MdCardSubtitle,
  MdCardActions,
  MdCardFooter,
  MdCardSmImage,
  MdCardMdImage,
  MdCardLgImage,
  MdCardImage,
  MdCardXlImage,
  MdCardAvatar,
} from './card';


@NgModule({
  imports: [CompatibilityModule],
  exports: [
    MdCard,
    MdCardHeader,
    MdCardTitleGroup,
    MdCardContent,
    MdCardTitle,
    MdCardSubtitle,
    MdCardActions,
    MdCardFooter,
    MdCardSmImage,
    MdCardMdImage,
    MdCardLgImage,
    MdCardImage,
    MdCardXlImage,
    MdCardAvatar,
    CompatibilityModule,
  ],
  declarations: [
    MdCard, MdCardHeader, MdCardTitleGroup, MdCardContent, MdCardTitle, MdCardSubtitle,
    MdCardActions, MdCardFooter, MdCardSmImage, MdCardMdImage, MdCardLgImage, MdCardImage,
    MdCardXlImage, MdCardAvatar,
  ],
})
export class MdCardModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdCardModule,
      providers: []
    };
  }
}


export * from './card';
