import { CodeExampleComponent } from './code-example.component';
import { DocTitleComponent } from './doc-title.component';

/** Components that can be embedded in docs such as CodeExampleComponent, LiveExampleComponent,... */
export const embeddedComponents: any[] = [
  CodeExampleComponent, DocTitleComponent
];

/** Injectable class w/ property returning components that can be embedded in docs */
export class EmbeddedComponents {
  components = embeddedComponents;
}
