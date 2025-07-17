import type { Role, User } from './index';

export interface LoginForm {
    username: string;
    password: string;
    remember?: boolean;
}

export interface LoginResult {
    token: string;
    expires: number;
}

export interface UserForm {
    id?: number
    name: string
    email: string
    role: string
}