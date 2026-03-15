#!/bin/bash
# ============================================
# Bilder-Konvertierung für Berg im Bahnhof
# ============================================
# Lege deine echten Fotos hier ab und führe dieses Script aus:
#   cd /Users/arturkokoev/Downloads/Berg-im-Bahnhof
#   bash convert-images.sh
#
# Das Script konvertiert alle JPG/PNG/HEIC Bilder im
# images/originals/ Ordner nach WebP (80% Qualität).
# ============================================

IMGDIR="$(dirname "$0")/images"
ORIGDIR="${IMGDIR}/originals"

mkdir -p "$ORIGDIR"

echo ""
echo "=== Berg im Bahnhof — Bilder-Konvertierung ==="
echo ""

if [ -z "$(ls -A "$ORIGDIR" 2>/dev/null)" ]; then
  echo "Lege deine Originalfotos in diesen Ordner:"
  echo "  $ORIGDIR"
  echo ""
  echo "Benötigte Dateinamen:"
  echo "  hero-spachteltechnik.jpg   (Hauptbild Hero-Bereich)"
  echo "  projekt-spachteltechnik.jpg (Spachteltechnik-Wand)"
  echo "  projekt-akzentwand.jpg     (Blaue Akzentwand Wohnzimmer)"
  echo "  projekt-flur.jpg           (Flur mit Farbakzent)"
  echo "  projekt-kamin-vorher.jpg   (Kamin vor Renovierung)"
  echo "  projekt-kamin-nachher.jpg  (Kamin nach Renovierung)"
  echo "  projekt-fassade.jpg        (Fassadenarbeit)"
  echo "  projekt-waermedaemmung.jpg (WDVS-Arbeit)"
  echo ""
  echo "Dann führe dieses Script erneut aus."
  exit 0
fi

echo "Konvertiere Bilder nach WebP..."
echo ""

for f in "$ORIGDIR"/*.{jpg,jpeg,png,JPG,JPEG,PNG}; do
  [ -f "$f" ] || continue
  name=$(basename "${f%.*}")
  echo "  $name → ${name}.webp"
  cwebp -q 80 "$f" -o "${IMGDIR}/${name}.webp" 2>/dev/null
done

# HEIC-Dateien (macOS)
for f in "$ORIGDIR"/*.{HEIC,heic}; do
  [ -f "$f" ] || continue
  name=$(basename "${f%.*}")
  echo "  $name (HEIC) → ${name}.webp"
  sips -s format jpeg "$f" --out "/tmp/${name}.jpg" 2>/dev/null
  cwebp -q 80 "/tmp/${name}.jpg" -o "${IMGDIR}/${name}.webp" 2>/dev/null
  rm -f "/tmp/${name}.jpg"
done

echo ""
echo "Fertig! Dateien im images/ Ordner:"
ls -lh "$IMGDIR"/*.webp
echo ""
echo "Seite neu laden um die Bilder zu sehen."
