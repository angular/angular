import {Connection} from 'vscode-languageserver/node';
import {URI} from 'vscode-uri';
import {fileURLToPath} from 'node:url';
import {canonicalizePath as normalizePath} from '../../../packages/compiler-cli/preprocessor/language-service/src/utils.js';

async function normalizeUri(uri: string): Promise<string> {
  try {
    const filePath = fileURLToPath(uri);
    return URI.file(await normalizePath(filePath)).toString();
  } catch {
    return uri;
  }
}

export class DiagnosticPublisher {
  /** Target URIs (normalized) that currently have active push diagnostics published on the client. */
  private activePushedUris = new Map<string, string>(); // normUri -> originalUri

  /** Maps normalized source analysis URI -> Map of normalized target URI to original target URI. */
  private pushedBySource = new Map<string, Map<string, string>>();

  constructor(private connection: Connection) {}

  /**
   * Clears push diagnostics for a specific URI if it currently has active push diagnostics.
   */
  async clearPush(uri: string) {
    const norm = await normalizeUri(uri);
    const originalUri = this.activePushedUris.get(norm) || uri;
    if (this.activePushedUris.delete(norm)) {
      this.connection.console.log(`[SERVER] Clearing push diagnostics for ${originalUri}`);
      this.connection.sendNotification('textDocument/publishDiagnostics', {
        uri: originalUri,
        diagnostics: [],
      });
    }
  }

  /**
   * Updates push diagnostics for secondary files and returns the diagnostics for the pulled file.
   */
  async update(
    sourceUri: string,
    pullUri: string,
    mappedDiagnostics: Record<string, any[]>,
  ): Promise<any[]> {
    const normSourceUri = await normalizeUri(sourceUri);
    const normPullUri = await normalizeUri(pullUri);

    const previousPushed = this.pushedBySource.get(normSourceUri) || new Map<string, string>();
    const currentPushed = new Map<string, string>();
    let pullItems: any[] = [];

    // Clear push diagnostics on the pulled file itself so pull response owns it cleanly
    await this.clearPush(pullUri);

    for (const [filePath, diagnostics] of Object.entries(mappedDiagnostics)) {
      const targetUri = URI.file(filePath).toString();
      const normTargetUri = await normalizeUri(targetUri);

      if (normTargetUri === normPullUri) {
        pullItems = diagnostics;
        continue;
      }

      this.connection.console.log(`[SERVER] Pushing diagnostics for ${targetUri}`);
      this.connection.sendNotification('textDocument/publishDiagnostics', {
        uri: targetUri,
        diagnostics,
      });

      if (diagnostics.length > 0) {
        this.activePushedUris.set(normTargetUri, targetUri);
        currentPushed.set(normTargetUri, targetUri);
      } else {
        this.activePushedUris.delete(normTargetUri);
      }
    }

    // Clean up any secondary files that this source previously pushed to but no longer has diagnostics for
    for (const [normStale, origStale] of previousPushed) {
      if (!currentPushed.has(normStale)) {
        await this.clearPush(origStale);
      }
    }

    if (currentPushed.size > 0) {
      this.pushedBySource.set(normSourceUri, currentPushed);
    } else {
      this.pushedBySource.delete(normSourceUri);
    }

    return pullItems;
  }

  /**
   * Clears all push diagnostics associated with a file (both received by it and sent by it),
   * and publishes empty diagnostics for this URI to ensure the client clears it on close.
   */
  async clearAllFor(uri: string) {
    const norm = await normalizeUri(uri);
    // Send empty diagnostics for uri
    this.connection.sendNotification('textDocument/publishDiagnostics', {
      uri,
      diagnostics: [],
    });
    this.activePushedUris.delete(norm);

    const pushed = this.pushedBySource.get(norm);
    if (pushed) {
      for (const targetUri of pushed.values()) {
        await this.clearPush(targetUri);
      }
      this.pushedBySource.delete(norm);
    }
  }
}
