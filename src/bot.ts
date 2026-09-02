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
