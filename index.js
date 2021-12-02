const express = require('express');
const { Octokit } = require('@octokit/core');
const app = express();
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const path = require('path');

app.use(express.static(path.join(__dirname, 'build')));

app.use(express.json());
app.post('/payload', async (req, res) => {
  const { body = {} } = req;
  if (body.hasOwnProperty('commits')) {
    const { after: ref } = body;
    const owner = 'sceenius', repo = process.env.GITHUB_REPO;
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
  }
});

app.listen(process.env.PORT || 3000);