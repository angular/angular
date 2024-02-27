// #docplaster
// #docregion builder, builder-skeleton
import {BuilderContext, BuilderOutput, createBuilder} from '@angular-devkit/architect';
import {JsonObject} from '@angular-devkit/core';
// #enddocregion builder-skeleton
import {promises as fs} from 'fs';
// #docregion builder-skeleton

interface Options extends JsonObject {
  source: string;
  destination: string;
}

export default createBuilder(copyFileBuilder);

async function copyFileBuilder(options: Options, context: BuilderContext): Promise<BuilderOutput> {
  // #enddocregion builder, builder-skeleton
  // #docregion progress-reporting
  context.reportStatus(`Copying ${options.source} to ${options.destination}.`);
  // #docregion builder, handling-output
  try {
    // #docregion report-status
    await fs.copyFile(options.source, options.destination);
    // #enddocregion report-status
  } catch (err) {
    // #enddocregion builder
    context.logger.error('Failed to copy file.');
    // #docregion builder
    return {
      success: false,
      error: (err as Error).message,
    };
  }
  // #enddocregion builder, handling-output

  context.reportStatus('Done.');
  // #docregion builder
  return {success: true};
  // #enddocregion progress-reporting
  // #docregion builder-skeleton
}

// #enddocregion builder, builder-skeleton
