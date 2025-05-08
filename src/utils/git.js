import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import * as fs from 'fs';

export async function initRepo() {
  await git.init({ fs, dir: '.' });
}

export async function createBranch(branchName) {
  await git.branch({ fs, dir: '.', ref: branchName });
  await git.checkout({ fs, dir: '.', ref: branchName });
}

export async function addAndCommit(message) {
  await git.add({ fs, dir: '.', filepath: '.' });
  await git.commit({
    fs,
    dir: '.',
    message,
    author: {
      name: 'Bolt User',
      email: 'user@example.com'
    }
  });
}