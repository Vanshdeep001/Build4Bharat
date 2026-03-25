export function extractBodyInner(html) {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  return match?.[1] ?? html
}

