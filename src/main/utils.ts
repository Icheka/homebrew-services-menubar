import { MenuItemConstructorOptions, MenuItem } from 'electron';
import { exec } from 'child_process';
import { listServices } from './services';
import { Events, eventEmitter } from './events';

type Template = MenuItemConstructorOptions | MenuItem;
export type TemplateArray = Array<Template>;

let services: Awaited<ReturnType<typeof listServices>> = {};

export const SEPARATOR: Template = {
  type: 'separator',
};

export function renderFooter(): TemplateArray {
  return [
    {
      label: 'Start all',
    },
    {
      label: 'Stop all',
    },
    {
      label: 'Restart all',
    },
  ];
}

export async function renderServices(): Promise<TemplateArray> {
  services = await listServices();
  return Object.entries(services).map(([service, status]) => ({
    label: service,
    checked: status,
    type: 'checkbox',
    click: async () => {
      console.log(`Attempting to toggle ${service}`, { currentStatus: status });
      await updateService(service, !status);
    },
  }));
}

async function updateService(service: string, startService: boolean) {
  const cmd = `brew services ${startService ? 'start' : 'stop'} ${service}`;
  try {
    await runCmd(cmd);
    eventEmitter.emit(Events.LIST_SERVICES);
  } catch (err) {}
}

export function stringToColumns(str: string) {
  return str.replaceAll(/\s{2,}/g, ' ');
}

export function runCmd(cmd: string): Promise<string> {
  const cp = exec(cmd);

  return new Promise((resolve, reject) => {
    cp.stdout?.on('data', (data: string) => {
      console.log(`\n${cmd}\n${data}`);
      resolve(data);
    });

    cp.stderr?.on('data', (err) => {
      console.error(`\n${cmd}\n${err}`);
      reject(err);
    });
  });
}
