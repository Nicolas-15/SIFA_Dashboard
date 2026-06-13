const fs = require('fs');

const MD_PATH = '/home/jarod/Documents/web/CURSOS/TITULO/MICROS/MANUALES/SIFA_DASHBOARD_MANUAL_INSTRUCCIONES.md';
let md = fs.readFileSync(MD_PATH, 'utf8');

const pages = {
  1: 6, 2: 7, 3: 8, 4: 11, 5: 17, 6: 24, 7: 31, 8: 34,
  9: 37, 10: 41, 11: 45, 12: 47, 13: 49, 14: 52, 15: 54, 16: 56
};

// Exact entries as they appear in the TOC
const entries = [
  ['1. Introducción', '#1-introducción', 6],
  ['2. Requisitos del Sistema', '#2-requisitos-del-sistema', 7],
  ['3. Inicio de Sesión', '#3-inicio-de-sesión', 8],
  ['4. Recuperación de Contraseña', '#4-recuperación-de-contraseña', 11],
  ['5. Panel Principal (Dashboard)', '#5-panel-principal-dashboard', 17],
  ['6. Registro de Infracciones', '#6-registro-de-infracciones', 24],
  ['7. Citaciones JPL', '#7-citaciones-jpl', 31],
  ['8. Catálogo de Tipos de Infracciones', '#8-catálogo-de-tipos-de-infracciones', 34],
  ['9. Gestión de Usuarios', '#9-gestión-de-usuarios', 37],
  ['10. Fiscalizadores en Terreno', '#10-fiscalizadores-en-terreno', 41],
  ['11. Tokens de Acceso', '#11-tokens-de-acceso', 45],
  ['12. Registro de Auditorías', '#12-registro-de-auditorías', 47],
  ['13. Notificaciones Push', '#13-notificaciones-push', 49],
  ['14. Roles y Permisos', '#14-roles-y-permisos', 52],
  ['15. Cierre de Sesión', '#15-cierre-de-sesión', 54],
  ['16. Funcionalidades Transversales', '#16-funcionalidades-transversales', 56],
];

for (const [title, href, page] of entries) {
  const oldStr = `  - [${title}](${href})`;
  const newStr = `  - [${title}](${href}) — pág. ${page}`;

  if (md.includes(oldStr)) {
    md = md.replace(oldStr, newStr);
    console.log(`OK: ${title} → pág. ${page}`);
  } else {
    console.log(`NOT FOUND: ${title}`);
    console.log(`  Looking for: ${JSON.stringify(oldStr)}`);
  }
}

fs.writeFileSync(MD_PATH, md, 'utf8');
console.log('\nDone!');
