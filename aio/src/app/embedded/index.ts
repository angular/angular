import { CodeExampleComponent } from './code-example.component';

/** Components that can be embedded in docs such as CodeExampleComponent, LiveExampleComponent,... */
export const embeddedComponents = [
  CodeExampleComponent
];

/** Injectable class w/ property returning components that can be embedded in docs */
export class EmbeddedComponents {
  components = embeddedComponents;
}
