import fetch from "node-fetch";
import * as yaml from "js-yaml";
import * as fs from "fs";

const GITHUB_API_BASE_URL = "https://api.github.com";

interface ActionStatusConfig {
  owner: string;
  repos: string[];
  authToken: string;
}
interface ActionStatusData {
  workflow_runs: GitHubAction[],
}
interface GitHubAction {
  id: number;
  name: string,
  status: string,
  conclusion: string,
}
async function getActionStatus(owner: string, repos: string[], authToken: string) {
  const results: Record<string, string> = {};
  for (const repo of repos) {
    const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/actions/runs`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/vnd.github.v3+json",
      }
    });
    const data = await res.json() as ActionStatusData;
    const latestAction: GitHubAction = data.workflow_runs[0];
    results[repo] = latestAction.status;
  }
  return results;
}

async function main() {
  try {
    const config = yaml.load(fs.readFileSync("config.yaml", "utf-8")) as ActionStatusConfig;
    const { owner, repos, authToken } = config;
    const results = await getActionStatus(owner, repos, authToken);
    console.log(results);
  } catch (err) {
    console.log(err);
  }
}