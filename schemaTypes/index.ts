import {businessSchemaTypes} from './business'
import {siteObjectTypes} from './objects'
import {siteDocumentTypes} from './site'

export const siteSchemaTypes = [...siteObjectTypes, ...siteDocumentTypes]
export {businessSchemaTypes}
