export interface Event {
    id: number
    id_user: number,
    title: string
    date: Date | string
    description: string
    description_extended: string
    location: string
    image_url: string
    price: number
    is_paid: boolean
    is_cancelled: boolean
    attendees: number
}

export interface EventUser {
    id: number
    id_user: number
    id_event: number
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
    eventId: number
}

export interface JoinEventResponse {
    success: boolean
    eventUser?: EventUser
    message?: string
    newBalance?: number
}

export interface CreateEventRequest {
    title: string
    id_user: number
    description: string
    date: string
    location: string
    image_url: string
    price: number
}

export interface CreateEventResponse {
    success: boolean
    event?: Event
    message?: string
}
export interface ChargeBalanceRequest {
    amount: number
}

export interface ChargeBalanceResponse {
    success: boolean
    newBalance?: number
}

export interface UnJoinEventRequest {
    eventId: number
}

export interface UnJoinEventResponse {
    success: boolean
    message?: string
    newBalance?: number
}

export interface CancelEventRequest {
    eventId: number
}

export interface CancelEventResponse {
    success: boolean
    message?: string
}

export interface ViewJoinedEventsResponse {
    success: boolean,
    events: Event[],
}

/* nombre de usuario, su nombre de pila,
apellido, DNI, email, contraseña y saldo disponible. Así como también la cantidad de
entradas compradas para cada evento y sus confirmaciones de asistencia. */

/*         título, fecha, descripción breve,
descripción ampliada, ubicación, imágenes, si se le suma la condición de pago o es
sin cargo, si fue cancelado y el costo de acceso al evento. */