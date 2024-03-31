export type Result<T, E> = Ok<T> | Err<E>;

export class Ok<const T> {
    public constructor(public readonly value: T) {}
}

export class Err<const E> {
    public constructor(public readonly reason: E) {}
}

export function ok(): Ok<null>;
export function ok<const T>(value: T): Ok<T>;
export function ok<const T = null>(value: T = null as T): Ok<T> {
    return new Ok(value);
}

export function err(): Err<null>;
export function err<const E>(reason: E): Err<E>;
export function err<const E = null>(reason: E = null as E): Err<E> {
    return new Err(reason);
}

export function resultFrom<const T>(fn: () => T): Result<T, null>;
export function resultFrom<const T, const E>(
    fn: () => T,
    catchFn: (error: unknown) => E
): Result<T, E>;
export function resultFrom<const T, const E>(
    fn: () => T,
    catchFn: (error: unknown) => E = () => null as E
): Result<T, E> {
    try {
        return ok(fn());
    } catch (reason: unknown) {
        return err(catchFn(reason));
    }
}
