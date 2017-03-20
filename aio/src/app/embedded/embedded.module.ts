import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiListComponent } from './api/api-list.component';
import { CodeExampleComponent } from './code-example.component';
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
    embeddedComponents
  ],
  providers: [ EmbeddedComponents ],
  entryComponents: [ embeddedComponents ]
})
export class EmbeddedModule { }
