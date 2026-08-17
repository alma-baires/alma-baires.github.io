# -*- coding: utf-8 -*-
"""
Sincroniza disponibilidad.json leyendo los calendarios (.ics) de Airbnb y
Booking configurados en ical_urls.json.

Pensado para correr solo (sin instalar nada extra) desde GitHub Actions,
cada 1 hora. Si algo falla para un departamento (link mal cargado, caída
temporal de Airbnb/Booking, etc.), ese departamento conserva los datos que
ya tenía en disponibilidad.json en vez de mostrarse como "todo libre" por
error.
"""
import json
import re
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone

ICAL_URLS_PATH = "ical_urls.json"
DISPONIBILIDAD_PATH = "disponibilidad.json"
TIMEOUT = 20


def log(msg):
    print(f"[sync_disponibilidad] {msg}", file=sys.stderr)


def fetch_ics(url):
    req = urllib.request.Request(url, headers={"User-Agent": "AlmaBaires-sync/1.0"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        raw = resp.read()
    return raw.decode("utf-8", errors="replace")


def unfold_lines(ics_text):
    """RFC5545: una línea que empieza con espacio o tab es continuación de la anterior."""
    lines = ics_text.replace("\r\n", "\n").split("\n")
    unfolded = []
    for line in lines:
        if line.startswith(" ") or line.startswith("\t"):
            if unfolded:
                unfolded[-1] += line[1:]
        else:
            unfolded.append(line)
    return unfolded


def parse_date_value(value):
    """Convierte YYYYMMDD o YYYYMMDDTHHMMSSZ a 'YYYY-MM-DD'."""
    value = value.strip()
    digits = re.match(r"(\d{4})(\d{2})(\d{2})", value)
    if not digits:
        return None
    y, m, d = digits.groups()
    return f"{y}-{m}-{d}"


def parse_vevents(ics_text):
    """Devuelve una lista de {desde, hasta} a partir de los VEVENT del ics."""
    rangos = []
    lines = unfold_lines(ics_text)
    in_event = False
    status = None
    dtstart = None
    dtend = None
    for line in lines:
        if line.strip() == "BEGIN:VEVENT":
            in_event = True
            status = None
            dtstart = None
            dtend = None
            continue
        if line.strip() == "END:VEVENT":
            if in_event and status != "CANCELLED" and dtstart:
                hasta = dtend or dtstart
                rangos.append({"desde": dtstart, "hasta": hasta})
            in_event = False
            continue
        if not in_event:
            continue
        if line.startswith("STATUS"):
            status = line.split(":", 1)[-1].strip().upper()
        elif line.startswith("DTSTART"):
            dtstart = parse_date_value(line.split(":", 1)[-1])
        elif line.startswith("DTEND"):
            dtend = parse_date_value(line.split(":", 1)[-1])
    return rangos


def cargar_json(path, default):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def main():
    ical_urls = cargar_json(ICAL_URLS_PATH, {})
    disponibilidad_anterior = cargar_json(DISPONIBILIDAD_PATH, {})

    nueva_disponibilidad = {}
    hubo_algun_error = False
    algun_link_ok_esta_vez = False

    for slug, plataformas in ical_urls.items():
        if slug.startswith("_"):
            continue
        if not isinstance(plataformas, dict):
            continue

        rangos_slug = []
        urls_configuradas = 0
        urls_ok = 0

        for plataforma, url in plataformas.items():
            url = (url or "").strip()
            if not url:
                continue
            urls_configuradas += 1
            try:
                ics_text = fetch_ics(url)
                rangos_slug.extend(parse_vevents(ics_text))
                urls_ok += 1
            except (urllib.error.URLError, TimeoutError, ValueError) as e:
                hubo_algun_error = True
                log(f"ERROR leyendo {slug}/{plataforma}: {e}")

        if urls_configuradas == 0:
            # Todavía no se cargó ningún link para este depto: dejamos lo que
            # ya había (vacío si es la primera vez), sin tocar.
            nueva_disponibilidad[slug] = disponibilidad_anterior.get(slug, [])
        elif urls_ok == 0:
            # Se configuraron links pero todos fallaron: conservamos lo
            # último que se pudo leer, para no mostrar todo como libre.
            hubo_algun_error = True
            log(f"AVISO: {slug} no se pudo actualizar (se mantiene el valor anterior)")
            nueva_disponibilidad[slug] = disponibilidad_anterior.get(slug, [])
        else:
            algun_link_ok_esta_vez = True
            # Ordenamos por fecha de inicio, sin deduplicar de más (no hace falta).
            rangos_slug.sort(key=lambda r: r["desde"])
            nueva_disponibilidad[slug] = rangos_slug

    # "sincronizado" queda en true para siempre una vez que al menos un link
    # real funcionó alguna vez — así el sitio deja de mostrar el cartel de
    # "datos de ejemplo" de forma definitiva, aunque algún link puntual
    # falle después.
    ya_estaba_sincronizado = bool(disponibilidad_anterior.get("sincronizado"))
    nueva_disponibilidad["sincronizado"] = ya_estaba_sincronizado or algun_link_ok_esta_vez
    nueva_disponibilidad["_actualizado"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    with open(DISPONIBILIDAD_PATH, "w", encoding="utf-8") as f:
        json.dump(nueva_disponibilidad, f, ensure_ascii=False, indent=2)

    log("disponibilidad.json actualizado" + (" (con avisos, ver arriba)" if hubo_algun_error else " sin errores"))


if __name__ == "__main__":
    main()
