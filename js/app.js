/* ============================================================
   HalalServices — App Logic
   ============================================================ */

'use strict';

let allServices = [];    // flat list of { category, subcategory, service }
let activeCategory = 'all';
let searchQuery = '';

// ── Fetch & bootstrap ─────────────────────────────────────
async function init() {
  try {
    const res = await fetch('data/services.json');
    if (!res.ok) throw new Error('Failed to load services data');
    const data = await res.json();
    buildFlatIndex(data.categories);
    renderCategoryNav(data.categories);
    renderFilterBar(data.categories);
    renderAllSections(data.categories);
    updateStats(data.categories);
    setupSearch();
    setupBackToTop();
  } catch (err) {
    console.error(err);
    document.getElementById('main-content').innerHTML =
      '<div class="alert alert-warning text-center mt-4">⚠️ Unable to load service listings. Please try refreshing the page.</div>';
  }
}

// ── Build searchable flat index ────────────────────────────
function buildFlatIndex(categories) {
  allServices = [];
  for (const cat of categories) {
    for (const sub of cat.subcategories) {
      for (const svc of sub.services) {
        allServices.push({
          categoryId: cat.id,
          categoryName: cat.name,
          subcategoryId: sub.id,
          subcategoryName: sub.name,
          subcategoryDesc: sub.description,
          tags: sub.tags || [],
          service: svc
        });
      }
    }
  }
}

// ── Category nav (top filter buttons) ─────────────────────
function renderCategoryNav(categories) {
  const nav = document.getElementById('category-nav');
  if (!nav) return;
  nav.innerHTML = '';

  const allBtn = makeFilterBtn('all', '🔍 All Categories', true);
  nav.appendChild(allBtn);

  for (const cat of categories) {
    nav.appendChild(makeFilterBtn(cat.id, `${cat.icon} ${cat.name}`, false));
  }
}

function makeFilterBtn(id, label, active) {
  const btn = document.createElement('button');
  btn.className = 'filter-btn' + (active ? ' active' : '');
  btn.dataset.catId = id;
  btn.textContent = label;
  btn.addEventListener('click', () => {
    activeCategory = id;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
  });
  return btn;
}

// ── Sidebar filter bar (mobile-friendly) ──────────────────
function renderFilterBar(categories) {
  // Re-use the same logic — driven by renderCategoryNav for this layout.
}

// ── Stats bar ─────────────────────────────────────────────
function updateStats(categories) {
  let totalSubs = 0;
  let totalSvcs = 0;
  for (const cat of categories) {
    totalSubs += cat.subcategories.length;
    for (const sub of cat.subcategories) {
      totalSvcs += sub.services.length;
    }
  }
  setText('stat-categories', categories.length);
  setText('stat-subcategories', totalSubs);
  setText('stat-services', totalSvcs);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── Render all service sections ────────────────────────────
function renderAllSections(categories) {
  const container = document.getElementById('services-container');
  if (!container) return;
  container.innerHTML = '';

  for (const cat of categories) {
    const section = buildCategorySection(cat);
    container.appendChild(section);
  }
}

function buildCategorySection(cat) {
  const section = document.createElement('section');
  section.className = 'service-section';
  section.dataset.catId = cat.id;
  section.id = `section-${cat.id}`;

  // Category header
  const header = document.createElement('div');
  header.className = 'd-flex align-items-center gap-3 mb-3';
  header.innerHTML = `
    <span style="font-size:2rem">${cat.icon}</span>
    <div>
      <h2 class="section-heading mb-0">${escapeHtml(cat.name)}</h2>
    </div>`;
  section.appendChild(header);

  const divider = document.createElement('hr');
  divider.className = 'section-divider';
  section.appendChild(divider);

  for (const sub of cat.subcategories) {
    section.appendChild(buildSubcategoryBlock(sub));
  }

  return section;
}

function buildSubcategoryBlock(sub) {
  const block = document.createElement('div');
  block.className = 'mb-4';
  block.dataset.subId = sub.id;

  // Sub-category heading
  const heading = document.createElement('div');
  heading.className = 'subcategory-header mb-1';
  heading.innerHTML = `<h2>${escapeHtml(sub.name)}</h2>`;
  block.appendChild(heading);

  // Tags
  if (sub.tags && sub.tags.length) {
    const tagRow = document.createElement('div');
    tagRow.className = 'mb-2';
    sub.tags.forEach(tag => {
      const pill = document.createElement('span');
      pill.className = 'tag-pill';
      pill.textContent = tag;
      tagRow.appendChild(pill);
    });
    block.appendChild(tagRow);
  }

  // Description
  const desc = document.createElement('p');
  desc.className = 'subcategory-description';
  desc.textContent = sub.description;
  block.appendChild(desc);

  // Service cards grid
  const row = document.createElement('div');
  row.className = 'row g-3';
  for (const svc of sub.services) {
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-lg-4';
    col.appendChild(buildServiceCard(svc));
    row.appendChild(col);
  }
  block.appendChild(row);

  return block;
}

function buildServiceCard(svc) {
  const card = document.createElement('div');
  card.className = 'service-card';

  const name = document.createElement('h4');
  name.textContent = svc.name;
  card.appendChild(name);

  if (svc.address) {
    card.appendChild(metaLine('📍', escapeHtml(svc.address)));
  }
  if (svc.phone) {
    const tel = document.createElement('div');
    tel.className = 'service-meta';
    tel.innerHTML = `<span>📞</span> <a href="tel:${escapeAttr(svc.phone)}">${escapeHtml(svc.phone)}</a>`;
    card.appendChild(tel);
  }
  if (svc.website) {
    const web = document.createElement('div');
    web.className = 'service-meta';
    const link = document.createElement('a');
    link.href = svc.website;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = new URL(svc.website).hostname;
    web.innerHTML = `<span>🌐</span> `;
    web.appendChild(link);
    card.appendChild(web);
  }
  if (svc.notes) {
    const notes = document.createElement('p');
    notes.className = 'service-notes';
    notes.textContent = svc.notes;
    card.appendChild(notes);
  }

  return card;
}

function metaLine(icon, text) {
  const div = document.createElement('div');
  div.className = 'service-meta';
  div.innerHTML = `<span>${icon}</span> ${text}`;
  return div;
}

// ── Search ─────────────────────────────────────────────────
function setupSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;
  input.addEventListener('input', () => {
    searchQuery = input.value.trim().toLowerCase();
    applyFilters();
  });

  // Clear on Escape
  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      input.value = '';
      searchQuery = '';
      applyFilters();
    }
  });
}

// ── Filter (category + search) ─────────────────────────────
function applyFilters() {
  const sections = document.querySelectorAll('.service-section');
  let anyVisible = false;

  sections.forEach(section => {
    const catId = section.dataset.catId;

    // Category filter
    if (activeCategory !== 'all' && catId !== activeCategory) {
      section.classList.add('hidden');
      return;
    }

    // Search filter within section
    let sectionHasResults = false;

    const subBlocks = section.querySelectorAll('[data-sub-id]');
    subBlocks.forEach(block => {
      if (!searchQuery) {
        block.classList.remove('hidden');
        sectionHasResults = true;
        return;
      }

      const text = block.textContent.toLowerCase();
      if (text.includes(searchQuery)) {
        block.classList.remove('hidden');
        sectionHasResults = true;
      } else {
        block.classList.add('hidden');
      }
    });

    if (sectionHasResults) {
      section.classList.remove('hidden');
      anyVisible = true;
    } else {
      section.classList.add('hidden');
    }
  });

  const noResults = document.getElementById('no-results');
  if (noResults) {
    noResults.style.display = anyVisible ? 'none' : 'block';
  }
}

// ── Back to top ────────────────────────────────────────────
function setupBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
}

// ── Utilities ──────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ── Boot ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
