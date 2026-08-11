const SPREADSHEET_ID = "1sEH73Eyg8cRJe2as8wF0_YZA-TAYJbW2qq186MNIkhk";
const RESPONSE_SHEET_NAME = "";
const CONTROL_SHEET_NAME = "Asignaciones";
const ADMIN_TOKEN = "cambia-este-token";
const FIRST_INVOICE_NUMBER = 201;
const ORIGINAL_PAYMENT_COLUMN = 8; // Columna H.

const CONTROL_HEADERS = [
  "Fila original",
  "Actualizado",
  "Nombre",
  "Carne",
  "Correo",
  "Casillero solicitado",
  "Casillero asignado",
  "Tamano",
  "Estado",
  "Pago",
  "Monto",
  "Factura",
  "Fecha de pago",
];

const ORIGINAL_COLUMNS = {
  name: ["nombre completo", "nombre", "estudiante"],
  carnet: ["carne", "carnet"],
  email: ["correo electronico", "correo", "email"],
  locker: ["numero deseado", "numero de casillero reservado", "casillero", "locker"],
};

function doGet(event) {
  const callback = event.parameter.callback || "callback";
  const action = String(event.parameter.action || "status").toLowerCase();

  try {
    if (action === "status") {
      return jsonp(callback, publicStatusPayload());
    }

    requireToken(event);

    if (action === "list") {
      return jsonp(callback, listPayload());
    }

    if (action === "update") {
      return jsonp(callback, updateAssignment(event));
    }

    throw new Error("Accion no soportada.");
  } catch (error) {
    return jsonp(callback, {
      ok: false,
      error: error.message || String(error),
    });
  }
}

function requireToken(event) {
  if (ADMIN_TOKEN && event.parameter.token !== ADMIN_TOKEN) {
    throw new Error("Token invalido.");
  }
}

function listPayload() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const responseSheet = getResponseSheet(spreadsheet);
  const controlSheet = getControlSheet(spreadsheet);
  const response = readResponseSheet(responseSheet);
  const assignments = readAssignments(controlSheet);

  return {
    ok: true,
    headers: response.headers,
    rows: response.rows,
    assignments,
    nextInvoice: nextInvoice(assignments),
  };
}

function publicStatusPayload() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const responseSheet = getResponseSheet(spreadsheet);
  const controlSheet = getControlSheet(spreadsheet);
  const response = readResponseSheet(responseSheet);
  const assignments = readAssignments(controlSheet);
  const assignmentsByRow = mapAssignmentsByRow(assignments);
  const columns = detectOriginalColumns(response.headers);
  const statuses = {};

  response.rows.forEach((row) => {
    const assignment = assignmentsByRow[row.rowNumber];
    const desiredLocker = extractLockerId(row.values[columns.locker]);
    const rawOriginalPayment = responseSheet.getRange(row.rowNumber, ORIGINAL_PAYMENT_COLUMN).getValue();
    const status = assignment ? normalizeStatus(assignment.status) : (isPaid(rawOriginalPayment) ? "pagado" : "reservado");
    const locker = assignment && assignment.locker ? assignment.locker : desiredLocker;

    if (!locker || status === "disponible") {
      return;
    }

    if (!statuses[locker]) {
      statuses[locker] = { count: 0, paid: false, status: "reservado" };
    }
    statuses[locker].count += 1;
    if (status === "pagado" || isPaid(rawOriginalPayment)) {
      statuses[locker].paid = true;
      statuses[locker].status = "pagado";
    }
  });

  return {
    ok: true,
    statuses,
  };
}

function updateAssignment(event) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const responseSheet = getResponseSheet(spreadsheet);
  const controlSheet = getControlSheet(spreadsheet);
  const response = readResponseSheet(responseSheet);
  const columns = detectOriginalColumns(response.headers);

  const rowNumber = Number(event.parameter.rowNumber);
  if (!rowNumber || rowNumber < 2) {
    throw new Error("Fila invalida.");
  }

  const row = response.rows.find((item) => item.rowNumber === rowNumber);
  if (!row) {
    throw new Error("No se encontro la solicitud original.");
  }

  const status = normalizeStatus(event.parameter.status);
  const locker = status === "disponible" ? "" : extractLockerId(event.parameter.locker);
  if (status !== "disponible" && !locker) {
    throw new Error("Casillero invalido.");
  }

  const assignments = readAssignments(controlSheet);
  const existing = assignments.find((item) => Number(item.rowNumber) === rowNumber);
  const invoice = status === "pagado" ? existing && existing.invoice ? existing.invoice : nextInvoice(assignments) : "";
  const paymentDate = status === "pagado" ? String(event.parameter.paymentDate || todayIso()) : "";
  const amount = status === "disponible" || !locker ? "" : priceForLocker(locker);
  const payment = status === "pagado" ? "SI" : "NO";
  const desiredLocker = extractLockerId(row.values[columns.locker]);
  const record = {
    rowNumber,
    updatedAt: new Date(),
    name: valueOrBlank(row.values[columns.name]),
    carnet: valueOrBlank(row.values[columns.carnet]),
    email: valueOrBlank(row.values[columns.email]),
    desiredLocker,
    locker,
    size: locker ? sizeForLocker(locker) : "",
    status: labelStatus(status),
    payment,
    amount,
    invoice,
    paymentDate,
  };

  upsertAssignment(controlSheet, record);

  if (status === "pagado") {
    if (!responseSheet.getRange(1, ORIGINAL_PAYMENT_COLUMN).getValue()) {
      responseSheet.getRange(1, ORIGINAL_PAYMENT_COLUMN).setValue("Pago");
    }
    responseSheet.getRange(rowNumber, ORIGINAL_PAYMENT_COLUMN).setValue("SI");
  }

  return {
    ok: true,
    assignment: record,
    nextInvoice: nextInvoice(readAssignments(controlSheet)),
  };
}

function getResponseSheet(spreadsheet) {
  const sheet = RESPONSE_SHEET_NAME
    ? spreadsheet.getSheetByName(RESPONSE_SHEET_NAME)
    : spreadsheet.getSheets()[0];
  if (!sheet) {
    throw new Error("No se encontro la hoja de respuestas.");
  }
  return sheet;
}

function getControlSheet(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(CONTROL_SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONTROL_SHEET_NAME);
  }
  ensureControlHeaders(sheet);
  return sheet;
}

function ensureControlHeaders(sheet) {
  const current = sheet.getRange(1, 1, 1, CONTROL_HEADERS.length).getValues()[0];
  const needsHeaders = CONTROL_HEADERS.some((header, index) => String(current[index] || "") !== header);
  if (needsHeaders) {
    sheet.getRange(1, 1, 1, CONTROL_HEADERS.length).setValues([CONTROL_HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function readResponseSheet(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastRow < 1 || lastColumn < 1) {
    return { headers: [], rows: [] };
  }

  const values = sheet.getRange(1, 1, lastRow, lastColumn).getValues();
  const headers = values[0].map(String);
  const rows = values.slice(1).map((row, index) => {
    const rowValues = {};
    headers.forEach((header, colIndex) => {
      rowValues[header] = normalizeCellValue(row[colIndex]);
    });
    return {
      rowNumber: index + 2,
      values: rowValues,
    };
  });
  return { headers, rows };
}

function readAssignments(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }
  const rows = sheet.getRange(2, 1, lastRow - 1, CONTROL_HEADERS.length).getValues();
  return rows
    .filter((row) => row[0])
    .map((row) => ({
      rowNumber: Number(row[0]),
      updatedAt: normalizeCellValue(row[1]),
      name: normalizeCellValue(row[2]),
      carnet: normalizeCellValue(row[3]),
      email: normalizeCellValue(row[4]),
      desiredLocker: normalizeCellValue(row[5]),
      locker: normalizeCellValue(row[6]),
      size: normalizeCellValue(row[7]),
      status: normalizeCellValue(row[8]),
      payment: normalizeCellValue(row[9]),
      amount: normalizeCellValue(row[10]),
      invoice: normalizeCellValue(row[11]),
      paymentDate: normalizeCellValue(row[12]),
    }));
}

function upsertAssignment(sheet, record) {
  const assignments = readAssignments(sheet);
  const existingIndex = assignments.findIndex((item) => Number(item.rowNumber) === Number(record.rowNumber));
  const values = [[
    record.rowNumber,
    record.updatedAt,
    record.name,
    record.carnet,
    record.email,
    record.desiredLocker,
    record.locker,
    record.size,
    record.status,
    record.payment,
    record.amount,
    record.invoice,
    record.paymentDate,
  ]];

  if (existingIndex === -1) {
    sheet.appendRow(values[0]);
  } else {
    sheet.getRange(existingIndex + 2, 1, 1, CONTROL_HEADERS.length).setValues(values);
  }
}

function detectOriginalColumns(headers) {
  const result = {};
  Object.keys(ORIGINAL_COLUMNS).forEach((key) => {
    result[key] = headers.find((header) => {
      const normalizedHeader = normalizeText(header);
      return ORIGINAL_COLUMNS[key].some((candidate) => normalizedHeader.indexOf(normalizeText(candidate)) !== -1);
    }) || "";
  });
  return result;
}

function mapAssignmentsByRow(assignments) {
  return assignments.reduce((map, assignment) => {
    map[Number(assignment.rowNumber)] = assignment;
    return map;
  }, {});
}

function nextInvoice(assignments) {
  const max = assignments.reduce((highest, assignment) => {
    const match = String(assignment.invoice || "").match(/^2026-(\d+)$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, FIRST_INVOICE_NUMBER - 1);
  return `2026-${max + 1}`;
}

function extractLockerId(value) {
  const text = String(value || "").trim();
  const exact = text.match(/^\D*([1-9][0-9]?)\D*$/);
  if (exact && Number(exact[1]) <= 66) {
    return exact[1];
  }
  const loose = text.match(/\b([1-9][0-9]?)\b/);
  return loose && Number(loose[1]) <= 66 ? loose[1] : "";
}

function priceForLocker(locker) {
  return sizeForLocker(locker) === "Grande" ? 3000 : 4000;
}

function sizeForLocker(locker) {
  const number = Number(locker);
  return number >= 13 && number <= 42 ? "Grande" : "Pequeno";
}

function normalizeStatus(value) {
  const normalized = normalizeText(value);
  if (normalized === "pagado" || normalized === "pago") {
    return "pagado";
  }
  if (normalized === "disponible" || normalized === "libre" || normalized === "cancelado") {
    return "disponible";
  }
  return "reservado";
}

function labelStatus(status) {
  return {
    disponible: "Disponible",
    reservado: "Reservado",
    pagado: "Pagado",
  }[status] || "Reservado";
}

function isPaid(value) {
  const normalized = normalizeText(value).replace(/\s+/g, "");
  return ["s", "si", "pagado", "pago", "1", "true"].indexOf(normalized) !== -1;
}

function todayIso() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function normalizeCellValue(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return value === null || value === undefined ? "" : String(value);
}

function valueOrBlank(value) {
  return value === null || value === undefined ? "" : String(value);
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
