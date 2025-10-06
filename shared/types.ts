interface Event {
    id: string
    title: string
    date: string
    description: string
    location: string
    imagen_url: string
    price: number

}

interface EventUser {
    id: string
    id_user: string
    id_event: string
    
}

interface User {
    id: string
    username: string
    nickname: string
    full_name: string
    DNI: string
    password: string
    balance: number
    tickets_bought: number // default(0)
    confirmed_asistances: number // default (0)
    
}


/* nombre de usuario, su nombre de pila,
apellido, DNI, email, contraseña y saldo disponible. Así como también la cantidad de
entradas compradas para cada evento y sus confirmaciones de asistencia. */

/*         título, fecha, descripción breve,
descripción ampliada, ubicación, imágenes, si se le suma la condición de pago o es
sin cargo, si fue cancelado y el costo de acceso al evento. */