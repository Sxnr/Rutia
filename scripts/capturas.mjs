import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const BASE = process.env.BASE || 'http://localhost:5175/'
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const capturas = path.join(root, 'anexos', 'capturas')
const laminas = path.join(root, 'anexos', 'laminas')
mkdirSync(capturas, { recursive: true })
mkdirSync(laminas, { recursive: true })

const GASTRONOMIA = ['emporio', 'patio bellavista']

async function main() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  const shot = (n) => page.screenshot({ path: path.join(capturas, `${n}.png`) })

  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Museo Nacional', { timeout: 15000 })
  await page.waitForTimeout(400)
  await shot('01-explorar')

  // Preferencias
  await page.getByText('Crear Ruta', { exact: true }).click()
  await page.waitForSelector('text=Tiempo disponible', { timeout: 8000 })
  await page.$eval('input[type=range]', (el) => {
    const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    set.call(el, '4')
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await page.getByText('$15.000', { exact: true }).click()
  await page.locator('button', { hasText: 'Histórico' }).click()
  await page.locator('button', { hasText: 'Gastronomía' }).click()
  await page.waitForTimeout(300)
  await shot('02-preferencias')

  // Generar ruta
  await page.getByText('Generar Ruta', { exact: false }).click()
  await page.waitForSelector('text=Tu itinerario', { timeout: 15000 })
  await page.waitForFunction(() => !document.querySelector('.animate-spin'), null, { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(700)

  // Resultados de la ruta
  const res = await page.evaluate(() => {
    const badge = document.querySelector('div[class*="bg-white/95"]')
    const spans = badge ? [...badge.querySelectorAll('span')].map(s => s.textContent.trim()) : []
    const nombres = [...document.querySelectorAll('.space-y-3 p.text-sm.font-extrabold')].map(e => e.textContent.trim())
    return { dur: spans[0] || null, costo: spans[2] || null, paradas: nombres }
  })
  const hayGastro = res.paradas.some(n => GASTRONOMIA.some(g => n.toLowerCase().includes(g)))
  console.log('RUTA:', JSON.stringify(res, null, 2))
  console.log('¿Incluye restaurante (Gastronomía)?', hayGastro)

  await shot('03-ruta-inicio')
  await page.evaluate(() => {
    const el = document.querySelector('.no-scrollbar')
    if (el) el.scrollTo(0, el.scrollHeight); else window.scrollTo(0, document.body.scrollHeight)
  })
  await page.waitForTimeout(400)
  await shot('04-ruta-final')

  if (!hayGastro) {
    console.error('ABORTADO: la ruta no incluye ningún restaurante. No armo láminas.')
    await browser.close()
    process.exit(2)
  }

  // Marcar 3 lugares como visitados
  const labels = page.locator('.space-y-3 label')
  for (let i = 0; i < Math.min(3, await labels.count()); i++) await labels.nth(i).click()
  await page.waitForTimeout(300)

  // Guardar ruta -> Guardados (pestaña rutas)
  await page.getByText('Guardar ruta', { exact: true }).click()
  await page.waitForSelector('text=Rutas guardadas', { timeout: 8000 })
  await page.waitForTimeout(500)
  await shot('05-guardados-ruta')

  // Pestaña lugares visitados
  await page.getByText('Lugares visitados', { exact: true }).click()
  await page.waitForTimeout(500)
  await shot('06-guardados-visitados')

  // Detalle del lugar (Ver detalle desde la ruta guardada)
  await page.getByText('Rutas guardadas', { exact: true }).click()
  await page.waitForTimeout(300)
  await page.getByText('Ver detalle', { exact: true }).first().click()
  await page.waitForSelector('text=Detalle del lugar', { timeout: 8000 })
  await page.waitForTimeout(400)
  await shot('07-detalle')

  // Perfil
  await page.getByText('Perfil', { exact: true }).click()
  await page.waitForSelector('text=Mi Perfil', { timeout: 8000 })
  await page.waitForTimeout(300)
  await shot('08-perfil')

  // Editar datos
  await page.locator('button', { hasText: 'Editar mis datos' }).click()
  await page.waitForTimeout(400)
  await shot('09-editar-datos')

  writeFileSync(path.join(capturas, 'ruta-daniel.json'), JSON.stringify({ caso: 'Daniel: 4h, $15.000, Museos+Gastronomía', ...res, hayGastro }, null, 2))

  await browser.close()
  await armarLaminas()
  console.log('LISTO: capturas + láminas generadas.')
}

async function armarLaminas() {
  const A = [
    ['01-explorar', 'Explorar'],
    ['02-preferencias', 'Preferencias'],
    ['03-ruta-inicio', 'Ruta sugerida (inicio)'],
    ['04-ruta-final', 'Ruta sugerida (final)'],
  ]
  const B = [
    ['05-guardados-ruta', 'Guardados · Rutas'],
    ['06-guardados-visitados', 'Guardados · Visitados'],
    ['07-detalle', 'Detalle del lugar'],
    ['08-perfil', 'Perfil'],
    ['09-editar-datos', 'Editar datos'],
  ]
  await renderLamina(A, 'Lámina A · Flujo principal', 'lamina-a')
  await renderLamina(B, 'Lámina B · Guardados y perfil', 'lamina-b')
}

async function renderLamina(items, titulo, nombre) {
  const IMG = 280
  const GAP = 24
  const PAD = 32
  const width = Math.ceil(items.length * IMG + (items.length - 1) * GAP + PAD * 2)
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  const figs = items.map(([f, label]) => `
    <figure><img src="file://${path.join(capturas, f)}.png" width="${IMG}"/><figcaption>${label}</figcaption></figure>`).join('')
  const html = `<!doctype html><meta charset="utf-8"><style>
    *{box-sizing:border-box}
    body{margin:0;background:#142C50;font-family:system-ui,sans-serif;padding:${PAD}px}
    h2{color:#E0A526;font-size:20px;margin:0 0 ${GAP}px;font-weight:800;letter-spacing:.3px}
    .row{display:flex;gap:${GAP}px;align-items:flex-start}
    figure{margin:0;width:${IMG}px}
    img{width:${IMG}px;border-radius:20px;border:3px solid #fff;display:block}
    figcaption{color:#fff;font-size:14px;font-weight:700;text-align:center;margin-top:12px;line-height:1.3}
  </style><h2>${titulo}</h2><div class="row">${figs}</div>`
  await page.setContent(html, { waitUntil: 'load' })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(laminas, `${nombre}.png`), fullPage: true })
  await browser.close()
}

main().catch(e => { console.error(e); process.exit(1) })
