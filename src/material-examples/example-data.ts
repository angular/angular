import {EXAMPLE_COMPONENTS} from './example-module';


/**
 * Example data
 *   with information about Component name, selector, files used in example, and path to examples
 */
export class ExampleData {
  // TODO: figure out how do we get these variables.
  description = 'Some description for material';
  // TODO: use real example and delete the example/ folder.
  examplePath = '/assets/example/';
  exampleFiles = ['button-demo.html', 'button-demo.scss', 'button-demo.ts'];

  // TODO: extract these variables from example code.
  selectorName = 'button-demo';
  indexFilename = 'button-demo';
  componentName = 'ButtonDemo';

  constructor(example: string) {
    if (example && EXAMPLE_COMPONENTS[example]) {
      this.examplePath = `/assets/plunker/examples/${example}/`;
      // TODO(tinayuangao): Do not hard-code extensions
      this.exampleFiles = ['html', 'ts', 'css']
        .map((extension) => `${example}-example.${extension}`);
      if (EXAMPLE_COMPONENTS[example].additionalFiles) {
        this.exampleFiles = this.exampleFiles.concat(EXAMPLE_COMPONENTS[example].additionalFiles);
      }
      this.selectorName = this.indexFilename = `${example}-example`;

      let exampleName = example.replace(/(?:^\w|\b\w)/g, letter => letter.toUpperCase());

      if (EXAMPLE_COMPONENTS[example].title) {
        this.description = EXAMPLE_COMPONENTS[example].title;
      } else {
        this.description = exampleName.replace(/[\-]+/g, ' ') + ' Example';
      }

      if (EXAMPLE_COMPONENTS[example].selectorName) {
        this.componentName = EXAMPLE_COMPONENTS[example].selectorName;
      } else {
        this.componentName = exampleName.replace(/[\-]+/g, '') + 'Example';
      }
    }
  }
}
