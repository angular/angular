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
  MatLegacyCard,
  MatLegacyCardActions,
  MatLegacyCardAvatar,
  MatLegacyCardContent,
  MatLegacyCardFooter,
  MatLegacyCardHeader,
  MatLegacyCardImage,
  MatLegacyCardLgImage,
  MatLegacyCardMdImage,
  MatLegacyCardSmImage,
  MatLegacyCardSubtitle,
  MatLegacyCardTitle,
  MatLegacyCardTitleGroup,
  MatLegacyCardXlImage,
} from './card';

@NgModule({
  imports: [MatCommonModule],
  exports: [
    MatLegacyCard,
    MatLegacyCardHeader,
    MatLegacyCardTitleGroup,
    MatLegacyCardContent,
    MatLegacyCardTitle,
    MatLegacyCardSubtitle,
    MatLegacyCardActions,
    MatLegacyCardFooter,
    MatLegacyCardSmImage,
    MatLegacyCardMdImage,
    MatLegacyCardLgImage,
    MatLegacyCardImage,
    MatLegacyCardXlImage,
    MatLegacyCardAvatar,
    MatCommonModule,
  ],
  declarations: [
    MatLegacyCard,
    MatLegacyCardHeader,
    MatLegacyCardTitleGroup,
    MatLegacyCardContent,
    MatLegacyCardTitle,
    MatLegacyCardSubtitle,
    MatLegacyCardActions,
    MatLegacyCardFooter,
    MatLegacyCardSmImage,
    MatLegacyCardMdImage,
    MatLegacyCardLgImage,
    MatLegacyCardImage,
    MatLegacyCardXlImage,
    MatLegacyCardAvatar,
  ],
})
export class MatLegacyCardModule {}
