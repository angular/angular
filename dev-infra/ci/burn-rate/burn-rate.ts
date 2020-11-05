import fetch from 'node-fetch';
import {getConfig} from '../../utils/config';
import {error, info, red, reset} from '../../utils/console';

/** Reporting windows for insight data from CircleCI. */
type ReportingWindow = 'last-90-days'|'last-30-days'|'last-7-days'|'last-24-hours';

/** API response structure from CircleCI's insight API. */
interface CircleCiInsightsResponse {
  message?: string;
  items: {
    name: string; window_start: string; window_end: string; metrics: {
      success_rate: number; total_runs: number; failed_runs: number; successful_runs: number;
      throughput: number;
      mttr: number;
      total_credits_used: number;
      duration_metrics: {
        min: number; mean: number; median: number; p95: number; max: number;
        standard_deviation: number;
      }
    }
  }[];
  next_page_token: string;
}

/** The Burn Rate check results as an object. */
export interface BurnRateResults {
  one: {credits: number; burnRate: number;};
  seven: {credits: number; burnRate: number;};
  thirty: {credits: number; burnRate: number;};
  ninety: {credits: number; burnRate: number;};
}

/** Check the burn rate of CircleCI credit usage for the repository. */
export async function checkBurnRate({ciToken, json}: {ciToken: string, json: boolean}) {
  const usage = {
    one: getUsageAndBurnRate(await getCreditsUsed(ciToken, 'last-24-hours'), 1),
    seven: getUsageAndBurnRate(await getCreditsUsed(ciToken, 'last-7-days'), 7),
    thirty: getUsageAndBurnRate(await getCreditsUsed(ciToken, 'last-30-days'), 30),
    ninety: getUsageAndBurnRate(await getCreditsUsed(ciToken, 'last-90-days'), 90),
  };

  if (json === true) {
    return JSON.stringify(usage);
  }

  info(`Credits used in last 24 hours: ${usage.one.credits} credits`);
  info();
  info.group(`Burn rate comparison (% change from 30 day rate):`);
  info(`1 day:  ${usage.one.burnRate}/month  (${compareRates(usage.one.burnRate)})`);
  info(`7 day:  ${usage.seven.burnRate}/month  (${compareRates(usage.seven.burnRate)})`);
  info(`30 day: ${usage.thirty.burnRate}/month  ---`);
  info(`90 day: ${usage.ninety.burnRate}/month  (${compareRates(usage.ninety.burnRate)})`);
  info.groupEnd();


  /** Compare two provided burn rates to determine the percentage change from the base rate. */
  function compareRates(rate: number, base = usage.thirty.burnRate) {
    if (rate === base) {
      return '---';
    }
    const percentage = ((rate - base) / base * 100);
    const color = percentage < 0 ? red : reset;
    return color(`${percentage.toFixed(2)}%`);
  }
}

/** Determine the credit usage and monthly burn rate for provide credit usage. */
function getUsageAndBurnRate(credits: number, days: number) {
  return {
    credits,
    // Formula: [credits] / [days of usage data] / [months in year] * [days in a year] /
    burnRate: Math.round(credits / days / 12 * 365)
  };
}

/** Retrieve the number of credits used for the project in a provided reporting window. */
async function getCreditsUsed(ciToken: string, window: ReportingWindow) {
  const {owner, name} = getConfig().github;
  const url = `https://circleci.com/api/v2/insights/gh/${owner}/${
      name}/workflows?reporting-window=${window}&circle-token=${ciToken}`;
  const data = (await fetch(url).then(r => r.json())) as CircleCiInsightsResponse;

  if (data.message) {
    error(`An error response was returned for the reporting window: ${window}`);
    return Infinity;
  }

  return data.items.map(workflow => workflow.metrics.total_credits_used).reduce((a, b) => a + b);
}
