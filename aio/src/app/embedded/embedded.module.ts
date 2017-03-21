import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrettyPrinter } from './code/pretty-printer.service';
import { CopierService } from 'app/shared/copier.service';
import { ApiListComponent } from './api/api-list.component';
import { CodeComponent } from './code/code.component';
import { CodeExampleComponent } from './code/code-example.component';
import { DocTitleComponent } from './doc-title.component';

/** Components that can be embedded in docs
 * such as CodeExampleComponent, LiveExampleComponent,...
 */
export const embeddedComponents: any[] = [
  ApiListComponent, CodeExampleComponent, DocTitleComponent
];

/** Injectable class w/ property returning components that can be embedded in docs */
export class EmbeddedComponents {
  components = embeddedComponents;
}

@NgModule({
  imports: [ CommonModule ],
  declarations: [
    embeddedComponents,
    CodeComponent
  ],
  providers: [
    EmbeddedComponents,
    PrettyPrinter,
    CopierService
  ],
  entryComponents: [ embeddedComponents ]
})
export class EmbeddedModule { }
