import {GithubConfig} from '@angular/dev-infra-private/ng-dev';

/**
 * Github configuration for the ng-dev command. This repository is
 * uses as remote for the merge script.
 */
export const github: GithubConfig = {
  owner: 'angular',
  name: 'components',
  mainBranchName: 'main',
};
