/* ============================================
   utils.js: herramientas compartidas
   Lo usan todos los demás archivos JS.
   ============================================ */

// Cada módulo registrará aquí su función de arranque.
// Ejemplo (más adelante): ModuloInit['m2-coulomb'] = function () { ... };
window.ModuloInit = {};

const Utils = {

  // Convierte texto en algo seguro para insertar en HTML.
  escapeHtml(texto) {
    const mapa = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(texto).replace(/[&<>"']/g, c => mapa[c]);
  },

  // Minúsculas y sin tildes, para que "electrónica" y "electronica" coincidan.
  normalizar(texto) {
    return String(texto)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  },

  // Lee un número escrito por una persona.
  // Acepta coma o punto decimal y notación científica (1e-6).
  // Devuelve NaN si el texto no es un número válido.
  leerNumero(texto) {
    const limpio = String(texto).trim().replace(',', '.');
    const patron = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
    return patron.test(limpio) ? Number(limpio) : NaN;
  },

  // Da formato legible a un resultado. Devuelve HTML (usar con innerHTML).
  // Números muy grandes o muy pequeños salen en notación científica.
  formatear(valor, cifras = 4) {
    if (!Number.isFinite(valor)) return '—';
    if (valor === 0) return '0';
    const abs = Math.abs(valor);
    if (abs >= 1e6 || abs < 1e-3) {
      const [mantisa, exponente] = valor.toExponential(cifras - 1).split('e');
      return `${Number(mantisa)} × 10<sup>${Number(exponente)}</sup>`;
    }
    return String(Number(valor.toPrecision(cifras)));
  },

  // Muestra un mensaje de error en un elemento (por ejemplo, un <div class="mensaje-error">).
  mostrarError(elemento, mensaje) {
    if (elemento) elemento.textContent = mensaje;
  },

  limpiarError(elemento) {
    if (elemento) elemento.textContent = '';
  },

  // Pone o quita el borde rojo de un campo.
  marcarInvalido(input, invalido) {
    if (input) input.classList.toggle('invalido', Boolean(invalido));
  },

  // Convierte las fórmulas escritas entre $$...$$ o \(...\) en fórmulas reales con KaTeX.
  renderMath(contenedor) {
    if (typeof window.renderMathInElement !== 'function') return;
    window.renderMathInElement(contenedor, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\(', right: '\\)', display: false }
      ],
      throwOnError: false
    });
  }
};