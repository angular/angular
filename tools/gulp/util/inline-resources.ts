import {readFileSync} from 'fs';
import {basename} from 'path';

/**
 * Recurse through a parsed metadata.json file and inline all html and css.
 * Note: this assumes that all html and css files have a unique name.
 */
export function inlineMetadataResources(metadata: any, componentResources: Map<string, string>) {
  // Convert `templateUrl` to `template`
  if (metadata.templateUrl) {
    const fullResourcePath = componentResources.get(basename(metadata.templateUrl));
    metadata.template = readFileSync(fullResourcePath, 'utf-8');
    delete metadata.templateUrl;
  }

  // Convert `styleUrls` to `styles`
  if (metadata.styleUrls && metadata.styleUrls.length) {
    metadata.styles = [];
    for (const styleUrl of metadata.styleUrls) {
      const fullResourcePath = componentResources.get(basename(styleUrl));
      metadata.styles.push(readFileSync(fullResourcePath, 'utf-8'));
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
