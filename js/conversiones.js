/* ============================================
   conversiones.js: enteros entre bases 2, 8, 10, 16
   ============================================ */
(function () {
  'use strict';

  const DIGITOS = '0123456789ABCDEF';
  const NOMBRE = { 2: 'binario', 8: 'octal', 10: 'decimal', 16: 'hexadecimal' };

  function parsear(texto, base) {
    const limpio = String(texto).trim().replace(/\s+/g, '').toUpperCase();
    if (!limpio) return { error: 'Escribe un número.' };
    const permitidos = DIGITOS.slice(0, base);
    for (let i = 0; i < limpio.length; i++) {
      if (permitidos.indexOf(limpio[i]) === -1) {
        return { error: '"' + limpio[i] + '" no es un dígito válido en base ' + base + '. Usa solo ' + permitidos.split('').join(', ') + '.' };
      }
    }
    if (limpio.length > 16) return { error: 'Usa como máximo 16 dígitos para que los pasos se puedan leer.' };
    const valor = parseInt(limpio, base);
    if (!Number.isSafeInteger(valor)) return { error: 'El número es demasiado grande para esta calculadora.' };
    return { texto: limpio, valor: valor };
  }

  function aBase(n, base) {
    if (n === 0) return '0';
    let x = n;
    let out = '';
    while (x > 0) {
      out = DIGITOS[x % base] + out;
      x = Math.floor(x / base);
    }
    return out;
  }

  function pasosADecimal(texto, base) {
    const digs = texto.split('');
    const n = digs.length;
    const partes = digs.map((d, i) => {
      const pot = n - 1 - i;
      const val = parseInt(d, 16);
      return d + '×' + base + '<sup>' + pot + '</sup> = ' + (val * Math.pow(base, pot));
    });
    return 'Valor posicional:<br>' + partes.join('<br>');
  }

  function pasosDesdeDecimal(n, base) {
    if (n === 0) return '0 dividido entre ' + base + ' da resto 0.';
    const filas = [];
    let x = n;
    while (x > 0) {
      const r = x % base;
      const q = Math.floor(x / base);
      filas.push(x + ' ÷ ' + base + ' = ' + q + ', resto ' + DIGITOS[r]);
      x = q;
    }
    return 'Divisiones sucesivas (restos de abajo hacia arriba):<br>' + filas.join('<br>');
  }

  function agrupar(bin, tam) {
    let s = bin.replace(/^0+/, '') || '0';
    while (s.length % tam !== 0) s = '0' + s;
    const grupos = s.match(new RegExp('.{1,' + tam + '}', 'g'));
    return grupos;
  }

  function pasosAgrupados(bin, hacia) {
    const tam = hacia === 8 ? 3 : 4;
    const grupos = agrupar(bin, tam);
    const mapa = grupos.map(g => g + ' → ' + aBase(parseInt(g, 2), hacia));
    return 'Se agrupa el binario de ' + tam + ' en ' + tam + ' desde la derecha:<br>' + mapa.join('<br>');
  }

  function iniciar(raiz) {
    const num = raiz.querySelector('#conv-num');
    const desde = raiz.querySelector('#conv-desde');
    const hacia = raiz.querySelector('#conv-hacia');
    const error = raiz.querySelector('#conv-error');
    const salida = raiz.querySelector('#conv-salida');
    if (!num || !desde || !hacia || !error || !salida) return;

    function calcular() {
      Utils.limpiarError(error);
      Utils.marcarInvalido(num, false);
      const b1 = Number(desde.value);
      const b2 = Number(hacia.value);
      const leido = parsear(num.value, b1);
      if (leido.error) {
        Utils.marcarInvalido(num, true);
        Utils.mostrarError(error, leido.error);
        salida.innerHTML = '';
        return;
      }
      const resultado = aBase(leido.valor, b2);
      const bin = aBase(leido.valor, 2);

      let procedimiento;
      if (b1 === b2) {
        procedimiento = 'Origen y destino son la misma base: el número no cambia.';
      } else if (b1 === 10) {
        procedimiento = pasosDesdeDecimal(leido.valor, b2);
      } else if (b2 === 10) {
        procedimiento = pasosADecimal(leido.texto, b1);
      } else if (b1 === 2 && (b2 === 8 || b2 === 16)) {
        procedimiento = pasosAgrupados(leido.texto, b2);
      } else if ((b1 === 8 || b1 === 16) && b2 === 2) {
        const tam = b1 === 8 ? 3 : 4;
        const partes = leido.texto.split('').map(d => {
          let bits = aBase(parseInt(d, 16), 2);
          while (bits.length < tam) bits = '0' + bits;
          return d + ' → ' + bits;
        });
        procedimiento = 'Cada dígito se pasa a ' + tam + ' bits:<br>' + partes.join('<br>');
      } else {
        procedimiento = 'Camino: ' + NOMBRE[b1] + ' → binario → ' + NOMBRE[b2] + '.<br>' +
          'Binario intermedio: ' + bin + '.<br>' + pasosAgrupados(bin, b2);
      }

      salida.innerHTML =
        '<div class="resultado" style="margin-top:0">' + Utils.escapeHtml(leido.texto) +
        '<sub>' + b1 + '</sub> = <strong>' + resultado + '</strong><sub>' + b2 + '</sub></div>' +
        '<div style="margin-top:10px">' + procedimiento + '</div>' +
        '<div style="margin-top:8px;color:var(--texto-suave)">En decimal: ' + leido.valor + '</div>';
    }

    num.addEventListener('input', calcular);
    desde.addEventListener('change', calcular);
    hacia.addEventListener('change', calcular);
    raiz.querySelectorAll('button[data-n]').forEach(boton => {
      boton.addEventListener('click', () => {
        num.value = boton.dataset.n;
        desde.value = boton.dataset.d;
        hacia.value = boton.dataset.h;
        calcular();
      });
    });
    calcular();
  }

  window.ModuloInit['m5-sistemas'] = iniciar;
})();
