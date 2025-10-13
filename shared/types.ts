export interface Event {
    id: number
    title: string
    date: Date
    description: string
    description_extended: string
    location: string
    image_url: string
    price: number
    is_paid: boolean
    is_cancelled: boolean
}

export interface EventUser {
    id: string
    id_user: string
    id_event: string
    
}

export interface User {
    id: number
    name: string
    email: string
    balance: number
    isAdmin: boolean
    dni: number
    full_name: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    success: boolean
    user?: User
    token?: string
    message?: string
}

export interface RegisterRequest {
    username: string
    full_name: string
    email: string
    DNI: number
    password: string
}

export interface RegisterResponse {
    success: boolean
    user?: User
    token?: string
}

export interface AllEventsRequest {
    page?: number
    limit?: number
    search?: string
    category?: string
}

export interface AllEventsResponse {
    success: boolean
    events: Event[]
    total: number
    page: number
    totalPages: number
}

export interface JoinEventRequest {
    eventId: string
    userId: string
}

export interface JoinEventResponse {
    success: boolean
    eventUser?: EventUser
    message?: string
}

export interface CreateEventRequest {
    title: string
    description: string
    date: string
    location: string
    image_url: string
    price: number
}

export interface ChargeBalanceRequest {
    amount: number
}

export interface ChargeBalanceResponse {
    success: boolean
    newBalance?: number
}

/* nombre de usuario, su nombre de pila,
apellido, DNI, email, contraseña y saldo disponible. Así como también la cantidad de
entradas compradas para cada evento y sus confirmaciones de asistencia. */

/*         título, fecha, descripción breve,
descripción ampliada, ubicación, imágenes, si se le suma la condición de pago o es
sin cargo, si fue cancelado y el costo de acceso al evento. */