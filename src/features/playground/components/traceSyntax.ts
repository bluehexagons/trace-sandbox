const traceTokenPattern =
  /#[^\n]*|@[^@\n]*@|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\bwhile\b|\b\d+(?:\.\d+)?\b|(?:\+\+|--|\*\*|%%|\+=|-=|\*=|%%=|\*\*=|=>|==|!=|>=|<=|&&|\|\||\+-|[+\-*/%=<>?:|~!&])|\b[A-Za-z_]\w*\b/g;

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function tokenClass(token: string, code: string, offset: number) {
  if (token.startsWith('#')) return 'syntax-comment';
  if (token.startsWith('@')) return 'syntax-echo';
  if (token.startsWith('"') || token.startsWith("'")) return 'syntax-string';
  if (/^\d/.test(token)) return 'syntax-number';
  if (token === 'while') return 'syntax-keyword';
  if (/^[A-Za-z_]\w*$/.test(token) && /^\s*\(/.test(code.slice(offset + token.length))) {
    return 'syntax-function';
  }
  if (
    /^(?:\+\+|--|\*\*|%%|\+=|-=|\*=|%%=|\*\*=|=>|==|!=|>=|<=|&&|\|\||\+-|[+\-*/%=<>?:|~!&])$/.test(
      token,
    )
  ) {
    return 'syntax-operator';
  }
  return 'syntax-variable';
}

export function highlightTrace(code: string) {
  let output = '';
  let cursor = 0;

  for (const match of code.matchAll(traceTokenPattern)) {
    const token = match[0];
    const offset = match.index;
    if (token === undefined || offset === undefined) continue;

    output += escapeHtml(code.slice(cursor, offset));
    output += `<span class="${tokenClass(token, code, offset)}">${escapeHtml(token)}</span>`;
    cursor = offset + token.length;
  }

  return output + escapeHtml(code.slice(cursor));
}
