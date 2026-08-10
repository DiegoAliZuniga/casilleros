const SHEET_ID = "1sEH73Eyg8cRJe2as8wF0_YZA-TAYJbW2qq186MNIkhk";
const SHEET_GID = "0";
const FORM_URL = "https://forms.gle/t8n4u23AVMQQapDR9";

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
  grid: document.querySelector("#locker-grid"),
  loadStatus: document.querySelector("#load-status"),
  updatedAt: document.querySelector("#updated-at"),
  statusLine: document.querySelector(".status-line"),
  unknownLegend: document.querySelector("#unknown-legend"),
  total: document.querySelector("#total-count"),
  available: document.querySelector("#available-count"),
  reserved: document.querySelector("#reserved-count"),
  paid: document.querySelector("#paid-count"),
  search: document.querySelector("#locker-search"),
  refresh: document.querySelector("#refresh-button"),
  detailTitle: document.querySelector("#detail-title"),
  detailStatus: document.querySelector("#detail-status"),
  detailSize: document.querySelector("#detail-size"),
  detailLocation: document.querySelector("#detail-location"),
  detailRecords: document.querySelector("#detail-records"),
  detailFormLink: document.querySelector("#detail-form-link"),
  reservationFrame: document.querySelector(".reservation-frame"),
};

const state = {
  selectedId: null,
  statusByLocker: new Map(),
  dataLoaded: false,
  dataError: "",
  filter: "todos",
  size: "todos",
  search: "",
};

init();

function init() {
  elements.total.textContent = String(LOCKERS.length);
  document.querySelectorAll('a[href*="forms.gle"]').forEach((link) => {
    link.href = FORM_URL;
  });
  if (elements.reservationFrame) {
    elements.reservationFrame.src = FORM_URL;
  }
  renderGrid();
  wireControls();
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

function wireControls() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveButton("[data-filter]", button);
      state.filter = button.dataset.filter;
      renderGrid();
    });
  });

  document.querySelectorAll("[data-size]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveButton("[data-size]", button);
      state.size = button.dataset.size;
      renderGrid();
    });
  });

  elements.search.addEventListener("input", (event) => {
    state.search = event.target.value.trim();
    renderGrid();
  });

  elements.refresh.addEventListener("click", () => loadSheet());
}

function setActiveButton(selector, activeButton) {
  document.querySelectorAll(selector).forEach((button) => {
    button.classList.toggle("active", button === activeButton);
  });
}

function renderGrid() {
  elements.grid.innerHTML = "";
  LOCKERS.forEach((item) => {
    const status = getLockerStatus(item.id);
    const button = document.createElement("button");
    button.className = "locker";
    button.type = "button";
    button.textContent = item.id;
    button.dataset.state = status;
    button.dataset.size = item.size;
    button.style.gridColumn = `${item.col} / span ${item.colSpan}`;
    button.style.gridRow = `${item.row} / span ${item.rowSpan}`;
    button.setAttribute("aria-label", `Casillero ${item.id}, ${statusLabel(status)}, ${sizeLabel(item.size)}`);
    button.classList.toggle("selected", state.selectedId === item.id);
    button.classList.toggle("is-dimmed", !matchesFilters(item, status));
    button.classList.toggle("is-hidden-match", !matchesSearch(item));
    button.addEventListener("click", () => selectLocker(item));
    elements.grid.append(button);
  });
  updateSummary();
  updateDetails();
}

function matchesFilters(item, status) {
  const statusMatch = state.filter === "todos" || state.filter === status;
  const sizeMatch = state.size === "todos" || state.size === item.size;
  return statusMatch && sizeMatch;
}

function matchesSearch(item) {
  return !state.search || item.id.includes(state.search);
}

function selectLocker(item) {
  state.selectedId = item.id;
  renderGrid();
}

function updateSummary() {
  const counts = { disponible: 0, reservado: 0, pagado: 0, "sin-datos": 0 };
  LOCKERS.forEach((item) => {
    counts[getLockerStatus(item.id)] += 1;
  });
  elements.available.textContent = String(counts.disponible);
  elements.reserved.textContent = String(counts.reservado);
  elements.paid.textContent = String(counts.pagado);
  elements.unknownLegend.hidden = counts["sin-datos"] === 0;
}

function updateDetails() {
  const item = LOCKERS.find((lockerItem) => lockerItem.id === state.selectedId);
  if (!item) {
    elements.detailTitle.textContent = "Elige un casillero";
    elements.detailStatus.textContent = "--";
    elements.detailSize.textContent = "--";
    elements.detailLocation.textContent = "--";
    elements.detailRecords.textContent = "--";
    if (elements.detailFormLink) {
      elements.detailFormLink.href = FORM_URL;
    }
    return;
  }

  const record = state.statusByLocker.get(item.id);
  const status = getLockerStatus(item.id);
  elements.detailTitle.textContent = `Casillero ${item.id}`;
  elements.detailStatus.textContent = statusLabel(status);
  elements.detailSize.textContent = sizeLabel(item.size);
  elements.detailLocation.textContent = `Fila ${item.row}, columna ${item.col}`;
  elements.detailRecords.textContent =
    record?.count > 1 ? `${record.count} registros` : record?.count === 1 ? "1 registro" : "Sin registros";
  if (elements.detailFormLink) {
    elements.detailFormLink.href = FORM_URL;
  }
}

function getLockerStatus(id) {
  if (state.dataError) {
    return "sin-datos";
  }
  const record = state.statusByLocker.get(id);
  if (record?.paid) {
    return "pagado";
  }
  if (record) {
    return "reservado";
  }
  return "disponible";
}

function statusLabel(status) {
  return {
    disponible: "Disponible",
    reservado: "Reservado, pago pendiente",
    pagado: "Pagado",
    "sin-datos": "Sin datos conectados",
  }[status];
}

function sizeLabel(size) {
  return size === "grande" ? "Grande" : "Peque\u00f1o";
}

async function loadSheet() {
  elements.refresh.disabled = true;
  elements.loadStatus.textContent = "Cargando datos de Google Sheets...";
  elements.updatedAt.textContent = "";
  elements.statusLine.classList.remove("error");
  state.dataError = "";
  renderGrid();

  try {
    const response = await loadGoogleSheetJson();
    const rows = tableToRows(response.table);
    state.statusByLocker = buildLockerStatus(rows);
    state.dataLoaded = true;
    elements.loadStatus.textContent = "Datos conectados desde Google Sheets.";
    elements.updatedAt.textContent = `Actualizado ${formatTime(new Date())}`;
  } catch (error) {
    state.statusByLocker = new Map();
    state.dataLoaded = false;
    state.dataError = error instanceof Error ? error.message : "No se pudo leer la hoja.";
    elements.statusLine.classList.add("error");
    elements.loadStatus.textContent =
      "No se pudieron cargar los datos. Revisa que la hoja este compartida como publica o publicada en la web.";
  } finally {
    elements.refresh.disabled = false;
    renderGrid();
  }
}

function loadGoogleSheetJson() {
  return new Promise((resolve, reject) => {
    const callbackName = `__casilleros_${Date.now()}_${Math.round(Math.random() * 100000)}`;
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

function tableToRows(table) {
  if (!table?.cols?.length) {
    return [];
  }
  const headers = table.cols.map((column, index) => {
    const label = String(column.label || column.id || `Columna ${index + 1}`).trim();
    return label || `Columna ${index + 1}`;
  });

  return (table.rows || []).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      const cell = row.c?.[index];
      record[header] = cell?.f ?? cell?.v ?? "";
    });
    return record;
  });
}

function buildLockerStatus(rows) {
  const statusMap = new Map();
  const lockerColumn = detectLockerColumn(rows);
  const paymentColumn = detectColumn(rows, ["pago", "pagado", "payment"]);

  rows.forEach((row) => {
    const id = extractLockerId(lockerColumn ? row[lockerColumn] : Object.values(row).join(" "));
    if (!id) {
      return;
    }

    const previous = statusMap.get(id) || { count: 0, paid: false };
    const paid = paymentColumn ? isPaidValue(row[paymentColumn]) : false;
    statusMap.set(id, {
      count: previous.count + 1,
      paid: previous.paid || paid,
    });
  });
  return statusMap;
}

function detectLockerColumn(rows) {
  const headers = Object.keys(rows[0] || {});
  let bestHeader = "";
  let bestScore = 0;

  headers.forEach((header) => {
    const normalizedHeader = normalize(header);
    const headerScore =
      (normalizedHeader.includes("casillero") ? 80 : 0) +
      (normalizedHeader.includes("locker") ? 80 : 0) +
      (normalizedHeader.includes("reserv") ? 25 : 0) +
      (normalizedHeader.includes("numero") ? 20 : 0);
    const valueScore = rows.reduce((score, row) => {
      return score + (extractLockerId(row[header]) ? 1 : 0);
    }, 0);
    const totalScore = headerScore + valueScore;
    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestHeader = header;
    }
  });

  return bestScore > 0 ? bestHeader : "";
}

function detectColumn(rows, keywords) {
  const headers = Object.keys(rows[0] || {});
  return (
    headers.find((header) => {
      const normalizedHeader = normalize(header);
      return keywords.some((keyword) => normalizedHeader.includes(keyword));
    }) || ""
  );
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

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatTime(date) {
  return new Intl.DateTimeFormat("es-CR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(date);
}
