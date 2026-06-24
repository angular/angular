/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import path from 'path';
import Zip from 'adm-zip';

import type {JsonReport} from '../../packages/benchpress/src/reporter/json_file_reporter_types.js';
import {bold} from '@angular/ng-dev';

/** Results of an individual benchmark scenario. */
export interface ScenarioResult {
  id: string;
  data: JsonReport;
  summaryConsoleText: string;
  summaryMarkdownText: string;
}

/**
 * Overall result of a benchmark target.
 * A benchmark target may contain multiple scenarios.
 */
export interface OverallResult {
  scenarios: ScenarioResult[];
  summaryConsoleText: string;
  summaryMarkdownText: string;
}

/** Collects and parses the benchmark results of the given Bazel target testlog directory. */
export function collectBenchmarkResults(testlogDir: string): OverallResult {
  const z = new Zip(path.join(testlogDir, 'test.outputs/outputs.zip'));
  const scenarioResults: ScenarioResult[] = [];

  for (const e of z.getEntries()) {
    if (path.extname(e.entryName) !== '.json') {
      continue;
    }

    const data = JSON.parse(z.readAsText(e.entryName));

    // Skip files that do not look like benchpress reports.
    if (!isJsonReport(data)) {
      continue;
    }

    scenarioResults.push({
      id: data.description.id,
      data,
      // Output used for console output when running locally/CI.
      summaryConsoleText: `\
${data.metricsText}
${data.validSampleTexts.join('\n')}
${data.statsText}`,
      // Output used for e.g. GitHub actions.
      summaryMarkdownText: `\
<details><summary>Full example results</summary>

\`\`\`
${data.metricsText}
${data.validSampleTexts.join('\n')}
${data.statsText}
\`\`\`

</details>

\`\`\`
${data.metricsText}
${data.statsText}
\`\`\``,
    });
  }

  return {
    scenarios: scenarioResults,
    summaryConsoleText: scenarioResults
      .map((s) => `${bold(s.id)}\n\n${s.summaryConsoleText}`)
      .join('`\n'),
    summaryMarkdownText: scenarioResults
      .map((s) => `### ${s.id}\n\n${s.summaryMarkdownText}`)
      .join('`\n'),
  };
}

/** Whether the object corresponds to a benchpress JSON report. */
function isJsonReport(data: any): data is JsonReport {
  return data['completeSample'] !== undefined;
}
