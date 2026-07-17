const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const {
  initDatabase,
  companyQueries,
  clientQueries,
  invoiceQueries,
  invoiceItemQueries,
} = require('./database')

const isDev = !!process.env.VITE_DEV_SERVER_URL

let mainWindow

process.on('uncaughtException', (err) => {
  console.error('[MAIN] Uncaught exception:', err)
})

process.on('unhandledRejection', (err) => {
  console.error('[MAIN] Unhandled rejection:', err)
})

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Facture Desktop',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow.webContents.on('did-fail-load', (_, code, desc) => {
    console.error(`[MAIN] Failed to load: ${code} — ${desc}`)
  })

  mainWindow.on('unresponsive', () => {
    console.error('[MAIN] Window became unresponsive!')
  })
}

function registerIpcHandlers() {
  ipcMain.handle('company:getAll', () => companyQueries.getAll())
  ipcMain.handle('company:getById', (_, id) => companyQueries.getById(id))
  ipcMain.handle('company:create', (_, data) => companyQueries.create(data))
  ipcMain.handle('company:update', (_, id, data) => companyQueries.update(id, data))
  ipcMain.handle('company:delete', (_, id) => companyQueries.delete(id))

  ipcMain.handle('client:getAll', () => clientQueries.getAll())
  ipcMain.handle('client:getById', (_, id) => clientQueries.getById(id))
  ipcMain.handle('client:search', (_, term) => clientQueries.search(term))
  ipcMain.handle('client:create', (_, data) => clientQueries.create(data))
  ipcMain.handle('client:update', (_, id, data) => clientQueries.update(id, data))
  ipcMain.handle('client:delete', (_, id) => clientQueries.delete(id))

  ipcMain.handle('invoice:getAll', () => invoiceQueries.getAll())
  ipcMain.handle('invoice:getById', (_, id) => invoiceQueries.getById(id))
  ipcMain.handle('invoice:getByNumber', (_, number) => invoiceQueries.getByNumber(number))
  ipcMain.handle('invoice:getNextNumber', (_, year) => invoiceQueries.getNextNumber(year))
  ipcMain.handle('invoice:create', (_, data) => invoiceQueries.create(data))
  ipcMain.handle('invoice:update', (_, id, data) => invoiceQueries.update(id, data))
  ipcMain.handle('invoice:delete', (_, id) => invoiceQueries.delete(id))
  ipcMain.handle('invoice:duplicate', (_, id) => invoiceQueries.duplicate(id))

  ipcMain.handle('invoiceItem:getByInvoiceId', (_, invoiceId) =>
    invoiceItemQueries.getByInvoiceId(invoiceId)
  )
  ipcMain.handle('invoiceItem:getById', (_, id) => invoiceItemQueries.getById(id))
  ipcMain.handle('invoiceItem:create', (_, data) => invoiceItemQueries.create(data))
  ipcMain.handle('invoiceItem:update', (_, id, data) => invoiceItemQueries.update(id, data))
  ipcMain.handle('invoiceItem:delete', (_, id) => invoiceItemQueries.delete(id))
  ipcMain.handle('invoiceItem:recalculateTotals', (_, invoiceId) =>
    invoiceItemQueries.recalculateTotals(invoiceId)
  )
}

app.whenReady().then(() => {
  initDatabase()
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
