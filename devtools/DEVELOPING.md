# Developing

To setup your development environment run:

```
git clone git@github.com:angular/angular
yarn
```

To run the extension in development mode run:

```
yarn devtools:devserver
```

You can also run a standalone version of the demo app with
```
yarn devtools:devserver:demo-standalone
```

This would start a development server that you can access on <http://localhost:4200>. In development, Angular DevTools uses a "development shell." This is different from "chrome shell" in a way, that it runs the user's app in an iframe. DevTools then communicate with the user's app via message passing.

## Building the extension

To build the Angular DevTools Chrome extension run:

```
yarn devtools:build:chrome 
```

You can then install the extension from `dist/bin/devtools/projects/shell-browser/src/prodapp` following the guide from [here](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).


You can also build the extension for Firefox with:
```
yarn devtools:build:firefox
```

In Firefox, to load the extension, you can go to the about:debugging page, click the "This Firefox" option and then click the Load Temporary Add-on button. You'll have to select the manifest file in `dist/bin/devtools/projects/shell-browser/src/prodapp` directly.
