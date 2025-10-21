import express from 'express'
import { LoginRequest, RegisterRequest } from '../../../shared/types';
import { handleRegisterRequest, handleLoginRequest } from '../services/user-service';

export const registerRouter = express.Router()

registerRouter.post('/register', async (req, res, next) => {
    try {
        const { body } = req;
        console.log("register req: ", body);

        const response = await handleRegisterRequest(body as RegisterRequest);
        
        res.status(200).json(response);
    } catch (err) {
        next(err)
    }
})

registerRouter.post('/login', async (req, res, next) => {
    try {
        const body = req.body as LoginRequest;
        console.log("login req: ", body);
        const response = await handleLoginRequest(body);
        
        res.status(200).json(response);
    } catch (err) {
        next(err)
    }
})


// nothing yet
registerRouter.get('/home', async (req, res, next) => {
    try {
        
    } catch (err) {
        next(err)
    }   
});