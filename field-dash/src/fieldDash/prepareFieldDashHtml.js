import { FIELD_DASH_NAV_HREF_ORDER } from './fieldDashRoutes'
import { extractBodyInner } from './extractBodyInner'

function rewriteNavLinksInBodyInner(bodyInner) {
  const doc = new DOMParser().parseFromString(
    `<body>${bodyInner}</body>`,
    'text/html',
  )

  // Field-dash pages use `<nav>...</nav>` for the left navigation.
  // We rewrite only `nav a[href="#"]` so buttons/links elsewhere stay untouched.
  const navAnchors = Array.from(doc.querySelectorAll('nav a[href="#"]'))

  navAnchors.forEach((a, idx) => {
    if (idx >= FIELD_DASH_NAV_HREF_ORDER.length) return
    a.setAttribute('href', FIELD_DASH_NAV_HREF_ORDER[idx])
  })

  return doc.body.innerHTML
}

export function prepareFieldDashHtml(rawHtml) {
  const bodyInner = extractBodyInner(rawHtml)
  return rewriteNavLinksInBodyInner(bodyInner)
}

