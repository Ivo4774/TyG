// Variables y constantes para las URLs y tokens
const tokenApi = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2MTZkMjY2YTY0ZDRjZDUzYTA0ZGUxNjAyZTA2OGE5ZSIsIm5iZiI6MTcyMDMwNTc2MS4yOTU4ODksInN1YiI6IjY2ODQzZDg5YzZkMzM5ZTM4MTFiOWE5OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Y9A2PJdOVp-7sqNDfioGqLDV6tNRjoNqOGsnh6Xojo4";
const tokenStrapi = "099da4cc6cbb36bf7af8de6f1f241f8c81e49fce15709c4cfcae1313090fa2c1ac8703b0179863b4eb2739ea65ae435e90999adb870d49f9f94dcadd88999763119edca01a6b34c25be92a80ed30db1bcacb20df40e4e7f45542bd501f059201ad578c18a11e4f5cd592cb25d6c31a054409caa99f11b6d2391440e9c72611ea";

const apiURLPeliculas = "https://api.themoviedb.org/3/discover/movie?primary_release_year=1999&sort_by=popularity.desc";
const apiURLStrapi = "https://gestionweb.frlp.utn.edu.ar/api/g13-peliculas"; // <-- cambiá g13 si sos otro grupo
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

// App Vue
new Vue({
  el: '#app',
  data: {
    movies: [],
    showTable: false,
    errorMessage: ''
  },
  methods: {
    async borrarPeliculas() {
      try {
        const response = await fetch(apiURLStrapi, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + tokenStrapi
          }
        });

        if (!response.ok) throw new Error("Error al obtener películas de Strapi.");

        const peliculasData = await response.json();

        for (const pelicula of peliculasData.data) {
          const res = await fetch(`${apiURLStrapi}/${pelicula.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + tokenStrapi
            }
          });

          if (!res.ok) {
            console.error(`Error al borrar ${pelicula.attributes.titulo}`);
          } else {
            console.log(`Borrada: ${pelicula.attributes.titulo}`);
          }
        }
      } catch (error) {
        console.error("Error en borrarPeliculas:", error);
        this.errorMessage = "Error al borrar las películas.";
      }
    },

    async loadData() {
      try {
        await this.borrarPeliculas();

        const respuesta = await fetch(apiURLPeliculas, requestOptions);
        if (respuesta.status !== 200) throw new Error("Error al cargar desde TMDb.");

        const datos = await respuesta.json();

        for (let i = 0; i < 10; i++) {
          const pelicula = datos.results[i];

          const peliculaParaStrapi = {
            data: {
              titulo: pelicula.title,
              sinopsis: pelicula.overview,
              genero: pelicula.genre_ids.join(', '), // Guarda los IDs por ahora
              promVotos: pelicula.vote_average,
              cantVotos: pelicula.vote_count
            }
          };

          await this.enviarPeliculaAStrapi(peliculaParaStrapi);
        }

        alert("Películas cargadas correctamente en Strapi.");
      } catch (error) {
        console.error("Error en loadData:", error);
        this.errorMessage = "Error al cargar las películas.";
      }
    },

    async enviarPeliculaAStrapi(pelicula) {
      try {
        const response = await fetch(apiURLStrapi, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + tokenStrapi
          },
          body: JSON.stringify(pelicula)
        });

        if (!response.ok) {
          const errorDetails = await response.text();
          console.error(`Error al enviar ${pelicula.data.titulo}: ${errorDetails}`);
        } else {
          console.log(`Enviada: ${pelicula.data.titulo}`);
        }
      } catch (error) {
        console.error("Error en enviarPeliculaAStrapi:", error);
      }
    },

    async showResults() {
      try {
        const genreResponse = await fetch(genreAPIURL + "&api_key=616d266a64d4cd53a04de1602e068a9e");
        if (!genreResponse.ok) throw new Error("Error al obtener géneros TMDb");

        const genreData = await genreResponse.json();
        const genreMap = {};
        genreData.genres.forEach(genre => genreMap[genre.id] = genre.name);

        const response = await fetch(apiURLStrapi, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + tokenStrapi,
          }
        });

        if (!response.ok) throw new Error("Error al obtener películas de Strapi.");

        const peliculasData = await response.json();

        this.movies = peliculasData.data.slice(0, 10).map(pelicula => ({
          title: pelicula.attributes.titulo,
          overview: pelicula.attributes.sinopsis,
          genres: pelicula.attributes.genero.split(',').map(id => genreMap[parseInt(id)] || id).join(', '),
          vote_count: pelicula.attributes.cantVotos,
          vote_average: pelicula.attributes.promVotos
        }));

        this.showTable = true;
      } catch (error) {
        console.error("Error en showResults:", error);
        this.errorMessage = "Error al mostrar películas.";
      }
    }
  }
});