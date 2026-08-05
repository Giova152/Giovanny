import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { i18n } from './i18n.js';

const root = dirname(fileURLToPath(import.meta.url));
const en = i18n.translations.en;

const pages = [
  { fr: 'index.html', en: 'en/index.html', frPath: '/', frUrl: 'https://infosweb.io/', enUrl: 'https://infosweb.io/en/' },
  { fr: 'tunnel-de-vente/tunnel-de-vente.html', en: 'en/tunnel-de-vente/tunnel-de-vente.html', frPath: '/tunnel-de-vente/tunnel-de-vente.html', frUrl: 'https://infosweb.io/tunnel-de-vente/tunnel-de-vente.html', enUrl: 'https://infosweb.io/en/tunnel-de-vente/tunnel-de-vente.html' },
  { fr: 'creation-site-web/creation-site-web.html', en: 'en/creation-site-web/creation-site-web.html', frPath: '/creation-site-web/creation-site-web.html', frUrl: 'https://infosweb.io/creation-site-web/creation-site-web.html', enUrl: 'https://infosweb.io/en/creation-site-web/creation-site-web.html' },
  { fr: 'audit-strategie/audit-strategie.html', en: 'en/audit-strategie/audit-strategie.html', frPath: '/audit-strategie/audit-strategie.html', frUrl: 'https://infosweb.io/audit-strategie/audit-strategie.html', enUrl: 'https://infosweb.io/en/audit-strategie/audit-strategie.html' },
  { fr: 'merci.html', en: 'en/merci.html', frPath: '/merci.html', frUrl: 'https://infosweb.io/merci.html', enUrl: 'https://infosweb.io/en/merci.html' },
];

const t = (key) => (en[key] !== undefined ? en[key] : null);

function translateAttr(out, attr, attrName) {
  out = out.replace(new RegExp(`${attrName}="([^"]*)"(?=[^>]*data-i18n-${attr}="([^"]+)")`, 'g'), (m, _old, key) => {
    const val = t(key);
    return val === null ? m : `${attrName}="${val}"`;
  });
  out = out.replace(new RegExp(`data-i18n-${attr}="([^"]+)"([^>]*?)${attrName}="([^"]*)"`, 'g'), (m, key, rest, _old) => {
    const val = t(key);
    return val === null ? m : `data-i18n-${attr}="${key}"${rest}${attrName}="${val}"`;
  });
  return out;
}

function build(html, { frPath, frUrl, enUrl }) {
  let out = html;

  // 1. meta : traduire content="..."
  out = out.replace(/data-i18n="([^"]+)"(\s+[^>]*?)content="[^"]*"/g, (m, key, rest) => {
    const val = t(key);
    return val === null ? m : `data-i18n="${key}"${rest}content="${val}"`;
  });
  out = out.replace(/content="[^"]*"(\s+[^>]*?)data-i18n="([^"]+)"/g, (m, rest, key) => {
    const val = t(key);
    return val === null ? m : `content="${val}"${rest}data-i18n="${key}"`;
  });

  // 2. protéger les <meta> du traitement des éléments (pas de balise fermante)
  out = out.replace(/<meta[^>]*>/g, (m) => m.replace(/\s+data-i18n="[^"]*"/g, ''));

  // 3. attributs alt / title / placeholder traduits (dans les deux ordres)
  out = translateAttr(out, 'alt', 'alt');
  out = translateAttr(out, 'title', 'title');
  out = translateAttr(out, 'placeholder', 'placeholder');

  // 4. texte des éléments data-i18n (éléments feuilles)
  out = out.replace(/data-i18n="([^"]+)"[^>]*>([\s\S]*?)<\/[a-zA-Z][^>]*>/g, (m, key, content) => {
    const val = t(key);
    return val === null ? m : m.replace(content, val);
  });

  // 5. suppression des attributs data-i18n*
  out = out.replace(/\s+data-i18n(?:-(alt|title|placeholder))?="[^"]*"/g, '');

  // 6. liens internes
  out = out.replace(/href="\/(tunnel-de-vente|creation-site-web|audit-strategie)\/([^"]+\.html)"/g, 'href="/en/$1/$2"');
  out = out.replace(/href="(tunnel-de-vente|creation-site-web|audit-strategie)\/([^"]+\.html)"/g, 'href="/en/$1/$2"');
  out = out.replace(/href="\/merci\.html"/g, 'href="/en/merci.html"');
  out = out.replace(/href="\/"/g, 'href="/en/"');
  out = out.replace(/href="\.\.\/mentions-legales\.html"/g, 'href="/mentions-legales.html"');
  out = out.replace(/href="\.\.\/politique-de-confidentialite\.html"/g, 'href="/politique-de-confidentialite.html"');
  out = out.replace(/href="\.\.\/style\.css"/g, 'href="../../style.css"');
  out = out.replace(/src="\.\.\/script\.js"/g, 'src="../../script.js"');

  // 7. URLs absolues vers la version EN (canonical, og:url, JSON-LD url...), hors chemins d'images
  out = out.replace(new RegExp('https://infosweb.io/(?!images/)', 'g'), 'https://infosweb.io/en/');

  // 8. toggle de langue -> lien vers la version FR (après les réécritures d'URL)
  out = out.replace(/<(?:a|button) class="lang-toggle"[^>]*>\s*EN\s*<\/(?:a|button)>/g, `<a class="lang-toggle" href="${frPath}" aria-label="Passer en français">FR</a>`);

  // 9. script i18n en module avec langue forcée
  out = out.replace(/<script type="module" src="\/i18n\.js"><\/script>/, '<script type="module" src="/i18n.js" data-lang="en"></script>');

  // 10. hreflang : paires bidirectionnelles correctes
  out = out.replace(/[\s]*<link rel="alternate"[^>]*>\n?/g, '');
  const hreflang = `  <link rel="alternate" href="${frUrl}" hreflang="x-default">
  <link rel="alternate" href="${frUrl}" hreflang="fr">
  <link rel="alternate" href="${enUrl}" hreflang="en">
`;
  out = out.replace(/<link rel="canonical"[^>]*>\n?/, (m) => `${m}${hreflang}`);

  // 11. lang html
  out = out.replace(/<html lang="fr">/, '<html lang="en">');

  return out;
}

let generated = 0;
for (const page of pages) {
  const src = readFileSync(join(root, page.fr), 'utf8');
  const result = build(src, page);
  const dest = join(root, page.en);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, result);
  generated++;
  console.log(`✓ ${page.fr} → ${page.en}`);
}
console.log(`${generated} pages EN générées.`);
