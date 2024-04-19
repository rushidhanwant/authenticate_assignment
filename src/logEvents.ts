import { logger } from './logger';
import _ from 'ramda';

export type UserEvents =
    | 'user-account-created'
    | 'user-account-creation-failed'
    | 'user-login-successful'
    | 'user-login-failed';

export type EventName =
    | UserEvents

export function logEvent(
    eventName: EventName,
    eventData: any,
    level: string = 'info',
) {
    logger.log(level, { eventName, eventData });
}


// User events

export function userAccountCreated(userDetails) {
    logEvent('user-account-created', userDetails);
}

export function userAccountCreationFailed(email) {
    logEvent('user-account-creation-failed', email);
}

export function userLoggedInEvent(userId) {
    logEvent('user-login-successful', { userId: userId });
}

export function userLoggedInFailed(reason) {
    logEvent('user-login-failed', { reason });
}
