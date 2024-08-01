import mysql from 'mysql2/promise';

// Configuración de la conexión
const config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'moviesdb'
};

// Crear la conexión
const connection = await mysql.createConnection(config);
export class MovieModel{
    //tambien los parametros los recivimos como si fueran objetos para la escalbilidad 
    static async getAll ({ genre}) {
        const result = await connection.query(
            `SELECT 
    title, 
    year, 
    director, 
    duration, 
    poster, 
    rate, 
    CONCAT(
        SUBSTR(HEX(id), 1, 8), '-', 
        SUBSTR(HEX(id), 9, 4), '-', 
        SUBSTR(HEX(id), 13, 4), '-', 
        SUBSTR(HEX(id), 17, 4), '-', 
        SUBSTR(HEX(id), 21)
    ) AS id
FROM movie;`
        )
        console.log(result)
    }
    static async getById ({id}) {

    }
    static async create ({input}) {

    }

    static async delete({id}) {

    }
    static async update ({id,input}) {

    }
}