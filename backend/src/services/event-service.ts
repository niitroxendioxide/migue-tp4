import express from 'express'

const router = express.Router()

router.get('/', (req, res, next) => {

    try {

    } catch(err) {
        next(err)
    }

})
