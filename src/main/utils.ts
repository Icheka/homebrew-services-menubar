import { MenuItemConstructorOptions, MenuItem } from 'electron';
import { exec } from 'child_process';
import {
  listServices,
  restartAllServices,
  startAllServices,
  stopAllServices,
  updateService,
} from './services';

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
      click: () => {
        console.log('Attempting to start all services');
        startAllServices();
      },
    },
    {
      label: 'Stop all',
      click: () => {
        console.log('Attempting to stop all services');
        stopAllServices();
      },
    },
    {
      label: 'Restart all',
      click: () => {
        console.log('Attempting to restart all services');
        restartAllServices();
      },
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
