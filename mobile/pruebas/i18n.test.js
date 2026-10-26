import assert from 'node:assert/strict'
import { test } from 'node:test'

import { TEXTOS, traducir } from '../src/i18n/traducir.js'

function claves(objeto, prefijo = '') {
  return Object.entries(objeto).flatMap(([clave, valor]) =>
    typeof valor === 'object' ? claves(valor, `${prefijo}${clave}.`) : [`${prefijo}${clave}`],
  )
}

test('español e inglés tienen exactamente las mismas claves', () => {
  assert.deepEqual(claves(TEXTOS.en).sort(), claves(TEXTOS.es).sort())
})

test('ningún texto está vacío', () => {
  for (const idioma of ['es', 'en']) {
    for (const clave of claves(TEXTOS[idioma])) {
      assert.ok(traducir(TEXTOS[idioma], clave).trim(), `${idioma}: ${clave} está vacío`)
    }
  }
})

test('las variables {x} son las mismas en ambos idiomas', () => {
  const variables = (texto) => (texto.match(/\{\w+\}/g) || []).sort()
  for (const clave of claves(TEXTOS.es)) {
    assert.deepEqual(variables(traducir(TEXTOS.en, clave)), variables(traducir(TEXTOS.es, clave)), clave)
  }
})

test('traducir reemplaza variables y avisa claves inexistentes', () => {
  assert.equal(traducir(TEXTOS.es, 'explorar.lugaresAyuda', { total: 25 }), '25 lugares en Santiago')
  assert.equal(traducir(TEXTOS.en, 'explorar.lugaresAyuda', { total: 25 }), '25 places in Santiago')
  assert.equal(traducir(TEXTOS.es, 'no.existe'), 'no.existe')
  assert.equal(traducir(TEXTOS.es, 'explorar.saludo'), 'Hola, {nombre} · ¿A dónde vamos hoy?')
})
