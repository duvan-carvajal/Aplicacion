// universidad.js
async function universidad(nombre = "Universidad Nacional de Colombia") {
    try {
        // Proxy HTTPS para evitar bloqueo en navegadores
        const proxy = "https://api.allorigins.win/raw?url=";
        const url = `${proxy}http://universities.hipolabs.com/search?name=${encodeURIComponent(nombre)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.length) throw new Error("No se encontró la universidad.");

        const uni = data[0]; // Tomamos la primera coincidencia
        const root = document.getElementById("root");

        // Revisar si ya está en favoritos
        let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
        let esFavorito = favoritos.some(u => u.name === uni.name);

        root.innerHTML = `
        <section class="c-detalle">
            <h2>${uni.name}</h2>
            <p><strong>País:</strong> ${uni.country}</p>
            <p><strong>Dominio:</strong> ${uni.domains.join(", ")}</p>
            <p><strong>Web:</strong> <a href="${uni.web_pages[0]}" target="_blank">${uni.web_pages[0]}</a></p>
            <button id="corazon-${btoa(uni.name)}">${esFavorito ? "❤️" : "🤍"}</button>
        </section>
        `;

        const boton = document.getElementById(`corazon-${btoa(uni.name)}`);
        boton.addEventListener('click', () => {
            toggleFavorito(uni);
            const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
            const esAhoraFavorito = favoritos.some(u => u.name === uni.name);
            boton.textContent = esAhoraFavorito ? "❤️" : "🤍";
        });

    } catch (error) {
        console.error("Error:", error);
        document.getElementById("root").innerHTML = `<p>Error al cargar los datos.</p>`;
    }
}

function toggleFavorito(uni) {
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    let existe = favoritos.some(u => u.name === uni.name);

    if (existe) {
        favoritos = favoritos.filter(u => u.name !== uni.name);
    } else {
        favoritos.push(uni);
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}
