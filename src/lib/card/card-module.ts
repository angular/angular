/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {
  MatCard,
  MatCardHeader,
  MatCardTitleGroup,
  MatCardContent,
  MatCardTitle,
  MatCardSubtitle,
  MatCardActions,
  MatCardFooter,
  MatCardSmImage,
  MatCardMdImage,
  MatCardLgImage,
  MatCardImage,
  MatCardXlImage,
  MatCardAvatar,
} from './card';


@NgModule({
  imports: [MatCommonModule],
  exports: [
    MatCard,
    MatCardHeader,
    MatCardTitleGroup,
    MatCardContent,
    MatCardTitle,
    MatCardSubtitle,
    MatCardActions,
    MatCardFooter,
    MatCardSmImage,
    MatCardMdImage,
    MatCardLgImage,
    MatCardImage,
    MatCardXlImage,
    MatCardAvatar,
    MatCommonModule,
  ],
  declarations: [
    MatCard, MatCardHeader, MatCardTitleGroup, MatCardContent, MatCardTitle, MatCardSubtitle,
    MatCardActions, MatCardFooter, MatCardSmImage, MatCardMdImage, MatCardLgImage, MatCardImage,
    MatCardXlImage, MatCardAvatar,
  ],
})
export class MatCardModule {}
