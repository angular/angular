/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCommonModule} from '@angular/material/core';
import {
  MatCard,
  MatCardActions,
  MatCardAvatar,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
  MatCardImage,
  MatCardLgImage,
  MatCardMdImage,
  MatCardSmImage,
  MatCardSubtitle,
  MatCardTitle,
  MatCardTitleGroup,
  MatCardXlImage,
} from './card';


const CARD_DIRECTIVES = [
  MatCard,
  MatCardActions,
  MatCardAvatar,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
  MatCardImage,
  MatCardLgImage,
  MatCardMdImage,
  MatCardSmImage,
  MatCardSubtitle,
  MatCardTitle,
  MatCardTitleGroup,
  MatCardXlImage
];

@NgModule({
  imports: [MatCommonModule, CommonModule],
  exports: [CARD_DIRECTIVES, MatCommonModule],
  declarations: CARD_DIRECTIVES,
})
export class MatCardModule {
}
