import {NgModule, ModuleWithProviders} from '@angular/core';
import {MdCommonModule} from '../core';
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
  imports: [MdCommonModule],
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
    MdCommonModule,
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
