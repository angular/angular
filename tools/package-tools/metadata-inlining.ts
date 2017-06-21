import {readFileSync, writeFileSync} from 'fs';
import {basename} from 'path';
import {sync as glob} from 'glob';
import {join} from 'path';

/**
 * Recurse through a parsed metadata.json file and inline all html and css.
 * Note: this assumes that all html and css files have a unique name.
 */
export function inlineMetadataResources(metadata: any, componentResources: Map<string, string>) {
  // Convert `templateUrl` to `template`
  if (metadata.templateUrl) {
    const fullResourcePath = componentResources.get(basename(metadata.templateUrl));
    metadata.template = readFileSync(fullResourcePath!, 'utf-8');
    delete metadata.templateUrl;
  }

  // Convert `styleUrls` to `styles`
  if (metadata.styleUrls && metadata.styleUrls.length) {
    metadata.styles = [];
    for (const styleUrl of metadata.styleUrls) {
      const fullResourcePath = componentResources.get(basename(styleUrl));
      metadata.styles.push(readFileSync(fullResourcePath!, 'utf-8'));
    }
    delete metadata.styleUrls;
  }

  // We we did nothing at this node, go deeper.
  if (!metadata.template && !metadata.styles) {
    for (const property in metadata) {
      if (typeof metadata[property] == 'object' && metadata[property]) {
        inlineMetadataResources(metadata[property], componentResources);
      }
    }
  }
}


/** Inlines HTML and CSS resources into `metadata.json` files. */
export function inlinePackageMetadataFiles(packagePath: string) {
  // Create a map of fileName -> fullFilePath. This is needed because the templateUrl and
  // styleUrls for each component use just the filename because, in the source, the component
  // and the resources live in the same directory.
  const componentResources = new Map<string, string>();

  glob(join(packagePath, '**/*.+(html|css)')).forEach(resourcePath => {
    componentResources.set(basename(resourcePath), resourcePath);
  });

  // Find all metadata files. For each one, parse the JSON content, inline the resources, and
  // reserialize and rewrite back to the original location.
  glob(join(packagePath, '**/*.metadata.json')).forEach(path => {
    const metadata = JSON.parse(readFileSync(path, 'utf-8'));
    inlineMetadataResources(metadata, componentResources);
    writeFileSync(path , JSON.stringify(metadata), 'utf-8');
  });
}
