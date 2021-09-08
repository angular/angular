export const environment = {
  production: true,
  process: {
    env: {
      // todo(aleksanderbodurri): when devtools is merged into the main angular repo, use stamping tooling to inject the latest SHA into the environment
      LATEST_SHA: '',
    },
  },
};
