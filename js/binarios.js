/* ============================================
   binarios.js: suma, resta y multiplicación
   ============================================ */
(function () {
  'use strict';

  function validar(texto) {
    const limpio = String(texto).trim().replace(/\s+/g, '');
    if (!limpio) return { error: 'Escribe un número binario.' };
    if (!/^[01]+$/.test(limpio)) return { error: 'Solo se admiten los dígitos 0 y 1.' };
    if (limpio.length > 12) return { error: 'Usa como máximo 12 bits para que la cuadrícula se lea bien.' };
    return { bits: limpio.replace(/^0+(?=\d)/, '') || '0' };
  }

  function pad(s, n) {
    while (s.length < n) s = '0' + s;
    return s;
  }

  function celdas(arr, clase) {
    return arr.map(x => '<span class="' + (clase || '') + '">' + x + '</span>').join('');
  }

  function grid(columnas, filasHtml) {
    return '<div class="binario-grid" style="grid-template-columns:repeat(' + columnas + ', 1.4em)">' + filasHtml + '</div>';
  }

  function sumar(a, b) {
    const n = Math.max(a.length, b.length);
    const A = pad(a, n).split('').map(Number);
    const B = pad(b, n).split('').map(Number);
    const suma = [];
    const acarreos = new Array(n + 1).fill('');
    let c = 0;
    for (let i = n - 1; i >= 0; i--) {
      const t = A[i] + B[i] + c;
      suma[i] = t % 2;
      c = t > 1 ? 1 : 0;
      if (c) acarreos[i] = '1';
    }
    const extra = c ? ['1'] : [];
    const resultado = extra.concat(suma).join('');
    const cols = n + 1;
    const filaC = ['<span></span>'].concat(acarreos.slice(0, n).map(x => '<span class="acarreo">' + (x || '') + '</span>')).join('');
    const filaA = ['<span></span>'].concat(A.map(d => '<span>' + d + '</span>')).join('');
    const filaB = ['<span>+</span>'].concat(B.map(d => '<span>' + d + '</span>')).join('');
    const filaR = (extra.length ? extra.map(d => '<span>' + d + '</span>') : ['<span></span>'])
      .concat(suma.map(d => '<span>' + d + '</span>')).join('');
    const html = grid(cols, filaC + filaA + filaB + '<span class="linea"></span>' + filaR);
    return { html: html, resultado: resultado.replace(/^0+(?=\d)/, '') || '0' };
  }

  function restar(a, b) {
    const va = parseInt(a, 2);
    const vb = parseInt(b, 2);
    if (va < vb) return { error: 'En este módulo la resta pide A ≥ B (sin números negativos).' };
    const n = Math.max(a.length, b.length);
    const A = pad(a, n).split('').map(Number);
    const B = pad(b, n).split('').map(Number);
    const dif = [];
    const prestamo = new Array(n).fill('');
    const trabajo = A.slice();
    for (let i = n - 1; i >= 0; i--) {
      if (trabajo[i] < B[i]) {
        let j = i - 1;
        while (j >= 0 && trabajo[j] === 0) j--;
        trabajo[j] -= 1;
        for (let k = j + 1; k < i; k++) trabajo[k] += 1;
        trabajo[i] += 2;
        prestamo[i] = '↩';
      }
      dif[i] = trabajo[i] - B[i];
    }
    const resultado = dif.join('').replace(/^0+(?=\d)/, '') || '0';
    const cols = n;
    const html = grid(cols,
      prestamo.map(x => '<span class="marca">' + x + '</span>').join('') +
      A.map(d => '<span>' + d + '</span>').join('') +
      B.map(d => '<span>' + d + '</span>').join('') +
      '<span class="linea"></span>' +
      dif.map(d => '<span>' + d + '</span>').join('')
    );
    return { html: '<div style="margin-bottom:4px;color:var(--texto-suave);font-size:0.85rem">La fila superior marca las columnas donde hubo préstamo.</div>' + html, resultado: resultado };
  }

  function multiplicar(a, b) {
    const parciales = [];
    const B = b.split('').reverse();
    for (let i = 0; i < B.length; i++) {
      if (B[i] === '1') parciales.push(a + '0'.repeat(i));
      else parciales.push('0'.repeat(a.length + i));
    }
    let acc = '0';
    const filas = [];
    filas.push(pad(a, a.length + b.length - 1).split(''));
    filas.push(('×' + pad(b, a.length + b.length - 2)).split(''));
    const ancho = a.length + b.length;
    parciales.forEach((p, i) => {
      filas.push(pad(p, ancho).split(''));
    });
    const prod = a === '0' || b === '0' ? '0' : (parseInt(a, 2) * parseInt(b, 2)).toString(2);
    const cols = ancho;
    let html = '';
    filas.forEach((fila, idx) => {
      html += fila.map(ch => '<span>' + ch + '</span>').join('');
      if (idx === 1) html += '<span class="linea"></span>';
    });
    html += '<span class="linea"></span>' + pad(prod, ancho).split('').map(ch => '<span>' + ch + '</span>').join('');
    return { html: grid(cols, html), resultado: prod };
  }

  function iniciar(raiz) {
    const aIn = raiz.querySelector('#bin-a');
    const bIn = raiz.querySelector('#bin-b');
    const op = raiz.querySelector('#bin-op');
    const error = raiz.querySelector('#bin-error');
    const salida = raiz.querySelector('#bin-salida');
    if (!aIn || !bIn || !op || !error || !salida) return;

    function calcular() {
      Utils.limpiarError(error);
      Utils.marcarInvalido(aIn, false);
      Utils.marcarInvalido(bIn, false);
      const A = validar(aIn.value);
      const B = validar(bIn.value);
      const problemas = [];
      if (A.error) { Utils.marcarInvalido(aIn, true); problemas.push(A.error); }
      if (B.error) { Utils.marcarInvalido(bIn, true); problemas.push(B.error); }
      if (problemas.length) {
        Utils.mostrarError(error, problemas.join(' '));
        salida.innerHTML = '';
        return;
      }
      let r;
      if (op.value === 'suma') r = sumar(A.bits, B.bits);
      else if (op.value === 'resta') r = restar(A.bits, B.bits);
      else r = multiplicar(A.bits, B.bits);
      if (r.error) {
        Utils.mostrarError(error, r.error);
        salida.innerHTML = '';
        return;
      }
      const da = parseInt(A.bits, 2);
      const db = parseInt(B.bits, 2);
      const signo = op.value === 'suma' ? '+' : (op.value === 'resta' ? '−' : '×');
      const dec = op.value === 'suma' ? da + db : (op.value === 'resta' ? da - db : da * db);
      salida.innerHTML =
        r.html +
        '<div class="resultado">' + A.bits + '₂ ' + signo + ' ' + B.bits + '₂ = <strong>' + r.resultado + '</strong>₂</div>' +
        '<div>Comprobación decimal: ' + da + ' ' + signo + ' ' + db + ' = ' + dec + '</div>';
    }

    aIn.addEventListener('input', calcular);
    bIn.addEventListener('input', calcular);
    op.addEventListener('change', calcular);
    raiz.querySelectorAll('button[data-a]').forEach(boton => {
      boton.addEventListener('click', () => {
        aIn.value = boton.dataset.a;
        bIn.value = boton.dataset.b;
        op.value = boton.dataset.op;
        calcular();
      });
    });
    calcular();
  }

  window.ModuloInit['m6-binarios'] = iniciar;
})();
