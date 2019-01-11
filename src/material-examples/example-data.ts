// The example-module file will be auto-generated. As soon as the
// examples are being compiled, the module file will be generated.
import {EXAMPLE_COMPONENTS} from './example-module';

/**
 * Example data
 *   with information about Component name, selector, files used in example, and path to examples
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

  /**
   * Name of the example component. For examples with multiple components, this property will
   * include multiple components that are comma separated (e.g. dialog-overview)
   */
  componentName: string;

  constructor(example: string) {
    if (!example || !EXAMPLE_COMPONENTS.hasOwnProperty(example)) {
      return;
    }

    const exampleConfig = EXAMPLE_COMPONENTS[example];

    // TODO(tinayuangao): Do not hard-code extensions
    this.exampleFiles = ['html', 'ts', 'css'].map(extension => `${example}-example.${extension}`);
    this.selectorName = this.indexFilename = `${example}-example`;

    if (exampleConfig.additionalFiles) {
      this.exampleFiles.push(...exampleConfig.additionalFiles);
    }

    const exampleName = example.replace(/(?:^\w|\b\w)/g, letter => letter.toUpperCase());

    this.description = exampleConfig.title || exampleName.replace(/[\-]+/g, ' ') + ' Example';
    this.componentName = exampleConfig.selectorName ||
                          exampleName.replace(/[\-]+/g, '') + 'Example';
  }
}
