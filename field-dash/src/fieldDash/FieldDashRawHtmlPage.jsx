import { useMemo } from 'react'
import { prepareFieldDashHtml } from './prepareFieldDashHtml'

export default function FieldDashRawHtmlPage({ rawHtml }) {
  const preparedHtml = useMemo(
    () => prepareFieldDashHtml(rawHtml),
    [rawHtml],
  )

  return <div dangerouslySetInnerHTML={{ __html: preparedHtml }} />
}

