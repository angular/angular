# Developing

To setup your development environment run:

```
git clone git@github.com:angular/angular
cd devtools
yarn
```

To run the extension in development mode run:

```
ng serve
```

This would start a development server that you can access on <http://localhost:4200>. In development, Angular DevTools uses a "development shell." This is different from "chrome shell" in a way, that it runs the user's app in an iframe. DevTools then communicate with the user's app via message passing.

## Building the extension

To build the Angular DevTools Chrome extension run:

```
npm run release
```

This would output the production assets of the app in `dist/shell-browser`. If you want to build the extension with development settings (i.e., not minified sources), just run:

```
ng build shell-browser
```

Later on, you can install the extension from `dist/shell-browser` following the guide from [here](https://developer.chrome.com/apps/external_extensions).
