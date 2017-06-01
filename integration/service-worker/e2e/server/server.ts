import express = require('express');

export function create(port: number, harnessPath: string): Promise<Server> {
  return new Promise((resolve, reject) => {
    let server;
    server = new Server(port, harnessPath, () => {
      console.log('SERVER RUNNING');
      resolve(server);
    });
  });
}

export class Server {
  app: any;
  server: any;
  
  responses: Object = {};
  delays: Object = {};

  constructor(port: number, harnessPath: string, readyCallback: Function) {
    this.app = express();
    this.app.use(express.static(harnessPath));
    this.server = this.app.listen(port, () => readyCallback());
    this.app.get('/index2.html', (req, resp) => {
      resp.redirect(301, '/index.html');
    });
    this.app.post('/ngsw-log', (req, resp) => {
      let content = '';
      req.on('data', data => content += data);
      req.on('end', () => console.log('SW: ' + content));
      resp.send('ok');
    });
  }

  addResponse(url: string, response: string, delayMs?: number) {
    let urlExisted = this.responses.hasOwnProperty(url);

    // Add the response.
    this.responses[url] = response;
    this.delays[url] = (!!delayMs ? delayMs : undefined);

    if (urlExisted) {
      // A handler for this URL is already registered.
      return;
    }

    // Register a handler for the URL, that doesn't use the response
    // passed but instead return  
    this.app.get(url, (req, resp) => {
      let response = this.responses[url];
      let delay = this.delays[url];
      if (!response) {
        return;
      }
      if (!!delay) {
        setTimeout(() => resp.send(response), delay);
      } else {
        resp.send(response);
      }
    });
  }

  clearResponses() {
    this.responses = {};
  }

  shutdown() {
    this.server.close();
  }
}