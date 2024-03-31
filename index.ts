export type Result<T, E> = Ok<T> | Err<E>;

export class Ok<const T> {
    public constructor(public readonly value: T) {}
}

export class Err<const E> extends Error {
    public constructor(public readonly reason: E) {
        super();
    }

    public override toString(): string {
        return this.reason == null || this.reason.toString === Object.prototype.toString
            ? "Err"
            : String(this.reason);
    }
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

export function asyncResultFrom<const T>(fn: () => T | Promise<T>): Promise<Result<T, null>>;
export function asyncResultFrom<const T, const E>(
    fn: () => T | Promise<T>,
    catchFn: (error: unknown) => E | Promise<E>
): Promise<Result<T, E>>;
export async function asyncResultFrom<const T, const E = null>(
    fn: () => T | Promise<T>,
    catchFn: (error: unknown) => E | Promise<E> = () => null as E
): Promise<Result<T, E>> {
    try {
        return ok(await fn());
    } catch (reason: unknown) {
        return err(await catchFn(reason));
    }
}

export function isOk<const T>(result: Result<T, unknown>): result is Ok<T> {
    return result instanceof Ok;
}

export function isErr<const E>(result: Result<unknown, E>): result is Err<E> {
    return result instanceof Err;
}

export function unwrapOk<const T>(result: Result<T, unknown>): T {
    if (result instanceof Ok) {
        return result.value;
    } else {
        throw result;
    }
}

export function unwrapErr<const E>(result: Result<unknown, E>): E {
    if (result instanceof Ok) {
        throw new TypeError("Err expected");
    } else {
        return result.reason;
    }
}

export function bindResult<const TInValue, const TOutValue, const TInReason, const TOutReason>(
    result: Result<TInValue, TInReason>,
    fn: (value: TInValue) => Result<TOutValue, TOutReason>
): Result<TOutValue, TInReason | TOutReason> {
    if (result instanceof Ok) {
        return fn(result.value);
    } else {
        return result;
    }
}

export function bindResultFn<const TInValue, const TOutValue, const TOutReason>(
    fn: (value: TInValue) => Result<TOutValue, TOutReason>
): <const TInReason>(
    result: Result<TInValue, TInReason>
) => Result<TOutValue, TInReason | TOutReason> {
    return result => bindResult(result, fn);
}

export function mapOk<const TInValue, const TOutValue, const TReason>(
    result: Result<TInValue, TReason>,
    fn: (value: TInValue) => TOutValue
): Result<TOutValue, TReason> {
    if (result instanceof Err) {
        return result;
    } else {
        return ok(fn(result.value));
    }
}

export function mapOkFn<const TInValue, const TOutValue>(
    fn: (value: TInValue) => TOutValue
): <const TReason>(result: Result<TInValue, TReason>) => Result<TOutValue, TReason> {
    return reason => mapOk(reason, fn);
}

export function mapErr<const TValue, const TInReason, const TOutReason>(
    result: Result<TValue, TInReason>,
    fn: (reason: TInReason) => TOutReason
): Result<TValue, TOutReason> {
    if (result instanceof Err) {
        return err(fn(result.reason));
    } else {
        return result;
    }
}

export function mapErrFn<const TInReason, const TOutReason>(
    fn: (reason: TInReason) => TOutReason
): <const TValue>(result: Result<TValue, TInReason>) => Result<TValue, TOutReason> {
    return result => mapErr(result, fn);
}
