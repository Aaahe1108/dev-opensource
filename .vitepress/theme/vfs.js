import ROOT from './vfs.json'

export { ROOT }

/** 把路径字符串切成段（忽略空段与 '.'） */
export function normalizePath(pathStr) {
  return String(pathStr).split('/').filter((s) => s && s !== '.')
}

export function pathOf(segs) {
  return '/' + segs.join('/')
}

/**
 * 解析路径：支持绝对路径、相对路径、'~'（-> /home）、'.' 与 '..'
 * 返回段数组（'..' 会真的向上跳）
 */
export function resolvePath(cwd, target) {
  let base
  let rest
  if (target.startsWith('/')) {
    base = []
    rest = target.slice(1)
  } else if (target === '~' || target.startsWith('~/')) {
    base = ['home']
    rest = target.slice(1).replace(/^\//, '')
  } else {
    base = normalizePath(cwd)
    rest = target
  }
  const stack = [...base]
  for (const seg of rest.split('/')) {
    if (!seg || seg === '.') continue
    if (seg === '..') stack.pop()
    else stack.push(seg)
  }
  return stack
}

/** 按路径查找节点，找不到返回 null */
export function findNode(pathStr) {
  const segs = normalizePath(pathStr)
  let node = ROOT
  for (const seg of segs) {
    const child = (node.children || []).find((c) => c.name === seg)
    if (!child) return null
    node = child
  }
  return node
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 展开 glob（支持 '*'，如 /etc/licenses/*），返回 [{ node, path }]
 * 只返回文件节点。
 */
export function expandGlob(cwd, pattern) {
  const segs = resolvePath(cwd, pattern)
  const results = []
  const walk = (node, idx, cur) => {
    if (idx >= segs.length) {
      if (node.type === 'file') results.push({ node, path: pathOf(cur) })
      return
    }
    const seg = segs[idx]
    if (seg.includes('*')) {
      const re = new RegExp('^' + seg.split('*').map(escapeRegExp).join('.*') + '$')
      for (const child of node.children || []) {
        if (re.test(child.name)) walk(child, idx + 1, [...cur, child.name])
      }
    } else {
      const child = (node.children || []).find((c) => c.name === seg)
      if (child) walk(child, idx + 1, [...cur, child.name])
    }
  }
  walk(ROOT, 0, [])
  return results
}
