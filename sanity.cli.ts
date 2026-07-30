import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'u60dwmhb',
    dataset: 'production'
  },
  deployment: {
    // O blueprint pede versões controladas entre produção e preview.
    // O Studio é empacotado com a versão declarada no package.json.
    autoUpdates: false,
  },
})
