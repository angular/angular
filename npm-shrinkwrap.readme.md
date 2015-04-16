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
See https://github.com/npm/npm/issues/3581 for related npm issue.

To add a new dependency do the following:

1. add a new dependency via `npm install -D <packagename>`
2. run `./tools/npm/clean-shrinkwrap.js`
3. these steps should change 3 files: `package.json`, `npm-shrinkwrap.json` and `npm-shrinkwrap.clean.json`
4. commit changes to these three files and you are done


To update existing dependency do the following:

1. update `package.json`
2. run `npm install <packagename>`
3. relock the dependencies with `npm shrinkwrap --dev`
4. clean up the shrinkwrap file for review with `./tools/npm/clean-shrinkwrap.js`
5. these steps should change 3 files: `package.json`, `npm-shrinkwrap.json` and `npm-shrinkwrap.clean.json`
6. commit changes to these three files and you are done


If updating the `tsd` project a special steps need to be taken due to
https://github.com/Bartvds/minitable/issues/2:

Update `tsd` by following the steps above but before you run `npm shrinkwrap --dev`, you'll have to
manually patch `node_modules/tsd/node_modules/minitable/package.json` and remove the `minichain` from
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
