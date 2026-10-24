/* ============================================
   resistencias.js: Módulo 3
   Código de colores y equivalente serie/paralelo
   ============================================ */
(function () {
  'use strict';

  const COLORES = {
    negro:    { nombre: 'Negro',    hex: '#111827', digito: 0,    exp: 0,    tol: null },
    marron:   { nombre: 'Marrón',   hex: '#92400e', digito: 1,    exp: 1,    tol: 1 },
    rojo:     { nombre: 'Rojo',     hex: '#dc2626', digito: 2,    exp: 2,    tol: 2 },
    naranja:  { nombre: 'Naranja',  hex: '#ea580c', digito: 3,    exp: 3,    tol: null },
    amarillo: { nombre: 'Amarillo', hex: '#eab308', digito: 4,    exp: 4,    tol: null },
    verde:    { nombre: 'Verde',    hex: '#16a34a', digito: 5,    exp: 5,    tol: 0.5 },
    azul:     { nombre: 'Azul',     hex: '#2563eb', digito: 6,    exp: 6,    tol: 0.25 },
    violeta:  { nombre: 'Violeta',  hex: '#7c3aed', digito: 7,    exp: 7,    tol: 0.1 },
    gris:     { nombre: 'Gris',     hex: '#6b7280', digito: 8,    exp: 8,    tol: 0.05 },
    blanco:   { nombre: 'Blanco',   hex: '#f8fafc', digito: 9,    exp: 9,    tol: null },
    oro:      { nombre: 'Oro',      hex: '#d4a017', digito: null, exp: -1,   tol: 5 },
    plata:    { nombre: 'Plata',    hex: '#c0c7d1', digito: null, exp: -2,   tol: 10 }
  };

  const DIGITOS = ['negro', 'marron', 'rojo', 'naranja', 'amarillo', 'verde', 'azul', 'violeta', 'gris', 'blanco'];
  const MULTIPLICADORES = DIGITOS.concat(['oro', 'plata']);
  const TOLERANCIAS = ['marron', 'rojo', 'verde', 'azul', 'violeta', 'gris', 'oro', 'plata'];
  const TOL_A_COLOR = { 5: 'oro', 10: 'plata', 1: 'marron', 2: 'rojo' };

  function opciones(ids, modo) {
    return ids.map(id => {
      const c = COLORES[id];
      let extra = '';
      if (modo === 'digito') extra = ' (' + c.digito + ')';
      if (modo === 'mult') extra = ' (× 10' + superindice(c.exp) + ')';
      if (modo === 'tol' && c.tol != null) extra = ' (±' + c.tol + ' %)';
      return '<option value="' + id + '">' + c.nombre + extra + '</option>';
    }).join('');
  }

  function superindice(n) {
    const map = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
    return String(n).split('').map(ch => map[ch] || ch).join('');
  }

  function textoOhmios(ohmios) {
    const a = Math.abs(ohmios);
    if (a >= 1e6) return Utils.formatear(ohmios / 1e6) + ' MΩ';
    if (a >= 1e3) return Utils.formatear(ohmios / 1e3) + ' kΩ';
    return Utils.formatear(ohmios) + ' Ω';
  }

  function dibujarResistencia(ids) {
    const xs = [118, 158, 198, 258];
    const bandas = ids.map((id, i) => {
      const c = COLORES[id];
      return '<rect x="' + xs[i] + '" y="28" width="18" height="64" fill="' + c.hex + '" stroke="#1e293b" stroke-width="0.6"/>';
    }).join('');
    return `
      <svg class="resistor-svg" viewBox="0 0 400 120" role="img" aria-label="Resistencia de cuatro bandas">
        <line x1="16" y1="60" x2="70" y2="60" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <line x1="330" y1="60" x2="384" y2="60" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
        <rect x="70" y="24" width="260" height="72" rx="18" fill="#e8c07a" stroke="#92400e" stroke-width="3"/>
        ${bandas}
      </svg>`;
  }

  function iniciarColores(raiz) {
    const b1 = raiz.querySelector('#res-b1');
    const b2 = raiz.querySelector('#res-b2');
    const b3 = raiz.querySelector('#res-b3');
    const b4 = raiz.querySelector('#res-b4');
    const lienzo = raiz.querySelector('#res-lienzo');
    const error = raiz.querySelector('#res-error');
    const salida = raiz.querySelector('#res-salida');
    if (!b1 || !b2 || !b3 || !b4 || !lienzo || !error || !salida) return;

    b1.innerHTML = opciones(DIGITOS, 'digito');
    b2.innerHTML = opciones(DIGITOS, 'digito');
    b3.innerHTML = opciones(MULTIPLICADORES, 'mult');
    b4.innerHTML = opciones(TOLERANCIAS, 'tol');
    b1.value = 'amarillo';
    b2.value = 'violeta';
    b3.value = 'rojo';
    b4.value = 'oro';

    function calcular() {
      Utils.limpiarError(error);
      const c1 = COLORES[b1.value];
      const c2 = COLORES[b2.value];
      const c3 = COLORES[b3.value];
      const c4 = COLORES[b4.value];
      lienzo.innerHTML = dibujarResistencia([b1.value, b2.value, b3.value, b4.value]);

      const dosCifras = 10 * c1.digito + c2.digito;
      const valor = dosCifras * Math.pow(10, c3.exp);
      if (!Number.isFinite(valor)) {
        Utils.mostrarError(error, 'Ese combinación produce un valor fuera de rango.');
        salida.innerHTML = '';
        return;
      }
      const tol = c4.tol;
      const min = valor * (1 - tol / 100);
      const max = valor * (1 + tol / 100);
      salida.innerHTML =
        '<div>Cifras: ' + c1.digito + ' y ' + c2.digito + ' → <strong>' + dosCifras + '</strong></div>' +
        '<div>Multiplicador: × 10<sup>' + c3.exp + '</sup></div>' +
        '<div class="resultado">Valor nominal = ' + textoOhmios(valor) + ' &nbsp;±&nbsp;' + tol + ' %</div>' +
        '<div>Rango válido: ' + textoOhmios(min) + ' a ' + textoOhmios(max) + '</div>';
    }

    [b1, b2, b3, b4].forEach(sel => sel.addEventListener('change', calcular));
    raiz.querySelectorAll('button[data-b1]').forEach(boton => {
      boton.addEventListener('click', () => {
        b1.value = boton.dataset.b1;
        b2.value = boton.dataset.b2;
        b3.value = boton.dataset.b3;
        b4.value = boton.dataset.b4;
        calcular();
      });
    });
    calcular();
  }

  function iniciarInverso(raiz) {
    const valorIn = raiz.querySelector('#inv-val');
    const unidad = raiz.querySelector('#inv-u');
    const tolSel = raiz.querySelector('#inv-tol');
    const error = raiz.querySelector('#inv-error');
    const salida = raiz.querySelector('#inv-salida');
    if (!valorIn || !unidad || !tolSel || !error || !salida) return;

    function calcular() {
      Utils.limpiarError(error);
      Utils.marcarInvalido(valorIn, false);
      const n = Utils.leerNumero(valorIn.value);
      if (!Number.isFinite(n) || n <= 0) {
        Utils.marcarInvalido(valorIn, true);
        Utils.mostrarError(error, 'Escribe un valor positivo. Ejemplos: 4.7, 220, 1.');
        salida.innerHTML = '';
        return;
      }
      const ohmios = n * Number(unidad.value);
      // Dos cifras significativas: valor = (10*d1 + d2) * 10^exp
      const exp10 = Math.floor(Math.log10(ohmios));
      const exp = exp10 - 1;
      const cifras = Math.round(ohmios / Math.pow(10, exp));
      if (cifras < 10 || cifras > 99) {
        Utils.mostrarError(error, 'Este valor no se representa bien con dos cifras (código de 4 bandas). Prueba 4.7, 220 o 1 kΩ.');
        salida.innerHTML = '';
        return;
      }
      const reconstruido = cifras * Math.pow(10, exp);
      const rel = Math.abs(reconstruido - ohmios) / ohmios;
      if (rel > 0.02) {
        Utils.mostrarError(error, 'Ese número no es un valor de dos cifras exactas. La herramienta propone el más cercano: ' + textoOhmios(reconstruido) + '.');
      }
      const d1 = Math.floor(cifras / 10);
      const d2 = cifras % 10;
      if (exp < -2 || exp > 9) {
        Utils.mostrarError(error, 'El multiplicador queda fuera de la tabla de 4 bandas.');
        salida.innerHTML = '';
        return;
      }
      const id1 = DIGITOS[d1];
      const id2 = DIGITOS[d2];
      const id3 = MULTIPLICADORES.find(id => COLORES[id].exp === exp);
      const id4 = TOL_A_COLOR[Number(tolSel.value)];
      if (!id3 || !id4) {
        Utils.mostrarError(error, 'No hay colores para esa combinación.');
        salida.innerHTML = '';
        return;
      }
      salida.innerHTML =
        dibujarResistencia([id1, id2, id3, id4]) +
        '<div>Bandas: <strong>' + COLORES[id1].nombre + '</strong>, <strong>' + COLORES[id2].nombre + '</strong>, <strong>' +
        COLORES[id3].nombre + '</strong>, <strong>' + COLORES[id4].nombre + '</strong></div>' +
        '<div class="resultado">' + textoOhmios(reconstruido) + ' ± ' + COLORES[id4].tol + ' %</div>';
    }

    valorIn.addEventListener('input', calcular);
    unidad.addEventListener('change', calcular);
    tolSel.addEventListener('change', calcular);
    calcular();
  }

  function iniciarEquivalente(raiz) {
    const modo = raiz.querySelector('#eq-modo');
    const campos = ['#eq-r1', '#eq-r2', '#eq-r3', '#eq-r4'].map(s => raiz.querySelector(s));
    const error = raiz.querySelector('#eq-error');
    const salida = raiz.querySelector('#eq-salida');
    if (!modo || campos.some(c => !c) || !error || !salida) return;

    function paso(n, rotulo, contenido) {
      return '<div class="paso"><span class="n">' + n + '</span>' +
             '<div class="contenido-paso"><span class="rotulo">' + rotulo + '</span> ' + contenido + '</div></div>';
    }

    function calcular() {
      Utils.limpiarError(error);
      campos.forEach(c => Utils.marcarInvalido(c, false));
      const valores = [];
      const problemas = [];
      campos.forEach((campo, i) => {
        const texto = campo.value.trim();
        if (texto === '' && i >= 2) return;
        const n = Utils.leerNumero(texto);
        if (!Number.isFinite(n) || n <= 0) {
          Utils.marcarInvalido(campo, true);
          problemas.push('R' + (i + 1) + ' debe ser un número mayor que cero.');
        } else {
          valores.push(n);
        }
      });
      if (valores.length < 2) problemas.push('Hace falta al menos dos resistencias.');
      if (problemas.length) {
        Utils.mostrarError(error, problemas.join(' '));
        salida.innerHTML = '';
        return;
      }

      const lista = valores.map((v, i) => 'R' + (i + 1) + ' = ' + textoOhmios(v)).join(', ');
      let req;
      let operaciones;
      if (modo.value === 'serie') {
        req = valores.reduce((a, b) => a + b, 0);
        operaciones = valores.map(v => Utils.formatear(v)).join(' + ') + ' = ' + Utils.formatear(req);
      } else {
        const sumaInv = valores.reduce((a, b) => a + 1 / b, 0);
        req = 1 / sumaInv;
        operaciones = valores.map(v => '1/' + Utils.formatear(v)).join(' + ') +
          ' = ' + Utils.formatear(sumaInv) + '<br>R<sub>eq</sub> = 1 / ' + Utils.formatear(sumaInv) + ' = ' + Utils.formatear(req);
      }

      salida.innerHTML =
        '<div class="resultado" style="margin-top:0">R<sub>eq</sub> = ' + textoOhmios(req) + '</div>' +
        paso(1, 'Datos.', lista + '. Conexión: ' + (modo.value === 'serie' ? 'serie' : 'paralelo') + '.') +
        paso(2, 'Fórmula.', modo.value === 'serie'
          ? 'R<sub>eq</sub> = R₁ + R₂ + …'
          : '1/R<sub>eq</sub> = 1/R₁ + 1/R₂ + …') +
        paso(3, 'Operaciones.', operaciones) +
        paso(4, 'Resultado.', '<div class="resultado">R<sub>eq</sub> = ' + textoOhmios(req) + '</div>') +
        paso(5, 'Interpretación.', modo.value === 'serie'
          ? 'En serie la equivalente es mayor que cualquiera de las resistencias sueltas.'
          : 'En paralelo la equivalente es menor que la resistencia más pequeña (' + textoOhmios(Math.min.apply(null, valores)) + ').');
    }

    modo.addEventListener('change', calcular);
    campos.forEach(c => c.addEventListener('input', calcular));
    raiz.querySelectorAll('button[data-modo]').forEach(boton => {
      boton.addEventListener('click', () => {
        modo.value = boton.dataset.modo;
        campos[0].value = boton.dataset.r1;
        campos[1].value = boton.dataset.r2;
        campos[2].value = boton.dataset.r3;
        campos[3].value = boton.dataset.r4;
        calcular();
      });
    });
    calcular();
  }

  window.ModuloInit['m3-resistencias'] = function (raiz) {
    iniciarColores(raiz);
    iniciarInverso(raiz);
    iniciarEquivalente(raiz);
  };
})();
