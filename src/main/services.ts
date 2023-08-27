import { Events, eventEmitter } from './events';
import { runCmd } from './utils';

export async function listServices(): Promise<{ [serviceName: string]: boolean }> {
  const cmd = 'brew services list --json';

  const data = JSON.parse(await runCmd(cmd));
  return data.reduce(
    (prev, { name, status }) => ({
      ...prev,
      [name]: status === 'started',
    }),
    {}
  );
}

export async function updateService(service: string, startService: boolean) {
  const cmd = `brew services ${startService ? 'start' : 'stop'} ${service}`;
  try {
    await runCmd(cmd);
    eventEmitter.emit(Events.LIST_SERVICES);
  } catch (err) {}
}

export async function startAllServices() {
  const cmd = 'brew services start --all';
  try {
    await runCmd(cmd);
    eventEmitter.emit(Events.LIST_SERVICES);
  } catch (err) {}
}

export async function stopAllServices() {
  const cmd = 'brew services stop --all';
  try {
    await runCmd(cmd);
    eventEmitter.emit(Events.LIST_SERVICES);
  } catch (err) {}
}

export async function restartAllServices() {
  const cmd = 'brew services restart --all';
  try {
    await runCmd(cmd);
    eventEmitter.emit(Events.LIST_SERVICES);
  } catch (err) {}
}
