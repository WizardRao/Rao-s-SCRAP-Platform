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
  { name: 'HDFC Bank', sector: 'Private banks', roe: 13.6, roce: 7.02, netNpa: 0.41, revGrowth3y: 27, peVsSectorPct: -14, source: 'Screener.in, 28 Aug 2026' },
  { name: 'ICICI Bank', sector: 'Private banks', roe: 15.9, roce: 7.18, netNpa: 0.37, revGrowth3y: 17, peVsSectorPct: 14, source: 'Screener.in, 31 Aug 2026' },
  { name: 'SRF', sector: 'Specialty chemicals', roe: 14.3, roce: 14.6, debtEquity: 0.36, revGrowth3y: 2, peVsSectorPct: 6, source: 'Screener.in, 31 Aug 2026' },
  { name: 'Deepak Nitrite', sector: 'Specialty chemicals', roe: 9.82, roce: 11.4, debtEquity: 0.28, revGrowth3y: 0, peVsSectorPct: -6, source: 'Screener.in, 31 Aug 2026' },
  { name: 'Hindustan Unilever', sector: 'FMCG', roe: 31.0, roce: 28.4, debtEquity: 0.03, revGrowth3y: 2, peVsSectorPct: -27, source: 'Screener.in, 31 Aug 2026' },
  { name: 'Nestle India', sector: 'FMCG', roe: 73.2, roce: 84.1, debtEquity: 0.08, revGrowth3y: 11, peVsSectorPct: 27, source: 'Screener.in, 28 Aug 2026' },
  { name: 'Larsen & Toubro', sector: 'Capital goods', roe: 15.9, roce: 14.6, debtEquity: 1.15, revGrowth3y: 16, peVsSectorPct: -30, source: 'Screener.in, 28 Aug 2026' },
  { name: 'Cummins India', sector: 'Capital goods', roe: 30.2, roce: 39.5, debtEquity: 0.00, revGrowth3y: 16, peVsSectorPct: 30, source: 'Screener.in, 31 Aug 2026' },
  { name: 'Sun Pharmaceutical Industries', sector: 'Pharmaceuticals', roe: 16.0, roce: 20.5, debtEquity: 0.06, revGrowth3y: 10, peVsSectorPct: -38, source: 'Screener.in, 31 Aug 2026' },
  { name: "Divi's Laboratories", sector: 'Pharmaceuticals', roe: 16.5, roce: 22.0, debtEquity: 0.00, revGrowth3y: 11, peVsSectorPct: 38, source: 'Screener.in, 31 Aug 2026' },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Sector final score: Quality x 40% + Growth x 35% + Timing x 25% (section 3 of the master prompt).
function sectorScore(sector) {
  return Math.round(sector.quality * 0.4 + sector.growth * 0.35 + sector.timing * 0.25);
}

// Company score: four weighted sub-scores, each normalised to 0-100.
// Banks get a variant: ROCE and debt/equity aren't meaningful for them, so
// profitability uses ROE alone and the balance-sheet slot uses Net NPA instead.
function companyScore(company) {
  if (company.sector === 'Private banks') {
    const profitability = clamp((company.roe / 18) * 100, 0, 100);
    const growth = clamp((company.revGrowth3y / 20) * 100, 0, 100);
    const assetQuality = clamp(100 - (company.netNpa / 3) * 100, 0, 100);
    const valuation = clamp(50 - company.peVsSectorPct, 0, 100);
    return Math.round(
      profitability * 0.35 + growth * 0.30 + assetQuality * 0.20 + valuation * 0.15
    );
  }

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
        <td class="num">${c.sector === 'Private banks' ? c.netNpa + '% NPA' : c.debtEquity.toFixed(2)}</td>
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
