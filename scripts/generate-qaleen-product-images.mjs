import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outDir = join(process.cwd(), "public", "qaleen", "products");

const seeds = [
  { type: "Persian Rug", family: "medallion" },
  { type: "Heriz Rug", family: "heriz" },
  { type: "Kashan Rug", family: "floral" },
  { type: "Tabriz Rug", family: "garden" },
  { type: "Isfahan Rug", family: "isfahan" },
  { type: "Bokhara Runner", family: "runner" },
  { type: "Tribal Runner", family: "tribal" },
  { type: "Contemporary Rug", family: "modern" },
  { type: "Medallion Carpet", family: "classic" }
];

const colors = [
  { name: "Emerald", base: "#0e5a47", deep: "#07352c", accent: "#c9a350", light: "#eff0d4" },
  { name: "Ruby", base: "#8b1e2d", deep: "#4d101b", accent: "#d8a657", light: "#f7e4cf" },
  { name: "Wine", base: "#6d2438", deep: "#35111c", accent: "#bd8b48", light: "#f2dccd" },
  { name: "Ivory", base: "#d8c8a5", deep: "#7b6241", accent: "#9a2430", light: "#fff8e8" },
  { name: "Navy", base: "#18304f", deep: "#0c172b", accent: "#c09a4a", light: "#e1e8ee" },
  { name: "Charcoal", base: "#333235", deep: "#141416", accent: "#b08754", light: "#e5dfd4" }
];

const standardSizes = ["3 x 5 ft", "4 x 6 ft", "5 x 8 ft", "6 x 9 ft", "7 x 10 ft", "8 x 11 ft"];
const runnerSizes = ["2.5 x 8 ft", "2.7 x 10 ft", "3 x 12 ft", "3 x 14 ft", "2.5 x 9 ft", "3 x 10 ft"];

function sizeFor(seed, index) {
  const round = Math.floor(index / seeds.length);
  if (seed.family === "runner" || seed.family === "tribal") return runnerSizes[round % runnerSizes.length];
  return standardSizes[(index + round) % standardSizes.length];
}

function parseSize(size) {
  const match = size.match(/([\d.]+)\s*x\s*([\d.]+)/i);
  return match ? { w: Number(match[1]), h: Number(match[2]) } : { w: 5, h: 8 };
}

function rugBox(size) {
  const { w, h } = parseSize(size);
  const ratio = Math.max(0.28, Math.min(1.05, w / h));
  const maxH = 320;
  const height = maxH;
  const width = Math.max(96, Math.min(300, height * ratio));
  return {
    x: Math.round((360 - width) / 2),
    y: Math.round((400 - height) / 2),
    width: Math.round(width),
    height: Math.round(height)
  };
}

function medallion(cx, cy, r, color, rotate = 0) {
  return `
    <g transform="rotate(${rotate} ${cx} ${cy})">
      <path d="M${cx} ${cy - r} L${cx + r * 0.42} ${cy - r * 0.42} L${cx + r} ${cy} L${cx + r * 0.42} ${cy + r * 0.42} L${cx} ${cy + r} L${cx - r * 0.42} ${cy + r * 0.42} L${cx - r} ${cy} L${cx - r * 0.42} ${cy - r * 0.42} Z" fill="${color.accent}" opacity=".96"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${r * 0.42}" ry="${r * 0.7}" fill="${color.light}" opacity=".88"/>
      <circle cx="${cx}" cy="${cy}" r="${r * 0.22}" fill="${color.deep}" opacity=".9"/>
    </g>`;
}

function cornerMotifs(box, color, variant) {
  const motifs = [];
  const pad = 22 + (variant % 5);
  const r = 10 + (variant % 6);
  const points = [
    [box.x + pad, box.y + pad],
    [box.x + box.width - pad, box.y + pad],
    [box.x + pad, box.y + box.height - pad],
    [box.x + box.width - pad, box.y + box.height - pad]
  ];
  points.forEach(([x, y], i) => {
    motifs.push(`<path d="M${x} ${y - r} C${x + r} ${y - r} ${x + r} ${y} ${x} ${y + r} C${x - r} ${y} ${x - r} ${y - r} ${x} ${y - r}Z" fill="${i % 2 ? color.light : color.accent}" opacity=".9"/>`);
  });
  return motifs.join("");
}

function borderPattern(box, color, variant) {
  const step = 20 + (variant % 5) * 2;
  const pieces = [];
  for (let x = box.x + 14; x < box.x + box.width - 10; x += step) {
    pieces.push(`<path d="M${x} ${box.y + 12} l8 8 l-8 8 l-8 -8Z" fill="${color.accent}" opacity=".82"/>`);
    pieces.push(`<path d="M${x} ${box.y + box.height - 12} l8 -8 l-8 -8 l-8 8Z" fill="${color.accent}" opacity=".82"/>`);
  }
  for (let y = box.y + 20; y < box.y + box.height - 10; y += step) {
    pieces.push(`<path d="M${box.x + 12} ${y} l8 8 l8 -8 l-8 -8Z" fill="${color.light}" opacity=".65"/>`);
    pieces.push(`<path d="M${box.x + box.width - 12} ${y} l-8 8 l-8 -8 l8 -8Z" fill="${color.light}" opacity=".65"/>`);
  }
  return pieces.join("");
}

function fieldPattern(box, color, family, variant) {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  if (family === "runner" || family === "tribal") {
    const count = 4 + (variant % 3);
    const gap = box.height / (count + 1);
    return Array.from({ length: count }, (_, i) => {
      const y = box.y + gap * (i + 1);
      const r = Math.min(box.width * 0.3, 32 + ((i + variant) % 3) * 5);
      const fill = i % 2 ? color.light : color.accent;
      return `
        <path d="M${cx} ${y - r} L${cx + r * 0.68} ${y} L${cx} ${y + r} L${cx - r * 0.68} ${y}Z" fill="${fill}" opacity=".88"/>
        <circle cx="${cx}" cy="${y}" r="${r * 0.24}" fill="${color.deep}" opacity=".86"/>`;
    }).join("");
  }

  if (family === "modern") {
    const bands = [];
    for (let i = 0; i < 7; i += 1) {
      const y = box.y + 30 + i * ((box.height - 60) / 6);
      bands.push(`<path d="M${box.x + 24} ${y} C${cx - 40} ${y - 18} ${cx + 38} ${y + 18} ${box.x + box.width - 24} ${y}" fill="none" stroke="${i % 2 ? color.light : color.accent}" stroke-width="${6 + (variant % 3)}" opacity=".58"/>`);
    }
    return bands.join("");
  }

  if (family === "heriz") {
    return `
      <path d="M${cx} ${box.y + 52} L${box.x + box.width - 50} ${cy} L${cx} ${box.y + box.height - 52} L${box.x + 50} ${cy}Z" fill="${color.deep}" opacity=".72"/>
      ${medallion(cx, cy, Math.min(box.width, box.height) * 0.22, color, 45 + variant * 4)}
      <path d="M${cx} ${box.y + 88} L${cx + 28} ${cy} L${cx} ${box.y + box.height - 88} L${cx - 28} ${cy}Z" fill="${color.light}" opacity=".42"/>`;
  }

  if (family === "garden" || family === "isfahan") {
    const cells = [];
    const cols = Math.max(2, Math.floor(box.width / 62));
    const rows = Math.max(3, Math.floor(box.height / 72));
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = box.x + 34 + col * ((box.width - 68) / Math.max(1, cols - 1));
        const y = box.y + 42 + row * ((box.height - 84) / Math.max(1, rows - 1));
        cells.push(`<ellipse cx="${x}" cy="${y}" rx="${12 + ((row + col + variant) % 3) * 3}" ry="${20}" fill="${(row + col) % 2 ? color.light : color.accent}" opacity=".62"/>`);
      }
    }
    return `${cells.join("")}${medallion(cx, cy, Math.min(box.width, box.height) * 0.19, color, variant * 8)}`;
  }

  if (family === "floral") {
    const blooms = [];
    for (let i = 0; i < 18; i += 1) {
      const x = box.x + 34 + ((i * 47 + variant * 13) % Math.max(40, box.width - 68));
      const y = box.y + 42 + ((i * 61 + variant * 19) % Math.max(60, box.height - 84));
      blooms.push(`<g transform="rotate(${i * 27} ${x} ${y})"><ellipse cx="${x - 6}" cy="${y}" rx="5" ry="10" fill="${color.light}" opacity=".68"/><ellipse cx="${x + 6}" cy="${y}" rx="5" ry="10" fill="${color.accent}" opacity=".74"/><circle cx="${x}" cy="${y}" r="4" fill="${color.deep}"/></g>`);
    }
    return `${blooms.join("")}${medallion(cx, cy, Math.min(box.width, box.height) * 0.18, color, variant * 5)}`;
  }

  return `${medallion(cx, cy, Math.min(box.width, box.height) * (0.23 + (variant % 3) * 0.015), color, variant * 7)}${cornerMotifs(box, color, variant)}`;
}

function makeSvg(index) {
  const seed = seeds[index % seeds.length];
  const color = colors[index % colors.length];
  const size = sizeFor(seed, index);
  const box = rugBox(size);
  const rx = seed.family === "runner" || seed.family === "tribal" ? 10 : 8;
  const fringeTop = Array.from({ length: Math.max(6, Math.floor(box.width / 16)) }, (_, i) => {
    const x = box.x + 10 + i * ((box.width - 20) / Math.max(1, Math.floor(box.width / 16) - 1));
    return `<path d="M${x} ${box.y - 16} v16 M${x} ${box.y + box.height} v16" stroke="#d9c8a4" stroke-width="2" opacity=".8"/>`;
  }).join("");

  const inner = {
    x: box.x + 18,
    y: box.y + 18,
    width: box.width - 36,
    height: box.height - 36
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="800" viewBox="0 0 360 400" role="img" aria-label="${color.name} ${seed.type} ${size}">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="11" stdDeviation="10" flood-color="#1b140d" flood-opacity=".22"/>
    </filter>
    <linearGradient id="pile" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${color.base}"/>
      <stop offset=".55" stop-color="${color.deep}"/>
      <stop offset="1" stop-color="${color.base}"/>
    </linearGradient>
    <pattern id="threads" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M0 3 H8 M2 0 V8" stroke="#ffffff" stroke-opacity=".08" stroke-width="1"/>
      <path d="M0 7 H8" stroke="#000000" stroke-opacity=".09" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="360" height="400" fill="#f4f1ec"/>
  <ellipse cx="180" cy="365" rx="${box.width * 0.55}" ry="18" fill="#000" opacity=".1"/>
  <g filter="url(#shadow)">
    ${fringeTop}
    <rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="${rx}" fill="url(#pile)"/>
    <rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="${rx}" fill="url(#threads)"/>
    <rect x="${box.x + 8}" y="${box.y + 8}" width="${box.width - 16}" height="${box.height - 16}" rx="${Math.max(3, rx - 2)}" fill="none" stroke="${color.accent}" stroke-width="${5 + (index % 3)}"/>
    <rect x="${inner.x}" y="${inner.y}" width="${inner.width}" height="${inner.height}" rx="${Math.max(2, rx - 4)}" fill="none" stroke="${color.light}" stroke-width="2" opacity=".8"/>
    ${borderPattern(box, color, index)}
    ${fieldPattern(inner, color, seed.family, index)}
    <path d="M${box.x + 8} ${box.y + box.height - 34} C${box.x + box.width * 0.38} ${box.y + box.height - 18} ${box.x + box.width * 0.68} ${box.y + box.height - 44} ${box.x + box.width - 8} ${box.y + box.height - 24}" fill="none" stroke="#fff" stroke-width="4" opacity=".11"/>
  </g>
</svg>
`;
}

await mkdir(outDir, { recursive: true });

await Promise.all(Array.from({ length: 54 }, async (_, index) => {
  const fileName = `qaleen-${String(index + 1).padStart(2, "0")}.svg`;
  await writeFile(join(outDir, fileName), makeSvg(index), "utf8");
}));

console.log("Generated 54 unique qaleen product images.");
