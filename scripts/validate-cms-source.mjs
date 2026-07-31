import console from 'node:console'
import process from 'node:process'
import {readFile} from 'node:fs/promises'

const files = {
  config: await readFile('sanity.config.ts', 'utf8'),
  shell: await readFile('studio/EsmeraStudioLayout.tsx', 'utf8'),
  shared: await readFile('dashboard/operational/shared.tsx', 'utf8'),
  dashboard: await readFile('dashboard/operational/SiteDashboardPage.tsx', 'utf8'),
  reports: await readFile('dashboard/operational/ReportsPage.tsx', 'utf8'),
}

const operationalFiles = [
  'dashboard/operational/SiteDashboardPage.tsx',
  'dashboard/operational/SiteContentPage.tsx',
  'dashboard/operational/SiteProductsPage.tsx',
  'dashboard/operational/SiteProductEditorPage.tsx',
  'dashboard/operational/SiteCategoriesPage.tsx',
  'dashboard/operational/CustomersPage.tsx',
  'dashboard/operational/SalesPage.tsx',
  'dashboard/operational/PipelinePage.tsx',
  'dashboard/operational/AfterSalesPage.tsx',
  'dashboard/operational/ReportsPage.tsx',
]

const operational = (await Promise.all(operationalFiles.map((file) => readFile(file, 'utf8')))).join('\n')
const hasTypedBusinessErrors =
  files.shared.includes('export type LoadErrorCode') &&
  files.shared.includes("'missing_dataset'") &&
  files.shared.includes("'forbidden'") &&
  files.shared.includes("'query_failed'")

const assertions = [
  [files.config.includes("title: 'Admin técnico'"), 'Structure Tool precisa estar rotulado como Admin técnico.'],
  [hasTypedBusinessErrors, 'Estados de erro do dataset precisam ser tipados.'],
  [files.shared.includes('Dados comerciais indisponíveis'), 'Falha Business precisa ser visível para o usuário.'],
  [files.dashboard.includes('Fonte Business indisponível'), 'Dashboard não pode converter indisponibilidade do Business em zero.'],
  [files.dashboard.includes('Não configurado'), 'Analytics sem fonte precisa ser mostrado como não configurado.'],
  [!files.shell.includes('@import'), 'Fontes não podem usar @import em createGlobalStyle.'],
  [!operational.includes('href="#"'), 'Nenhum controle operacional pode apontar apenas para #.'],
  [!operational.includes('15%'), 'Percentual demonstrativo de tráfego não pode voltar ao código operacional.'],
  [!operational.includes('+12%'), 'Tendência fixa de relatório não pode voltar ao código operacional.'],
  [!operational.includes('6,2 dias'), 'Tempo médio demonstrativo não pode voltar ao código operacional.'],
  [!operational.includes('48%'), 'Conversão fixa não pode voltar ao código operacional.'],
  [!operational.includes('22%'), 'Conversão fixa não pode voltar ao código operacional.'],
]

const failed = assertions.filter(([condition]) => !condition)
if (failed.length) {
  for (const [, message] of failed) console.error(`✗ ${message}`)
  process.exit(1)
}

for (const [, message] of assertions) console.log(`✓ ${message}`)
