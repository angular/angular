# Angular i18n Internationalization Example

This sample comes from the Angular documentation's "[Example Angular Internationalization application](https://angular.dev/guide/i18n/example)" page.

## Install and Run the Download

1. `npm install` the node_module packages
2. `npm start` to see it run in English
3. `npm run start:fr` to see it run with French translation.

>See the scripts in `package.json` for an explanation of these commands.

## Run in Stackblitz

Stackblitz compiles and runs the English version by default.

To see the example translate to French with Angular i18n:

1. Open the `project.json` file and add the following to the bottom:

```json
  "stackblitz": {
    "startCommand": "npm run start:fr"
  }
```

1. Click the "Fork" button in the stackblitz header. That makes a new copy for you with this change and re-runs the example in French.
