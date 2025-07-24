import {FormsModule} from '@angular/forms';

import {HighlightDirective} from './highlight.directive';
import {TitleCasePipe} from './title-case.pipe';

export const sharedImports = [FormsModule, HighlightDirective, TitleCasePipe];
