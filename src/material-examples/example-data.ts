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
    if (!example || !EXAMPLE_COMPONENTS.hasOwnProperty(example)) {
      return;
    }

    const exampleConfig = EXAMPLE_COMPONENTS[example];
    const exampleFilesSet = new Set(['html', 'ts', 'css'].map(extension => {
      return `${example}-example.${extension}`;
    }));

    // TODO(tinayuangao): Do not hard-code extensions
    this.exampleFiles = ['html', 'ts', 'css'].map(extension => `${example}-example.${extension}`);
    this.examplePath = `/assets/stackblitz/examples/${example}/`;
    this.exampleFiles = Array.from(exampleFilesSet.values());
    this.selectorName = this.indexFilename = `${example}-example`;

    if (exampleConfig.additionalFiles) {
      for (let file of exampleConfig.additionalFiles) {
        exampleFilesSet.add(file);
      }
    }

    const exampleName = example.replace(/(?:^\w|\b\w)/g, letter => letter.toUpperCase());

    this.description = exampleConfig.title || exampleName.replace(/[\-]+/g, ' ') + ' Example';
    this.componentName = exampleConfig.selectorName ||
                          exampleName.replace(/[\-]+/g, '') + 'Example';
  }
}
