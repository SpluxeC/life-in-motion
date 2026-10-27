#!/usr/bin/env python3
"""Import the uploaded Kenney four-direction PNG archive into this repo.

Usage (from a local clone of SpluxeC/life-in-motion):
  python3 scripts/import_kenney_vehicles.py /path/to/life-in-motion-kenney-vehicle-sprites-ready.zip
  git add v3/assets/kenney-vehicles
  git commit -m "assets: import Kenney four-direction vehicle sprites"
  git push origin main
"""
from pathlib import Path
from zipfile import ZipFile
import sys

PREFIX = "v3/assets/kenney-vehicles/"
ROOT = Path(__file__).resolve().parents[1]

def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python3 scripts/import_kenney_vehicles.py <archive.zip>")
    path = Path(sys.argv[1]).expanduser()
    if not path.is_file():
        raise SystemExit(f"Archive missing: {path}")
    with ZipFile(path) as archive:
        names = archive.namelist()
        pngs = [n for n in names if n.startswith(PREFIX) and n.endswith(".png")]
        if len(pngs) != 56:
            raise SystemExit(f"Expected 56 PNG images; found {len(pngs)}")
        for n in names:
            if not n.startswith(PREFIX) or n.endswith("/"):
                continue
            relative = Path(n)
            if ".." in relative.parts or relative.is_absolute():
                raise SystemExit(f"Unsafe archive entry: {n}")
            if not (n.endswith(".png") or n.endswith("LICENSE.txt")):
                continue
            destination = ROOT / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(archive.read(n))
            print(f"Imported {relative}")
    print(f"Imported {len(pngs)} PNGs. Commit and push the directory to activate sprites.")

if __name__ == "__main__":
    main()
