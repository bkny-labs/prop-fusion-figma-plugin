export class GitHubIntegration {
  private authToken: string;

  constructor(authToken: string) {
    this.authToken = authToken;
  }

  async getRepositories() {
    const response = await fetch('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `token ${this.authToken}`,
      },
    });
    return response.json();
  }

  async synchronize(owner: string, repo: string, branch: string = 'main') {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents?ref=${branch}`, {
      headers: {
        'Authorization': `token ${this.authToken}`,
      },
    });
    return response.json();
  }

  async createBranch(owner: string, repo: string, branch: string) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`, {
      headers: {
        'Authorization': `token ${this.authToken}`,
      },
    });
    const { object: { sha } } = await response.json();
    await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: `refs/heads/${branch}`,
        sha,
      }),
    });
  }

  async commitAndPush(owner: string, repo: string, branch: string, path: string, message: string, content: string) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
      headers: {
        'Authorization': `token ${this.authToken}`,
      },
    });
    const { sha } = await response.json();
    await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${this.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: btoa(content),
        sha,
        branch,
      }),
    });
  }

  async createPullRequest(owner: string, repo: string, title: string, body: string, head: string, base: string = 'main') {
    await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        body,
        head,
        base,
      }),
    });
  }
}