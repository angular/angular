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

1. add a new dependency via `npm install -D <packagename>`
2. update npm-shrinkwrap.json with `npm shrinkwrap --dev`
3. run `./tools/npm/clean-shrinkwrap.js`
4. these steps should change 3 files: `package.json`, `npm-shrinkwrap.json` and `npm-shrinkwrap.clean.json`
5. commit changes to these three files and you are done


To update existing dependency do the following:

1. run `npm install -D <packagename>@<version|latest>` or `npm update <packagename>` to update to the latest version that matches version constraint in `package.json`
2. relock the dependencies with `npm shrinkwrap --dev`
3. clean up the shrinkwrap file for review with `./tools/npm/clean-shrinkwrap.js`
4. these steps should change 2 files: `npm-shrinkwrap.json` and `npm-shrinkwrap.clean.json`. Optionally if you used `npm install ...` in the first step, `package.json` might be modified as well
5. commit changes to these three files and you are done


If updating the `tsd` project a special steps need to be taken due to
https://github.com/Bartvds/minitable/issues/2:

Update `tsd` by following the steps above but before you run `npm shrinkwrap --dev`, you'll have to
manually patch `node_modules/ts2dart/node_modules/tsd/node_modules/minitable/package.json` and
`node_modules/tsd/node_modules/minitable/package.json` and remove the `minichain` from
the `peerDependencies` section.

before:

```
 "peerDependencies": {
    "minichain": "~X.Y.Z",
    ...
  },
```


after:

```
 "peerDependencies": {
    ...
  },
```

Then resume the shrinkwrap update and cleaning steps.
