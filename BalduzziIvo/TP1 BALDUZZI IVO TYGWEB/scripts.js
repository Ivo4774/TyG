const tokenApi = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2MTZkMjY2YTY0ZDRjZDUzYTA0ZGUxNjAyZTA2OGE5ZSIsInN1YiI6IjY2ODQzZDg5YzZkMzM5ZTM4MTFiOWE5OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Y9A2PJdOVp-7sqNDfioGqLDV6tNRjoNqOGsnh6Xojo4";

const apiURLPeliculas = "https://api.themoviedb.org/3/discover/movie?primary_release_year=1999&sort_by=popularity.desc";
const genreAPIURL = "https://api.themoviedb.org/3/genre/movie/list?language=es&api_key=616d266a64d4cd53a04de1602e068a9e";

// Headers TMDb
const myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer " + tokenApi);
myHeaders.append("accept", "application/json");

const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow"
};

// Variables temporales
let datosPeliculas = [];

// Botón: Cargar datos desde TMDb
async function cargarDatos() {
  const contenedor = document.getElementById("contenido-api");
  contenedor.innerHTML = `<p class="loading">Cargando datos desde TMDb...</p>`;

  try {
    const response = await fetch(apiURLPeliculas, requestOptions);
    const data = await response.json();

    datosPeliculas = data.results.slice(0, 10);
    contenedor.innerHTML = `<p>Datos cargados correctamente. Hacé clic en "Visualizar datos cargados".</p>`;
  } catch (error) {
    console.error("Error en carga:", error);
    contenedor.innerHTML = `<p>Error al cargar los datos desde TMDb.</p>`;
  }
}

// Botón: Visualizar datos
async function visualizarDatos() {
  const contenedor = document.getElementById("contenido-api");
  contenedor.innerHTML = `<p class="loading">Cargando resultados...</p>`;

  try {
    const genreResponse = await fetch(genreAPIURL);
    const genreData = await genreResponse.json();

    const genreMap = {};
    genreData.genres.forEach(g => genreMap[g.id] = g.name);

    let tabla = `<table><thead><tr>
      <th>Título</th><th>Sinopsis</th><th>Géneros</th><th>Votos</th><th>Promedio</th>
    </tr></thead><tbody>`;

    datosPeliculas.forEach(p => {
      const generos = p.genre_ids.map(id => genreMap[id] || id).join(", ");

      tabla += `<tr>
        <td>${p.title}</td>
        <td>${p.overview}</td>
        <td>${generos}</td>
        <td>${p.vote_count}</td>
        <td>${p.vote_average}</td>
      </tr>`;
    });

    tabla += `</tbody></table>`;
    contenedor.innerHTML = tabla;
  } catch (error) {
    console.error("Error al visualizar:", error);
    contenedor.innerHTML = `<p>Error al mostrar los datos.</p>`;
  }
}

// Frases
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
