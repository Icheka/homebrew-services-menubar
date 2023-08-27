import { join as joinPaths } from 'path';
import { app, nativeImage, Menu, Tray } from 'electron';
import { SEPARATOR, TemplateArray, renderFooter, renderServices } from './utils';
import { Events, eventEmitter } from './events';

/**
 * Path to macOS tray icon
 */
const iconPath = joinPaths(__dirname, '../../resources/tray-icon.png');

let tray: Tray | null = null;

function createTray(services?: TemplateArray) {
  console.log('Creating tray...');

  const icon = nativeImage.createFromPath(iconPath);
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.displayBalloon({
    title: 'Hey',
    content: 'Hello',
  });

  const footer = renderFooter();
  const ctxMenu = Menu.buildFromTemplate([...(services ?? []), SEPARATOR, ...footer]);

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

app.whenReady().then(() => {
  createTray();

  listServicesAndRender();

  eventEmitter.on(Events.LIST_SERVICES, () => {
    console.log('Event:', Events.LIST_SERVICES);
    listServicesAndRender();
  });
});
