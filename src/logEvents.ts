import { logger } from './logger';
import _ from 'ramda';

export type UserEvents =
    | 'user-account-created'
    | 'user-account-creation-failed'
    | 'user-login-successful'
    | 'user-login-failed';

export type PhoneBookEvents =
    | 'mark-spam-failed';

export type EventName = 
    | UserEvents 
    | PhoneBookEvents;

export function logEvent(
    eventName: EventName,
    eventData: any,
    level: string = 'info',
) {
    logger.log(level, { eventName, eventData });
}

// User events

export function userAccountCreated(data: any) {
    logEvent('user-account-created', data);
}

export function userAccountCreationFailed(data: any) {
    logEvent('user-account-creation-failed', data);
}

export function userLoggedInEvent(userId) {
    logEvent('user-login-successful', { userId: userId });
}

export function userLoggedInFailed(reason) {
    logEvent('user-login-failed', { reason });
}

export function markSpamFailed(reason) {
    logEvent('mark-spam-failed', { reason });
}
