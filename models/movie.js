//Representa la lógica de negocio y los datos de la aplicación.
//Es responsable de acceder a la base de datos, realizar cálculos y gestionar el estado de la aplicación.
//El modelo no tiene conocimiento de la interfaz de usuario.
import { readJSON } from "../utils.js";
import {randomUUID} from "node:crypto"

const movies = readJSON('./movies.json')

//aqui hacemos que una clase tenga los metodos estaticos de las funciones para las rutas de movies-routes,
//se hace con clases para que sea mas escalable 
export class MovieModel{
    //tambien los parametros los recivimos como si fueran objetos para la escalbilidad 
    static async getAll ({ genre}) {
        if (genre) {
            return movies.filter(
              movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
            )
        }
        return movies
    }
    static async getById ({id}) {
        const movie = movies.find(movie => movie.id === id)
        return movie
    }
    static async create ({input}) {
        const newMovie = {
            id: randomUUID(), // uuid v4
            ...input
        }
        
        // Esto no sería REST, porque estamos guardando
        // el estado de la aplicación en memoria
        movies.push(newMovie)
        return newMovie
    }

    static async delete({id}) {
        const movieIndex = movies.findIndex(movie => movie.id === id)
        if (movieIndex === -1) return false
        movies.splice(movieIndex, 1)
        return true
    }
    static async update ({id,input}) {
        const movieIndex = movies.findIndex(movie => movie.id === id)
        if (movieIndex === -1) return false

        movies[movieIndex] = {
        ...movies[movieIndex],
        ...input
        }

        return movies[movieIndex]
    }
}