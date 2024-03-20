// #docplaster
// #docregion builder, builder-skeleton, handling-output, progress-reporting
import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
// #enddocregion builder-skeleton
import { promises as fs } from 'fs';
// #docregion builder-skeleton

interface Options extends JsonObject {
  source: string;
  destination: string;
}

export default createBuilder(copyFileBuilder);

async function copyFileBuilder(
  options: Options,
  context: BuilderContext,
): Promise<BuilderOutput> {
  // #enddocregion builder, builder-skeleton, handling-output
  // #docregion report-status
  context.reportStatus(`Copying ${options.source} to ${options.destination}.`);
  // #docregion builder, handling-output
  try {
    await fs.copyFile(options.source, options.destination);
  } catch (err) {
    // #enddocregion builder
    context.logger.error('Failed to copy file.');
    // #docregion builder
    return {
      success: false,
      error: err.message,
    };
  }

  // #enddocregion builder, handling-output
  context.reportStatus('Done.');
  // #docregion builder, handling-output
  return { success: true };
  // #enddocregion report-status
  // #docregion builder-skeleton
}

// #enddocregion builder, builder-skeleton, handling-output, progress-reporting
