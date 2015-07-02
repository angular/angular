All of our npm dependencies are locked via the `npm-shrinkwrap.json` file for the following reasons:

- our project has lots of dependencies which update at unpredictable times, so it's important that
  we update them explicitly once in a while rather than implicitly when any of us runs npm install
- locked dependencies allow us to do reuse npm cache on travis, significantly speeding up our builds
  (by 5min or more)  
- locked dependencies allow us to detect when node_modules folder is out of date after a branch switch
  which allows us to build the project with the correct dependencies every time

However npm's shrinkwrap is known to be buggy, so we need to take some extra steps to deal with this.
The most important step is generating the npm-shrinkwrap.clean.js which is used during code reviews
or debugging to easily review what has actually changed. 
See https://github.com/npm/npm/issues/3581 for related npm issue. A common symptom is that the `from` property of various dependencies in `npm-shrinkwrap.json` "arbitrarily" changes depending on when and where the shrinkwrap command was run.

To add a new dependency do the following:

1. if you are on linux or windows, then use MacOS or ask someone with MacOS to perform the installation. This is due to an optional `fsevents` dependency that is really required on MacOS to get good performance from file watching.
2. make sure you are in sync with `upstream/master`
3. ensure that your `node_modules` directory is not stale or poisoned by doing a clean install with `rm -rf node_modules && npm install`
4. add a new dependency via `npm install --save-dev <packagename>`
5. update npm-shrinkwrap.json with `npm shrinkwrap --dev`
6. run `./tools/npm/clean-shrinkwrap.js`
7. these steps should change 3 files: `package.json`, `npm-shrinkwrap.json` and `npm-shrinkwrap.clean.json`
8. commit changes to these three files and you are done


To update existing dependency do the following:

1. if you are on linux or windows, then use MacOS or ask someone with MacOS to perform the installation. This is due to an optional `fsevents` dependency that is really required on MacOS to get good performance from file watching.
2. make sure you are in sync with `upstream/master`: `git fetch upstream && git rebase upstream/master`
3. ensure that your `node_modules` directory is not stale or poisoned by doing a clean install with `rm -rf node_modules && npm install`
4. run `npm install --save-dev <packagename>@<version|latest>` or `npm update <packagename>` to update to the latest version that matches version constraint in `package.json`
5. relock the dependencies with `npm shrinkwrap --dev`
6. clean up the shrinkwrap file for review with `./tools/npm/clean-shrinkwrap.js`
7. these steps should change 2 files: `npm-shrinkwrap.json` and `npm-shrinkwrap.clean.json`. Optionally if you used `npm install ...` in the first step, `package.json` might be modified as well
8. commit changes to these three files and you are done


To Remove an existing dependency do the following:

1. if you are on linux or windows, then use MacOS or ask someone with MacOS to perform the installation. This is due to an optional `fsevents` dependency that is really required on MacOS to get good performance from file watching.
2. make sure you are in sync with `upstream/master`: `git fetch upstream && git rebase upstream/master`
3. ensure that your `node_modules` directory is not stale or poisoned by doing a clean install with `rm -rf node_modules && npm install`
4. run `npm uninstall --save-dev <packagename>@<version|latest>`
5. relock the dependencies with `npm shrinkwrap --dev`
6. clean up the shrinkwrap file for review with `./tools/npm/clean-shrinkwrap.js`
7. these steps should change 3 files: `npm-shrinkwrap.json` and `npm-shrinkwrap.clean.json`.
8. commit changes to these three files and you are done
