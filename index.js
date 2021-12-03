const express = require('express');
const { Octokit } = require('@octokit/core');
const app = express();
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const path = require('path');
const { writeFile } = require('fs');

app.use(express.static(path.join(__dirname, 'build')));

app.use(express.json());
app.post('/payload', async (req, res) => {
  const { body = {} } = req;
  const { env } = process;
  if (body.hasOwnProperty('commits')) {
    const { after: ref } = body;
    const owner = env.GITHUB_OWNER, repo = env.GITHUB_REPO;
    const options = { owner, repo, ref };
    const index = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      ...options,
      path: 'index.html'
    });
    const js = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      ...options,
      path: '/js'
    });
    const css = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      ...options,
      path: '/css'
    });
    (() => {
      let { content, encoding, name } = index;
      let path = path.join(__dirname, 'build', name);
      console.log(path, name);
      writeFile(path, content, encoding, () => {

      });
    })();
    if (Array.isArray(js)) {
      js.forEach(script => {
        let { content, encoding, name } = script;
        let path = path.join(__dirname, 'build', 'js', name);
        writeFile(path, content, encoding, () => {

        });
      });
    }
    if (Array.isArray(css)) {
      css.forEach(style => {
        let { content, encoding, name } = style;
        let path = path.join(__dirname, 'build', 'css', name);
        writeFile(path, content, encoding, () => {

        });
      });
    }
  }
});

app.listen(process.env.PORT || 3000);