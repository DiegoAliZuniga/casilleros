const SPREADSHEET_ID = "1sEH73Eyg8cRJe2as8wF0_YZA-TAYJbW2qq186MNIkhk";
const TARGET_SHEET_NAME = "";
const ADMIN_TOKEN = "cambia-este-token";

const COLUMNS = {
  locker: ["numero deseado", "numero de casillero reservado", "casillero", "locker"],
  payment: ["estatus de pago", "estado de pago", "pago", "pagado"],
  status: ["estado", "estatus", "status"],
};

function doGet(event) {
  const callback = event.parameter.callback || "callback";
  try {
    if (ADMIN_TOKEN && event.parameter.token !== ADMIN_TOKEN) {
      throw new Error("Token invalido.");
    }
    if (event.parameter.action !== "update") {
      throw new Error("Accion no soportada.");
    }

    const rowNumber = Number(event.parameter.rowNumber);
    if (!rowNumber || rowNumber < 2) {
      throw new Error("Fila invalida.");
    }

    const status = normalizeStatus(event.parameter.status);
    const locker = String(event.parameter.locker || "").trim();
    const payment = String(event.parameter.payment || "NO").trim().toUpperCase() === "SI" ? "SI" : "NO";

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = TARGET_SHEET_NAME
      ? spreadsheet.getSheetByName(TARGET_SHEET_NAME)
      : spreadsheet.getSheets()[0];
    if (!sheet) {
      throw new Error("No se encontro la hoja.");
    }

    const headers = getHeaders(sheet);
    const lockerCol = findOrCreateColumn(sheet, headers, COLUMNS.locker, "Numero deseado");
    const paymentCol = findOrCreateColumn(sheet, headers, COLUMNS.payment, "Pago");
    const statusCol = findOrCreateColumn(sheet, headers, COLUMNS.status, "Estado");

    if (status === "disponible") {
      sheet.getRange(rowNumber, lockerCol).setValue("");
      sheet.getRange(rowNumber, paymentCol).setValue("NO");
      sheet.getRange(rowNumber, statusCol).setValue("Disponible");
    } else if (status === "pagado") {
      sheet.getRange(rowNumber, lockerCol).setValue(locker);
      sheet.getRange(rowNumber, paymentCol).setValue("SI");
      sheet.getRange(rowNumber, statusCol).setValue("Pagado");
    } else {
      sheet.getRange(rowNumber, lockerCol).setValue(locker);
      sheet.getRange(rowNumber, paymentCol).setValue(payment);
      sheet.getRange(rowNumber, statusCol).setValue(payment === "SI" ? "Pagado" : "Reservado");
    }

    return jsonp(callback, {
      ok: true,
      rowNumber,
      locker,
      status,
      payment: status === "pagado" ? "SI" : payment,
    });
  } catch (error) {
    return jsonp(callback, {
      ok: false,
      error: error.message || String(error),
    });
  }
}

function getHeaders(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String);
}

function findOrCreateColumn(sheet, headers, candidates, fallbackName) {
  const normalizedCandidates = candidates.map(normalizeText);
  const index = headers.findIndex((header) => {
    const normalizedHeader = normalizeText(header);
    return normalizedCandidates.some((candidate) => normalizedHeader.indexOf(candidate) !== -1);
  });

  if (index !== -1) {
    return index + 1;
  }

  const newColumn = headers.length + 1;
  sheet.getRange(1, newColumn).setValue(fallbackName);
  headers.push(fallbackName);
  return newColumn;
}

function normalizeStatus(value) {
  const normalized = normalizeText(value);
  if (normalized === "pagado" || normalized === "pago") {
    return "pagado";
  }
  if (normalized === "disponible" || normalized === "libre") {
    return "disponible";
  }
  return "reservado";
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function jsonp(callback, payload) {
  const safeCallback = String(callback).replace(/[^\w.$]/g, "");
  return ContentService
    .createTextOutput(`${safeCallback}(${JSON.stringify(payload)})`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
