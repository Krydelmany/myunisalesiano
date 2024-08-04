const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config();

const ra = process.env.ra;
const senha = process.env.senha;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      worldSafeExecuteJavaScript: true,
      sandbox: true,
    }
  });

  mainWindow.loadFile('index.html');
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Listen for the maximize request from the renderer process
ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    mainWindow.maximize();
  }
});

// Webscrapping
require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.unisalesiano.com.br/salaEstudo/alunos/');

  // Click the input that opens the dropdown
  await page.click('input.select-dropdown.dropdown-trigger');

  // Wait for the dropdown to be visible
  await page.waitForSelector('ul.dropdown-content');

  // Click the item with the text "UNISALESIANO-ARAÇATUBA"
  await page.evaluate(() => {
    const items = document.querySelectorAll('ul.dropdown-content li');
    items.forEach(item => {
      if (item.textContent.includes('UNISALESIANO-ARAÇATUBA')) {
        item.click();
      }
    });
  });

  // Wait for the login form to be available
  await page.waitForSelector('input[name="ra"]');

  // Fill in the login form
  await page.type('input[name="ra"]',ra); // Use environment variables for sensitive data
  await page.type('input[name="senha"]',senha);
  
  // Click the login button
  await page.click('button[type="button"][onclick="realizarLogin(\'frmLogin\')"]');
  // Wait for navigation after login
  await page.waitForNavigation();
 
  // Optional: Wait for some time to see the result of the selection
  
  await page.evaluate(() => {
    const menuAva = document.querySelector('#menuAva .blue-text.text-darken-3.clique');
    if (menuAva) {
      menuAva.click();
      console.log('Elemento clicado');
    } else {
      console.log('Elemento não encontrado');
    }
  });
  
  await page.waitForSelector('#snap-pm-trigger', { timeout: 10000 })
  .then(async () => {
    await page.evaluate(() => {
      const meusCursos = document.querySelector('#snap-pm-trigger');
      if (meusCursos) {
        meusCursos.click();
        return 'Elemento clicado';
      } else {
        return 'Elemento não encontrado';
      }
    }).then(result => console.log(result));
  })
  .catch(error => console.log('Erro ao esperar pelo elemento:', error));

  await page.waitForTimeout(5000);

  await browser.close();
})();





