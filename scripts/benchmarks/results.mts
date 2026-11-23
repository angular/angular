/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import fs from 'fs';
import path from 'path';
import Zip from 'adm-zip';

import {bold} from '@angular/ng-dev';

interface JsonReport {
  description: Record<string, string>;
  metricsText: string;
  statsText: string;
  validSampleTexts: string[];
  completeSample?: any;
}

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
  const scenarioResults: ScenarioResult[] = [];
  const zipPath = path.join(testlogDir, 'test.outputs/outputs.zip');

  if (fs.existsSync(zipPath)) {
    const z = new Zip(zipPath);
    for (const e of z.getEntries()) {
      if (path.extname(e.entryName) !== '.json') {
        continue;
      }

      try {
        const data = JSON.parse(z.readAsText(e.entryName));
        if (isJsonReport(data)) {
          addScenarioResult(data, scenarioResults);
        }
      } catch (err) {
        // Skip files that fail to parse
      }
    }
  } else {
    const outputsDir = path.join(testlogDir, 'test.outputs');
    if (fs.existsSync(outputsDir)) {
      for (const file of fs.readdirSync(outputsDir)) {
        if (path.extname(file) !== '.json') {
          continue;
        }

        const filePath = path.join(outputsDir, file);
        if (!fs.statSync(filePath).isFile()) {
          continue;
        }

        let data;
        try {
          data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (e) {
          continue;
        }

        if (!isJsonReport(data)) {
          continue;
        }

        addScenarioResult(data, scenarioResults);
      }
    }
  }

  if (scenarioResults.length === 0) {
    throw new Error(`No valid benchpress benchmark reports found in "${testlogDir}".`);
  }

  return {
    scenarios: scenarioResults,
    summaryConsoleText: scenarioResults
      .map((s) => `${bold(s.id)}\n\n${s.summaryConsoleText}`)
      .join('\n\n'),
    summaryMarkdownText: scenarioResults
      .map((s) => `### ${s.id}\n\n${s.summaryMarkdownText}`)
      .join('\n\n'),
  };
}

function addScenarioResult(data: JsonReport, scenarioResults: ScenarioResult[]) {
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

/** Whether the object corresponds to a benchpress JSON report. */
function isJsonReport(data: any): data is JsonReport {
  return data?.completeSample !== undefined;
}
