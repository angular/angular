import * as fs from 'fs';
import * as path from 'path';
import {parseExampleFile} from './parse-example-file';
import {parseExampleModuleFile} from './parse-example-module-file';

interface ExampleMetadata {
  /** Name of the example component. */
  componentName: string;
  /** Path to the source file that declares this example. */
  sourcePath: string;
  /** Module import that can be used to load this example. */
  importPath: string;
  /** Unique id for this example. */
  id: string;
  /** Title of the example. */
  title: string;
  /** Additional components for this example. */
  additionalComponents: string[];
  /** Additional files for this example. */
  additionalFiles: string[];
  /** Reference to the module that declares this example. */
  module: ExampleModule;
}

interface ExampleModule {
  /** Path to the package that the module is defined in. */
  packagePath: string;
  /** Name of the module. */
  name: string;
}

interface AnalyzedExamples {
  exampleMetadata: ExampleMetadata[];
}

/** Inlines the example module template with the specified parsed data. */
function inlineExampleModuleTemplate(parsedData: AnalyzedExamples): string {
  const {exampleMetadata} = parsedData;
  const exampleComponents = exampleMetadata.reduce((result, data) => {
    result[data.id] = {
      title: data.title,
      componentName: data.componentName,
      additionalFiles: data.additionalFiles,
      additionalComponents: data.additionalComponents,
      module: {
        name: data.module.name,
        importSpecifier: data.module.packagePath,
      },
    };

    return result;
  }, {} as any);

  return fs.readFileSync(require.resolve('./example-module.template'), 'utf8')
    .replace(/\${exampleComponents}/g, JSON.stringify(exampleComponents, null, 2));
}

/** Converts a given camel-cased string to a dash-cased string. */
function convertToDashCase(name: string): string {
  name = name.replace(/[A-Z]/g, ' $&');
  name = name.toLowerCase().trim();
  return name.split(' ').join('-');
}

/**
 * Analyzes the examples by parsing the given TypeScript files in order to find
 * individual example modules and example metadata.
 */
function analyzeExamples(sourceFiles: string[], baseDir: string): AnalyzedExamples {
  const exampleMetadata: ExampleMetadata[] = [];
  const exampleModules: ExampleModule[] = [];

  for (const sourceFile of sourceFiles) {
    const relativePath = path.relative(baseDir, sourceFile).replace(/\\/g, '/');
    const importPath = relativePath.replace(/\.ts$/, '');

    // Collect all individual example modules.
    if (path.basename(sourceFile) === 'index.ts') {
      exampleModules.push(...parseExampleModuleFile(sourceFile).map(name => ({
        name,
        importPath,
        packagePath: path.dirname(relativePath),
      })));
    }

    // Avoid parsing non-example files.
    if (!path.basename(sourceFile, path.extname(sourceFile)).endsWith('-example')) {
      continue;
    }

    const sourceContent = fs.readFileSync(sourceFile, 'utf-8');
    const {primaryComponent, secondaryComponents} = parseExampleFile(sourceFile, sourceContent);

    if (primaryComponent) {
      // Generate a unique id for the component by converting the class name to dash-case.
      const exampleId = convertToDashCase(primaryComponent.componentName.replace('Example', ''));
      const example: ExampleMetadata = {
        sourcePath: relativePath,
        id: exampleId,
        componentName: primaryComponent.componentName,
        title: primaryComponent.title.trim(),
        additionalFiles: [],
        additionalComponents: [],
        module: null,
        importPath,
      };
      if (secondaryComponents.length) {
        for (const meta of secondaryComponents) {
          example.additionalComponents.push(meta.componentName);
          if (meta.templateUrl) {
            example.additionalFiles.push(meta.templateUrl);
          }
          if (meta.styleUrls) {
            example.additionalFiles.push(...meta.styleUrls);
          }
        }
      }
      exampleMetadata.push(example);
    } else {
        throw Error(`Could not find a primary example component in ${sourceFile}. ` +
                    `Ensure that there's a component with an @title annotation.`);
    }
  }

  // Walk through all collected examples and find their parent example module. In View Engine,
  // components cannot be lazy-loaded without the associated module being loaded.
  exampleMetadata.forEach(example => {
    const parentModule = exampleModules
      .find(module => example.sourcePath.startsWith(module.packagePath));

    if (!parentModule) {
      throw Error(`Could not determine example module for: ${example.id}`);
    }

    example.module = parentModule;
  });

  return {exampleMetadata};
}

/**
 * Generates the example module from the given source files and writes it to a specified output
 * file.
 */
export function generateExampleModule(sourceFiles: string[], outputFile: string,
                                      baseDir: string = path.dirname(outputFile)) {
  const analysisData = analyzeExamples(sourceFiles, baseDir);
  const generatedModuleFile = inlineExampleModuleTemplate(analysisData);

  fs.writeFileSync(outputFile, generatedModuleFile);
}
