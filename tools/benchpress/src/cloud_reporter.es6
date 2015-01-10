var google = require('googleapis');
var bigquery = google.bigquery('v2');
var webdriver = require('protractor/node_modules/selenium-webdriver');

var HEADER_FIELDS = [
  {
    "name": 'runId',
    "type": 'STRING',
    "description": 'uuid for the benchmark run'
  },
  {
    "name": 'index',
    "type": 'INTEGER',
    "description": 'index within the sample'
  },
  {
    "name": 'creationTime',
    "type": 'TIMESTAMP'
  },
  {
    "name": 'browser',
    "type": 'STRING',
    "description": 'navigator.platform'
  },
  {
    "name": 'forceGc',
    "type": 'BOOLEAN',
    "description": 'whether gc was forced at end of action'
  }
];

class CloudReporter {
  constructor(runId, benchmarkConfig) {
    this.stableRowsTableConfig = createTableConfig(benchmarkConfig, '_stable');
    this.allRowsTableConfig = createTableConfig(benchmarkConfig, '_all')
    this.authConfig = benchmarkConfig.cloudReporter.auth;
    this.benchmarkConfig = benchmarkConfig;
    this.runId = runId;
    this.allRows = [];
    var self = this;
    browser.executeScript('return navigator.userAgent').then(function(userAgent) {
      self.browserUserAgent = userAgent;
    });

  }
  begin() {
    var self = this;
    var flow = browser.driver.controlFlow();
    flow.execute(function() {
      return authenticate(self.authConfig).then(function(authClient) {
        self.authClient = authClient;
      });
    });
    flow.execute(function() {
      return webdriver.promise.all([
        getOrCreateTable(self.authClient, self.allRowsTableConfig),
        getOrCreateTable(self.authClient, self.stableRowsTableConfig)
      ]);
    });
  }
  add(data) {
    this.allRows.push(this._convertToTableRow(data));
  }
  end(stableSample) {
    var self = this;
    var flow = browser.driver.controlFlow();
    var stableRows = stableSample.map(function(data) {
      return self._convertToTableRow(data);
    });
    flow.execute(function() {
      return webdriver.promise.all([
        insertRows(self.authClient, self.stableRowsTableConfig, stableRows),
        insertRows(self.authClient, self.allRowsTableConfig, self.allRows)
      ]);
    });
  }
  _convertToTableRow(benchpressRow) {
    var tableRow = {
      runId: this.runId,
      index: benchpressRow.index,
      creationTime: new Date(),
      browser: this.browserUserAgent,
      forceGc: benchpressRow.forceGc
    };
    this.benchmarkConfig.params.forEach(function(param) {
      tableRow['p_'+param.name] = param.value;
    });
    this.benchmarkConfig.metrics.forEach(function(metric, index) {
      tableRow['m_'+metric] = benchpressRow.values[index];
    });
    return tableRow;
  }
}

function createTableConfig(benchmarkConfig, tableSuffix) {
  var tableId = (benchmarkConfig.id+tableSuffix).replace(/\./g, '_');
  return {
    projectId: benchmarkConfig.cloudReporter.projectId,
    datasetId: benchmarkConfig.cloudReporter.datasetId,
    table: {
      id: tableId,
      fields: HEADER_FIELDS
        .concat(benchmarkConfig.params.map(function(param) {
          return {
            "name": 'p_'+param.name,
            "type": 'FLOAT'
          };
        }))
        .concat(benchmarkConfig.metrics.map(function(metricName) {
          return {
            "name": 'm_'+metricName,
            "type": 'FLOAT'
          };
        }))
    }
  };
}

function getOrCreateTable(authClient, tableConfig) {
  return getTable(authClient, tableConfig).then(null, function(err) {
    // create the table if it does not exist
    return createTable(authClient, tableConfig);
  });
}

function authenticate(authConfig) {
  var authClient = new google.auth.JWT(
    authConfig['client_email'],
    null,
    authConfig['private_key'],
    ['https://www.googleapis.com/auth/bigquery'],
    // User to impersonate (leave empty if no impersonation needed)
    null);

  var defer = webdriver.promise.defer();
  authClient.authorize(makeNodeJsResolver(defer));
  return defer.promise.then(function() {
    return authClient;
  });
}

function getTable(authClient, tableConfig) {
  // see https://cloud.google.com/bigquery/docs/reference/v2/tables/get
  var params = {
    auth: authClient,
    projectId: tableConfig.projectId,
    datasetId: tableConfig.datasetId,
    tableId: tableConfig.table.id
  };
  var defer = webdriver.promise.defer();
  bigquery.tables.get(params, makeNodeJsResolver(defer));
  return defer.promise;
}

function createTable(authClient, tableConfig) {
  // see https://cloud.google.com/bigquery/docs/reference/v2/tables
  // see https://cloud.google.com/bigquery/docs/reference/v2/tables#resource
  var params = {
    auth: authClient,
    projectId: tableConfig.projectId,
    datasetId: tableConfig.datasetId,
    resource: {
      "kind": "bigquery#table",
      "tableReference": {
        projectId: tableConfig.projectId,
        datasetId: tableConfig.datasetId,
        tableId: tableConfig.table.id
      },
      "schema": {
        "fields": tableConfig.table.fields
      }
    }
  };
  var defer = webdriver.promise.defer();
  bigquery.tables.insert(params, makeNodeJsResolver(defer));
  return defer.promise;
}

function insertRows(authClient, tableConfig, rows) {
  // see https://cloud.google.com/bigquery/docs/reference/v2/tabledata/insertAll
  var params = {
    auth: authClient,
    projectId: tableConfig.projectId,
    datasetId: tableConfig.datasetId,
    tableId: tableConfig.table.id,
    resource: {
      "kind": "bigquery#tableDataInsertAllRequest",
      "rows": rows.map(function(row) {
        return {
          json: row
        }
      })
    }
  };
  var defer = webdriver.promise.defer();
  bigquery.tabledata.insertAll(params, makeNodeJsResolver(defer));
  return defer.promise.then(function(result) {
    if (result.insertErrors) {
      throw result.insertErrors.map(function(err) {
        return err.errors.map(function(err) {
          return err.message;
        }).join('\n');
      }).join('\n');
    }
  });
}

function makeNodeJsResolver(defer) {
  return function(err, result) {
    if (err) {
      // Normalize errors messages from BigCloud so that they show up nicely
      if (err.errors) {
        err = err.errors.map(function(err) {
          return err.message;
        }).join('\n');
      }
      defer.reject(err);
    } else {
      defer.fulfill(result);
    }
  }
}

module.exports = CloudReporter;