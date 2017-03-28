import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrettyPrinter } from './code/pretty-printer.service';
import { CopierService } from 'app/shared/copier.service';


// Any components that we want to use inside embedded components must be declared or imported here
// It is not enough just to import them inside the AppModule

// Reusable components (used inside embedded components)
import { MdTabsModule } from '@angular/material';
import { CodeComponent } from './code/code.component';

// Embedded Components
import { ApiListComponent } from './api/api-list.component';
import { CodeExampleComponent } from './code/code-example.component';
import { CodeTabsComponent } from './code/code-tabs.component';
import { DocTitleComponent } from './doc-title.component';
import { LiveExampleComponent, EmbeddedPlunkerComponent } from './live-example/live-example.component';

/** Components that can be embedded in docs
 * such as CodeExampleComponent, LiveExampleComponent,...
 */
export const embeddedComponents: any[] = [
  ApiListComponent, CodeExampleComponent, DocTitleComponent, CodeTabsComponent, LiveExampleComponent
];

/** Injectable class w/ property returning components that can be embedded in docs */
export class EmbeddedComponents {
  components = embeddedComponents;
}

@NgModule({
  imports: [ CommonModule, MdTabsModule ],
  declarations: [
    embeddedComponents,
    CodeComponent,
    EmbeddedPlunkerComponent
  ],
  providers: [
    EmbeddedComponents,
    PrettyPrinter,
    CopierService
  ],
  entryComponents: [ embeddedComponents ]
})
export class EmbeddedModule { }
