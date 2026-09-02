import { getDomain } from 'tldts'
import { Resolver } from 'node:dns/promises'

const resolver = new Resolver()
resolver.setServers(['1.1.1.1', '8.8.8.8'])

export async function checkTxt(pkg: string, github_username: string) {
  const hostname = parsePackage(pkg)
  if (hostname === null || hostname === '') return false
  const txts = await resolver.resolveTxt(hostname)
  for (const y of txts) {
    for (const x of y) {
      if (!x.startsWith('lsposed-modules-repo-verification=')) continue
      const content = x.split('=', 2)[1]
      if (content.toLowerCase() === github_username.toLowerCase()) return true
    }
  }
  return false
}

function parsePackage(pkg: string) {
  return getDomain(pkg.split('.').reverse().join('.'))
}

export function matchPages(pkg: string, github_username: string) {
  return pkg.toLowerCase().startsWith(`io.github.${github_username.toLowerCase()}.`)
}

export function recognizeTitle(title: string) {
  const match = title.match(/^\[([^\]]+)]\s*(.*?)\s*$/)
  if (match) {
    match[1] = match[1].toLowerCase()
    if ([
      'submission',
      'transfer',
      'appeal',
      'issue',
      'suggestion'
    ].indexOf(match[1]) !== -1) {
      if (match[1] === 'submission' || match[1] === 'transfer') {
        return {
          type: checkPackageName(match[2]) ? match[1] : 'invalid',
          title: match[2]
        }
      }
      return {
        type: match[1],
        title: match[2]
      }
    }
  }
  return {
    type: '',
    title
  }
}

export function checkPackageName(packageName: string) {
  if (!packageName.match(/\./)) return false
  const groups = packageName.split('.')
  for (const group of groups) {
    if (!group.match(/^[a-zA-Z_][a-zA-Z_0-9]*$/) || group.toLowerCase() === 'example') return false
  }
  const blacklist = ['com.android', 'com.google', 'org.lsposed', 'io.github.lsposed', 'com.xiaomi', 'com.android', 'com.chrome']
  for (const item of blacklist) {
    if (packageName.toLowerCase().startsWith(item)) return false
  }
  return true
}
