/* ============================================
   logica.js: simulador de puertas
   ============================================ */
(function () {
  'use strict';

  const FN = {
    AND:  (a, b) => a && b,
    OR:   (a, b) => a || b,
    NOT:  (a) => !a,
    NAND: (a, b) => !(a && b),
    NOR:  (a, b) => !(a || b),
    XOR:  (a, b) => a !== b,
    XNOR: (a, b) => a === b,
    ABC:  (a, b, c) => (a && b) || c
  };

  const EXPR = {
    AND: 'Y = A · B  (1 solo si A y B son 1)',
    OR: 'Y = A + B  (1 si A o B —o ambas— son 1)',
    NOT: 'Y = ¬A  (invierte A; B y C no se usan)',
    NAND: 'Y = ¬(A · B)  (lo contrario de AND)',
    NOR: 'Y = ¬(A + B)  (lo contrario de OR)',
    XOR: 'Y = A ⊕ B  (1 si A y B son distintas)',
    XNOR: 'Y = ¬(A ⊕ B)  (1 si A y B son iguales)',
    ABC: 'Y = A · B + C  (AND de A y B, luego OR con C)'
  };

  function bit(boton) {
    return boton.getAttribute('aria-pressed') === 'true';
  }

  function pintar(boton, letra) {
    const v = bit(boton) ? 1 : 0;
    boton.textContent = letra + ' = ' + v;
  }

  function iniciar(raiz) {
    const sel = raiz.querySelector('#log-puerta');
    const btnA = raiz.querySelector('#log-a');
    const btnB = raiz.querySelector('#log-b');
    const btnC = raiz.querySelector('#log-c');
    const led = raiz.querySelector('#log-y');
    const expr = raiz.querySelector('#log-expr');
    const salida = raiz.querySelector('#log-salida');
    if (!sel || !btnA || !btnB || !btnC || !led || !expr || !salida) return;

    function actualizar() {
      const puerta = sel.value;
      const a = bit(btnA);
      const b = bit(btnB);
      const c = bit(btnC);
      btnB.style.visibility = puerta === 'NOT' ? 'hidden' : 'visible';
      btnC.style.visibility = puerta === 'ABC' ? 'visible' : 'hidden';
      expr.textContent = EXPR[puerta];

      const y = puerta === 'NOT' ? FN.NOT(a) : (puerta === 'ABC' ? FN.ABC(a, b, c) : FN[puerta](a, b));
      led.textContent = 'Y = ' + (y ? 1 : 0);
      led.classList.toggle('encendida', y);

      let detalle;
      if (puerta === 'NOT') detalle = '¬' + (a ? 1 : 0) + ' = ' + (y ? 1 : 0);
      else if (puerta === 'ABC') detalle = '(' + (a ? 1 : 0) + ' · ' + (b ? 1 : 0) + ') + ' + (c ? 1 : 0) + ' = ' + (y ? 1 : 0);
      else detalle = 'Entradas A=' + (a ? 1 : 0) + ', B=' + (b ? 1 : 0) + ' → Y=' + (y ? 1 : 0);
      salida.textContent = detalle;
    }

    function toggle(boton, letra) {
      boton.addEventListener('click', () => {
        boton.setAttribute('aria-pressed', bit(boton) ? 'false' : 'true');
        pintar(boton, letra);
        actualizar();
      });
    }

    toggle(btnA, 'A');
    toggle(btnB, 'B');
    toggle(btnC, 'C');
    sel.addEventListener('change', actualizar);
    pintar(btnA, 'A');
    pintar(btnB, 'B');
    pintar(btnC, 'C');
    actualizar();
  }

  window.ModuloInit['m7-logica'] = iniciar;
})();
