async function cargarUniversidades(pais = "Colombia") {
  try {
    // URL con proxy HTTPS (para evitar errores de "mixed content")
    const urlOriginal = `http://universities.hipolabs.com/search?country=${pais}`;
    const urlProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlOriginal)}`;

    const res = await fetch(urlProxy);
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("No se pudo parsear la respuesta como JSON:", text);
      data = [];
    }

    if (!Array.isArray(data)) {
      console.error("Los datos recibidos no son un arreglo:", data);
      data = [];
    }

    const root = document.getElementById("root"); // 🔹 Faltaba esto
    root.innerHTML = "";

    if (data.length === 0) {
      root.innerHTML = `<p>No se encontraron universidades.</p>`;
      return;
    }

    // Generar lista de universidades
    let listaHTML = "";
    data.forEach((u, i) => {
      listaHTML += `
        <div class="c-lista-uni uni-${i}" style="cursor:pointer;" onclick="verUniversidad('${u.name}', '${u.country}', '${u.web_pages[0]}')">
          <p><strong>${u.name}</strong></p>
          <p>${u.country}</p>
          <a href="${u.web_pages[0]}" target="_blank">Visitar web</a>
        </div>
      `;
    });

    root.innerHTML = `
      <div style="margin-bottom: 10px;">
        <input id="buscar" type="text" placeholder="Buscar universidad..." style="width:70%; padding:5px;">
        <button onclick="buscarUniversidad()">Buscar</button>
      </div>
      <div id="listaUniversidades">${listaHTML}</div>
    `;
  } catch (error) {
    console.error("Error al cargar universidades:", error);
    document.getElementById("root").innerHTML = `<p>Error al cargar los datos.</p>`;
  }
}

function home() {
  cargarUniversidades("Colombia");
}

async function buscarUniversidad() {
  const texto = document.getElementById("buscar").value.trim();
  if (texto === "") {
    cargarUniversidades("Colombia");
    return;
  }

  try {
    const urlOriginal = `http://universities.hipolabs.com/search?name=${texto}`;
    const urlProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlOriginal)}`;

    const res = await fetch(urlProxy);
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("No se pudo parsear la respuesta como JSON:", text);
      data = [];
    }

    if (!Array.isArray(data)) {
      console.error("Los datos recibidos no son un arreglo:", data);
      data = [];
    }

    const contenedor = document.getElementById("listaUniversidades");
    contenedor.innerHTML = "";

    if (data.length === 0) {
      contenedor.innerHTML = "<p>No se encontraron resultados.</p>";
      return;
    }

    data.forEach((u, i) => {
      contenedor.innerHTML += `
        <div class="c-lista-uni uni-${i}" style="cursor:pointer;" onclick="verUniversidad('${u.name}', '${u.country}', '${u.web_pages ? u.web_pages[0] : '#'}')">
          <p><strong>${u.name}</strong></p>
          <p>${u.country}</p>
          <a href="${u.web_pages ? u.web_pages[0] : '#'}" target="_blank">Visitar web</a>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error:", error);
    const contenedor = document.getElementById("listaUniversidades");
    contenedor.innerHTML = "<p>Error al buscar universidades. Intenta de nuevo.</p>";
  }
}

function verUniversidad(nombre, pais, web) {
  const root = document.getElementById("root");
  root.innerHTML = `
    <h2>${nombre}</h2>
    <p>País: ${pais}</p>
    <a href="${web}" target="_blank">Visitar sitio web</a>
    <br><br>
    <button onclick="home()">Volver</button>
  `;
}
