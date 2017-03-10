To add a new server side rendering E2E test

- Add a new server side rendered application to src/
- Edit webpack.client.config.js to add new entry point for the new client bundle
- The index.html can access the client bundle from /built/<bundle-name>.js
- Edit src/server.ts to add the server side application to a new URL
- Add a protractor test in e2e/ to test with the new URL
