// Variables y constantes
const tokenApi = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2MTZkMjY2YTY0ZDRjZDUzYTA0ZGUxNjAyZTA2OGE5ZSIsIm5iZiI6MTcyMDMwNTc2MS4yOTU4ODksInN1YiI6IjY2ODQzZDg5YzZkMzM5ZTM4MTFiOWE5OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Y9A2PJdOVp-7sqNDfioGqLDV6tNRjoNqOGsnh6Xojo4";
const tokenStrapi = "099da4cc6cbb36bf7af8de6f1f241f8c81e49fce15709c4cfcae1313090fa2c1ac8703b0179863b4eb2739ea65ae435e90999adb870d49f9f94dcadd88999763119edca01a6b34c25be92a80ed30db1bcacb20df40e4e7f45542bd501f059201ad578c18a11e4f5cd592cb25d6c31a054409caa99f11b6d2391440e9c72611ea";

const apiURLPeliculas = "https://api.themoviedb.org/3/discover/movie?primary_release_year=1999&sort_by=popularity.desc";
const apiURLStrapi = "https://gestionweb.frlp.utn.edu.ar/api/g1-peliculas"; 
const genreAPIURL = "https://api.themoviedb.org/3/genre/movie/list?language=es";

// Headers para TMDb
const myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer " + tokenApi);
myHeaders.append("accept", "application/json");

const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow"
};

// Botón: Cargar datos
async function cargarDatos() {
  const contenedor = document.getElementById("contenido-api");
  contenedor.innerHTML = `<p class="loading">Cargando datos desde TMDb y guardando en Strapi...</p>`;

  try {
    // 1. Borrar datos anteriores de Strapi
    const borrarRes = await fetch(apiURLStrapi, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + tokenStrapi
      }
    });

    const datosBorrar = await borrarRes.json();
    for (const item of datosBorrar.data) {
      await fetch(`${apiURLStrapi}/${item.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + tokenStrapi
        }
      });
    }

    // 2. Obtener películas populares
    const respuesta = await fetch(apiURLPeliculas, requestOptions);
    const datos = await respuesta.json();

    for (let i = 0; i < 10; i++) {
      const peli = datos.results[i];

      const dataParaStrapi = {
        data: {
          titulo: peli.title,
          sinopsis: peli.overview,
          genero: peli.genre_ids.join(", "),
          promVotos: peli.vote_average,
          cantVotos: peli.vote_count
        }
      };

      await fetch(apiURLStrapi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + tokenStrapi
        },
        body: JSON.stringify(dataParaStrapi)
      });
    }

    contenedor.innerHTML = `<p>Películas cargadas y guardadas correctamente en Strapi.</p>`;
  } catch (error) {
    console.error("Error en carga:", error);
    contenedor.innerHTML = `<p>Error al cargar los datos.</p>`;
  }
}

// Botón: Visualizar datos
async function visualizarDatos() {
  const contenedor = document.getElementById("contenido-api");
  contenedor.innerHTML = `<p class="loading">Cargando resultados...</p>`;

  try {
    const genreResponse = await fetch(genreAPIURL + "&api_key=616d266a64d4cd53a04de1602e068a9e");
    const genreData = await genreResponse.json();
    const genreMap = {};
    genreData.genres.forEach(g => genreMap[g.id] = g.name);

    const response = await fetch(apiURLStrapi, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + tokenStrapi
      }
    });

    const data = await response.json();

    let tabla = `<table><thead><tr>
      <th>Título</th><th>Sinopsis</th><th>Géneros</th><th>Votos</th><th>Promedio</th>
    </tr></thead><tbody>`;

    data.data.forEach(peli => {
      const p = peli.attributes;
      const generosTraducidos = p.genero
        .split(",")
        .map(id => genreMap[parseInt(id.trim())] || id.trim())
        .join(", ");

      tabla += `<tr>
        <td>${p.titulo}</td>
        <td>${p.sinopsis}</td>
        <td>${generosTraducidos}</td>
        <td>${p.cantVotos}</td>
        <td>${p.promVotos}</td>
      </tr>`;
    });

    tabla += `</tbody></table>`;
    contenedor.innerHTML = tabla;
  } catch (error) {
    console.error("Error al visualizar:", error);
    contenedor.innerHTML = `<p>Error al mostrar los datos.</p>`;
  }
}

// Botón: Frases
const frases = [
  '<span class="sombra1">"Esta es la mejor página para ver los mejores actores."</span>',
  '<span class="sombra2">"¿Cuáles son los actores más famosos?"</span>',
  '<span class="sombra3">"El hall de la fama de los actores."</span>'
];

function mostrarFraseAleatoria() {
  const randomIndex = Math.floor(Math.random() * frases.length);
  document.getElementById("frase-del-dia").innerHTML = frases[randomIndex];
}

// Eventos
mostrarFraseAleatoria();
document.getElementById("btn-frase").addEventListener("click", e => {
  e.preventDefault();
  mostrarFraseAleatoria();
});
document.getElementById("btn-cargar").addEventListener("click", e => {
  e.preventDefault();
  cargarDatos();
});
document.getElementById("btn-visualizar").addEventListener("click", e => {
  e.preventDefault();
  visualizarDatos();
});
