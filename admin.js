const SHEET_ID = "1sEH73Eyg8cRJe2as8wF0_YZA-TAYJbW2qq186MNIkhk";
const SHEET_GID = "0";
const APPS_SCRIPT_URL = "";
const ADMIN_TOKEN = "cambia-este-token";

const LOCKERS = [
  locker("19", 1, 1, 2, 1),
  locker("20", 1, 2, 2, 1),
  locker("21", 1, 3, 2, 1),
  locker("43", 1, 4, 1, 1),
  locker("44", 1, 5, 1, 1),
  locker("45", 1, 6, 1, 1),
  locker("55", 1, 8, 1, 1),
  locker("56", 1, 9, 1, 1),
  locker("57", 1, 10, 1, 1),
  locker("31", 1, 11, 2, 1),
  locker("32", 1, 12, 2, 1),
  locker("33", 1, 13, 2, 1),
  locker("37", 1, 14, 2, 1),
  locker("38", 1, 15, 2, 1),
  locker("39", 1, 16, 2, 1),
  locker("13", 1, 17, 2, 1),
  locker("14", 1, 18, 2, 1),
  locker("15", 1, 19, 2, 1),
  locker("1", 1, 20, 1, 1),
  locker("2", 1, 21, 1, 1),
  locker("3", 1, 22, 1, 1),
  locker("25", 1, 23, 2, 1),
  locker("26", 1, 24, 2, 1),
  locker("27", 1, 25, 2, 1),
  locker("46", 2, 4, 1, 1),
  locker("47", 2, 5, 1, 1),
  locker("48", 2, 6, 1, 1),
  locker("58", 2, 8, 1, 1),
  locker("59", 2, 9, 1, 1),
  locker("60", 2, 10, 1, 1),
  locker("4", 2, 20, 1, 1),
  locker("5", 2, 21, 1, 1),
  locker("6", 2, 22, 1, 1),
  locker("22", 3, 1, 2, 1),
  locker("23", 3, 2, 2, 1),
  locker("24", 3, 3, 2, 1),
  locker("49", 3, 4, 1, 1),
  locker("50", 3, 5, 1, 1),
  locker("51", 3, 6, 1, 1),
  locker("61", 3, 8, 1, 1),
  locker("62", 3, 9, 1, 1),
  locker("63", 3, 10, 1, 1),
  locker("34", 3, 11, 2, 1),
  locker("35", 3, 12, 2, 1),
  locker("36", 3, 13, 2, 1),
  locker("40", 3, 14, 2, 1),
  locker("41", 3, 15, 2, 1),
  locker("42", 3, 16, 2, 1),
  locker("16", 3, 17, 2, 1),
  locker("17", 3, 18, 2, 1),
  locker("18", 3, 19, 2, 1),
  locker("7", 3, 20, 1, 1),
  locker("8", 3, 21, 1, 1),
  locker("9", 3, 22, 1, 1),
  locker("28", 3, 23, 2, 1),
  locker("29", 3, 24, 2, 1),
  locker("30", 3, 25, 2, 1),
  locker("52", 4, 4, 1, 1),
  locker("53", 4, 5, 1, 1),
  locker("54", 4, 6, 1, 1),
  locker("64", 4, 8, 1, 1),
  locker("65", 4, 9, 1, 1),
  locker("66", 4, 10, 1, 1),
  locker("10", 4, 20, 1, 1),
  locker("11", 4, 21, 1, 1),
  locker("12", 4, 22, 1, 1),
];

const lockerIds = new Set(LOCKERS.map((item) => item.id));
const elements = {
  loadStatus: document.querySelector("#admin-load-status"),
  updatedAt: document.querySelector("#admin-updated-at"),
  refresh: document.querySelector("#admin-refresh-button"),
  search: document.querySelector("#reservation-search"),
  list: document.querySelector("#reservation-list"),
  form: document.querySelector("#assignment-form"),
  selectedTitle: document.querySelector("#selected-person-title"),
  lockerSelect: document.querySelector("#locker-select"),
  statusSelect: document.querySelector("#status-select"),
  paymentSelect: document.querySelector("#payment-select"),
  receiptInput: document.querySelector("#receipt-input"),
  amountInput: document.querySelector("#amount-input"),
  paymentDateInput: document.querySelector("#payment-date-input"),
  saveButton: document.querySelector("#save-sheet-button"),
  copyButton: document.querySelector("#copy-values-button"),
  saveStatus: document.querySelector("#save-status"),
  contract: document.querySelector("#contract-preview"),
  printButton: document.querySelector("#print-contract-button"),
};

const columnCandidates = {
  name: ["nombre completo", "nombre", "estudiante"],
  carnet: ["carne", "carnet", "carn\u00e9"],
  career: ["carrera"],
  phone: ["telefono", "tel\u00e9fono", "celular"],
  email: ["correo electronico", "correo electr\u00f3nico", "correo", "email"],
  locker: ["numero deseado", "n\u00famero deseado", "numero de casillero reservado", "casillero", "locker"],
  payment: ["estatus de pago", "estado de pago", "pago", "pagado"],
  status: ["estado", "estatus", "status"],
};

const state = {
  rows: [],
  columns: {},
  search: "",
  selectedRowNumber: null,
};

init();

function init() {
  fillLockerOptions();
  wireControls();
  renderContract();
  loadSheet();
}

function locker(id, row, col, rowSpan, colSpan) {
  return {
    id,
    row,
    col,
    rowSpan,
    colSpan,
    size: rowSpan > 1 || colSpan > 1 ? "grande" : "pequeno",
  };
}

function fillLockerOptions() {
  const sorted = [...LOCKERS].sort((a, b) => Number(a.id) - Number(b.id));
  elements.lockerSelect.innerHTML = '<option value="">Sin casillero</option>';
  sorted.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.id} - ${sizeLabel(item.size)}`;
    elements.lockerSelect.append(option);
  });
}

function wireControls() {
  elements.refresh.addEventListener("click", () => loadSheet());
  elements.search.addEventListener("input", (event) => {
    state.search = event.target.value.trim();
    renderReservations();
  });
  elements.statusSelect.addEventListener("change", () => {
    syncPaymentFromStatus();
    renderContract();
  });
  [
    elements.lockerSelect,
    elements.paymentSelect,
    elements.receiptInput,
    elements.amountInput,
    elements.paymentDateInput,
  ].forEach((element) => element.addEventListener("input", renderContract));
  elements.form.addEventListener("submit", saveAssignment);
  elements.copyButton.addEventListener("click", copySheetValues);
  elements.printButton.addEventListener("click", () => window.print());
}

async function loadSheet() {
  elements.refresh.disabled = true;
  elements.loadStatus.textContent = "Cargando reservas desde Google Sheets...";
  elements.updatedAt.textContent = "";
  setSaveStatus("");

  try {
    const response = await loadGoogleSheetJson();
    const parsed = tableToRows(response.table);
    state.rows = parsed.rows;
    state.columns = detectColumns(parsed.headers);
    elements.loadStatus.textContent = `${state.rows.length} reservas cargadas.`;
    elements.updatedAt.textContent = `Actualizado ${formatTime(new Date())}`;
    if (!state.selectedRowNumber && state.rows[0]) {
      selectRow(state.rows[0].__rowNumber);
    }
    renderReservations();
  } catch (error) {
    state.rows = [];
    state.columns = {};
    elements.loadStatus.textContent =
      "No se pudieron cargar las reservas. Revisa que la hoja este compartida como publica.";
    setSaveStatus(error instanceof Error ? error.message : "Error al leer la hoja.", "error");
    renderReservations();
  } finally {
    elements.refresh.disabled = false;
  }
}

function renderReservations() {
  const rows = filteredRows();
  elements.list.innerHTML = "";
  if (!rows.length) {
    const empty = document.createElement("p");
    empty.className = "save-status";
    empty.textContent = "No hay reservas para mostrar.";
    elements.list.append(empty);
    return;
  }

  rows.forEach((row) => {
    const person = getPerson(row);
    const status = getRowStatus(row);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "reservation-row";
    button.classList.toggle("selected", row.__rowNumber === state.selectedRowNumber);
    button.innerHTML = `
      <span>
        <span class="reservation-name">${escapeHtml(person.name || "Sin nombre")}</span>
        <span class="reservation-meta">${escapeHtml([person.carnet, person.email].filter(Boolean).join(" / ") || "Sin contacto")}</span>
      </span>
      <span class="reservation-locker">${escapeHtml(person.locker ? `#${person.locker}` : "Sin #")}</span>
      <span class="reservation-state" data-state="${status}">${escapeHtml(statusLabel(status))}</span>
    `;
    button.addEventListener("click", () => selectRow(row.__rowNumber));
    elements.list.append(button);
  });
}

function filteredRows() {
  if (!state.search) {
    return state.rows;
  }
  const needle = normalize(state.search);
  return state.rows.filter((row) => {
    const person = getPerson(row);
    return normalize(Object.values(person).join(" ")).includes(needle);
  });
}

function selectRow(rowNumber) {
  state.selectedRowNumber = rowNumber;
  const row = selectedRow();
  if (!row) {
    return;
  }

  const person = getPerson(row);
  const status = getRowStatus(row);
  elements.selectedTitle.textContent = person.name || `Fila ${row.__rowNumber}`;
  elements.lockerSelect.value = person.locker || "";
  elements.statusSelect.value = status;
  elements.paymentSelect.value = status === "pagado" || isPaidValue(person.payment) ? "SI" : "NO";
  elements.receiptInput.value = "";
  elements.amountInput.value = "";
  elements.paymentDateInput.value = new Date().toISOString().slice(0, 10);
  setSaveStatus(APPS_SCRIPT_URL ? "" : "Para guardar directo en el Sheet, configura APPS_SCRIPT_URL en admin.js.");
  renderReservations();
  renderContract();
}

function selectedRow() {
  return state.rows.find((row) => row.__rowNumber === state.selectedRowNumber) || null;
}

function syncPaymentFromStatus() {
  if (elements.statusSelect.value === "pagado") {
    elements.paymentSelect.value = "SI";
  }
  if (elements.statusSelect.value === "reservado") {
    elements.paymentSelect.value = "NO";
  }
  if (elements.statusSelect.value === "disponible") {
    elements.paymentSelect.value = "NO";
  }
}

async function saveAssignment(event) {
  event.preventDefault();
  const row = selectedRow();
  if (!row) {
    setSaveStatus("Selecciona una reserva antes de guardar.", "error");
    return;
  }
  if (!APPS_SCRIPT_URL) {
    setSaveStatus("Falta configurar APPS_SCRIPT_URL en admin.js para escribir en el Sheet.", "error");
    return;
  }

  elements.saveButton.disabled = true;
  setSaveStatus("Guardando cambios...");

  try {
    const payload = await callAppsScript({
      action: "update",
      rowNumber: row.__rowNumber,
      locker: elements.statusSelect.value === "disponible" ? "" : elements.lockerSelect.value,
      status: elements.statusSelect.value,
      payment: elements.paymentSelect.value,
      token: ADMIN_TOKEN,
    });
    if (!payload.ok) {
      throw new Error(payload.error || "No se pudo guardar.");
    }
    setSaveStatus("Cambios guardados en el Sheet.", "success");
    await loadSheet();
  } catch (error) {
    setSaveStatus(error instanceof Error ? error.message : "No se pudo guardar.", "error");
  } finally {
    elements.saveButton.disabled = false;
  }
}

async function copySheetValues() {
  const row = selectedRow();
  if (!row) {
    setSaveStatus("Selecciona una reserva antes de copiar.", "error");
    return;
  }

  const lockerValue = elements.statusSelect.value === "disponible" ? "" : elements.lockerSelect.value;
  const text = [
    `Fila: ${row.__rowNumber}`,
    `Numero deseado: ${lockerValue || "(vaciar)"}`,
    `Estado: ${statusLabel(elements.statusSelect.value)}`,
    `Pago: ${elements.paymentSelect.value}`,
  ].join("\n");

  try {
    await copyText(text);
    setSaveStatus("Valores copiados para pegarlos en el Sheet.", "success");
  } catch {
    setSaveStatus(text, "success");
  }
}

function renderContract() {
  const row = selectedRow();
  const person = row ? getPerson(row) : {};
  const values = {
    name: person.name || "",
    carnet: person.carnet || "",
    career: person.career || "",
    phone: person.phone || "",
    email: person.email || "",
    locker: elements.lockerSelect.value || person.locker || "",
    receipt: elements.receiptInput.value,
    amount: elements.amountInput.value,
    paymentDate: elements.paymentDateInput.value,
  };
  elements.contract.innerHTML = `
    ${contractCopy(values)}
    <div class="contract-divider" aria-hidden="true"></div>
    ${contractCopy(values)}
  `;
}

function contractCopy(values) {
  const date = parseDate(values.paymentDate);
  return `
    <article class="contract-copy">
      <h3>ASOCIACI&Oacute;N DE ESTUDIANTES DE MATEM&Aacute;TICA</h3>
      <h4>CONTRATO DE ARRENDAMIENTO Y USO DE CASILLERO</h4>
      <p class="contract-period">Periodo 2026</p>
      <hr />

      <p class="contract-section-title">1. Datos de la persona estudiante</p>
      <div class="contract-fields">
        ${field("Nombre completo:", values.name, "wide")}
        ${field("Carn\u00e9:", values.carnet)}
        ${field("Carrera:", values.career)}
        ${field("Tel\u00e9fono:", values.phone)}
        ${field("Correo electr\u00f3nico:", values.email)}
      </div>

      <p class="contract-section-title">2. Datos del casillero y del pago</p>
      <div class="contract-fields">
        ${field("Casillero No.:", values.locker)}
        ${field("Factura/recibo No.:", values.receipt)}
        ${field("Monto pagado:", values.amount)}
        ${field("Fecha de pago:", formatContractDate(values.paymentDate))}
      </div>

      <p class="contract-section-title">3. Vigencia</p>
      <p>El presente contrato autoriza el uso del casillero indicado durante el periodo 2026, desde el d&iacute;a <strong>${escapeHtml(date.day)}</strong> de <strong>${escapeHtml(date.month)}</strong> de 2026 hasta el <strong>5 de diciembre de 2026</strong>, salvo que exista una renovaci&oacute;n formal o una disposici&oacute;n distinta aprobada por la Asociaci&oacute;n.</p>

      <p class="contract-section-title">4. Condiciones de uso</p>
      <p>Al firmar este documento, la persona estudiante declara conocer y aceptar el <strong>Reglamento de Uso de los Casilleros de la Asociaci&oacute;n de Estudiantes de Matem&aacute;tica</strong> y se compromete a:</p>
      <ol>
        <li>Utilizar el casillero asignado de manera adecuada y conforme al Reglamento vigente.</li>
        <li>Mantener el casillero cerrado y bajo su cuidado durante todo el periodo de uso.</li>
        <li>No ceder, prestar ni transferir a terceras personas el derecho de uso del casillero sin autorizaci&oacute;n de la Asociaci&oacute;n.</li>
        <li>Desocupar completamente el casillero al finalizar la vigencia del contrato, salvo que la renovaci&oacute;n haya sido formalizada antes de esa fecha.</li>
      </ol>

      <p class="contract-section-title">5. Vencimiento, renovaci&oacute;n y objetos almacenados</p>
      <p>Una vez vencido el plazo indicado, si el casillero no ha sido desocupado o el contrato no ha sido renovado, la Asociaci&oacute;n podr&aacute; proceder a <strong>retirar o cortar el candado</strong> para recuperar el casillero. La Asociaci&oacute;n no asumir&aacute; responsabilidad por p&eacute;rdida, deterioro o cualquier otra afectaci&oacute;n de los objetos que permanezcan dentro del casillero despu&eacute;s del vencimiento del contrato, de conformidad con el Reglamento aplicable.</p>
      <p>La renovaci&oacute;n, cuando corresponda, deber&aacute; realizarse mediante el procedimiento y dentro del plazo que establezca la Asociaci&oacute;n para el nuevo periodo.</p>

      <p class="contract-section-title">6. Aceptaci&oacute;n</p>
      <p>La persona estudiante manifiesta haber le&iacute;do y comprendido el contenido de este contrato y acepta sus condiciones y el Reglamento de Uso de los Casilleros.</p>

      <div class="contract-spacer"></div>
      <div class="signature-grid">
        <div class="signature-line">Firma de la persona estudiante</div>
        <div class="signature-line">Firma del representante de la Asociaci&oacute;n</div>
        <div class="signature-line">Nombre del representante</div>
        <div class="signature-line">Fecha de firma</div>
      </div>
      <div class="seal-box">SELLO</div>
    </article>
  `;
}

function field(label, value, extraClass = "") {
  return `
    <span class="contract-field ${extraClass}">
      <strong>${escapeHtml(label)}</strong>
      <span class="contract-line">${escapeHtml(value || "")}</span>
    </span>
  `;
}

function getPerson(row) {
  return {
    name: getValue(row, "name"),
    carnet: getValue(row, "carnet"),
    career: getValue(row, "career"),
    phone: getValue(row, "phone"),
    email: getValue(row, "email"),
    locker: extractLockerId(getValue(row, "locker")),
    payment: getValue(row, "payment"),
    status: getValue(row, "status"),
  };
}

function getValue(row, columnKey) {
  const header = state.columns[columnKey];
  return header ? String(row[header] ?? "").trim() : "";
}

function getRowStatus(row) {
  const person = getPerson(row);
  const explicitStatus = getReservationState(person.status);
  if (explicitStatus) {
    return explicitStatus;
  }
  if (isPaidValue(person.payment)) {
    return "pagado";
  }
  if (person.locker) {
    return "reservado";
  }
  return "disponible";
}

function detectColumns(headers) {
  return Object.fromEntries(
    Object.entries(columnCandidates).map(([key, candidates]) => [
      key,
      headers.find((header) => candidates.some((candidate) => normalize(header).includes(normalize(candidate)))) || "",
    ]),
  );
}

function loadGoogleSheetJson() {
  return new Promise((resolve, reject) => {
    const callbackName = `__admin_casilleros_${Date.now()}_${Math.round(Math.random() * 100000)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("La hoja tardo demasiado en responder."));
    }, 12000);

    window[callbackName] = (payload) => {
      cleanup();
      if (payload?.status === "error") {
        const reason = payload.errors?.[0]?.detailed_message || payload.errors?.[0]?.reason;
        reject(new Error(reason || "Google Sheets devolvio un error."));
        return;
      }
      resolve(payload);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("No se pudo conectar con Google Sheets."));
    };

    const url = new URL(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`);
    url.searchParams.set("gid", SHEET_GID);
    url.searchParams.set("headers", "1");
    url.searchParams.set("tqx", `out:json;responseHandler:${callbackName}`);
    script.src = url.toString();
    document.body.append(script);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }
  });
}

function callAppsScript(params) {
  return new Promise((resolve, reject) => {
    const callbackName = `__admin_save_${Date.now()}_${Math.round(Math.random() * 100000)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("La actualizacion tardo demasiado."));
    }, 12000);

    window[callbackName] = (payload) => {
      cleanup();
      resolve(payload);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("No se pudo contactar el Apps Script."));
    };

    const url = new URL(APPS_SCRIPT_URL);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== "") {
        url.searchParams.set(key, value);
      }
    });
    url.searchParams.set("callback", callbackName);
    script.src = url.toString();
    document.body.append(script);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }
  });
}

function tableToRows(table) {
  if (!table?.cols?.length) {
    return { headers: [], rows: [] };
  }
  const headers = table.cols.map((column, index) => {
    const label = String(column.label || column.id || `Columna ${index + 1}`).trim();
    return label || `Columna ${index + 1}`;
  });
  const rows = (table.rows || []).map((row, index) => {
    const record = { __rowNumber: index + 2 };
    headers.forEach((header, cellIndex) => {
      const cell = row.c?.[cellIndex];
      record[header] = cell?.f ?? cell?.v ?? "";
    });
    return record;
  });
  return { headers, rows };
}

function extractLockerId(value) {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }
  const exact = text.match(/^\D*([1-9][0-9]?)\D*$/);
  if (exact && lockerIds.has(exact[1])) {
    return exact[1];
  }
  const loose = text.match(/\b([1-9][0-9]?)\b/);
  return loose && lockerIds.has(loose[1]) ? loose[1] : "";
}

function isPaidValue(value) {
  const normalized = normalize(value).replace(/\s+/g, "");
  return ["si", "s", "yes", "y", "true", "1", "pagado", "pago"].includes(normalized);
}

function getReservationState(value) {
  const normalized = normalize(value).replace(/\s+/g, "");
  if (["disponible", "libre", "cancelado", "cancelada"].includes(normalized)) {
    return "disponible";
  }
  if (["pagado", "pago", "si"].includes(normalized)) {
    return "pagado";
  }
  if (["reservado", "reserva", "pendiente"].includes(normalized)) {
    return "reservado";
  }
  return "";
}

function statusLabel(status) {
  return {
    disponible: "Disponible",
    reservado: "Reservado",
    pagado: "Pagado",
  }[status] || "Disponible";
}

function sizeLabel(size) {
  return size === "grande" ? "Grande" : "Pequeno";
}

function formatTime(date) {
  return new Intl.DateTimeFormat("es-CR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(date);
}

function parseDate(value) {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();
  if (Number.isNaN(date.getTime())) {
    return { day: "", month: "" };
  }
  return {
    day: String(date.getDate()),
    month: date.toLocaleDateString("es-CR", { month: "long" }),
  };
}

function formatContractDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("es-CR");
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setSaveStatus(message, type = "") {
  elements.saveStatus.textContent = message;
  elements.saveStatus.classList.toggle("error", type === "error");
  elements.saveStatus.classList.toggle("success", type === "success");
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-999px";
  document.body.append(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}
