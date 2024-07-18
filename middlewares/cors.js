import cors from 'cors'

const ACCEPTED_ORIGINS = [
    'http://localhost:8080', 
    'http://localhost:3000', 
    'https://movies.com',    
    'https://midu.dev',
    'http://192.168.1.4:8080'      
];

export const corsMiddleware = ({acceptedOrigins = ACCEPTED_ORIGINS} = {})=> cors({
    origin: (origin, callback) => { // Configura CORS para permitir o restringir orígenes específicos
    
        if (acceptedOrigins.includes(origin)) {
          //al decir null decimos que no hay error y al poner true decimos que permitimos que ese origen lo permitimos
          return callback(null, true); // Permite la solicitud si el origen está en la lista de aceptados
        }
    
        if (!origin) {
          return callback(null, true); // Permite solicitudes sin origen
        }
    
        return callback(new Error('Not allowed by CORS')); // Rechaza la solicitud si el origen no está en la lista de aceptados
      }
})