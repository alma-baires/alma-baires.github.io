/* =========================================================================
   DISPONIBILIDAD
   ---------------------------------------------------------------------
   Los datos reales viven en "disponibilidad.json" (mismo directorio).
   Ese archivo lo actualiza automáticamente, cada 1 hora, un robot
   (GitHub Actions) que lee los calendarios de Airbnb y Booking de cada
   departamento y arma este archivo. Ver README-github.md para el detalle
   de cómo se configura eso.

   Si "disponibilidad.json" todavía no existe o no se puede cargar (por
   ejemplo, si estás mirando el sitio abriendo el archivo index.html
   directamente en tu computadora, sin subirlo a internet), se usan estos
   datos de EJEMPLO como respaldo, para que igual se vea cómo funciona.
   ========================================================================= */

const DISPONIBILIDAD_RESPALDO_DEMO = {
  mono:     [{ desde: "2026-08-20", hasta: "2026-08-24" }, { desde: "2026-09-10", hasta: "2026-09-14" }],
  catorce:  [{ desde: "2026-08-25", hasta: "2026-08-29" }, { desde: "2026-09-18", hasta: "2026-09-21" }],
  octavo:   [{ desde: "2026-08-18", hasta: "2026-08-22" }, { desde: "2026-09-05", hasta: "2026-09-09" }],
  rincon:   [{ desde: "2026-08-30", hasta: "2026-09-03" }],
  uruguay:  [{ desde: "2026-08-22", hasta: "2026-08-27" }, { desde: "2026-09-15", hasta: "2026-09-19" }],
  salguero: [{ desde: "2026-09-01", hasta: "2026-09-05" }],
  abasto:   [{ desde: "2026-08-19", hasta: "2026-08-21" }, { desde: "2026-09-08", hasta: "2026-09-12" }],
  alsina:   [{ desde: "2026-09-12", hasta: "2026-09-17" }],
  viamonte: [{ desde: "2026-08-28", hasta: "2026-09-01" }],
};

let DISPONIBILIDAD = {};
let DISPONIBILIDAD_ES_REAL = false;

// Se dispara apenas carga la página. Todo lo que necesite los datos
// (buscador de la home, calendario de cada depto) espera esta promesa.
window.disponibilidadPromise = fetch("disponibilidad.json", { cache: "no-store" })
  .then((r) => {
    if (!r.ok) throw new Error("no disponible");
    return r.json();
  })
  .then((data) => {
    if (data && data.sincronizado === true) {
      DISPONIBILIDAD = data;
      DISPONIBILIDAD_ES_REAL = true;
    } else {
      // El archivo existe pero todavía no lo actualizó la sincronización real
      // (por ejemplo, todavía no se cargó ningún link de Airbnb/Booking).
      DISPONIBILIDAD = DISPONIBILIDAD_RESPALDO_DEMO;
      DISPONIBILIDAD_ES_REAL = false;
    }
  })
  .catch(() => {
    DISPONIBILIDAD = DISPONIBILIDAD_RESPALDO_DEMO;
    DISPONIBILIDAD_ES_REAL = false;
  });

// "hasta" se trata como el día de checkout: esa noche ya no está ocupada
// (mismo criterio que usan Airbnb/Booking).
function fechaOcupada(fechaStr, desde, hasta) {
  return fechaStr >= desde && fechaStr < hasta;
}

function rangosSuperpuestos(entrada, salida, desde, hasta) {
  return entrada < hasta && desde < salida;
}

function estaDisponible(slug, entrada, salida) {
  const ocupados = DISPONIBILIDAD[slug] || [];
  if (!entrada || !salida) return true;
  return !ocupados.some((r) => rangosSuperpuestos(entrada, salida, r.desde, r.hasta));
}

function diaOcupado(slug, fechaStr) {
  const ocupados = DISPONIBILIDAD[slug] || [];
  return ocupados.some((r) => fechaOcupada(fechaStr, r.desde, r.hasta));
}

/* =========================================================================
   Calendario mensual simple (vanilla JS), usado en cada página de depto.
   ========================================================================= */
function pad2(n) {
  return String(n).padStart(2, "0");
}
function fechaISO(y, m, d) {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}

function initCalendario(slug) {
  const gridEl = document.getElementById("cal-grid");
  const titleEl = document.getElementById("cal-title");
  const noteEl = document.getElementById("cal-fuente");
  if (!gridEl || !titleEl) return;

  const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const hoy = new Date();
  let cur = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  function render() {
    const y = cur.getFullYear();
    const m = cur.getMonth();
    titleEl.textContent = `${MESES[m]} ${y}`;

    const primerDia = new Date(y, m, 1);
    let offset = primerDia.getDay() - 1; // lunes = 0
    if (offset < 0) offset = 6;
    const diasEnMes = new Date(y, m + 1, 0).getDate();
    const hoyISO = fechaISO(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    let html = "";
    for (let i = 0; i < offset; i++) html += '<span class="day day-empty"></span>';
    for (let d = 1; d <= diasEnMes; d++) {
      const fecha = fechaISO(y, m, d);
      const ocupado = diaOcupado(slug, fecha);
      const clases = ["day", ocupado ? "day-blocked" : "day-free"];
      if (fecha === hoyISO) clases.push("day-today");
      html += `<span class="${clases.join(" ")}" title="${ocupado ? "Ocupado" : "Libre"}">${d}</span>`;
    }
    gridEl.innerHTML = html;

    if (noteEl) {
      if (DISPONIBILIDAD_ES_REAL) {
        noteEl.style.display = "none";
      } else {
        noteEl.textContent = "Calendario de ejemplo — todavía no sincronizado con Airbnb ni Booking.";
        noteEl.style.display = "block";
      }
    }
  }

  const prevBtn = document.getElementById("cal-prev");
  const nextBtn = document.getElementById("cal-next");
  if (prevBtn) prevBtn.addEventListener("click", () => { cur.setMonth(cur.getMonth() - 1); render(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { cur.setMonth(cur.getMonth() + 1); render(); });

  window.disponibilidadPromise.then(render);
}
