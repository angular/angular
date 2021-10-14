exports.config = {
  useAllAngular2AppRoots: true,
  allScriptsTimeout: 120000,
  getPageTimeout: 120000,
  jasmineNodeOpts: {
    defaultTimeoutInterval: 120000,
  },

  plugins: [
    {
      // Runs the axe-core accessibility checks each time the e2e page changes and
      // Angular is ready.
      path: require.resolve('angular_material/tools/axe-protractor'),

      rules: [
        // Exclude mat-menu elements because those are empty if not active.
        {id: 'aria-required-children', selector: '*:not(mat-menu)'},

        // Disable color contrast checks since the final colors will vary based on the theme.
        {id: 'color-contrast', enabled: false},

        // Don't require all content to be inside landmarks since some tests depend on the
        // page layout and moving this around can break them.
        {id: 'region', enabled: false},

        // Don't require at least one `<h1>` since we don't have any content.
        {id: 'page-has-heading-one', enabled: false},

        // Axe incorrectly picks up that `aria-required` is not allowed on the MDC slide toggle.
        {id: 'aria-allowed-attr', selector: '*:not(.mdc-switch)'},
      ],
    },
  ],

  // Since we want to use async/await we don't want to mix up with selenium's promise
  // manager. In order to enforce this, we disable the promise manager.
  SELENIUM_PROMISE_MANAGER: false,
};
