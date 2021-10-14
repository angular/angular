// The example-module file will be auto-generated. As soon as the
// examples are being compiled, the module file will be generated.
import {EXAMPLE_COMPONENTS} from './example-module';

/**
 * Example data with information about component name, selector, files used in
 * example, and path to examples.
 */
export class ExampleData {
  /** Description of the example. */
  description: string;

  /** List of files that are part of this example. */
  exampleFiles: string[];

  /** Selector name of the example component. */
  selectorName: string;

  /** Name of the file that contains the example component. */
  indexFilename: string;

  /** Names of the components being used in this example. */
  componentNames: string[];

  constructor(example: string) {
    if (!example || !EXAMPLE_COMPONENTS.hasOwnProperty(example)) {
      return;
    }

    const {componentName, files, selector, primaryFile, additionalComponents, title} =
      EXAMPLE_COMPONENTS[example];
    const exampleName = example.replace(/(?:^\w|\b\w)/g, letter => letter.toUpperCase());

    this.exampleFiles = files;
    this.selectorName = selector;
    this.indexFilename = primaryFile;
    this.description = title || exampleName.replace(/[\-]+/g, ' ') + ' Example';
    this.componentNames = [componentName, ...additionalComponents];
  }
}
