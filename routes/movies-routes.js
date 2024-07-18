import { Router } from "express";
import { MovieController } from "../controllers/movie.js";

export const MovieRouter = Router()

MovieRouter.get('/', MovieController.getAll)

MovieRouter.get('/:id', MovieController.getById)

MovieRouter.post('/', MovieController.create)

MovieRouter.delete('/:id', MovieController.delete)

MovieRouter.patch('/:id', MovieController.update)