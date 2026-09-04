import { context, getOctokit } from '@actions/github'
import { retry } from "@octokit/plugin-retry"

export function getPrNumber() {
  const pullRequest = context.payload.pull_request
  if (!pullRequest) {
    return undefined
  }

  return pullRequest.number
}

export function getIssueNumber() {
  const issue = context.payload.issue
  if (!issue) {
    return undefined
  }

  return issue.number
}

export function getRepo() {
  return context.repo
}

export async function getIssue(token: string) {
  const octokit = getOctokit(token)
  let issueNumber = getIssueNumber()
  if (issueNumber === undefined) {
    issueNumber = getPrNumber()
  }
  if (issueNumber === undefined) {
    throw new Error('No Issue Provided')
  }

  const { data } = await octokit.rest.issues.get({
    ...getRepo(),
    issue_number: issueNumber
  })

  return data
}

export async function repoInvite(token: string, owner: string, username: string, repo: string) {
  const octokit = getOctokit(token)
  try {
    await octokit.rest.repos.addCollaborator({
      owner,
      repo,
      username,
      permission: 'maintain'
    })
  } catch (e) {
    if (typeof e === "string") {
      console.error(e)
    } else if (e instanceof Error) {
      console.error(e.message)
    } else {
      console.error(JSON.stringify(e))
    }
    return false
  }
  return true
}

export async function createAndInviteToRepo(token: string, owner: string, username: string, repo: string) {
  const octokit = getOctokit(token, {}, retry)
  try {
    await octokit.rest.repos.createInOrg({
      org: owner,
      name: repo,
      has_issues: false,
      has_projects: false,
      has_wiki: false
    })
    await octokit.rest.repos.addCollaborator({
      owner,
      repo,
      username,
      permission: 'maintain'
    })
  } catch (e) {
    if (typeof e === "string") {
      console.error(e)
    } else if (e instanceof Error) {
      console.error(e.message)
    } else {
      console.error(JSON.stringify(e))
    }
    return false
  }
  return true
}

export async function addLabel(token: string, owner: string, repo: string, issueNumber: number, label: string) {
  const octokit = getOctokit(token)
  await octokit.rest.issues.addLabels({
    owner,
    repo,
    issue_number: issueNumber,
    labels: [label]
  })
}

export async function setLabel(token: string, owner: string, repo: string, issueNumber: number, labels: string[]) {
  const octokit = getOctokit(token)
  await octokit.rest.issues.setLabels({
    owner,
    repo,
    issue_number: issueNumber,
    labels: labels
  })
}

export async function leaveComment(token: string, owner: string, repo: string, issueNumber: number, comment: string) {
  const octokit = getOctokit(token)
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body: comment
  })
}

export async function closeIssue(token: string, owner: string, repo: string, issueNumber: number, isCompleted: boolean = false) {
  const octokit = getOctokit(token)
  await octokit.rest.issues.update({
    owner,
    repo,
    issue_number: issueNumber,
    state: 'closed',
    state_reason: isCompleted ? 'completed' : 'not_planned'
  })
  await octokit.rest.issues.lock({
    owner,
    repo,
    issue_number: issueNumber,
    lock_reason: 'resolved'
  })
}

export async function lockSpamIssue(token: string, owner: string, repo: string, issueNumber: number) {
  const octokit = getOctokit(token)
  await octokit.rest.issues.lock({
    owner,
    repo,
    issue_number: issueNumber,
    lock_reason: 'spam'
  })
}

export async function orgBlockUser(token: string, owner: string, username: string) {
  const octokit = getOctokit(token)
  await octokit.rest.orgs.blockUser({
    org: owner,
    username
  })
}

export async function getUser(token: string, username: string) {
  const octokit = getOctokit(token)
  return await octokit.rest.users.getByUsername({
    username
  })
}

export async function isRepoExists(token: string, owner: string, repo: string) {
  const octokit = getOctokit(token)
  try {
    await octokit.rest.repos.get({
      owner,
      repo,
    })
    return true
  } catch (e) {
    if (typeof e === "string") {
      console.error(e)
    } else if (e instanceof Error) {
      console.error(e.message)
    } else {
      console.error(JSON.stringify(e))
    }
    return false
  }
}

export async function getUserOrgs(token: string, username: string) {
  const octokit = getOctokit(token)
  const { data } = await octokit.rest.orgs.listForUser({
    username
  })
  return data
}
