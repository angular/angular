var google = require('googleapis');
var bigquery = google.bigquery('v2');
var webdriver = require('protractor/node_modules/selenium-webdriver');

var TABLE_FIELDS = [
  {
    "name": 'runId',
    "type": 'STRING',
    "description": 'git SHA and uuid for the benchmark run'
  },
  {
    "name": 'benchmarkId',
    "type": 'STRING',
    "description": 'id of the benchmark'
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
  },
  {
    "name": 'stable',
    "type": 'BOOLEAN',
    "description": 'whether this entry was part of the stable sample'
  },
  {
    "name": 'params',
    "type": 'RECORD',
    "description": 'parameters of the benchmark',
    "mode": 'REPEATED',
    "fields": [
      {
        "name": 'name',
        "type": 'STRING',
        "description": 'param name'
      },
      {
        "name": 'strvalue',
        "type": 'STRING',
        "description": 'param value for strings'
      },
      {
        "name": 'numvalue',
        "type": 'FLOAT',
        "description": 'param value for numbers'
      }
    ]
  },
  {
    "name": 'metrics',
    "type": 'RECORD',
    "description": 'metrics of the benchmark',
    "mode": 'REPEATED',
    "fields": [
      {
        "name": 'name',
        "type": 'STRING',
        "description": 'metric name'
      },
      {
        "name": 'value',
        "type": 'FLOAT',
        "description": 'metric value'
      }
    ]
  }
];

class CloudReporter {
  constructor(benchmarkConfig) {
    this.tableConfig = createTableConfig(benchmarkConfig);
    this.authConfig = benchmarkConfig.cloudReporter.auth;
    this.benchmarkConfig = benchmarkConfig;
    this.allSample = [];
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
      return getOrCreateTable(self.authClient, self.tableConfig);
    });
  }
  add(data) {
    this.allSample.push(data);
  }
  end(stableSample) {
    var self = this;
    var flow = browser.driver.controlFlow();
    var allRows = this.allSample.map(function(data) {
      return self._convertToTableRow(data, stableSample);
    });
    flow.execute(function() {
      return insertRows(self.authClient, self.tableConfig, allRows)
    });
  }
  _convertToTableRow(benchpressRow, stableSample) {
    var tableRow = {
      runId: this.benchmarkConfig.runId,
      benchmarkId: this.benchmarkConfig.id,
      index: benchpressRow.index,
      creationTime: new Date(),
      browser: this.browserUserAgent,
      forceGc: benchpressRow.forceGc,
      stable: stableSample.indexOf(benchpressRow) >= 0,
      params: this.benchmarkConfig.params.map(function(param) {
        if (typeof param.value === 'number') {
          return {
            name: param.name,
            numvalue: param.value
          };
        } else {
          return {
            name: param.name,
            strvalue: ''+param.value
          }
        }
      }),
      metrics: this.benchmarkConfig.metrics.map(function(metricName, index) {
        return {
          name: metricName,
          value: benchpressRow.values[index]
        };
      })
    };
    return tableRow;
  }
}

function createTableConfig(benchmarkConfig) {
  return {
    projectId: benchmarkConfig.cloudReporter.projectId,
    datasetId: benchmarkConfig.cloudReporter.datasetId,
    table: {
      id: benchmarkConfig.cloudReporter.tableId,
      fields: TABLE_FIELDS
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