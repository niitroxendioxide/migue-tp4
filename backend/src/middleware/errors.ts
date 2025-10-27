
export class ServerError extends Error {
    public statusCode: number;
    //public name: string?

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}

export class BadRequestError extends ServerError {
    constructor(message: string) {
        super(message, 400);
    }
}

export class NotFoundError extends ServerError {
    constructor(message: string) {
        super(message, 404);
    }
}

export class ValidationError extends ServerError {
    constructor(message: string = "Error when validating user tokens") {
        super(message, 401);
    }
}


export const errorHandlerMiddleware = (
    err: Error | ServerError, 
    req: any, 
    res: any, 
    next: any
) => {
    // Si es un error personalizado (ServerError)
    if (err instanceof ServerError) {
        return res.status(err.statusCode).json({ 
            message: err.message,
            error: err.name
        });
    }

    return res.status(500).json({ 
        message: err.message || 'Internal server error',
        error: 'ServerError'
    });
};