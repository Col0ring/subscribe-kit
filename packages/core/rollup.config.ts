import { createBaseConfig } from '../../build/rollup.base.config'

import pkg from './package.json' assert { type: 'json' }

export default createBaseConfig(pkg)
