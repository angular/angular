# BuildKite configuration

This folder contains configuration for the [BuildKite](https://buildkite.com) based CI checks for 
this repository.

BuildKite is a CI provider that provides build coordination and reports while we provide the 
infrastructure.

CI runs are triggered by new PRs and will show up on the GitHub checks interface, along with the 
other current CI solutions.

Currently it is only used for tests on Windows platforms.


## The build pipeline

BuildKite uses a pipeline for each repository. The `pipeline.yml` file defines pipeline 
[build steps](https://buildkite.com/docs/pipelines/defining-steps) for this repository.

Run results can be seen in the GitHub checks interface and in the 
[pipeline dashboard](https://buildkite.com/angular/angular).

Although most configuration is done via `pipeline.yml`, some options are only available
in the online [pipeline settings](https://buildkite.com/angular/angular/settings).


## Infrastructure

BuildKite does not provide the host machines where the builds runs, providing instead the
[BuildKite Agent](https://buildkite.com/docs/agent/v3) that should be run our own infrastructure.


### Agents

This agent polls the BuildKite API for builds, runs them, and reports back the results.
Agents are the unit of concurrency: each agent can run one build at any given time. 
Adding agents allows more builds to be ran at the same time.

Individual agents can have tags, and pipeline steps can target only agents with certain tags via the
`agents` field in `pipeline.yml`.
For example: agents on Windows machines are tagged as `windows`, and the Windows specific build 
steps list `windows: true` in their `agents` field.

You can see the current agent pool, along with their tags, in the 
[agents list](https://buildkite.com/organizations/angular/agents).


### Our host machines

We use [Google Cloud](https://cloud.google.com/) as our cloud provider, under the 
[Angular project](https://console.cloud.google.com/home/dashboard?project=internal-200822).
To access this project you need need to be logged in with a Google account that's a member of 
team@angular.io. 
For googlers this may be your google.com account, for others it is an angular.io account.

In this project we have a number of Windows VMs running, each of them with several agents.
The `provision-windows-buildkite.ps1` file contains instructions on how to create new host VMs that
are fully configured to run the BuildKite agents as services.

Our pipeline uses [docker-buildkite-plugin](https://github.com/buildkite-plugins/docker-buildkite-plugin)
to run build steps inside docker containers.
This way we achieve isolation and hermeticity.

The `Dockerfile` file describes a custom Docker image that includes NodeJs, Yarn, and the Bazel 
pre-requisites on Windows.

To upload a new version of the docker image, follow any build instructions in `Dockerfile` and then
run `docker build -t angular/node-bazel-windows:NEW_VERSION`, followed by 
`docker push angular/node-bazel-windows:NEW_VERSION`. 
After being pushed it should be available online, and you can use the new version in `pipeline.yml`.


## Caretaker 

BuildKite status can be found at https://www.buildkitestatus.com/.

Issues related to the BuildKite setup should be escalated to the Tools Team via the current 
caretaker, followed by Alex Eagle and Filipe Silva.

Support requests should be submitted via email to support@buildkite.com and cc Igor, Misko, Alex,
Jeremy and Manu


## Rollout strategy

At the moment our BuildKite CI uses 1 host VM running 4 agents, thus being capable of 4 concurrent 
builds.
The only test running is `bazel test //tools/ts-api-guardian:all`, and the PR check is not 
mandatory.

In the future we should add cache support to speed up the initial `yarn` install, and also Bazel
remote caching to speed up Bazel builds.

After the current setup is verified as stable and reliable the GitHub PR check can become mandatory.

The tests ran should also be expanded to cover most, if not all, of the Bazel tests.
