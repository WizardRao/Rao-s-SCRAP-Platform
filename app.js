// Sample data — replace with verified figures once you have a real source.
// Sector inputs are 0-100 scores you supply; company inputs are real ratios.

const stageLabels = [
  'Structural decline', 'Late contraction', 'Bottom formation', 'Early recovery',
  'Early expansion', 'Mid expansion', 'Late expansion', 'Peak / euphoria'
];
const preferredStages = [3, 4, 5];
const cautionStages = [8];

const sectors = [
  { name: 'IT services', quality: 78, growth: 62, timing: 55, stage: 5 },
  { name: 'Private banks', quality: 82, growth: 58, timing: 68, stage: 4 },
  { name: 'Specialty chemicals', quality: 65, growth: 70, timing: 40, stage: 2 },
  { name: 'FMCG', quality: 85, growth: 40, timing: 45, stage: 6 },
  { name: 'Capital goods', quality: 60, growth: 75, timing: 72, stage: 5 },
  { name: 'Pharmaceuticals', quality: 70, growth: 55, timing: 50, stage: 3 },
];

const companies = [
  { name: 'Tata Consultancy Services', sector: 'IT services', roe: 51.8, roce: 63.0, debtEquity: 0.11, revGrowth3y: 6, peVsSectorPct: -6, source: 'Screener.in, 28 Aug 2026' },
  { name: 'Infosys', sector: 'IT services', roe: 31.9, roce: 40.0, debtEquity: 0.10, revGrowth3y: 7, peVsSectorPct: -11, source: 'Screener.in, 28 Aug 2026' },
  { name: 'HCL Technologies', sector: 'IT services', roe: 23.8, roce: 30.4, debtEquity: 0.07, revGrowth3y: 9, peVsSectorPct: 17, source: 'Screener.in, 28 Aug 2026' },
  { name: 'Meridian Bank', sector: 'Private banks', roe: 17, roce: 14, debtEquity: 0.6, revGrowth3y: 18, peVsSectorPct: -12 },
  { name: 'Kestrel Finance Bank', sector: 'Private banks', roe: 15, roce: 12, debtEquity: 0.7, revGrowth3y: 12, peVsSectorPct: 10 },
  { name: 'Aravali Chemicals', sector: 'Specialty chemicals', roe: 19, roce: 22, debtEquity: 0.3, revGrowth3y: 20, peVsSectorPct: -15 },
  { name: 'Solstice Specialty', sector: 'Specialty chemicals', roe: 12, roce: 14, debtEquity: 0.8, revGrowth3y: 8, peVsSectorPct: 25 },
  { name: 'Sundrop Foods', sector: 'FMCG', roe: 28, roce: 32, debtEquity: 0.1, revGrowth3y: 9, peVsSectorPct: 20 },
  { name: 'Harvest Home Foods', sector: 'FMCG', roe: 20, roce: 24, debtEquity: 0.2, revGrowth3y: 6, peVsSectorPct: 5 },
  { name: 'Ironbridge Engineering', sector: 'Capital goods', roe: 21, roce: 23, debtEquity: 0.4, revGrowth3y: 22, peVsSectorPct: -10 },
  { name: 'Falcon Heavy Industries', sector: 'Capital goods', roe: 14, roce: 16, debtEquity: 0.9, revGrowth3y: 15, peVsSectorPct: 8 },
  { name: 'Cascade Pharma', sector: 'Pharmaceuticals', roe: 18, roce: 20, debtEquity: 0.25, revGrowth3y: 13, peVsSectorPct: -5 },
  { name: 'Northline Labs', sector: 'Pharmaceuticals', roe: 10, roce: 11, debtEquity: 1.1, revGrowth3y: 4, peVsSectorPct: 15 },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Sector final score: Quality x 40% + Growth x 35% + Timing x 25% (section 3 of the master prompt).
function sectorScore(sector) {
  return Math.round(sector.quality * 0.4 + sector.growth * 0.35 + sector.timing * 0.25);
}

// Company score: four weighted sub-scores, each normalised to 0-100.
function companyScore(company) {
  const roeScore = clamp((company.roe / 30) * 100, 0, 100);
  const roceScore = clamp((company.roce / 30) * 100, 0, 100);
  const profitability = (roeScore + roceScore) / 2;

  const growth = clamp((company.revGrowth3y / 25) * 100, 0, 100);

  const balanceSheet = clamp(100 - (company.debtEquity / 1.5) * 100, 0, 100);

  const valuation = clamp(50 - company.peVsSectorPct, 0, 100);

  return Math.round(
    profitability * 0.35 + growth * 0.30 + balanceSheet * 0.20 + valuation * 0.15
  );
}

function tierFor(score) {
  if (score >= 70) return { tier: 'strong', label: 'Strong candidate' };
  if (score >= 50) return { tier: 'watch', label: 'Watchlist' };
  return { tier: 'reject', label: 'Reject' };
}

function stageColor(stage) {
  if (preferredStages.includes(stage)) return 'var(--teal)';
  if (cautionStages.includes(stage)) return 'var(--rust)';
  return 'var(--ink-soft)';
}

let selectedSector = null;

function renderSectors() {
  const tbody = document.getElementById('sector-tbody');
  const rows = [...sectors].sort((a, b) => sectorScore(b) - sectorScore(a));

  tbody.innerHTML = rows.map((s) => {
    const final = sectorScore(s);
    const tier = tierFor(final);
    const isActive = selectedSector === s.name;
    const markerLeft = ((s.stage - 1) / 7) * 100;
    const color = stageColor(s.stage);

    return `
      <tr>
        <td><button class="sector-link${isActive ? ' is-active' : ''}" data-sector="${s.name}">${s.name}</button></td>
        <td class="num">${s.quality}</td>
        <td class="num">${s.growth}</td>
        <td class="num">${s.timing}</td>
        <td><span class="badge" data-tier="${tier.tier}">${final}</span></td>
        <td>
          <div class="cycle">
            <div class="cycle-track">
              <div class="cycle-marker" style="left:${markerLeft}%; background:${color};"></div>
            </div>
            <span class="cycle-label">${stageLabels[s.stage - 1]}</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.sector-link').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.sector;
      selectedSector = selectedSector === name ? null : name;
      renderSectors();
      renderCompanies();
    });
  });
}

function renderCompanies() {
  const tbody = document.getElementById('company-tbody');
  const label = document.getElementById('company-filter-label');
  label.textContent = selectedSector
    ? `Showing: ${selectedSector} — click it again to clear`
    : 'Showing all sectors';

  const list = companies
    .filter((c) => !selectedSector || c.sector === selectedSector)
    .map((c) => ({ ...c, score: companyScore(c) }))
    .sort((a, b) => b.score - a.score);

  tbody.innerHTML = list.map((c) => {
    const tier = tierFor(c.score);
    const peSign = c.peVsSectorPct > 0 ? '+' : '';
    const dataTag = c.source
      ? `<span class="tag tag-verified" title="${c.source}">Verified</span>`
      : `<span class="tag tag-sample">Sample</span>`;
    return `
      <tr>
        <td>${c.name}</td>
        <td class="read-text">${c.sector}</td>
        <td class="num">${c.roe}</td>
        <td class="num">${c.roce}</td>
        <td class="num">${c.debtEquity.toFixed(2)}</td>
        <td class="num">${c.revGrowth3y}%</td>
        <td class="num">${peSign}${c.peVsSectorPct}%</td>
        <td><span class="badge" data-tier="${tier.tier}">${c.score}</span></td>
        <td class="read-text">${tier.label}</td>
        <td>${dataTag}</td>
      </tr>
    `;
  }).join('');
}

renderSectors();
renderCompanies();
