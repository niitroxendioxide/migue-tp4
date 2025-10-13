import express from 'express'

export const registerRouter = express.Router()

registerRouter.post('/register', (req, res, next) => {
    try {

    } catch (err) {
        next(err)
    }
})

registerRouter.post('/login', (req, res, next) => {
    try {

    } catch (err) {
        next(err)
    }
})

registerRouter.get('/home', (req, res, next) => {
    try {
        
    } catch (err) {
        next(err)
    }   
});