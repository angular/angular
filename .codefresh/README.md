# CodeFresh configuration

[![Codefresh build status](https://g.codefresh.io/api/badges/pipeline/angular/angular%2Fangular%2Fangular?type=cf-1)](https://g.codefresh.io/public/accounts/angular/pipelines/angular/angular/angular)

This folder contains configuration for the [CodeFresh](<https://codefresh.io/>) based CI checks for this repository.

## The build pipeline

CodeFresh uses a several pipeline for each repository. The `codefresh.yml` file defines pipeline [build steps](https://codefresh.io/docs/docs/configure-ci-cd-pipeline/introduction-to-codefresh-pipelines/) for this repository.

Run results can be seen in the GitHub checks interface and in the [public pipeline](https://g.codefresh.io/public/accounts/angular/pipelines/angular/angular/angular)

Although most configuration is done via `pipeline.yml`, some options are only available in the online [pipeline settings](https://g.codefresh.io/pipelines/angular/services?repoOwner=angular&repoName=angular&project=angular%2Fangular&context=github&serviceName=angular%2Fangular), which needs a login to access.


## Caretaker

CodeFresh status can be found at <http://status.codefresh.io/>.

Issues related to the CodeFresh setup should be escalated to the Tools Team via the current caretaker, followed by Alex Eagle and Filipe Silva.

## Rollout strategy

Currently it is only used for tests on Windows platforms, on the master branch, and without pushing user-facing reports. It's only possible to see current builds in the [public pipeline dashboard](https://g.codefresh.io/public/accounts/angular/pipelines/angular/angular/angular).

After a week or two of running like this, we should reassess how stable and reliable it is. 

Next steps include:
- building PRs
- showing build status publicly
- blocking PRs that break the build
- expanding the test suite

