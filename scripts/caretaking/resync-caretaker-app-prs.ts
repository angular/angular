import {Octokit} from '@octokit/rest';
import * as fetch from 'node-fetch';

const apiBaseUrl = 'https://test-jperrott.firebaseio.com/pulls';
const github = new Octokit({auth: process.env.TOKEN});

async function resync() {
  const pulls: any[] = [];
  let page = 1;
  let hasNext = true;
  while (hasNext) {
    const response = await github.pulls.list({
      owner: 'angular',
      repo: 'components',
      per_page: 100,
      page,
    });
    pulls.push(...response.data);
    hasNext = !!response.data.length;
    page++;
  }

  let syncedCount = 0;
  for (let pull of pulls) {
    await fetch.default(`${apiBaseUrl}/${pull.base.repo.full_name}/${pull.number}/github.json`, {
      method: 'patch',
      body: JSON.stringify({
        'branch': pull.base.ref,
        'title': pull.title,
        'pull_number': pull.number,
        'state': pull.state,
        'commit_sha': pull.head.sha,
        'author': pull.user,
        'labels': pull.labels,
        'created_at': pull.created_at,
        'updated_at': pull.updated_at,
      }),
    });
    syncedCount++;
    console.log(`updated pr ${pull.number} (${syncedCount} of ${pulls.length})`);
  }
}

resync();
