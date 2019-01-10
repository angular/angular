# ngcontainer

This docker container provides everything needed to build and test Angular applications:

**Note**: This docker image will be no longer actively updated. Consider using other Docker 
images that come with Node installed. Bazel can be installed through the `@bazel/bazel` NPM package.

- node 10.9.0
- npm 6.2.0
- yarn 1.9.2
- Java 8 (for Closure Compiler and Bazel)
- Bazel build tool v0.18.0 - http://bazel.build
- Google Chrome 69.0.3497.81
- Mozilla Firefox 47.0.1
- xvfb (virtual framebuffer) for headless testing
- Brotli compression utility, making smaller files than gzip

By using this, you avoid installation steps in your CI scripts and get a more consistent dev environment.

## Example

See https://github.com/angular/closure-demo/blob/master/.circleci/config.yml
where this container is used in CircleCI.

To run locally:

```
$ docker run -it --rm angular/ngcontainer
```

## Running tests

Any program that needs to talk to a browser (eg. protractor) should be run under xvfb when executing on a headless machine like on CI. The nice way to factor this is to have your top-level test command which you run locally:

```
$ yarn test
```

Then in your CI configuration, you'd run

```
$ xvfb-run -a yarn test
```

## For Developers

Install Docker on your machine in order to build/pull/push this image.

Get the teamangular password from http://valentine and log in:

`$ docker login`

Publish a new version:

`$ tools/ngcontainer/publish.sh [tag eg. 0.2.3]`
