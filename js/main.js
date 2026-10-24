/* ============================================
   main.js: navegación, menú móvil y buscador
   ============================================ */
(function () {
  'use strict';

  // 1. Lista de módulos. El "id" es el nombre del archivo en modulos/ (sin .html).
  const MODULOS = [
    { id: 'inicio', titulo: 'Inicio',
      resumen: 'Portada y accesos a todos los módulos.',
      palabras: 'portada inicio laboratorio' },
    { id: 'm1-carga', titulo: 'Módulo 1 · Carga eléctrica',
      resumen: 'Carga, átomo, iones, atracción y repulsión.',
      palabras: 'carga electrica atomo proton neutron electron ion cation anion ionizacion atraccion repulsion conservacion' },
    { id: 'm2-coulomb', titulo: 'Módulo 2 · Ley de Coulomb',
      resumen: 'Fuerza entre cargas, fórmula y ejemplos resueltos.',
      palabras: 'coulomb fuerza electrica constante electrostatica distancia carga' },
    { id: 'm3-resistencias', titulo: 'Módulo 3 · Resistencias',
      resumen: 'Código de colores, serie y paralelo.',
      palabras: 'resistencia ohmio codigo de colores bandas tolerancia serie paralelo equivalente potencia voltaje corriente' },
    { id: 'm4-ohm', titulo: 'Módulo 4 · Ley de Ohm',
      resumen: 'V = I × R, despejes y circuitos.',
      palabras: 'ohm voltaje corriente resistencia triangulo despeje serie paralelo mixto' },
    { id: 'm5-sistemas', titulo: 'Módulo 5 · Sistemas numéricos',
      resumen: 'Conversiones entre decimal, binario, octal y hexadecimal.',
      palabras: 'decimal binario octal hexadecimal conversion base sistemas numericos' },
    { id: 'm6-binarios', titulo: 'Módulo 6 · Operaciones binarias',
      resumen: 'Suma, resta y multiplicación en binario.',
      palabras: 'suma resta multiplicacion binaria acarreo prestamo' },
    { id: 'm7-logica', titulo: 'Módulo 7 · Puertas lógicas',
      resumen: 'AND, OR, NOT, NAND, NOR, XOR, XNOR y álgebra de Boole.',
      palabras: 'and or not nand nor xor xnor compuertas puertas logicas tabla de verdad boole' },
    { id: 'consulta-rapida', titulo: 'Consulta rápida',
      resumen: 'Fórmulas, prefijos y equivalencias importantes.',
      palabras: 'formulas equivalencias prefijos resumen consulta rapida' }
  ];

  // 2. Elementos de la página que vamos a usar.
  const contenedor = document.getElementById('contenido');
  const sidebar = document.getElementById('sidebar');
  const btnMenu = document.getElementById('btn-menu');
  const inputBusqueda = document.getElementById('buscador');
  const cajaResultados = document.getElementById('resultados');
  const enlacesMenu = document.querySelectorAll('.enlace-menu');

  let tokenCarga = 0; // Evita mezclar respuestas si se hace clic muy rápido.

  // 3. Plantillas de mensajes.
  function htmlEnConstruccion(modulo) {
    return `
      <div class="tarjeta en-construccion">
        <div class="icono">🔧</div>
        <h2>${Utils.escapeHtml(modulo.titulo)}</h2>
        <p>${Utils.escapeHtml(modulo.resumen)}</p>
        <p>El contenido de esta sección se agrega en las próximas fases.</p>
      </div>`;
  }

  function htmlErrorCarga(modulo) {
    const sinServidor = location.protocol === 'file:';
    const ayuda = sinServidor
      ? 'Abriste el archivo con doble clic. Ábrelo con Live Server: clic derecho en index.html y "Open with Live Server".'
      : 'Revisa que el archivo modulos/' + modulo.id + '.html exista y esté bien escrito.';
    return `
      <div class="tarjeta">
        <div class="aviso error">
          <strong>No se pudo cargar el módulo</strong>
          <p>${Utils.escapeHtml(ayuda)}</p>
        </div>
      </div>`;
  }

  // 4. Resalta en el menú el módulo activo.
  function marcarMenu(id) {
    enlacesMenu.forEach(enlace => {
      const activo = enlace.dataset.modulo === id;
      enlace.classList.toggle('activo', activo);
      if (activo) enlace.setAttribute('aria-current', 'page');
      else enlace.removeAttribute('aria-current');
    });
  }

  // 5. Carga un módulo desde modulos/<id>.html y lo muestra.
  async function cargarModulo(id) {
    const modulo = MODULOS.find(m => m.id === id) || MODULOS[0];
    const token = ++tokenCarga;

    marcarMenu(modulo.id);
    document.title = modulo.titulo + ' · Fundamentos de Electrónica';

    try {
      const respuesta = await fetch('modulos/' + modulo.id + '.html');
      if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
      const html = await respuesta.text();
      if (token !== tokenCarga) return; // llegó tarde: ya se pidió otro módulo

      contenedor.innerHTML = html.trim() === '' ? htmlEnConstruccion(modulo) : html;
    } catch (error) {
      if (token !== tokenCarga) return;
      console.error('Error al cargar el módulo:', error);
      contenedor.innerHTML = htmlErrorCarga(modulo);
    }

    // Reinicia la animación de entrada.
    contenedor.style.animation = 'none';
    void contenedor.offsetHeight;
    contenedor.style.animation = '';
    window.scrollTo({ top: 0 });

    Utils.renderMath(contenedor);

    // Si el módulo tiene función de arranque (calculadoras, simulaciones), se ejecuta.
    const iniciar = window.ModuloInit[modulo.id];
    if (typeof iniciar === 'function') {
      try {
        iniciar(contenedor);
      } catch (error) {
        console.error('Error al iniciar ' + modulo.id + ':', error);
      }
    }
  }

  // 6. Navegación: el módulo se decide por la parte "#..." de la dirección.
  function idDesdeHash() {
    return decodeURIComponent(location.hash.replace('#', '')) || 'inicio';
  }

  window.addEventListener('hashchange', () => cargarModulo(idDesdeHash()));

  // 7. Menú móvil.
  function alternarMenu(abrir) {
    const estado = typeof abrir === 'boolean' ? abrir : !sidebar.classList.contains('abierta');
    sidebar.classList.toggle('abierta', estado);
    btnMenu.setAttribute('aria-expanded', String(estado));
  }

  btnMenu.addEventListener('click', () => alternarMenu());

  sidebar.addEventListener('click', e => {
    if (e.target.closest('.enlace-menu')) alternarMenu(false);
  });

  // 8. Buscador.
  function buscar(texto) {
    const consulta = Utils.normalizar(texto);
    if (!consulta) return [];
    const palabras = consulta.split(/\s+/);
    return MODULOS.filter(m => {
      const texto = Utils.normalizar(m.titulo + ' ' + m.palabras);
      return palabras.every(p => texto.includes(p));
    });
  }

  function mostrarResultados(lista, hayConsulta) {
    if (!hayConsulta) {
      cajaResultados.classList.remove('visible');
      cajaResultados.innerHTML = '';
      return;
    }
    cajaResultados.innerHTML = lista.length
      ? lista.map(m => `
          <a href="#${m.id}" role="option">
            ${Utils.escapeHtml(m.titulo)}
            <small>${Utils.escapeHtml(m.resumen)}</small>
          </a>`).join('')
      : '<div style="padding:10px 14px;color:var(--texto-suave)">Sin resultados. Prueba con otra palabra.</div>';
    cajaResultados.classList.add('visible');
  }

  function cerrarBuscador() {
    inputBusqueda.value = '';
    mostrarResultados([], false);
  }

  inputBusqueda.addEventListener('input', () => {
    const texto = inputBusqueda.value;
    mostrarResultados(buscar(texto), texto.trim() !== '');
  });

  inputBusqueda.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const primero = buscar(inputBusqueda.value)[0];
      if (primero) {
        location.hash = '#' + primero.id;
        cerrarBuscador();
        inputBusqueda.blur();
      }
    }
  });

  cajaResultados.addEventListener('click', e => {
    if (e.target.closest('a')) cerrarBuscador();
  });

  // 9. Cierres con clic fuera o con la tecla Escape.
  document.addEventListener('click', e => {
    if (!e.target.closest('.buscador')) mostrarResultados([], false);
    const menuAbierto = sidebar.classList.contains('abierta');
    if (menuAbierto && !e.target.closest('#sidebar') && !e.target.closest('#btn-menu')) {
      alternarMenu(false);
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      cerrarBuscador();
      alternarMenu(false);
    }
  });

  // 10. Arranque: carga el módulo que indique la dirección (o Inicio).
  cargarModulo(idDesdeHash());
})();