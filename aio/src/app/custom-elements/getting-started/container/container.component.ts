import { Component } from '@angular/core';

@Component({
  selector: 'aio-gs-container',
  template: `
    <table>
      <thead>
        <tr>
          <th>Template</th>
          <th>Data</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <pre><ng-content select=".template"></ng-content></pre>
          </td>
          <td>
            <code><ng-content select=".data"></ng-content></code>
          </td>
          <td><ng-content select=".result"></ng-content></td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [
    `
    pre {
      margin: 0;
    }

    code {
      display: flex;
      align-items: center;
    }

    @media only screen and (max-width: 760px),
    (min-device-width: 768px) and (max-device-width: 1024px)  {
      /* Force table to not be like tables anymore */
      table, thead, tbody, th, td, tr {
        display: block;
      }

      /* Hide table headers (but not display: none;, for accessibility) */
      thead tr {
        position: absolute;
        top: -9999px;
        left: -9999px;
      }

      tr { border: 1px solid #ccc; }

      td {
        /* Behave  like a "row" */
        border: none;
        border-bottom: 1px solid #eee;
        position: relative;
        padding-top: 10%;
      }

      td:before {
        /* Now like a table header */
        position: absolute;
        /* Top/left values mimic padding */
        top: 6px;
        left: 6px;
        width: 45%;
        padding-right: 10px;
      }

      /* Label the data */
      td:nth-of-type(1):before { content: "Template"; }
      td:nth-of-type(2):before { content: "Data"; }
      td:nth-of-type(3):before { content: "Result"; }
    }
    `
  ]
})
export class ContainerComponent { }
