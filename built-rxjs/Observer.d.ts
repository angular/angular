export interface Observer<T> {
    next?: (value: T) => void;
    error?: (err?: any) => void;
    complete?: () => void;
    isUnsubscribed?: boolean;
}
