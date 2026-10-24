/* ============================================
   cargas.js: herramientas del Módulo 1
   - Simulador de cargas (atracción y repulsión)
   - Constructor de iones
   ============================================ */
(function () {
  'use strict';

  const E = 1.602176634e-19; // carga elemental, en coulombs

  /* ---------- Simulador de cargas ---------- */
  function iniciarSimulador(raiz) {
    const selQ1 = raiz.querySelector('#sim-q1');
    const selQ2 = raiz.querySelector('#sim-q2');
    const rango = raiz.querySelector('#sim-dist');
    const lienzo = raiz.querySelector('#sim-lienzo');
    const mensaje = raiz.querySelector('#sim-mensaje');
    const valorDist = raiz.querySelector('#sim-dist-valor');
    if (!selQ1 || !selQ2 || !rango || !lienzo || !mensaje || !valorDist) return;

    const COLOR = { '+': '#dc2626', '-': '#2563eb', '0': '#64748b' };
    const SIGNO = { '+': '+', '-': '\u2212', '0': '0' };

    function flecha(x1, x2, y) {
      return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#0d9488" stroke-width="5" stroke-linecap="round" marker-end="url(#sim-punta)"/>`;
    }

    function carga(cx, cy, r, tipo) {
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${COLOR[tipo]}"/>` +
             `<text x="${cx}" y="${cy + 9}" text-anchor="middle" font-family="Inter, sans-serif" font-size="26" font-weight="700" fill="#ffffff">${SIGNO[tipo]}</text>`;
    }

    function dibujar() {
      const q1 = selQ1.value;
      const q2 = selQ2.value;
      const d = Number(rango.value);
      valorDist.textContent = d;

      const separacion = 150 + d * 30;       // distancia entre centros, en píxeles
      const x1 = 320 - separacion / 2;
      const x2 = 320 + separacion / 2;
      const r = 26;
      const y = 90;
      const hueco = separacion - 2 * r;

      let tipo, texto;
      if (q1 === '0' || q2 === '0') {
        tipo = 'ninguna';
        texto = 'Hay un cuerpo neutro: no hay atracción ni repulsión eléctrica entre ellos.';
      } else if (q1 === q2) {
        tipo = 'repulsion';
        texto = q1 === '+'
          ? 'Las dos cargas son positivas: se repelen (las fuerzas las alejan).'
          : 'Las dos cargas son negativas: se repelen (las fuerzas las alejan).';
      } else {
        tipo = 'atraccion';
        texto = 'Las cargas tienen signos opuestos: se atraen (las fuerzas las acercan).';
      }

      // Cuanto más cerca, más larga la flecha (solo es una idea visual).
      const L = Math.max(18, Math.min(hueco / 2 - 6, 90 / d + 12));

      let flechas = '';
      if (tipo === 'repulsion') {
        flechas = flecha(x1 - r - 4, x1 - r - 4 - L, y) + flecha(x2 + r + 4, x2 + r + 4 + L, y);
      } else if (tipo === 'atraccion') {
        flechas = flecha(x1 + r + 4, x1 + r + 4 + L, y) + flecha(x2 - r - 4, x2 - r - 4 - L, y);
      }

      lienzo.innerHTML = `
        <svg viewBox="0 0 640 180" role="img" aria-label="${texto}">
          <defs>
            <marker id="sim-punta" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="3.5" markerHeight="3.5" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#0d9488"/>
            </marker>
          </defs>
          ${flechas}
          ${carga(x1, y, r, q1)}
          ${carga(x2, y, r, q2)}
          <text x="${x1}" y="146" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" fill="#64748b">Carga 1</text>
          <text x="${x2}" y="146" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" fill="#64748b">Carga 2</text>
        </svg>`;
      mensaje.textContent = texto;
    }

    selQ1.addEventListener('change', dibujar);
    selQ2.addEventListener('change', dibujar);
    rango.addEventListener('input', dibujar);
    dibujar();
  }

  /* ---------- Constructor de iones ---------- */
  function iniciarConstructorIones(raiz) {
    const inP = raiz.querySelector('#ion-p');
    const inE = raiz.querySelector('#ion-e');
    const error = raiz.querySelector('#ion-error');
    const salida = raiz.querySelector('#ion-salida');
    if (!inP || !inE || !error || !salida) return;

    function calcular() {
      Utils.limpiarError(error);
      Utils.marcarInvalido(inP, false);
      Utils.marcarInvalido(inE, false);
      salida.innerHTML = '';

      const p = Utils.leerNumero(inP.value);
      const e = Utils.leerNumero(inE.value);
      const problemas = [];

      if (!Number.isInteger(p) || p < 1 || p > 118) {
        Utils.marcarInvalido(inP, true);
        problemas.push('Los protones deben ser un número entero entre 1 y 118.');
      }
      if (!Number.isInteger(e) || e < 0 || e > 150) {
        Utils.marcarInvalido(inE, true);
        problemas.push('Los electrones deben ser un número entero entre 0 y 150.');
      }
      if (problemas.length) {
        Utils.mostrarError(error, problemas.join(' '));
        return;
      }

      const neta = p - e;
      const signo = neta > 0 ? '+' : (neta < 0 ? '\u2212' : '');
      const netaTexto = signo + Math.abs(neta);
      const cantidad = Math.abs(neta);
      const palabra = cantidad === 1 ? 'electrón' : 'electrones';

      let tipo, detalle;
      if (neta === 0) {
        tipo = 'Átomo neutro';
        detalle = 'Tiene la misma cantidad de protones y de electrones.';
      } else if (neta > 0) {
        tipo = 'Catión (ion positivo)';
        detalle = `Perdió ${cantidad} ${palabra} respecto al átomo neutro.`;
      } else {
        tipo = 'Anión (ion negativo)';
        detalle = `Ganó ${cantidad} ${palabra} respecto al átomo neutro.`;
      }

      salida.innerHTML = `
        <div>Carga neta = protones − electrones = ${p} − ${e} = <strong>${netaTexto}</strong> (en unidades de e)</div>
        <div>q = (${netaTexto}) × 1.602 × 10<sup>\u221219</sup> C = <strong>${Utils.formatear(neta * E)} C</strong></div>
        <div style="margin-top:8px"><strong>${tipo}.</strong> ${detalle}</div>`;
    }

    inP.addEventListener('input', calcular);
    inE.addEventListener('input', calcular);

    raiz.querySelectorAll('button[data-p]').forEach(boton => {
      boton.addEventListener('click', () => {
        inP.value = boton.dataset.p;
        inE.value = boton.dataset.e;
        calcular();
      });
    });

    calcular();
  }

  /* ---------- Registro del módulo ---------- */
  // main.js ejecuta esta función cada vez que se abre el Módulo 1.
  window.ModuloInit['m1-carga'] = function (raiz) {
    iniciarSimulador(raiz);
    iniciarConstructorIones(raiz);
  };
})();