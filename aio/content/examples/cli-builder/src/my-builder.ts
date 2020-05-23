// #docplaster
// #docregion builder, builder-skeleton, handling-output, progress-reporting
import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
// #enddocregion builder-skeleton
import * as childProcess from 'child_process';
// #docregion builder-skeleton

interface Options extends JsonObject {
  command: string;
  args: string[];
}

export default createBuilder(commandBuilder);

function commandBuilder(
  options: Options,
  context: BuilderContext,
  ): Promise<BuilderOutput> {
    // #enddocregion builder, builder-skeleton, handling-output
    // #docregion report-status
    context.reportStatus(`Executing "${options.command}"...`);
    // #docregion builder, handling-output
    const child = childProcess.spawn(options.command, options.args);
    // #enddocregion builder, report-status

    child.stdout.on('data', data => {
      context.logger.info(data.toString());
    });
    child.stderr.on('data', data => {
      context.logger.error(data.toString());
    });

    // #docregion builder
    return new Promise(resolve => {
      // #enddocregion builder, handling-output
      context.reportStatus(`Done.`);
      // #docregion builder, handling-output
      child.on('close', code => {
        resolve({ success: code === 0 });
      });
    });
    // #docregion builder-skeleton
}

// #enddocregion builder, builder-skeleton, handling-output, progress-reporting
