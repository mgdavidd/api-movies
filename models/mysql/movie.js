import mysql from 'mysql2/promise';

// Configuración de la conexión
const config = {
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: '',
    database: 'moviesdb'
};

const ids = `CONCAT(
           SUBSTR(HEX(id), 1, 8), '-', 
           SUBSTR(HEX(id), 9, 4), '-', 
           SUBSTR(HEX(id), 13, 4), '-', 
           SUBSTR(HEX(id), 17, 4), '-', 
           SUBSTR(HEX(id), 21)
       ) AS id`

// Crear la conexión
const connection = await mysql.createConnection(config);
export class MovieModel{
    //tambien los parametros los recivimos como si fueran objetos para la escalbilidad 
    static async getAll ({ genre}) {

        if (genre) {
            const lowerCaseGenre = genre.toLowerCase();
      
            // Get genre ids from database table using genre names
            const [genres] = await connection.query(
              'SELECT id, name FROM genre WHERE LOWER(name) = ?;',
              [lowerCaseGenre]
            );
      
            // No genre found
            if (genres.length === 0) return [];
      
            // Get the id from the first genre result
            const [{ id}] = genres;
      
            // Get all movies for the specified genre
            const [movies] = await connection.query(
              `
              SELECT m.title, m.year, m.director, m.duration, m.poster, m.rate, ${ids} FROM movie m
              INNER JOIN movie_genres mg ON m.id = mg.movie_id
              WHERE mg.genre_id = ?;
              `,
              [id]
            );
      
            return movies;
          }
      
          // Get all movies
          const [movies] = await connection.query(
            `SELECT title, year, director, duration, poster, rate, ${ids} FROM movie;`
          );
      
          return movies;
        }
    static async getById({ id }) {
         const [movies] = await connection.query(
    `
      SELECT title, year, director, duration, poster, rate, ${ids}
      FROM movie
      WHERE LOWER(CONCAT(
        SUBSTR(HEX(id), 1, 8), '-',
        SUBSTR(HEX(id), 9, 4), '-',
        SUBSTR(HEX(id), 13, 4), '-',
        SUBSTR(HEX(id), 17, 4), '-',
        SUBSTR(HEX(id), 21)
         )) = LOWER(?) `,[id]
        );
        return movies;
      }
          

      static async create({ input }) {
        const {
            genre: genreInput,
            title,
            year,
            duration,
            director,
            rate,
            poster
        } = input;
        
        const connection = await mysql.createConnection(config);
    
        try {
            // Verificar si la película ya existe
            const [existingMovies] = await connection.query(
                'SELECT id FROM movie WHERE title = ? AND year = ?;',
                [title, year]
            );
        
            if (existingMovies.length > 0) {
                return new Error('A movie with the same title and year already exists.');
            }
        
            // Generar UUID y eliminar guiones para convertir a binario
            const [uuidResult] = await connection.query('SELECT UUID() AS uuid;');
            const [{ uuid }] = uuidResult;
            const uuidModified = uuid.replace(/-/g, '');
        
            // Iniciar una transacción
            await connection.beginTransaction();
        
            // Insertar la película en la tabla 'movie'
            await connection.query(
                `INSERT INTO movie (id, title, year, director, duration, poster, rate)
                 VALUES (UNHEX(?), ?, ?, ?, ?, ?, ?);`,
                [uuidModified, title, year, director, duration, poster, rate]
            );
        
            // Obtener los IDs de los géneros y crear las relaciones
            if (genreInput && genreInput.length > 0) {
                const genreIds = await Promise.all(
                    genreInput.map(async (genreName) => {
                        const [genreResult] = await connection.query(
                            'SELECT id FROM genre WHERE LOWER(name) = ?;',
                            [genreName.toLowerCase()]
                        );
                        if (genreResult.length === 0) {
                            throw new Error(`Genre '${genreName}' not found`);
                        }
                        return genreResult[0].id;
                    })
                );
        
                // Insertar las relaciones en 'movie_genres'
                await Promise.all(
                    genreIds.map(async (genreId) => {
                        await connection.query(
                            'INSERT INTO movie_genres (movie_id, genre_id) VALUES (UNHEX(?), ?);',
                            [uuidModified, genreId]
                        );
                    })
                );
            }
        
            // Confirmar la transacción
            await connection.commit();
        
            // Obtener la película insertada para devolverla
            const [movies] = await connection.query(
                `SELECT title, year, director, duration, poster, rate, HEX(id) AS id
                 FROM movie WHERE id = UNHEX(?);`,
                [uuidModified]
            );
        
            return movies[0];
        } catch (e) {
            // Revertir la transacción en caso de error
            await connection.rollback();
            throw new Error(`Error creating movie: ${e.message}`);
        } finally {
            await connection.end();
        }
    }
    
      

    static async delete({ id }) {
        try {
            // Verificar si el ID está en el formato correcto
            console.log('ID recibido para eliminación:', id);
            
            // Verificar si la película existe
            const [existingMovies] = await connection.query(
                `SELECT * FROM movie WHERE id = UNHEX(REPLACE(?, '-', ''));`,
                [id]
            );
            
            console.log('Películas existentes:', existingMovies);
            
            // Si no existe la película, retornar false
            if (existingMovies.length === 0) {
                console.log('No se encontró la película con el ID proporcionado.');
                return false;
            }
            
            // Eliminar la película si existe
            await connection.query(
                `DELETE FROM movie_genres WHERE movie_id = UNHEX(REPLACE(?, '-', ''));`,
                [id]
            );
    
            // Eliminar la película si existe
            await connection.query(
                `DELETE FROM movie WHERE id = UNHEX(REPLACE(?, '-', ''));`,
                [id]
            );
            
            return true;
            
        } catch (error) {
            // Manejo de errores
            console.error('Error al intentar eliminar la película:', error);
            return new Error(`Error deleting movie: ${error.message}`);
        }
    }
    
  
  
    static async update({ id, input }) {
        // Buscar la película existente
        const [existingMovies] = await connection.query(
            `SELECT * FROM movie WHERE id = UNHEX(REPLACE(?, '-', ''));`,
            [id]
        );
        
        if (existingMovies.length === 0) {
            console.log('No se encontró la película con el ID proporcionado.');
            return false;
        }
    
        // Definir las claves a obtener
        const clavesAObtener = ["year", "title", "director", "duration", "poster", "genre", "rate"];
        
        // Filtrar las claves y obtener los valores del input
        const clavesFiltradas = clavesAObtener.filter(clave => input.hasOwnProperty(clave));
        
        // Realizar actualizaciones
        for (let clave of clavesFiltradas) {
            const valor = input[clave];
            await connection.query(
                `UPDATE movie SET ${clave} = ? WHERE id = UNHEX(REPLACE(?, '-', ''));`,
                [valor, id]
            );
        }
    
        console.log('Actualización completada.');
        return "pelicula actualizada"
        
    }
    
}