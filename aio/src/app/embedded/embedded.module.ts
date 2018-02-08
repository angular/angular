import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContributorService } from './contributor/contributor.service';
import { CopierService } from 'app/shared/copier.service';
import { PrettyPrinter } from './code/pretty-printer.service';
import { WithEmbeddedComponents } from 'app/embed-components/embed-components.service';

// Any components that we want to use inside embedded components must be declared or imported here
// It is not enough just to import them inside the AppModule

// Reusable components (used inside embedded components)
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { CodeComponent } from './code/code.component';
import { SharedModule } from 'app/shared/shared.module';

// Embedded Components
import { ApiListComponent } from './api/api-list.component';
import { ApiService } from './api/api.service';
import { CodeExampleComponent } from './code/code-example.component';
import { CodeTabsComponent } from './code/code-tabs.component';
import { ContributorListComponent } from './contributor/contributor-list.component';
import { ContributorComponent } from './contributor/contributor.component';
import { CurrentLocationComponent } from './current-location.component';
import { FileNotFoundSearchComponent } from './search/file-not-found-search.component';
import { LiveExampleComponent, EmbeddedStackblitzComponent } from './live-example/live-example.component';
import { ResourceListComponent } from './resource/resource-list.component';
import { ResourceService } from './resource/resource.service';

/**
 * Components that can be embedded in docs,
 * such as CodeExampleComponent, LiveExampleComponent,...
 */
export const embeddedComponents: Type<any>[] = [
  ApiListComponent, CodeExampleComponent, CodeTabsComponent, ContributorListComponent,
  CurrentLocationComponent, FileNotFoundSearchComponent, LiveExampleComponent, ResourceListComponent
];

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
    SharedModule
  ],
  declarations: [
    embeddedComponents,
    CodeComponent,
    ContributorComponent,
    EmbeddedStackblitzComponent
  ],
  providers: [
    ApiService,
    ContributorService,
    CopierService,
    PrettyPrinter,
    ResourceService
  ],
  entryComponents: [ embeddedComponents ]
})
export class EmbeddedModule implements WithEmbeddedComponents {
  embeddedComponents = embeddedComponents;
}
