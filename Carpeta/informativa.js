function Informativa() {
  const root = document.getElementById("root");

  root.innerHTML = `
    <div class="info-container">
      <h2>Sobre esta aplicación</h2>
      <p>
        Esta aplicación te permite explorar universidades de Colombia y del mundo .
        Puedes buscar instituciones, visitar sus páginas oficiales y guardar tus favoritas
        para consultarlas más adelante.
      </p>

      

      <p>
        Aplicación creada con fines educativos.
      </p>

      <h3>Características</h3>
      <ul>
        <li>Búsqueda de universidades por nombre o país.</li>
        <li>Sistema de favoritos guardado localmente.</li>
        <li>Información detallada de cada universidad.</li>
        <li>Enlaces directos a las páginas oficiales.</li>
      </ul>

      <button class="btn-volver" onclick="home()">← Volver</button>
    </div>
  `;
}
