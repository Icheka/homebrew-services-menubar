import EventEmitter from 'events';

export enum Events {
  LIST_SERVICES = 'list-services',
}

export const eventEmitter = new EventEmitter();
