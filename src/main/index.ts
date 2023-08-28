import { join as joinPaths } from 'path';
import { app, nativeImage, Menu, Tray } from 'electron';
import {
  SEPARATOR,
  TemplateArray,
  initialiseAutoLaunchManager,
  renderFooter,
  renderServices,
} from './utils';
import { Events, eventEmitter } from './events';
import { is } from '@electron-toolkit/utils';

/**
 * Path to macOS tray icon
 */
const TRAY_ICON_PATH = joinPaths(__dirname, '../../resources/tray-icon.png');
export const APP_NAME = 'Homebrew Services Tray';

let tray: Tray | null = null;

function createTray(services?: TemplateArray) {
  console.log('Creating tray...');

  const icon = nativeImage.createFromPath(TRAY_ICON_PATH);
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.displayBalloon({
    title: 'Hey',
    content: 'Hello',
  });

  const footer = renderFooter();
  const ctxMenu = Menu.buildFromTemplate([
    ...(services ?? []),
    SEPARATOR,
    ...footer,
    SEPARATOR,
    {
      label: 'Quit',
      click: () => {
        console.log('Quitting app...');
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Homebrew services');
  tray.setContextMenu(ctxMenu);

  console.log('Created tray');
}

function updateServicesView(templates: TemplateArray) {
  // force macOS to discard the initial tray
  // without this, a second tray will be created
  tray?.destroy();

  createTray(templates);
}

function listServicesAndRender() {
  renderServices().then(updateServicesView);
}

app.whenReady().then(async () => {
  const { join } = await import('path');
  process.env.PATH += ':' + '/Users/icheka/.nvm/versions/node/v16.20.1/bin/node';
  app.dock.hide();

  createTray();

  listServicesAndRender();

  eventEmitter.on(Events.LIST_SERVICES, () => {
    console.log('Event:', Events.LIST_SERVICES);
    listServicesAndRender();
  });

  !is.dev && initialiseAutoLaunchManager();
});
