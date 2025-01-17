const { context, GitHub } = require('@actions/github')

function getPrNumber () {
  const pullRequest = context.payload.pull_request
  if (!pullRequest) {
    return undefined
  }

  return pullRequest.number
}

function getIssueNumber () {
  const issue = context.payload.issue
  if (!issue) {
    return undefined
  }

  return issue.number
}

function getRepo () {
  return context.repo
}

async function getIssue (token) {
  const octokit = new GitHub(token)
  let issueNumber
  if (getIssueNumber() !== undefined) {
    issueNumber = getIssueNumber()
  } else if (getPrNumber() !== undefined) {
    issueNumber = getPrNumber()
  } else {
    throw new Error('No Issue Provided')
  }

  const { data } = await octokit.issues.get({
    ...getRepo(),
    issue_number: issueNumber
  })

  return data
}

async function createAndInviteToRepo (token, owner, username, repo) {
  const octokit = new GitHub(token)
  try {
    await octokit.repos.createInOrg({
      org: owner,
      name: repo
    })
  } catch (err) {
    let e = err
    if (e.name === 'HttpError') e = e.response.data
    if (e && e.errors && e.errors.length && e.errors[0].field === 'name') {
      return false
    }
    console.log('嘤嘤嘤', JSON.stringify(err))
    throw err
  }
  for (let i = 0; i < 3; i++) {
    try {
      await octokit.repos.addCollaborator({
        owner,
        repo,
        username,
        permission: 'admin'
      })
      break;
    } catch (err) {
      let e = err
      if (e.status == 404) {
        await new Promise(r => setTimeout(r, 2000));
        continue
      }
      if (e.name === 'HttpError') e = e.response.data
      if (e && e.errors && e.errors.length && e.errors[0].field === 'name') {
        return false
      }
      console.log('呜呜呜', JSON.stringify(err))
      throw err
    }
  }
  return true
}

async function addLabel (token, owner, repo, issueNumber, label) {
  const octokit = new GitHub(token)
  await octokit.issues.addLabels({
    owner,
    repo,
    issue_number: issueNumber,
    labels: [label]
  })
}

async function leaveComment (token, owner, repo, issueNumber, comment) {
  const octokit = new GitHub(token)
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body: comment
  })
}

async function closeIssue (token, owner, repo, issueNumber) {
  const octokit = new GitHub(token)
  await octokit.issues.update({
    owner,
    repo,
    issue_number: issueNumber,
    state: 'closed'
  })
}

module.exports = {
  getRepo,
  getIssue,
  createAndInviteToRepo,
  addLabel,
  leaveComment,
  closeIssue
}
