const tokenTMDB = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZDIwZTU1ZjFkNjY5NGExMzhjODUyZWIyZGU0NzdiYyIsIm5iZiI6MTc1MTczODk4NC4yMjU5OTk4LCJzdWIiOiI2ODY5NmE2OGRjNjFkM2JmOTY1M2Y2OTkiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.-rq4PSyWpmy5XjeQmo0NunVmLP-Xq7ztAekvjkki6Ws";
const tokenStrapi = "099da4cc6cbb36bf7af8de6f1f241f8c81e49fce15709c4cfcae1313090fa2c1ac8703b0179863b4eb2739ea65ae435e90999adb870d49f9f94dcadd88999763119edca01a6b34c25be92a80ed30db1bcacb20df40e4e7f45542bd501f059201ad578c18a11e4f5cd592cb25d6c31a054409caa99f11b6d2391440e9c72611ea";
const strapiUrl = "https://gestionweb.frlp.utn.edu.ar/api/actors"; // Reemplazá con tu URL de Strapi

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-cargar").onclick = () => {
        loadData();
    };
    document.getElementById("btn-visualizar").onclick = () => {
        showResults();
    };
});


async function loadData() {
    const response = await fetch("https://api.themoviedb.org/3/person/popular?language=es-ES&page=1", {
        headers: {
            Authorization: `Bearer ${tokenTMDB}`
        }
    });

    const data = await response.json();
    console.log("Actores populares obtenidos correctamente:", data.results.slice(0, 10));

    const top10 = data.results.slice(0, 10);

    for (const actor of top10) {
        const [nombre, ...resto] = actor.name.split(" ");
        const apellido = resto.join(" ") || "(Sin apellido)";
        const actorId = actor.id;

        // Películas del actor
        const filmResp = await fetch(`https://api.themoviedb.org/3/person/${actorId}/movie_credits?language=es-ES`, {
            headers: {
                Authorization: `Bearer ${tokenTMDB}`
            }
        });
        const filmData = await filmResp.json();

        const lastMovie = filmData.cast?.sort((a, b) => new Date(b.release_date) - new Date(a.release_date))[0];

        if (!lastMovie) {
            console.warn(`Actor ${actor.name} no tiene películas con fecha válida`);
            continue;
        }

        const {
            title,
            release_date,
            genre_ids,
            vote_count,
            vote_average
        } = lastMovie;

        // Obtener géneros por ID
        const genresResp = await fetch("https://api.themoviedb.org/3/genre/movie/list?language=es-ES", {
            headers: {
                Authorization: `Bearer ${tokenTMDB}`
            }
        });
        const genresList = await genresResp.json();

        const genreNames = genre_ids.map(id => {
            const genre = genresList.genres.find(g => g.id === id);
            return genre ? genre.name : "Desconocido";
        });

        console.log(`Datos procesados para ${nombre} ${apellido}:`, {
            pelicula: title,
            estreno: release_date,
            generos: genreNames,
            cantidad_votos: vote_count,
            promedio_votos: vote_average
        });

        // POST a Strapi
        const strapiResponse = await fetch(strapiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenStrapi}`
            },
            body: JSON.stringify({
                data: {
                    nombre,
                    apellido,
                    pelicula: title,
                    estreno: release_date,
                    generos: genreNames,
                    cantidad_votos: vote_count,
                    promedio_votos: vote_average
                }
            })
        });

        if (strapiResponse.ok) {
            console.log(`✅ Datos de ${nombre} ${apellido} guardados en Strapi`);
        } else {
            console.error(`❌ Error al guardar en Strapi:`, await strapiResponse.text());
        }
    }
    document.getElementById("contenido-api").innerHTML = "<p>Datos cargados correctamente en Strapi.</p>";
}


async function showResults() {
    const response = await fetch(strapiUrl, {
        headers: { Authorization: `Bearer ${tokenStrapi}` }
    });
    const data = await response.json();

    const uniqueEntries = new Map();
    for (const entry of data.data) {
        const actor = entry.attributes || entry;
        if (!actor.nombre || !actor.apellido || !actor.pelicula) continue;

        const key = `${actor.nombre}-${actor.apellido}-${actor.pelicula}`;
        if (!uniqueEntries.has(key)) {
            uniqueEntries.set(key, actor);
        }
    }

    let tablaHTML = `
        <table border="1" cellspacing="0" cellpadding="5">
            <thead>
                <tr>
                    <th>Nombre y Apellido</th>
                    <th>Película</th>
                    <th>Estreno</th>
                    <th>Géneros</th>
                    <th>Votos</th>
                    <th>Promedio</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const actor of uniqueEntries.values()) {
        tablaHTML += `
            <tr>
                <td>${actor.nombre} ${actor.apellido}</td>
                <td>${actor.pelicula}</td>
                <td>${actor.estreno}</td>
                <td>${Array.isArray(actor.generos) ? actor.generos.join("<br>") : "Desconocido"}</td>
                <td>${actor.cantidad_votos}</td>
                <td>${actor.promedio_votos}</td>
            </tr>
        `;
    }

    tablaHTML += "</tbody></table>";
    document.getElementById("contenido-api").innerHTML = tablaHTML;
}