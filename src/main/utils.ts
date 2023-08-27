import { MenuItemConstructorOptions, MenuItem } from 'electron';
import { exec } from 'child_process';
import {
  listServices,
  restartAllServices,
  startAllServices,
  stopAllServices,
  updateService,
} from './services';
import AutoLaunch from 'auto-launch';
import settings from 'electron-settings';
import { APP_NAME } from '.';

const AUTO_LAUNCH_CONFIG_KEY = 'autoLaunch';

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

export async function initialiseAutoLaunchManager() {
  const autoLaunch = new AutoLaunch({
    name: APP_NAME,
  });

  async function enableAutoLaunch() {
    console.log('Enabling auto-launch...');

    try {
      await autoLaunch.enable();
      await settings.set(AUTO_LAUNCH_CONFIG_KEY, true);

      return console.log('Auto-launch enabled');
    } catch (err) {
      console.error('Failed to enable auto-launch', err);
    }
  }

  async function disableAutoLaunch() {
    console.log('Disabling auto-launch...');

    try {
      await autoLaunch.disable();
      await settings.set(AUTO_LAUNCH_CONFIG_KEY, false);

      return console.log('Auto-launch disabled');
    } catch (err) {
      console.error('Failed to disable auto-launch', err);
    }
  }

  const config = await settings.get(AUTO_LAUNCH_CONFIG_KEY);
  if (config === undefined) {
    // This is app's first launch
    // Auto-launch is enabled by default
    return enableAutoLaunch();
  }

  const isEnabled = await autoLaunch.isEnabled();
  if (config === false && isEnabled) return disableAutoLaunch();

  if (!isEnabled) return enableAutoLaunch();
}
