/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
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
export class MdCardModule {}


export * from './card';
