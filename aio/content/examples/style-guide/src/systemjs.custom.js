(function(global) {
  // extra local packages
  var packageNames = [
    '01-01', '01-01/app', '01-01/app/heroes', '01-01/app/heroes/shared',
    '02-05', '02-05/app',
    '02-07', '02-07/app', '02-07/app/heroes', '02-07/app/users',
    '02-08', '02-08/app', '02-08/app/shared',
    '03-01', '03-01/app', '03-01/app/core',
    '03-02', '03-02/app', '03-02/app/core',
    '03-03', '03-03/app', '03-03/app/core',
    '03-04', '03-04/app', '03-04/app/core',
    '03-05', '03-05/app', '03-05/app/core', '03-05/app/core/spinner', '03-05/app/core/toast',
      '03-05/app/heroes', '03-05/app/heroes/shared',
    '03-06', '03-06/app', '03-06/app/core', '03-06/app/core/spinner', '03-06/app/core/toast',
      '03-06/app/heroes', '03-06/app/heroes/shared',
    '04-08', '04-08/app', '04-08/app/heroes',
    '04-10', '04-10/app', '04-10/app/shared', '04-10/app/heroes', '04-10/app/shared/spinner', '04-10/app/shared/toast',
      '04-10/app/shared/filter-text',
    '04-11', '04-11/app', '04-11/app/core', '04-11/app/heroes', '04-11/app/core/spinner',
      '04-11/app/core/nav',
    '04-12', '04-12/app', '04-12/app/core', '04-12/app/heroes', '04-12/app/core/nav',
    '05-02', '05-02/app', '05-02/app/heroes', '05-02/app/heroes/shared', '05-02/app/heroes/shared/hero-button',
    '05-03', '05-03/app', '05-03/app/heroes', '05-03/app/heroes/shared', '05-03/app/heroes/shared/hero-button',
    '05-04', '05-04/app', '05-04/app/heroes', '05-04/app/heroes/shared',
    '05-12', '05-12/app', '05-12/app/heroes', '05-12/app/heroes/shared', '05-12/app/heroes/shared/hero-button',
    '05-13', '05-13/app', '05-13/app/heroes', '05-13/app/heroes/shared', '05-13/app/heroes/shared/hero-button',
    '05-14', '05-14/app', '05-14/app/shared', '05-14/app/shared/toast',
    '05-15', '05-15/app', '05-15/app/heroes', '05-15/app/heroes/hero-list', '05-15/app/heroes/shared',
    '05-16', '05-16/app', '05-16/app/heroes',
    '05-17', '05-17/app', '05-17/app/heroes', '05-17/app/heroes/hero', '05-17/app/heroes/hero-list',
    '05-17/app/heroes/shared',
    '06-01', '06-01/app', '06-01/app/shared',
    '06-03', '06-03/app', '06-03/app/shared',
    '07-01', '07-01/app', '07-01/app/heroes', '07-01/app/heroes/shared',
    '07-03', '07-03/app', '07-03/app/heroes', '07-03/app/heroes/hero-list', '07-03/app/heroes/shared',
    '07-04', '07-04/app', '07-04/app/heroes', '07-04/app/heroes/shared',
    '09-01', '09-01/app', '09-01/app/heroes', '09-01/app/heroes/shared', '09-01/app/heroes/shared/hero-button'
  ];

  var packages = {};
  packageNames.forEach(function(pkgName) {
    packages[pkgName] = { main: 'index.js', defaultExtension: 'js', meta: { './*.js': { loader: 'systemjs-angular-loader.js' }} };
  });

  var config = {
    packages: packages
  }

  System.config(config);

})(this);
