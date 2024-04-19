import { Tracer, ExplicitContext, ConsoleRecorder } from 'zipkin';

const ctxImpl = new ExplicitContext();
const recorder = new ConsoleRecorder();
const localServiceName = 'hapi-core';
export const tracer = new Tracer({ ctxImpl, recorder, localServiceName });
