import { FormsModule } from '@angular/forms';

import { HighlightDirective } from './highlight.directive';
import { TitleCasePipe } from './title-case.pipe';
import { NgFor, NgIf } from '@angular/common';

export const sharedImports = [FormsModule, HighlightDirective, TitleCasePipe, NgIf, NgFor];
