const express = require('express');
const { Octokit } = require('@octokit/core');
const app = express();
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const path = require('path');
const http = require('http');
const { writeFile } = require('fs');

app.use(express.static(path.join(__dirname, 'build')));

app.use(express.json());
app.get('/outlets/:outlets/state', (req, res) => {
  const { headers, method, params: { outlets } } = req;
  const options = {
    hostname: '201.182.226.142',
    port: '5000',
    path: `/restapi/relay/outlets/${outlets}/state`,
    method,
    headers
  };
  const request = http.request(options);
  request.on('data', (data) => {
    res.json(JSON.parse(data));
  });
  request.on('error', () => {
    res.status(500).end();
  });
  request.end();
});
app.put('/outlets/:outlets/state', (req, res) => {
  const { body, headers, method, params: { outlets } } = req;
  const options = {
    hostname: '201.182.226.142',
    port: '5000',
    path: `/restapi/relay/outlets/${outlets}/state`,
    method,
    headers
  };
  const request = http.request(options);
  request.on('data', (data) => {
    res.send(data);
  });
  request.on('error', () => {
    res.status(500).end();
  });
  request.write(new TextEncoder().encode(
    JSON.stringify(body)
  ));
  request.end();
});
app.post('/payload', async (req, res) => {
  const { body = {} } = req;
  const { env } = process;
  if (body.hasOwnProperty('commits')) {
    const { after: ref } = body;
    const owner = env.GITHUB_OWNER, repo = env.GITHUB_REPO;
    const options = { owner, repo, ref };
    const { data: index } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      ...options,
      path: 'index.html'
    });
    const { data: js } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      ...options,
      path: '/js'
    });
    const { data: css } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      ...options,
      path: '/css'
    });
    (() => {
      let { content, encoding, name } = index;
      let filename = path.join(__dirname, 'build', name);
      console.log(filename, name);
      writeFile(filename, content, encoding, () => {

      });
    })();
    if (Array.isArray(js)) {
      js.forEach(async script => {
        let { path: pathname } = script;
        let { data: { content, encoding, name } } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          ...options,
          path: pathname
        });
        let filename = path.join(__dirname, 'build', 'js', name);
        writeFile(filename, content, encoding, () => {

        });
      });
    }
    if (Array.isArray(css)) {
      css.forEach(async style => {
        let { path: pathname } = style;
        let { data: { content, encoding, name } } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          ...options,
          path: pathname
        });
        let filename = path.join(__dirname, 'build', 'css', name);
        writeFile(filename, content, encoding, () => {

        });
      });
    }
  }
});

app.listen(process.env.PORT || 3000);