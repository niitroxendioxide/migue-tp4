import { db } from "../db/db";
import { User, type LoginRequest, type LoginResponse, type RegisterRequest, type RegisterResponse } from "../../../shared/types";
import { BadRequestError, NotFoundError } from "../middleware/errors";


// helpers
async function createNewToken(p_User: User): Promise<string> {
    const token = await db.tokens.create({
        data: {
            userId: p_User.id,
            token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            expiresAt: new Date(Date.now() + 3600 * 1000),
        },

        select: {
            token: true,
        }
    });

    return token.token;
}

async function createNewUser(p_User: RegisterRequest): Promise<User> {
    const user = await db.user.create({
        data: {
            name: p_User.username,
            email: p_User.email,
            password: p_User.password,
            isAdmin: false,
            full_name: p_User.full_name,
            dni: p_User.DNI,
        },
    });

    return user;
}




// public functions
export async function getUserByEmail(p_Email: string) {
    const user = await db.user.findUnique({
        where: { 
            email: p_Email
        },

        select: {
            id: true,
            name: true,
            email: true,
            balance: true,
            isAdmin: true,
            password: true,
            dni: true,
            full_name: true,
        }
    });

    return user;
}

export async function validateToken(p_Token: string, p_UserId: number): Promise<Boolean> {
    const token = await db.tokens.findUnique({
        where: {
            token: p_Token,
        },
        select: {
            userId: true,
        }
    });

    if (!token) {
        return false;
    }
    
    return true;
}

export async function handleLoginRequest(p_Request: LoginRequest): Promise<LoginResponse> {
    const user = await getUserByEmail(p_Request.email);
    
    if (!user) {
        throw new NotFoundError('User not found');
    }

    if (p_Request.password !== user.password) {
        throw new BadRequestError('Invalid password');
    }

    const user_data =  {
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        isAdmin: user.isAdmin,
        dni: user.dni,
        full_name: user.full_name,
    } as User;

    const new_token = await createNewToken(user_data);

    return {
        success: true,
        user: user_data,
        token: new_token,
    }
}

export async function handleRegisterRequest(p_Request: RegisterRequest): Promise<RegisterResponse> {
    if (!p_Request.email || !p_Request.password || !p_Request.username || !p_Request.full_name || !p_Request.DNI) {
        throw new BadRequestError('Missing required fields');
    }

    if (p_Request.DNI <= 0) {
        throw new BadRequestError('DNI Inválido');
    }

    if (!p_Request.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
        throw new BadRequestError('Invalid email');
    }
    
    const existing_user = await getUserByEmail(p_Request.email);

    if (existing_user) {
        throw new BadRequestError('Email already in use');
    }

    const new_user = await createNewUser(p_Request);
    const new_token = await createNewToken(new_user);

    return {
        success: true,
        user: new_user,
        token: new_token,
    }
}