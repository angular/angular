All of our npm dependencies are locked via the `yarn.lock` file for the following reasons:

- our project has lots of dependencies which update at unpredictable times, so it's important that
  we update them explicitly once in a while rather than implicitly when any of us runs `yarn install`
- locked dependencies allow us to reuse yarn cache on CircleCI, significantly speeding up our builds
  (by 5 minutes or more)
- locked dependencies allow us to detect when node_modules folder is out of date after a branch switch
  which allows us to build the project with the correct dependencies every time

Before changing a dependency, do the following:

- make sure you are in sync with `upstream/main`: `git fetch upstream && git rebase upstream/main`
- ensure that your `node_modules` directory is not stale by running `yarn install`


To add a new dependency do the following: `yarn add <packagename> --dev`

To update an existing dependency do the following: run `yarn upgrade <packagename>@<version|latest> --dev`
or `yarn upgrade <packagename> --dev` to update to the latest version that matches version constraint
in `package.json`

To Remove an existing dependency do the following: run `yarn remove <packagename>`


Once you've changed the dependency, commit the changes to `package.json` & `yarn.lock`, and you are done.
