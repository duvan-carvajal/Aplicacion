function favoritos() {
  const root = document.getElementById("root");
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  if (favoritos.length === 0) {
    root.innerHTML = `
      <div class="c-detalle">
        <h2>⭐ Favoritos</h2>
        <p>No tienes universidades guardadas todavía.</p>
        <button class="btn-volver" onclick="home()">← Volver</button>
      </div>
    `;
    return;
  }

  let listaHTML = `<h2>⭐ Tus Universidades Favoritas</h2>`;

  favoritos.forEach((u, i) => {
    listaHTML += `
      <div class="c-lista-uni">
        <p><strong>${u.nombre}</strong></p>
        <p>${u.pais}</p>
        <a href="${u.web}" target="_blank">Visitar web</a>
        <br>
        <button class="btn-volver" onclick="eliminarFavorito(${i})">🗑 Quitar</button>
      </div>
    `;
  });

  root.innerHTML = `
    <div>
      ${listaHTML}
      <button class="btn-volver" onclick="home()">← Volver</button>
    </div>
  `;
}

function eliminarFavorito(index) {
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  favoritos.splice(index, 1);
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  favoritos(); // 🔁 recargar la lista
}
