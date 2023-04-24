import {GithubConfig} from '@angular/ng-dev';

/**
 * Github configuration for the `ng-dev` command. This repository is used as
 * remote for the merge script and other utilities like `ng-dev pr rebase`.
 */
export const github: GithubConfig = {
  owner: 'angular',
  name: 'angular',
  mainBranchName: 'main',
  useNgDevAuthService: true,
};
