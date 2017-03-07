const request = require('request');

/** Update github pr status to success/failure */
export function updateGithubStatus(result: boolean, prNumber: string) {
  let state = result ? 'success' : 'failure';
  let sha = process.env['TRAVIS_PULL_REQUEST_SHA'];
  let token = decode(process.env['MATERIAL2_GITHUB_STATUS_TOKEN']);

  let data = JSON.stringify({
    state: state,
    target_url: `http://material2-screenshots.firebaseapp.com/${prNumber}`,
    context: 'screenshot-diff',
    description: `Screenshot test ${state}`
  });

  let headers =  {
    'Authorization': `token ${token}`,
    'User-Agent': 'ScreenshotDiff/1.0.0',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  };

  return new Promise((resolve) => {
    request({
      url: `https://api.github.com/repos/angular/material2/statuses/${sha}`,
      method: 'POST',
      form: data,
      headers: headers
    }, function (error: any, response: any) {
      resolve(response.statusCode);
    });
  });
}

function decode(value: string): string {
  return value.split('').reverse().join('');
}
