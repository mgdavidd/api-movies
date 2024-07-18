// requerimos los siguientes módulos
import express, { json } from 'express'; // require -> commonJS
import {MovieRouter} from './routes/movies-routes.js';
import { corsMiddleware } from './middlewares/cors.js';

const app = express(); // Crea una instancia de la aplicación Express

app.use(json()); // Permite manejar solicitudes con cuerpos JSON

app.use(corsMiddleware());

app.disable('x-powered-by'); // Deshabilitar el header X-Powered-By: Express

// métodos normales: GET/HEAD/POST
// métodos complejos: PUT/PATCH/DELETE

// CORS PRE-Flight
// OPTIONS

// Todos los recursos que sean MOVIES se identifican con /movies
app.use('/movies', MovieRouter);

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
