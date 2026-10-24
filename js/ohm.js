/* ============================================
   ohm.js: calculadora V = I · R
   ============================================ */
(function () {
  'use strict';

  function texto(valor, unidad) {
    return Utils.formatear(valor) + ' ' + unidad;
  }

  function iniciar(raiz) {
    const vIn = raiz.querySelector('#ohm-v');
    const iIn = raiz.querySelector('#ohm-i');
    const rIn = raiz.querySelector('#ohm-r');
    const vU = raiz.querySelector('#ohm-vu');
    const iU = raiz.querySelector('#ohm-iu');
    const rU = raiz.querySelector('#ohm-ru');
    const error = raiz.querySelector('#ohm-error');
    const salida = raiz.querySelector('#ohm-salida');
    if (!vIn || !iIn || !rIn || !vU || !iU || !rU || !error || !salida) return;

    function etiqueta(sel) { return sel.options[sel.selectedIndex].text; }

    function paso(n, rotulo, contenido) {
      return '<div class="paso"><span class="n">' + n + '</span>' +
             '<div class="contenido-paso"><span class="rotulo">' + rotulo + '</span> ' + contenido + '</div></div>';
    }

    function leerCampo(input) {
      const t = input.value.trim();
      if (t === '') return { vacio: true };
      const n = Utils.leerNumero(t);
      return { vacio: false, n: n };
    }

    function calcular() {
      Utils.limpiarError(error);
      [vIn, iIn, rIn].forEach(c => Utils.marcarInvalido(c, false));
      const vL = leerCampo(vIn);
      const iL = leerCampo(iIn);
      const rL = leerCampo(rIn);
      const vacios = [vL, iL, rL].filter(x => x.vacio).length;
      const problemas = [];

      if (vacios !== 1) {
        Utils.mostrarError(error, 'Deja exactamente un campo vacío (el que quieres calcular) y llena los otros dos.');
        salida.innerHTML = '';
        return;
      }
      if (!vL.vacio && !Number.isFinite(vL.n)) { Utils.marcarInvalido(vIn, true); problemas.push('V debe ser un número.'); }
      if (!iL.vacio && (!Number.isFinite(iL.n) || iL.n === 0) && !rL.vacio) {
        /* I se usa para hallar R o V; I = 0 solo vale para hallar V */
      }
      if (!iL.vacio && !Number.isFinite(iL.n)) { Utils.marcarInvalido(iIn, true); problemas.push('I debe ser un número.'); }
      if (!rL.vacio && !Number.isFinite(rL.n)) { Utils.marcarInvalido(rIn, true); problemas.push('R debe ser un número.'); }
      if (!rL.vacio && rL.n <= 0) { Utils.marcarInvalido(rIn, true); problemas.push('R debe ser mayor que cero.'); }
      if (!iL.vacio && iL.n === 0 && vL.vacio) { Utils.marcarInvalido(iIn, true); problemas.push('Si I = 0 no se puede despejar R (división entre cero).'); }
      if (problemas.length) {
        Utils.mostrarError(error, problemas.join(' '));
        salida.innerHTML = '';
        return;
      }

      const vSI = vL.vacio ? null : vL.n * Number(vU.value);
      const iSI = iL.vacio ? null : iL.n * Number(iU.value);
      const rSI = rL.vacio ? null : rL.n * Number(rU.value);

      let incognita, formula, valor, unidad, interpretacion, operaciones;

      if (vL.vacio) {
        if (iSI === 0) {
          incognita = 'V'; formula = 'V = I · R'; valor = 0; unidad = 'V';
          operaciones = '0 × ' + Utils.formatear(rSI) + ' = 0';
          interpretacion = 'Sin corriente no hay caída de voltaje en la resistencia.';
        } else {
          incognita = 'V'; formula = 'V = I · R'; valor = iSI * rSI; unidad = 'V';
          operaciones = Utils.formatear(iSI) + ' × ' + Utils.formatear(rSI) + ' = ' + Utils.formatear(valor);
          interpretacion = 'El voltaje es el producto de la corriente (en A) por la resistencia (en Ω).';
        }
      } else if (iL.vacio) {
        incognita = 'I'; formula = 'I = V / R'; valor = vSI / rSI; unidad = 'A';
        operaciones = Utils.formatear(vSI) + ' / ' + Utils.formatear(rSI) + ' = ' + Utils.formatear(valor);
        interpretacion = 'A mayor resistencia, menor corriente para el mismo voltaje.';
      } else {
        if (iSI === 0) {
          Utils.marcarInvalido(iIn, true);
          Utils.mostrarError(error, 'No se puede calcular R con corriente cero.');
          salida.innerHTML = '';
          return;
        }
        incognita = 'R'; formula = 'R = V / I'; valor = vSI / iSI; unidad = 'Ω';
        operaciones = Utils.formatear(vSI) + ' / ' + Utils.formatear(iSI) + ' = ' + Utils.formatear(valor);
        interpretacion = 'La resistencia es el cociente entre el voltaje y la corriente.';
      }

      if (!Number.isFinite(valor)) {
        Utils.mostrarError(error, 'El resultado se sale de rango. Revisa los números y las unidades.');
        salida.innerHTML = '';
        return;
      }

      const datos = [];
      if (!vL.vacio) datos.push('V = ' + Utils.escapeHtml(vIn.value.trim()) + ' ' + etiqueta(vU) + ' = ' + texto(vSI, 'V'));
      if (!iL.vacio) datos.push('I = ' + Utils.escapeHtml(iIn.value.trim()) + ' ' + etiqueta(iU) + ' = ' + texto(iSI, 'A'));
      if (!rL.vacio) datos.push('R = ' + Utils.escapeHtml(rIn.value.trim()) + ' ' + etiqueta(rU) + ' = ' + texto(rSI, 'Ω'));

      salida.innerHTML =
        '<div class="resultado" style="margin-top:0">' + incognita + ' = ' + texto(valor, unidad) + '</div>' +
        paso(1, 'Datos.', datos.join('; ') + '.') +
        paso(2, 'Fórmula.', formula) +
        paso(3, 'Conversión.', 'Se opera en V, A y Ω.') +
        paso(4, 'Operaciones.', operaciones) +
        paso(5, 'Resultado.', '<div class="resultado">' + incognita + ' = ' + texto(valor, unidad) + '</div>') +
        paso(6, 'Interpretación.', interpretacion);
    }

    [vIn, iIn, rIn].forEach(c => c.addEventListener('input', calcular));
    [vU, iU, rU].forEach(s => s.addEventListener('change', calcular));
    raiz.querySelectorAll('button[data-v]').forEach(boton => {
      boton.addEventListener('click', () => {
        vIn.value = boton.dataset.v;
        iIn.value = boton.dataset.i;
        rIn.value = boton.dataset.r;
        vU.value = boton.dataset.vu;
        iU.value = boton.dataset.iu;
        rU.value = boton.dataset.ru;
        calcular();
      });
    });
    calcular();
  }

  window.ModuloInit['m4-ohm'] = iniciar;
})();
