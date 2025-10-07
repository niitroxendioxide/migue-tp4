

export const errorHandlerMiddleware = (err: any, res: any) => {
    if (err instanceof Error) {
        return res.status(500).json({ message: err.message })
    }

    return res.status(500).json({ message: 'Internal server error' })
}