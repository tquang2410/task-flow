// src/types/actions.ts

export type ActionResponse<T> = {
    status: 'success';
    data: T;
} | {
    status: 'error';
    message: string;
    fieldErrors?: Record<string, string[] | undefined>;
};