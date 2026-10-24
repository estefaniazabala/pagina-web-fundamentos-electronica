/* ============================================
   coulomb.js: calculadora del Módulo 2
   F = k · |q1 · q2| / r²
   ============================================ */
(function () {
  'use strict';

  function iniciar(raiz) {
    const q1In = raiz.querySelector('#cou-q1');
    const q1U = raiz.querySelector('#cou-q1u');
    const q2In = raiz.querySelector('#cou-q2');
    const q2U = raiz.querySelector('#cou-q2u');
    const rIn = raiz.querySelector('#cou-r');
    const rU = raiz.querySelector('#cou-ru');
    const kSel = raiz.querySelector('#cou-k');
    const error = raiz.querySelector('#cou-error');
    const salida = raiz.querySelector('#cou-salida');
    if (!q1In || !q1U || !q2In || !q2U || !rIn || !rU || !kSel || !error || !salida) return;

    const MENSAJE_RANGO = 'Los valores son demasiado grandes o demasiado pequeños para calcular. Revisa los números y las unidades.';

    // Texto de la unidad elegida en un <select> (por ejemplo "µC").
    function etiqueta(selector) {
      return selector.options[selector.selectedIndex].text;
    }

    // Un paso del procedimiento (usa las clases .paso de components.css).
    function paso(n, rotulo, contenido) {
      return '<div class="paso"><span class="n">' + n + '</span>' +
             '<div class="contenido-paso"><span class="rotulo">' + rotulo + '</span> ' + contenido + '</div></div>';
    }

    function calcular() {
      Utils.limpiarError(error);
      [q1In, q2In, rIn].forEach(campo => Utils.marcarInvalido(campo, false));
      salida.innerHTML = '';

      // 1. Leer y validar lo que escribió la persona.
      const q1 = Utils.leerNumero(q1In.value);
      const q2 = Utils.leerNumero(q2In.value);
      const r = Utils.leerNumero(rIn.value);
      const problemas = [];

      if (!Number.isFinite(q1)) {
        Utils.marcarInvalido(q1In, true);
        problemas.push('La carga q\u2081 debe ser un número. Ejemplos: 3, -5, 2.5 o 1e-6.');
      }
      if (!Number.isFinite(q2)) {
        Utils.marcarInvalido(q2In, true);
        problemas.push('La carga q\u2082 debe ser un número. Ejemplos: 3, -5, 2.5 o 1e-6.');
      }
      if (!Number.isFinite(r)) {
        Utils.marcarInvalido(rIn, true);
        problemas.push('La distancia r debe ser un número. Ejemplos: 20, 0.5 o 3e-2.');
      } else if (r <= 0) {
        Utils.marcarInvalido(rIn, true);
        problemas.push('La distancia r debe ser mayor que cero.');
      }
      if (problemas.length) {
        Utils.mostrarError(error, problemas.join(' '));
        return;
      }

      // 2. Convertir a unidades del SI (C y m).
      const k = Number(kSel.value);
      const q1SI = q1 * Number(q1U.value);
      const q2SI = q2 * Number(q2U.value);
      const rSI = r * Number(rU.value);
      const r2 = rSI * rSI;
      const producto = q1SI * q2SI;

      const fueraDeRango =
        !Number.isFinite(q1SI) || !Number.isFinite(q2SI) || !Number.isFinite(rSI) ||
        !(r2 > 0) || !Number.isFinite(r2) || !Number.isFinite(producto) ||
        (q1SI !== 0 && q2SI !== 0 && producto === 0);

      if (fueraDeRango) {
        Utils.mostrarError(error, MENSAJE_RANGO);
        return;
      }

      // 3. Calcular.
      const numerador = k * Math.abs(producto);
      const F = numerador / r2;
      if (!Number.isFinite(F)) {
        Utils.mostrarError(error, MENSAJE_RANGO);
        return;
      }

      // 4. Decidir si atrae o repele (se usa el signo de las cargas).
      let tipo;
      let interpretacion;
      if (q1SI === 0 || q2SI === 0) {
        tipo = 'Sin fuerza';
        interpretacion = 'Una de las cargas es cero, así que no hay fuerza eléctrica entre ellas.';
      } else if (Math.sign(q1SI) === Math.sign(q2SI)) {
        const signo = q1SI > 0 ? 'positivas' : 'negativas';
        tipo = 'Fuerza repulsiva';
        interpretacion = 'Las dos cargas son ' + signo + ' (mismo signo): la fuerza es <strong>repulsiva</strong> y las cargas se alejan.';
      } else {
        tipo = 'Fuerza atractiva';
        interpretacion = 'Las cargas tienen signos opuestos: la fuerza es <strong>atractiva</strong> y las cargas se acercan.';
      }

      // 5. Mostrar resultado y procedimiento.
      const f = Utils.formatear;
      const esc = Utils.escapeHtml;

      salida.innerHTML =
        '<div class="resultado" style="margin-top:0">F = ' + f(F) + ' N &nbsp;·&nbsp; ' + tipo + '</div>' +
        paso(1, 'Datos.',
          'q\u2081 = ' + esc(q1In.value.trim()) + ' ' + esc(etiqueta(q1U)) +
          '; q\u2082 = ' + esc(q2In.value.trim()) + ' ' + esc(etiqueta(q2U)) +
          '; r = ' + esc(rIn.value.trim()) + ' ' + esc(etiqueta(rU)) +
          '; k = ' + f(k) + ' N·m²/C².') +
        paso(2, 'Fórmula.', 'F = k · |q\u2081 · q\u2082| / r²') +
        paso(3, 'Conversión.',
          'q\u2081 = ' + f(q1SI) + ' C; q\u2082 = ' + f(q2SI) + ' C; r = ' + f(rSI) + ' m.') +
        paso(4, 'Sustitución.',
          'F = (' + f(k) + ') · |(' + f(q1SI) + ')(' + f(q2SI) + ')| / (' + f(rSI) + ')²') +
        paso(5, 'Operaciones.',
          '<br>|q\u2081 · q\u2082| = ' + f(Math.abs(producto)) + ' C²' +
          '<br>k · |q\u2081 · q\u2082| = ' + f(numerador) +
          '<br>r² = ' + f(r2) + ' m²' +
          '<br>F = ' + f(numerador) + ' / ' + f(r2) + ' = ' + f(F)) +
        paso(6, 'Resultado.', '<div class="resultado">F = ' + f(F) + ' N</div>') +
        paso(7, 'Interpretación.', interpretacion);
    }

    // Se recalcula al escribir o al cambiar una unidad.
    [q1In, q2In, rIn].forEach(campo => campo.addEventListener('input', calcular));
    [q1U, q2U, rU, kSel].forEach(selector => selector.addEventListener('change', calcular));

    // Botones de ejemplo: rellenan los campos y calculan.
    raiz.querySelectorAll('button[data-q1]').forEach(boton => {
      boton.addEventListener('click', () => {
        q1In.value = boton.dataset.q1;
        q1U.value = boton.dataset.u1;
        q2In.value = boton.dataset.q2;
        q2U.value = boton.dataset.u2;
        rIn.value = boton.dataset.r;
        rU.value = boton.dataset.ur;
        calcular();
      });
    });

    calcular();
  }

  // main.js ejecuta esta función cada vez que se abre el Módulo 2.
  window.ModuloInit['m2-coulomb'] = iniciar;
})();