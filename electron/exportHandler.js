const { BrowserWindow, dialog } = require('electron')
const fs = require('node:fs')
const ExcelJS = require('exceljs')

function formatDateFr(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const months = [
    'JANVIER', 'FEVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
    'JUILLET', 'AOUT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DECEMBRE',
  ]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-CD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function buildInvoiceHtml(invoice, client, items, company) {
  const rows = items.map((item) => `
    <tr>
      <td style="border:1px solid #999;padding:6px 8px;text-align:center">${item.truck_capacity || '—'}</td>
      <td style="border:1px solid #999;padding:6px 8px;text-align:center">${item.trips_count || 1}</td>
      <td style="border:1px solid #999;padding:6px 8px;text-align:center">${item.quantity != null ? Number(item.quantity).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''}</td>
      <td style="border:1px solid #999;padding:6px 8px">${item.designation}</td>
      <td style="border:1px solid #999;padding:6px 8px;text-align:right">${formatCurrency(item.unit_price)}</td>
      <td style="border:1px solid #999;padding:6px 8px;text-align:right;font-weight:600">${formatCurrency(item.total_price)}</td>
    </tr>
  `).join('')

  const clientHtml = client ? `
    <p><strong>Nom :</strong> ${client.full_name || '—'}</p>
    ${client.address ? `<p><strong>Adresse :</strong> ${client.address}</p>` : ''}
    ${client.quarter ? `<p><strong>Quartier :</strong> ${client.quarter}</p>` : ''}
    ${client.reference ? `<p><strong>Reference :</strong> ${client.reference}</p>` : ''}
    ${client.phone ? `<p><strong>Telephone :</strong> ${client.phone}</p>` : ''}
  ` : '<p>—</p>'

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: serif; font-size: 12px; color: #000; padding: 20mm 15mm; }
    .header { text-align: center; margin-bottom: 24px; }
    .header-inner { display: inline-flex; align-items: center; gap: 16px; }
    .logo { width: 60px; height: 60px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1d4ed8; font-weight: bold; font-size: 20px; }
    .company-name { font-size: 18px; font-weight: bold; letter-spacing: 0.5px; }
    .company-dir { font-size: 12px; color: #555; }
    .date-line { text-align: right; margin-bottom: 16px; font-size: 12px; }
    .title { text-align: center; margin-bottom: 24px; font-size: 14px; font-weight: bold; text-decoration: underline; letter-spacing: 0.5px; }
    .client-info { margin-bottom: 24px; }
    .client-info p { margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { border: 1px solid #999; padding: 8px; text-align: center; background: #f3f4f6; font-weight: 600; }
    .mentions { font-style: italic; color: #555; margin-bottom: 24px; font-size: 12px; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 32px; }
    .totals-box { width: 256px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d1d5db; font-size: 12px; }
    .totals-row-ttc { display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px; font-weight: bold; }
    .totals-ttc-value { color: #1d4ed8; }
    .signatures { display: flex; justify-content: space-between; margin-top: 48px; font-size: 12px; }
    .sig-zone { width: 40%; text-align: center; }
    .sig-space { height: 80px; }
    .sig-line { border-top: 1px solid #999; padding-top: 8px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-inner">
      <div class="logo">R</div>
      <div style="text-align:left">
        <div class="company-name">${(company && company.name) || 'REGIDESO SA'}</div>
        <div class="company-dir">${(company && company.direction) || 'DIRECTION REGIONALE DE KINSHASA EST'}</div>
      </div>
    </div>
  </div>

  <div class="date-line">
    ${invoice.issue_location || 'KINSHASA'}, le ${formatDateFr(invoice.issue_date)}
  </div>

  <div class="title">AVIS DE VENTE N&deg;${invoice.invoice_number}</div>

  <div class="client-info">
    <p style="font-weight:bold;margin-bottom:8px">Informations du client :</p>
    <div style="margin-left:16px">${clientHtml}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:12%">CAMION CITERNE (M3)</th>
        <th style="width:10%">COURSES</th>
        <th style="width:10%">QUANTITE</th>
        <th style="width:30%">DESIGNATION</th>
        <th style="width:19%">PRIX UNITAIRE</th>
        <th style="width:19%">PRIX TOTAL</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="6" style="border:1px solid #999;padding:24px;text-align:center;color:#999">Aucune ligne</td></tr>'}
    </tbody>
  </table>

  <div class="mentions">
    <p>PRELEVEMENT DE L'EAU A L'USINE AVEC LE CAMION PRIVE</p>
    <p style="margin-top:4px">Contacts REGIDESO : 815064484</p>
  </div>

  <div class="totals">
    <div class="totals-box">
      <div class="totals-row">
        <span style="font-weight:600">TOTAL H.T.</span>
        <span>${formatCurrency(invoice.subtotal)}</span>
      </div>
      <div class="totals-row">
        <span style="font-weight:600">T.V.A. (${invoice.tax_rate}%)</span>
        <span>${formatCurrency(invoice.tax_amount)}</span>
      </div>
      <div class="totals-row-ttc">
        <span>TOTAL TTC</span>
        <span class="totals-ttc-value">${formatCurrency(invoice.total_amount)}</span>
      </div>
    </div>
  </div>

  <div class="signatures">
    <div class="sig-zone">
      <div class="sig-space"></div>
      <div class="sig-line">LE CHEF DE SECTION VENTE EAU</div>
    </div>
    <div class="sig-zone">
      <div class="sig-space"></div>
      <div class="sig-line">Pour LE CHEF DE DIVISION FINANCIERE</div>
    </div>
  </div>
</body>
</html>`
}

function buildDefaultFileName(invoice) {
  const num = (invoice.invoice_number || 'FACTURE').replace(/\//g, '_')
  return `FACTURE_${num}`
}

async function exportPdf(mainWindow, invoiceId, db) {
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId)
  if (!invoice) throw new Error('Facture introuvable')

  const client = invoice.client_id
    ? db.prepare('SELECT * FROM clients WHERE id = ?').get(invoice.client_id)
    : null
  const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id').all(invoiceId)
  const companies = db.prepare('SELECT * FROM companies ORDER BY id LIMIT 1').all()
  const company = companies.length > 0 ? companies[0] : null

  const html = buildInvoiceHtml(invoice, client, items, company)

  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Exporter en PDF',
    defaultPath: buildDefaultFileName(invoice) + '.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  })
  if (canceled || !filePath) return null

  const printWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: 1100,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  })

  await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

  const pdfBuffer = await printWindow.webContents.printToPDF({
    printBackground: true,
    pageSize: 'A4',
    margins: { marginType: 'custom', top: 0, bottom: 0, left: 0, right: 0 },
    scaleFactor: 100,
  })

  printWindow.close()

  fs.writeFileSync(filePath, pdfBuffer)

  return { filePath, size: pdfBuffer.length }
}

async function exportExcel(mainWindow, invoiceId, db) {
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId)
  if (!invoice) throw new Error('Facture introuvable')

  const client = invoice.client_id
    ? db.prepare('SELECT * FROM clients WHERE id = ?').get(invoice.client_id)
    : null
  const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id').all(invoiceId)
  const companies = db.prepare('SELECT * FROM companies ORDER BY id LIMIT 1').all()
  const company = companies.length > 0 ? companies[0] : null

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Facture Desktop'
  workbook.created = new Date()

  const ws = workbook.addWorksheet('Facture', {
    pageSetup: { paperSize: 9, orientation: 'portrait' },
  })

  ws.columns = [
    { header: '', key: 'col1', width: 12 },
    { header: '', key: 'col2', width: 10 },
    { header: '', key: 'col3', width: 10 },
    { header: '', key: 'col4', width: 28 },
    { header: '', key: 'col5', width: 18 },
    { header: '', key: 'col6', width: 18 },
  ]

  const borderThin = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  }

  // --- EN-TETE ---
  ws.mergeCells('A1:F1')
  const compName = ws.getCell('A1')
  compName.value = (company && company.name) || 'REGIDESO SA'
  compName.font = { bold: true, size: 16 }
  compName.alignment = { horizontal: 'center' }

  ws.mergeCells('A2:F2')
  const compDir = ws.getCell('A2')
  compDir.value = (company && company.direction) || 'DIRECTION REGIONALE DE KINSHASA EST'
  compDir.font = { size: 11, color: { argb: 'FF555555' } }
  compDir.alignment = { horizontal: 'center' }

  // Date
  ws.mergeCells('E3:F3')
  const dateCell = ws.getCell('E3')
  dateCell.value = `${invoice.issue_location || 'KINSHASA'}, le ${formatDateFr(invoice.issue_date)}`
  dateCell.font = { size: 10 }
  dateCell.alignment = { horizontal: 'right' }

  // Titre
  ws.mergeCells('A5:F5')
  const titleCell = ws.getCell('A5')
  titleCell.value = `AVIS DE VENTE N°${invoice.invoice_number}`
  titleCell.font = { bold: true, size: 13, underline: 'single' }
  titleCell.alignment = { horizontal: 'center' }

  // --- CLIENT ---
  let row = 7
  ws.getCell(`A${row}`).value = 'Informations du client :'
  ws.getCell(`A${row}`).font = { bold: true, size: 11 }
  row++

  if (client) {
    ws.getCell(`A${row}`).value = `Nom : ${client.full_name || '—'}`
    ws.getCell(`A${row}`).font = { size: 10 }
    row++
    if (client.address) {
      ws.getCell(`A${row}`).value = `Adresse : ${client.address}`
      ws.getCell(`A${row}`).font = { size: 10 }
      row++
    }
    if (client.quarter) {
      ws.getCell(`A${row}`).value = `Quartier : ${client.quarter}`
      ws.getCell(`A${row}`).font = { size: 10 }
      row++
    }
    if (client.reference) {
      ws.getCell(`A${row}`).value = `Reference : ${client.reference}`
      ws.getCell(`A${row}`).font = { size: 10 }
      row++
    }
    if (client.phone) {
      ws.getCell(`A${row}`).value = `Telephone : ${client.phone}`
      ws.getCell(`A${row}`).font = { size: 10 }
      row++
    }
  }
  row++

  // --- TABLEAU HEADER ---
  const headerRow = row
  const headers = ['CAMION CITERNE (M3)', 'COURSES', 'QUANTITE', 'DESIGNATION', 'PRIX UNITAIRE', 'PRIX TOTAL']
  headers.forEach((h, i) => {
    const cell = ws.getCell(headerRow, i + 1)
    cell.value = h
    cell.font = { bold: true, size: 9 }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = borderThin
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }
  })

  // --- TABLEAU DATA ---
  const dataStartRow = headerRow + 1
  items.forEach((item, idx) => {
    const r = dataStartRow + idx
    ws.getCell(r, 1).value = item.truck_capacity || ''
    ws.getCell(r, 1).alignment = { horizontal: 'center' }
    ws.getCell(r, 2).value = item.trips_count || 1
    ws.getCell(r, 2).alignment = { horizontal: 'center' }
    ws.getCell(r, 3).value = item.quantity || 0
    ws.getCell(r, 3).numFmt = '#,##0.00'
    ws.getCell(r, 3).alignment = { horizontal: 'center' }
    ws.getCell(r, 4).value = item.designation || ''
    ws.getCell(r, 5).value = item.unit_price || 0
    ws.getCell(r, 5).numFmt = '#,##0.00'
    ws.getCell(r, 5).alignment = { horizontal: 'right' }

    // Formule Excel : Quantite * Prix Unitaire
    ws.getCell(r, 6).value = { formula: `C${r}*E${r}`, result: item.total_price || 0 }
    ws.getCell(r, 6).numFmt = '#,##0.00'
    ws.getCell(r, 6).alignment = { horizontal: 'right' }
    ws.getCell(r, 6).font = { bold: true }

    for (let c = 1; c <= 6; c++) {
      ws.getCell(r, c).border = borderThin
    }
  })

  const dataEndRow = items.length > 0 ? dataStartRow + items.length - 1 : dataStartRow

  // --- MENTIONS ---
  let mentionRow = dataEndRow + 2
  ws.mergeCells(`A${mentionRow}:F${mentionRow}`)
  const mention1 = ws.getCell(`A${mentionRow}`)
  mention1.value = "PRELEVEMENT DE L'EAU A L'USINE AVEC LE CAMION PRIVE"
  mention1.font = { italic: true, size: 10, color: { argb: 'FF555555' } }
  mentionRow++
  ws.mergeCells(`A${mentionRow}:F${mentionRow}`)
  const mention2 = ws.getCell(`A${mentionRow}`)
  mention2.value = 'Contacts REGIDESO : 815064484'
  mention2.font = { size: 10, color: { argb: 'FF555555' } }
  mentionRow += 2

  // --- TOTAUX ---
  ws.mergeCells(`E${mentionRow}:E${mentionRow}`)
  const totalHtLabel = ws.getCell(`E${mentionRow}`)
  totalHtLabel.value = 'TOTAL H.T.'
  totalHtLabel.font = { bold: true, size: 10 }
  totalHtLabel.alignment = { horizontal: 'right' }

  const totalHtCell = ws.getCell(`F${mentionRow}`)
  if (items.length > 0) {
    totalHtCell.value = { formula: `SUM(F${dataStartRow}:F${dataEndRow})`, result: invoice.subtotal }
  } else {
    totalHtCell.value = 0
  }
  totalHtCell.numFmt = '#,##0.00'
  totalHtCell.alignment = { horizontal: 'right' }
  totalHtCell.border = { bottom: { style: 'thin' } }
  mentionRow++

  const tvaLabel = ws.getCell(`E${mentionRow}`)
  tvaLabel.value = `T.V.A. (${invoice.tax_rate}%)`
  tvaLabel.font = { bold: true, size: 10 }
  tvaLabel.alignment = { horizontal: 'right' }

  const tvaCell = ws.getCell(`F${mentionRow}`)
  tvaCell.value = { formula: `F${mentionRow - 1}*${invoice.tax_rate}/100`, result: invoice.tax_amount }
  tvaCell.numFmt = '#,##0.00'
  tvaCell.alignment = { horizontal: 'right' }
  tvaCell.border = { bottom: { style: 'thin' } }
  mentionRow++

  const ttcLabel = ws.getCell(`E${mentionRow}`)
  ttcLabel.value = 'TOTAL TTC'
  ttcLabel.font = { bold: true, size: 13 }
  ttcLabel.alignment = { horizontal: 'right' }

  const ttcCell = ws.getCell(`F${mentionRow}`)
  ttcCell.value = { formula: `F${mentionRow - 2}+F${mentionRow - 1}`, result: invoice.total_amount }
  ttcCell.numFmt = '#,##0.00'
  ttcCell.font = { bold: true, size: 13, color: { argb: 'FF1D4ED8' } }
  ttcCell.alignment = { horizontal: 'right' }
  mentionRow += 3

  // --- SIGNATURES ---
  ws.mergeCells(`A${mentionRow}:C${mentionRow}`)
  const sig1 = ws.getCell(`A${mentionRow}`)
  sig1.value = 'LE CHEF DE SECTION VENTE EAU'
  sig1.font = { bold: true, size: 10 }
  sig1.alignment = { horizontal: 'center' }

  ws.mergeCells(`D${mentionRow}:F${mentionRow}`)
  const sig2 = ws.getCell(`D${mentionRow}`)
  sig2.value = 'Pour LE CHEF DE DIVISION FINANCIERE'
  sig2.font = { bold: true, size: 10 }
  sig2.alignment = { horizontal: 'center' }

  // --- SAUVEGARDE ---
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Exporter en Excel',
    defaultPath: buildDefaultFileName(invoice) + '.xlsx',
    filters: [{ name: 'Excel', extensions: ['xlsx'] }],
  })
  if (canceled || !filePath) return null

  await workbook.xlsx.writeFile(filePath)

  return { filePath, size: fs.statSync(filePath).size }
}

module.exports = { exportPdf, exportExcel }
