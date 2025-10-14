// #docplaster
// #docregion builder, builder-skeleton
import {createBuilder} from '@angular-devkit/architect';
// #enddocregion builder-skeleton
import {promises as fs} from 'fs';
export default createBuilder(copyFileBuilder);
async function copyFileBuilder(options, context) {
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
      error: err.message,
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
//# sourceMappingURL=my-builder.js.map
