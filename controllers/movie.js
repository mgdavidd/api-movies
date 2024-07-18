import { MovieModel } from '../models/movie.js';
import { validateMovie, validatePartialMovie } from '../schemas/movies.js';

export class MovieController{
    static async getAll (req, res) {
        const {genre} = req.query
        const movies = await MovieModel.getAll({genre}) 
        //que es lo que renderiza
        res.json(movies)
    }
    static async getById (req, res) {
        const { id } = req.params
        const movie = await MovieModel.getById({id})
        if (movie) return res.json(movie)
        res.status(404).json({ message: 'Movie not found' })
    }
    static async create (req, res) {
        //la funcion "validateMovie" verifica si si se entregaron los elementos requeridos y si son correctos
        const result = validateMovie(req.body)
  
        if (!result.success) {
        // 422 Unprocessable Entity
        return res.status(400).json({ error: JSON.parse(result.error.message) })
        }
    
        const newMovie = await MovieModel.create({input: result.data})
        res.status(201).json(newMovie)
    }
    static async delete (req, res) {
        const { id } = req.params

        const result = await MovieModel.delete({id})
  
        if (result == false) {
            return res.status(404).json({ message: 'Movie not found' })
        }
        return res.json({ message: 'Movie deleted' })
    }
    static async update (req, res) {
        //con la funcion "validatePartialMovie" validamos solo los elementos que existen si no existen no se validan 
        const result = validatePartialMovie(req.body)
  
        if (!result.success) {
            return res.status(400).json({ error: JSON.parse(result.error.message) })
        }
  
        const { id } = req.params
    
        const updatedMovie = await MovieModel.update({id, input: result.data})

        return res.json(updatedMovie)
    }
}