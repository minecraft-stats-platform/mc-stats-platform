// =========================================================================
// BETTER_ANSH DASHBOARD - V3 LOGIC ENGINE
// =========================================================================

const $ = id => document.getElementById(id);
const fmtNum = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const fmtTime = hrs => hrs >= 24 ? `${(hrs/24).toFixed(1)}d` : `${hrs}h`;

// Icons
const mobEmoji = mob => ({
  zombie:'🧟', skeleton:'💀', creeper:'💥', spider:'🕷️', enderman:'👁️',
  blaze:'🔥', silverfish:'🐛', pillager:'🏹', vindicator:'⚔️', witch:'🧙',
  evoker:'✨', ravager:'🐂', ghast:'👻', slime:'🟢', magma_cube:'🌋',
  hoglin:'🐗', zombie_villager:'🧟', wither_skeleton:'💀', cave_spider:'🕷️',
  shulker:'🔮', drowned:'🌊', phantom:'🦅', vex:'👺', bat:'🦇',
  pig:'🐷', cow:'🐄', sheep:'🐑', chicken:'🐔', horse:'🐴', iron_golem:'🤖',
  wolf:'🐺', allay:'🧚', breeze:'🌀', piglin:'👺', piglin_brute:'💪',
  zombified_piglin:'🐷', trader_llama:'🦙', wandering_trader:'👨‍💼'
}[mob] || '⚔️');

const itemEmoji = item => {
  const i = item.toLowerCase();
  if(i.includes('diamond')) return '💎';
  if(i.includes('iron')||i.includes('gold')||i.includes('copper')) return '🪙';
  if(i.includes('emerald')) return '💵';
  if(i.includes('sword')) return '🗡️';
  if(i.includes('pickaxe')) return '⛏️';
  if(i.includes('axe')) return '🪓';
  if(i.includes('bow')) return '🏹';
  if(i.includes('stone')||i.includes('cobble')||i.includes('deepslate')) return '🪨';
  if(i.includes('wood')||i.includes('log')||i.includes('plank')) return '🪵';
  if(i.includes('apple')||i.includes('bread')||i.includes('meat')||i.includes('chicken')||i.includes('pork')) return '🍖';
  if(i.includes('sand')||i.includes('gravel')||i.includes('dirt')) return '🟤';
  if(i.includes('coal')) return '⬛';
  if(i.includes('quartz')||i.includes('netherrack')) return '🔥';
  if(i.includes('tnt')) return '🧨';
  return '📦';
};

// Remove Loader
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    $('loader').style.opacity = '0';
    setTimeout(() => $('loader').style.display = 'none', 500);
  }, 600);
});

$('fDate').textContent = LAST_UPDATED;

// ── NAVIGATION ─────────────────────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    $('sec-'+btn.dataset.target).classList.add('active');
  });
});

// ── V3 SERVER AI ───────────────────────────────────────────────────────
function initServerAI() {
  // Server Heat
  const activePlayers = PLAYERS.filter(p => p.play_time_hrs > 5).length;
  const totalKills = PLAYERS.reduce((s,p) => s + p.total_mob_kills, 0);
  const totalDeaths = PLAYERS.reduce((s,p) => s + p.deaths, 0);
  
  let heatText = "Chill ❄️";
  if(totalDeaths > 500) heatText = "Violent 🩸";
  if(totalKills > 20000) heatText = "Warzone 🔥";
  $('serverHeat').textContent = heatText;

  // Dominator Detection
  let dominator = [...PLAYERS].sort((a,b) => b.player_kills - a.player_kills)[0];
  if(dominator && dominator.player_kills > 0) {
    $('dominatorBanner').style.display = 'flex';
    $('domName').textContent = dominator.name;
    $('domKills').textContent = dominator.player_kills;
  }
}

// ── PLAYERS GRID ───────────────────────────────────────────────────────
function renderPlayersGrid(filter = '') {
  const grid = $('playersGrid');
  const f = filter.toLowerCase();
  const filtered = PLAYERS.filter(p => p.name.toLowerCase().includes(f));
  
  const favorites = JSON.parse(localStorage.getItem('mc_favorites') || '[]');
  
  filtered.sort((a, b) => {
    const aFav = favorites.includes(a.uuid) ? 1 : 0;
    const bFav = favorites.includes(b.uuid) ? 1 : 0;
    if (bFav !== aFav) return bFav - aFav;
    return b.bas_score - a.bas_score;
  });
  
  grid.innerHTML = filtered.map(p => {
    const isFav = favorites.includes(p.uuid);
    return `
    <div class="p-card team-${p.team}" onclick="openProfile('${p.uuid}')" style="${isFav ? 'border: 1px solid #ef4444; box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);' : ''}">
      <div class="pc-top">
        <img src="https://mc-heads.net/avatar/${p.uuid}/100" class="pc-img" alt="Avatar" onerror="this.src='https://crafatar.com/avatars/${p.uuid}?size=100'"/>
        <div class="pc-info" style="width: 100%;">
          <div class="pc-name" style="display:flex; justify-content:space-between; align-items:center;">
            <span>${p.name}</span>
            ${isFav ? '<span style="font-size:1rem; text-shadow: 0 0 5px #ef4444;">❤️</span>' : ''}
          </div>
          <span class="badge team-${p.team}">${TEAMS[p.team].name}</span>
          <span class="badge playstyle-badge">${p.playstyle.split('|')[0]}</span>
        </div>
      </div>
      <div class="pc-stats-grid">
        <div class="pc-stat">
          <div class="pc-s-val">${fmtNum(p.bas_score)}</div>
          <div class="pc-s-lbl" style="color:var(--ba-primary)">Ultimate Score</div>
        </div>
        <div class="pc-stat">
          <div class="pc-s-val">${p.rank.title}</div>
          <div class="pc-s-lbl">Rank</div>
        </div>
        <div class="pc-stat">
          <div class="pc-s-val">${fmtNum(p.total_mob_kills)}</div>
          <div class="pc-s-lbl">Mob Kills</div>
        </div>
        <div class="pc-stat">
          <div class="pc-s-val">${p.kd}</div>
          <div class="pc-s-lbl">K/D Ratio</div>
        </div>
      </div>
    </div>
  `}).join('');
}
$('globalSearch').addEventListener('input', (e) => renderPlayersGrid(e.target.value));

// ── DASHBOARD V3 ─────────────────────────────────────────────────────
function renderDashboard() {
  const totalPlaytime = PLAYERS.reduce((s, p) => s + p.play_time_hrs, 0);
  $('dsPlaytime').textContent = fmtTime(totalPlaytime);
  $('dsDeaths').textContent = fmtNum(PLAYERS.reduce((s, p) => s + p.deaths, 0));
  $('dsMined').textContent = fmtNum(PLAYERS.reduce((s, p) => s + p.blocks_mined, 0));
  $('dsCrafted').textContent = fmtNum(PLAYERS.reduce((s, p) => s + Object.values(p.crafted_obj || {}).reduce((a, b) => a + b, 0), 0));
  $('dsMobKills').textContent = fmtNum(PLAYERS.reduce((s, p) => s + p.total_mob_kills, 0));
  $('dsPvPKills').textContent = fmtNum(PLAYERS.reduce((s, p) => s + p.player_kills, 0));
  const totalKm = PLAYERS.reduce((s, p) => s + p.walk_km + p.sprint_km + p.fly_km, 0);
  $('dsDistance').textContent = fmtNum(Math.round(totalKm)) + " km";
  $('dsPlayers').textContent = PLAYERS.length;

  const renderMiniRank = (arr, valKey, formatFn) => {
    return arr.map((p, i) => `
      <div class="stat-row" onclick="openProfile('${p.uuid}')" style="cursor:pointer; padding:0.5rem; border-radius:8px; transition:0.2s;">
        <div class="stat-row-top">
          <div class="stat-row-name">
            <img src="https://mc-heads.net/avatar/${p.uuid}/30" style="width:24px; border-radius:4px;" onerror="this.src='https://crafatar.com/avatars/${p.uuid}?size=30'" />
            <span style="color:#fff;">${p.name}</span>
          </div>
          <div class="stat-row-val">${formatFn ? formatFn(p[valKey]) : fmtNum(p[valKey])}</div>
        </div>
      </div>
    `).join('');
  };

  const topTime = [...PLAYERS].sort((a, b) => b.play_time_hrs - a.play_time_hrs).slice(0, 5);
  $('colPlaytime').innerHTML = renderMiniRank(topTime, 'play_time_hrs', fmtTime);

  const topMined = [...PLAYERS].sort((a, b) => b.blocks_mined - a.blocks_mined).slice(0, 5);
  $('colMined').innerHTML = renderMiniRank(topMined, 'blocks_mined');

  const topKills = [...PLAYERS].sort((a, b) => b.total_mob_kills - a.total_mob_kills).slice(0, 5);
  $('colKills').innerHTML = renderMiniRank(topKills, 'total_mob_kills');

  const aggBlocks = {};
  const aggUsed = {};
  const aggMobs = {};
  PLAYERS.forEach(p => {
    for (let k in p.mined_obj) aggBlocks[k] = (aggBlocks[k] || 0) + p.mined_obj[k];
    for (let k in p.used_obj) aggUsed[k] = (aggUsed[k] || 0) + p.used_obj[k];
    for (let k in p.killed_obj) aggMobs[k] = (aggMobs[k] || 0) + p.killed_obj[k];
  });

  const topAggBlocks = Object.entries(aggBlocks).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const topAggUsed = Object.entries(aggUsed).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const topAggMobs = Object.entries(aggMobs).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const renderAggRank = (arr, type) => {
    return arr.map(([k, v]) => {
      let rawName = k.replace('minecraft:', '');
      let name = rawName.replace(/_/g, ' ');
      let icon = type === 'blocks' ? `<img src="https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data/1.19.2/items/${rawName}.png" onerror="this.onerror=null; this.src='https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data/1.19.2/blocks/${rawName}.png';" class="mc-logo-sm" alt=""/>` : `<span style="font-size:1.2rem">${mobEmoji(rawName)}</span>`;
      return `
        <div class="stat-row" style="padding:0.5rem;">
          <div class="stat-row-top">
            <div class="stat-row-name">${icon} <span style="text-transform:capitalize;">${name}</span></div>
            <div class="stat-row-val">${fmtNum(v)}</div>
          </div>
        </div>
      `;
    }).join('');
  };

  $('colGlobalBlocks').innerHTML = renderAggRank(topAggBlocks, 'blocks');
  $('colGlobalItems').innerHTML = renderAggRank(topAggUsed, 'blocks');
  $('colGlobalMobs').innerHTML = renderAggRank(topAggMobs, 'mobs');
}

// ── RIVAL BATTLES (GOD TIER) ───────────────────────────────────────────
function initBattleSystem() {
  const opts = PLAYERS.map(p => `<option value="${p.uuid}">${p.name}</option>`).join('');
  $('battleSelect1').innerHTML = opts;
  $('battleSelect2').innerHTML = opts;
  
  if (PLAYERS.length > 1) {
    $('battleSelect2').selectedIndex = 1;
  }

  // Compare tab switching
  document.querySelectorAll('.ctab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.ctab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      $('ctab-'+btn.dataset.ctab).classList.add('active');
    });
  });
  
  $('btnFight').addEventListener('click', () => {
    const p1 = PLAYERS.find(p => p.uuid === $('battleSelect1').value);
    const p2 = PLAYERS.find(p => p.uuid === $('battleSelect2').value);
    
    if(!p1 || !p2) { alert('Please select two players!'); return; }
    if(p1.uuid === p2.uuid) { alert('You cannot battle the same player! Select two different players.'); return; }
    
    $('battleArena').style.display = 'flex';
    $('battleResult').style.display = 'none';
    $('comparePanel').style.display = 'none';
    
    $('bfAvatar1').src = `https://mc-heads.net/avatar/${p1.uuid}/150`;
    $('bfName1').textContent = p1.name;
    $('bfScore1').textContent = 0;
    
    $('bfAvatar2').src = `https://mc-heads.net/avatar/${p2.uuid}/150`;
    $('bfName2').textContent = p2.name;
    $('bfScore2').textContent = 0;
    
    let ticks = 0;
    let s1 = 0; let s2 = 0;
    const interval = setInterval(() => {
      s1 += p1.bas_score / 20;
      s2 += p2.bas_score / 20;
      $('bfScore1').textContent = Math.round(s1);
      $('bfScore2').textContent = Math.round(s2);
      ticks++;
      
      if(ticks >= 20) {
        clearInterval(interval);
        $('bfScore1').textContent = fmtNum(p1.bas_score);
        $('bfScore2').textContent = fmtNum(p2.bas_score);
        
        const winner = p1.bas_score >= p2.bas_score ? p1 : p2;
        $('battleResult').style.display = 'block';
        $('brWinner').textContent = `🏆 WINNER: ${winner.name} 🏆`;
        
        // Render comparison
        renderAdvancedComparison(p1, p2);
      }
    }, 50);
  });
}

// ── ADVANCED COMPARISON ENGINE (UNBIASED) ──────────────────────────────
function renderAdvancedComparison(p1, p2) {
  $('comparePanel').style.display = 'block';

  // Define all stat categories
  const categories = {
    core: {
      title: '🎯 Core Statistics',
      stats: [
        { label: '🏆 BAS Score', v1: p1.bas_score, v2: p2.bas_score },
        { label: '⏱️ Play Time', v1: p1.play_time_hrs, v2: p2.play_time_hrs, suffix: 'hrs', decimal: true },
        { label: '💀 Mob Kills', v1: p1.total_mob_kills, v2: p2.total_mob_kills },
        { label: '⚔️ Player Kills', v1: p1.player_kills, v2: p2.player_kills },
        { label: '🪦 Deaths', v1: p1.deaths, v2: p2.deaths, lowerBetter: true },
        { label: '⚖️ K/D Ratio', v1: p1.kd, v2: p2.kd, decimal: true },
        { label: '⛏️ Blocks Mined', v1: p1.blocks_mined, v2: p2.blocks_mined },
        { label: '🏅 Rank', v1: p1.bas_score, v2: p2.bas_score, display: [p1.rank.title, p2.rank.title] }
      ]
    },
    combat: {
      title: '⚔️ Combat Breakdown',
      stats: [
        { label: '💀 Total Mob Kills', v1: p1.total_mob_kills, v2: p2.total_mob_kills },
        { label: '⚔️ Player Kills', v1: p1.player_kills, v2: p2.player_kills },
        { label: '🪦 Deaths', v1: p1.deaths, v2: p2.deaths, lowerBetter: true },
        { label: '⚖️ K/D Ratio', v1: p1.kd, v2: p2.kd, decimal: true },
        { label: '💥 Damage Dealt', v1: p1.damage_dealt, v2: p2.damage_dealt },
        { label: '🩸 Damage Taken', v1: p1.damage_taken, v2: p2.damage_taken, lowerBetter: true },
        { label: '🧠 Dmg Efficiency', v1: p1.damage_taken>0 ? +(p1.damage_dealt/p1.damage_taken).toFixed(2) : p1.damage_dealt, v2: p2.damage_taken>0 ? +(p2.damage_dealt/p2.damage_taken).toFixed(2) : p2.damage_dealt, decimal: true },
        { label: '👁️ Unique Mobs Killed', v1: Object.keys(p1.killed_obj).length, v2: Object.keys(p2.killed_obj).length },
        { label: '🧟 Killed By Mobs', v1: Object.values(p1.killed_by_obj).reduce((a,b)=>a+b,0), v2: Object.values(p2.killed_by_obj).reduce((a,b)=>a+b,0), lowerBetter: true }
      ]
    },
    mining: {
      title: '⛏️ Mining & Resources',
      stats: [
        { label: '⛏️ Total Blocks', v1: p1.blocks_mined, v2: p2.blocks_mined },
        { label: '<img src="https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data/1.19.2/blocks/stone.png" style="width:20px;vertical-align:middle;margin-right:5px;image-rendering:pixelated;"> Stone', v1: (p1.mined_obj['minecraft:stone']||0), v2: (p2.mined_obj['minecraft:stone']||0) },
        { label: '<img src="https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data/1.19.2/blocks/deepslate.png" style="width:20px;vertical-align:middle;margin-right:5px;image-rendering:pixelated;"> Deepslate', v1: (p1.mined_obj['minecraft:deepslate']||0), v2: (p2.mined_obj['minecraft:deepslate']||0) },
        { label: '<img src="https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data/1.19.2/blocks/diamond_ore.png" style="width:20px;vertical-align:middle;margin-right:5px;image-rendering:pixelated;"> Diamond Ore', v1: (p1.mined_obj['minecraft:deepslate_diamond_ore']||0)+(p1.mined_obj['minecraft:diamond_ore']||0), v2: (p2.mined_obj['minecraft:deepslate_diamond_ore']||0)+(p2.mined_obj['minecraft:diamond_ore']||0) },
        { label: '<img src="https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data/1.19.2/blocks/coal_ore.png" style="width:20px;vertical-align:middle;margin-right:5px;image-rendering:pixelated;"> Coal Ore', v1: (p1.mined_obj['minecraft:coal_ore']||0), v2: (p2.mined_obj['minecraft:coal_ore']||0) },
        { label: '<img src="https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data/1.19.2/blocks/iron_ore.png" style="width:20px;vertical-align:middle;margin-right:5px;image-rendering:pixelated;"> Iron Ore', v1: (p1.mined_obj['minecraft:iron_ore']||0)+(p1.mined_obj['minecraft:deepslate_iron_ore']||0), v2: (p2.mined_obj['minecraft:iron_ore']||0)+(p2.mined_obj['minecraft:deepslate_iron_ore']||0) },
        { label: '<img src="https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data/1.19.2/blocks/gold_ore.png" style="width:20px;vertical-align:middle;margin-right:5px;image-rendering:pixelated;"> Gold Ore', v1: (p1.mined_obj['minecraft:gold_ore']||0)+(p1.mined_obj['minecraft:deepslate_gold_ore']||0)+(p1.mined_obj['minecraft:nether_gold_ore']||0), v2: (p2.mined_obj['minecraft:gold_ore']||0)+(p2.mined_obj['minecraft:deepslate_gold_ore']||0)+(p2.mined_obj['minecraft:nether_gold_ore']||0) },
        { label: '<img src="https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data/1.19.2/blocks/ancient_debris.png" style="width:20px;vertical-align:middle;margin-right:5px;image-rendering:pixelated;"> Ancient Debris', v1: (p1.mined_obj['minecraft:ancient_debris']||0), v2: (p2.mined_obj['minecraft:ancient_debris']||0) },
        { label: '<img src="https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data/1.19.2/blocks/netherrack.png" style="width:20px;vertical-align:middle;margin-right:5px;image-rendering:pixelated;"> Netherrack', v1: (p1.mined_obj['minecraft:netherrack']||0), v2: (p2.mined_obj['minecraft:netherrack']||0) },
        { label: '📦 Unique Blocks', v1: Object.keys(p1.mined_obj).length, v2: Object.keys(p2.mined_obj).length }
      ]
    },
    movement: {
      title: '🏃 Movement & Exploration',
      stats: [
        { label: '🚶 Walk Distance', v1: p1.walk_km, v2: p2.walk_km, suffix: 'km', decimal: true },
        { label: '🏃 Sprint Distance', v1: p1.sprint_km, v2: p2.sprint_km, suffix: 'km', decimal: true },
        { label: '🦅 Fly Distance', v1: p1.fly_km, v2: p2.fly_km, suffix: 'km', decimal: true },
        { label: '🗺️ Total Distance', v1: +(p1.walk_km+p1.sprint_km+p1.fly_km).toFixed(2), v2: +(p2.walk_km+p2.sprint_km+p2.fly_km).toFixed(2), suffix: 'km', decimal: true },
        { label: '🛌 Sleep In Bed', v1: p1.sleep_in_bed, v2: p2.sleep_in_bed }
      ]
    },
    items: {
      title: '📦 Items & Crafting',
      stats: [
        { label: '🔨 Items Crafted', v1: Object.values(p1.crafted_obj||{}).reduce((a,b)=>a+b,0), v2: Object.values(p2.crafted_obj||{}).reduce((a,b)=>a+b,0) },
        { label: '🖱️ Items Used', v1: Object.values(p1.used_obj||{}).reduce((a,b)=>a+b,0), v2: Object.values(p2.used_obj||{}).reduce((a,b)=>a+b,0) },
        { label: '💥 Tools Broken', v1: Object.values(p1.broken_obj||{}).reduce((a,b)=>a+b,0), v2: Object.values(p2.broken_obj||{}).reduce((a,b)=>a+b,0) },
        { label: '✨ Unique Crafts', v1: Object.keys(p1.crafted_obj||{}).length, v2: Object.keys(p2.crafted_obj||{}).length },
        { label: '🔄 Items Dropped', v1: Object.values(p1.dropped_obj||{}).reduce((a,b)=>a+b,0), v2: Object.values(p2.dropped_obj||{}).reduce((a,b)=>a+b,0) },
        { label: '📥 Items Picked Up', v1: Object.values(p1.picked_obj||{}).reduce((a,b)=>a+b,0), v2: Object.values(p2.picked_obj||{}).reduce((a,b)=>a+b,0) }
      ]
    },
    efficiency: {
      title: '🧠 Efficiency & Skill',
      stats: [
        { label: '⚡ Kills / Hour', v1: p1.play_time_hrs>0 ? +(p1.total_mob_kills/p1.play_time_hrs).toFixed(1) : 0, v2: p2.play_time_hrs>0 ? +(p2.total_mob_kills/p2.play_time_hrs).toFixed(1) : 0, decimal: true },
        { label: '⚡ Blocks / Hour', v1: p1.play_time_hrs>0 ? +(p1.blocks_mined/p1.play_time_hrs).toFixed(1) : 0, v2: p2.play_time_hrs>0 ? +(p2.blocks_mined/p2.play_time_hrs).toFixed(1) : 0, decimal: true },
        { label: '⚠️ Deaths / Hour', v1: p1.play_time_hrs>0 ? +(p1.deaths/p1.play_time_hrs).toFixed(2) : 0, v2: p2.play_time_hrs>0 ? +(p2.deaths/p2.play_time_hrs).toFixed(2) : 0, decimal: true, lowerBetter: true },
        { label: '🥊 Dmg Dealt/Death', v1: p1.deaths>0 ? Math.round(p1.damage_dealt/p1.deaths) : p1.damage_dealt, v2: p2.deaths>0 ? Math.round(p2.damage_dealt/p2.deaths) : p2.damage_dealt },
        { label: '🛡️ Survival Ratio', v1: p1.play_time_hrs>0 ? +((p1.play_time_hrs*60)/Math.max(1,p1.deaths)).toFixed(1) : 0, v2: p2.play_time_hrs>0 ? +((p2.play_time_hrs*60)/Math.max(1,p2.deaths)).toFixed(1) : 0, decimal: true, suffix: 'min/dth' }
      ]
    }
  };

  // Render each category
  let totalP1Wins = 0, totalP2Wins = 0;

  Object.keys(categories).forEach(catKey => {
    const cat = categories[catKey];
    let catP1 = 0, catP2 = 0;

    let rowsHtml = '';
    cat.stats.forEach(st => {
      let v1 = parseFloat(st.v1) || 0;
      let v2 = parseFloat(st.v2) || 0;
      const maxVal = Math.max(v1, v2, 1);
      const pct1 = (v1 / maxVal) * 100;
      const pct2 = (v2 / maxVal) * 100;

      let cls1, cls2;
      if (st.lowerBetter) {
        if (v1 < v2) { cls1 = 'winner'; cls2 = 'loser'; catP1++; }
        else if (v2 < v1) { cls1 = 'loser'; cls2 = 'winner'; catP2++; }
        else { cls1 = 'tie'; cls2 = 'tie'; }
      } else {
        if (v1 > v2) { cls1 = 'winner'; cls2 = 'loser'; catP1++; }
        else if (v2 > v1) { cls1 = 'loser'; cls2 = 'winner'; catP2++; }
        else { cls1 = 'tie'; cls2 = 'tie'; }
      }

      const d1 = st.display ? st.display[0] : (st.decimal ? v1 : fmtNum(v1));
      const d2 = st.display ? st.display[1] : (st.decimal ? v2 : fmtNum(v2));
      const suf = st.suffix ? ` ${st.suffix}` : '';

      rowsHtml += `
        <div class="cmp-row">
          <div class="cmp-val left ${cls1}">${d1}${st.display?'':suf}</div>
          <div class="cmp-bar left"><div class="cmp-bar-fill" style="width:${pct1}%"></div></div>
          <div class="cmp-label">${st.label}</div>
          <div class="cmp-bar right"><div class="cmp-bar-fill" style="width:${pct2}%"></div></div>
          <div class="cmp-val right ${cls2}">${d2}${st.display?'':suf}</div>
        </div>
      `;
    });

    totalP1Wins += catP1;
    totalP2Wins += catP2;

    const catWinCls = catP1 > catP2 ? 'p1-wins' : catP2 > catP1 ? 'p2-wins' : 'cat-tie';
    const catWinTxt = catP1 > catP2 ? `${p1.name} leads ${catP1}-${catP2}` : catP2 > catP1 ? `${p2.name} leads ${catP2}-${catP1}` : `Tied ${catP1}-${catP2}`;

    $('ctab-'+catKey).innerHTML = `
      <div class="cmp-cat-header">
        <h3>${cat.title}</h3>
        <span class="cat-score ${catWinCls}">${catWinTxt}</span>
      </div>
      ${rowsHtml}
    `;
  });

  // Overall verdict
  const total = totalP1Wins + totalP2Wins;
  const pct1 = total > 0 ? Math.round((totalP1Wins / total) * 100) : 50;
  const pct2 = 100 - pct1;

  let verdictText = '';
  if (totalP1Wins > totalP2Wins) {
    verdictText = `${p1.name} dominates with ${totalP1Wins} stat wins vs ${totalP2Wins}`;
  } else if (totalP2Wins > totalP1Wins) {
    verdictText = `${p2.name} dominates with ${totalP2Wins} stat wins vs ${totalP1Wins}`;
  } else {
    verdictText = `Perfectly balanced! Both tied at ${totalP1Wins} stat wins each`;
  }

  $('compareVerdict').innerHTML = `
    <div class="verdict-title">${verdictText}</div>
    <div class="verdict-names">
      <span class="v-left">${p1.name} — ${totalP1Wins} wins</span>
      <span class="v-right">${p2.name} — ${totalP2Wins} wins</span>
    </div>
    <div class="verdict-score-bar">
      <div class="verdict-bar-left" style="width:${pct1}%"></div>
      <div class="verdict-bar-right" style="width:${pct2}%"></div>
    </div>
    <div class="verdict-subtitle">Across ${total} individual stat comparisons · Higher bar = more stat wins</div>
  `;

  // Summary Cards
  $('compareSummary').innerHTML = `
    <h3 style="text-align:center; color:#fff; margin-bottom:0.5rem;">📋 Head-to-Head Summary</h3>
    <p style="text-align:center; color:var(--text-muted); margin-bottom:1.5rem; font-size:0.85rem;">Fair comparison across ${total} stats in 6 categories</p>
    <div class="summary-grid">
      <div class="summary-card">
        <div class="sc-label">${p1.name} Stats Won</div>
        <div class="sc-val p1">${totalP1Wins}</div>
      </div>
      <div class="summary-card">
        <div class="sc-label">${p2.name} Stats Won</div>
        <div class="sc-val p2">${totalP2Wins}</div>
      </div>
      <div class="summary-card">
        <div class="sc-label">${p1.name} Playstyle</div>
        <div class="sc-val p1" style="font-size:1rem;">${p1.playstyle.split('|')[0]}</div>
      </div>
      <div class="summary-card">
        <div class="sc-label">${p2.name} Playstyle</div>
        <div class="sc-val p2" style="font-size:1rem;">${p2.playstyle.split('|')[0]}</div>
      </div>
      <div class="summary-card">
        <div class="sc-label">${p1.name} Rank</div>
        <div class="sc-val p1">${p1.rank.title}</div>
      </div>
      <div class="summary-card">
        <div class="sc-label">${p2.name} Rank</div>
        <div class="sc-val p2">${p2.rank.title}</div>
      </div>
    </div>
  `;

  // Reset compare tabs
  document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.ctab-pane').forEach(p => p.classList.remove('active'));
  document.querySelector('.ctab[data-ctab="core"]').classList.add('active');
  $('ctab-core').classList.add('active');
  
  // Render Rival Radar Chart
  renderRivalRadar(p1, p2);

  // Scroll to comparison
  setTimeout(() => {
    $('comparePanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 300);
}

// ── PROFILE MODAL (V3) ─────────────────────────────────────────────────
let timelineChartInstance = null;
let skillRadarChartInstance = null;
let miningDoughnutChartInstance = null;
let mobsBarChartInstance = null;
let rivalRadarChartInstance = null;
let chartKdBarInstance = null;
let chartDistBarInstance = null;
let chartActivityPieInstance = null;

let skinViewerInstance = null;

function openProfile(uuid) { try {
  const p = PLAYERS.find(x => x.uuid === uuid);
  if(!p) return;
  
  // Render 3D Skin with Fallback
  $('skinContainer').innerHTML = '';
  try {
    if (skinViewerInstance) { skinViewerInstance.dispose(); }
    
    skinViewerInstance = new skinview3d.SkinViewer({
      canvas: document.createElement("canvas"),
      width: 140,
      height: 180,
      skin: `https://crafatar.com/skins/${p.uuid}`
    });
    
    skinViewerInstance.autoRotate = true;
    skinViewerInstance.autoRotateSpeed = 0.5;
    
    // Fallback: the OrbitControls from this version of skinview3d doesn't exist. Let it just auto-rotate.
    
    $('skinContainer').appendChild(skinViewerInstance.canvas);
  } catch (err) {
    console.error("3D Skin failed to load:", err);
    $('skinContainer').innerHTML = `<img src="https://mc-heads.net/avatar/${p.uuid}/140" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://crafatar.com/avatars/${p.uuid}?size=140';" />`;
  }

  // Apply Special Thematic Skin based on Achievements
  if (p.achievements && p.achievements.length > 0) {
    const topAch = p.achievements[0].title;
    if (topAch === "Monster Hunter") {
      // Load a special "Hunter" skin texture if they earned it
      // For now we just load their default, but you can swap URLs here
      // skinViewerInstance.loadSkin("url-to-hunter-skin.png");
    }
  }

  $('pName').textContent = p.name;
  $('pUuid').textContent = p.uuid;
  
  // Level Progress Bar
  const level = Math.floor(p.bas_score / 500) + 1;
  const currentLevelProgress = p.bas_score % 500;
  const progressPct = Math.min(100, Math.max(2, (currentLevelProgress / 500) * 100));
  
  $('pLevelText').textContent = level;
  $('pNextLevelText').textContent = `${Math.round(currentLevelProgress)} / 500 pts`;
  $('pLevelFill').style.width = `${progressPct}%`;
  
  // Rank Badge
  $('pRankBadge').innerHTML = `${p.rank.title}`;
  $('pRankBadge').className = `badge ${p.rank.class} playstyle-badge`;
  $('pRankBadge').style.borderColor = 'currentColor';

  // Achievements
  const ALL_ACHIEVEMENTS = [
    { id: 'first_blood', icon: '🩸', title: 'First Blood', desc: 'Get your first PvP kill', req: p => p.player_kills >= 1, tier: 'bronze' },
    { id: 'executioner', icon: '⚔️', title: 'Executioner', desc: 'Get 10 PvP kills', req: p => p.player_kills >= 10, tier: 'silver' },
    { id: 'god_mode', icon: '✨', title: 'GOD Mode', desc: 'Get 50 PvP kills', req: p => p.player_kills >= 50, tier: 'gold' },
    { id: 'mob_slayer', icon: '🧟', title: 'Mob Slayer', desc: 'Kill 1,000 Mobs', req: p => p.total_mob_kills >= 1000, tier: 'bronze' },
    { id: 'monster_hunter', icon: '🏹', title: 'Monster Hunter', desc: 'Kill 5,000 Mobs', req: p => p.total_mob_kills >= 5000, tier: 'silver' },
    { id: 'doom_slayer', icon: '🌋', title: 'Doom Slayer', desc: 'Kill 10,000 Mobs', req: p => p.total_mob_kills >= 10000, tier: 'gold' },
    { id: 'miner', icon: '⛏️', title: 'Miner', desc: 'Mine 10,000 Blocks', req: p => p.blocks_mined >= 10000, tier: 'bronze' },
    { id: 'master_miner', icon: '⚒️', title: 'Master Miner', desc: 'Mine 50,000 Blocks', req: p => p.blocks_mined >= 50000, tier: 'silver' },
    { id: 'dwarven_king', icon: '👑', title: 'Dwarven King', desc: 'Mine 100,000 Blocks', req: p => p.blocks_mined >= 100000, tier: 'gold' },
    { id: 'marathon', icon: '🏃', title: 'Marathon Runner', desc: 'Travel 100km', req: p => (p.walk_km+p.sprint_km) >= 100, tier: 'bronze' },
    { id: 'explorer', icon: '🧭', title: 'Explorer', desc: 'Travel 500km', req: p => (p.walk_km+p.sprint_km) >= 500, tier: 'silver' },
    { id: 'veteran', icon: '🎖️', title: 'Veteran', desc: 'Play for 100 hours', req: p => p.play_time_hrs >= 100, tier: 'silver' },
    { id: 'no_life', icon: '⏱️', title: 'No Lifed', desc: 'Play for 500 hours', req: p => p.play_time_hrs >= 500, tier: 'gold' },
    { id: 'untouchable', icon: '📈', title: 'Untouchable', desc: 'Achieve a K/D of 10.0+', req: p => p.kd >= 10, tier: 'gold' },
    { id: 'skill_issue', icon: '🤡', title: 'Skill Issue', desc: 'Die 100 times', req: p => p.deaths >= 100, tier: 'bronze' },
    { id: 'legend', icon: '🌟', title: 'Legend', desc: 'Reach 10,000 Better_Ansh Score', req: p => p.bas_score >= 10000, tier: 'gold' }
  ];

  let unlockedCount = 0;
  const achHTML = ALL_ACHIEVEMENTS.map(ach => {
    const isUnlocked = ach.req(p);
    if(isUnlocked) unlockedCount++;
    const bgCls = isUnlocked ? `ach-bg-${ach.tier}` : 'ach-bg-locked';
    return `
      <div class="ach-box ${bgCls}" title="${ach.title}\n${ach.desc}\nStatus: ${isUnlocked?'Unlocked':'Locked'}" style="padding: 1rem; border-radius: 12px; border: 1px solid ${isUnlocked? 'var(--ba-primary)' : 'rgba(255,255,255,0.1)'}; text-align: center; background: ${isUnlocked? 'rgba(57,255,20,0.1)' : 'rgba(255,255,255,0.02)'}; opacity: ${isUnlocked? 1 : 0.4}; transition: 0.2s;">
        <div style="font-size: 2rem;">${ach.icon}</div>
        <div style="font-size: 0.7rem; font-weight: bold; margin-top: 0.3rem; color: ${isUnlocked? '#fff' : 'var(--text-muted)'};">${ach.title}</div>
      </div>
    `;
  }).join('');
  
  $('achievementsGrid').innerHTML = achHTML;
  $('pAchCount').textContent = `${unlockedCount} / 16 unlocked`;

  // Copy Stats Button
  $('btnCopyStats').onclick = () => {
    const text = `=== ${p.name} — Minecraft Stats ===\nScore: ${fmtNum(p.bas_score)} pts | Rank: ${p.rank.title}\nLevel: ${level}\n\nPlaytime: ${fmtTime(p.play_time_hrs)}\nBlocks Mined: ${fmtNum(p.blocks_mined)}\nMob Kills: ${fmtNum(p.total_mob_kills)}\nPvP Kills: ${fmtNum(p.player_kills)}\nDeaths: ${fmtNum(p.deaths)}\nK/D: ${p.kd}\nDistance: ${fmtNum(Math.round(p.walk_km+p.sprint_km+p.fly_km))} km\n\nAchievements (${unlockedCount}/16)\n\nMade by Better_Ansh • MC_STATS`;
    navigator.clipboard.writeText(text).then(() => {
      const orig = $('btnCopyStats').innerHTML;
      $('btnCopyStats').innerHTML = '✅ Copied!';
      setTimeout(() => { $('btnCopyStats').innerHTML = orig; }, 2000);
    });
  };

  // Favorites
  let favorites = JSON.parse(localStorage.getItem('mc_favorites') || '[]');
  const updateFavoriteIcon = () => {
    const isFav = favorites.includes(p.uuid);
    $('btnFavorite').innerHTML = isFav ? '❤️' : '🤍';
    $('btnFavorite').style.transform = isFav ? 'scale(1.2)' : 'scale(1)';
  };
  updateFavoriteIcon();
  
  $('btnFavorite').onclick = () => {
    if(favorites.includes(p.uuid)) favorites = favorites.filter(id => id !== p.uuid);
    else favorites.push(p.uuid);
    localStorage.setItem('mc_favorites', JSON.stringify(favorites));
    updateFavoriteIcon();
    renderPlayersGrid($('globalSearch').value); // Refresh grid to show favorites
  };
  
  $('psPlaytime').textContent = fmtTime(p.play_time_hrs);
  $('psMined').textContent = fmtNum(p.blocks_mined);
  $('psKills').textContent = fmtNum(p.total_mob_kills);
  $('psDeaths').textContent = fmtNum(p.deaths);
  
  $('pBas').textContent = fmtNum(p.bas_score);
  $('pPvPKD').textContent = p.kd;
  
  $('scoreMath').innerHTML = `
    <div>PvP Kills &times; 10 = <span style="color:#fbbf24">${fmtNum(p.player_kills * 10)}</span></div>
    <div>Mob Kills &times; 2 = <span style="color:#4ade80">${fmtNum(p.total_mob_kills * 2)}</span></div>
    <div>Deaths penalty = <span style="color:#ef4444">-${fmtNum(p.deaths)}</span></div>
  `;

  // Mining Tab
  renderMassGrid('allMinedGrid', p.mined_obj || {}, 'blocks');
  renderMassGrid('allDroppedGrid', p.dropped_obj || {}, 'blocks');
  renderMassGrid('allPickedGrid', p.picked_obj || {}, 'blocks');

  // Mobs Tab
  renderMassGrid('allKilledGrid', p.killed_obj || {}, 'mobs');
  renderMassGrid('allKilledByGrid', p.killed_by_obj || {}, 'mobs');

  // Crafting Tab
  renderMassGrid('allCraftedGrid', p.crafted_obj || {}, 'blocks');
  renderMassGrid('allUsedGrid', p.used_obj || {}, 'blocks');
  renderMassGrid('allBrokenGrid', p.broken_obj || {}, 'blocks');

  // Render Charts
  renderTimelineChart(p);
  renderSkillRadar(p);
  renderResourceDoughnut(p);
  renderMobBarChart(p);
  renderSlateCharts(p);

  document.body.style.overflow = 'hidden'; } catch(e) { console.error('ERROR IN OPENPROFILE:', e); }

  // Tabs Reset
  document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
  document.querySelector('.ptab[data-tab="ai"]').classList.add('active');
  $('tab-ai').classList.add('active');

  // AI Insights
  $('aiInsightsGrid').innerHTML = p.insights.map(ins => `
    <div class="ai-card ${ins.type}">
      <div class="ai-icon">${ins.type==='good'?'📈':ins.type==='bad'?'⚠️':'💡'}</div>
      <div class="ai-text">${ins.text}</div>
    </div>
  `).join('');

  // Mass Grids (ALL Data)
  renderMassGrid('allMinedGrid', p.mined_obj, 'blocks');
  renderMassGrid('allDroppedGrid', p.dropped_obj, 'blocks');
  renderMassGrid('allPickedGrid', p.picked_obj, 'blocks');
  renderMassGrid('allCraftedGrid', p.crafted_obj, 'blocks');
  renderMassGrid('allKilledGrid', p.killed_obj, 'mobs');
  renderMassGrid('allKilledByGrid', p.killed_by_obj, 'mobs');
  
  // Combine used and broken
  const usedAndBroken = {...p.used_obj};
  for(let key in p.broken_obj) {
    usedAndBroken[key] = (usedAndBroken[key] || 0) + p.broken_obj[key];
  }
  renderMassGrid('allUsedGrid', usedAndBroken, 'blocks');

  // Timeline Chart
  setTimeout(() => renderTimelineChart(p), 100);

  $('playerProfile').classList.add('open');
  document.body.style.overflow = 'hidden'; } catch(e) { console.error('ERROR IN OPENPROFILE:', e); }
}

function renderMassGrid(id, dataObj, type) {
  const sorted = Object.entries(dataObj).sort((a,b) => b[1]-a[1]);
  if(sorted.length===0) { $(id).innerHTML = '<div style="color:var(--text-muted)">No data collected.</div>'; return; }
  
  const maxVal = sorted[0][1]; // Highest value in the list for progress bar scaling

  $(id).innerHTML = sorted.map(([k, v]) => {
    let rawName = k.replace('minecraft:', '');
    let name = rawName.replace(/_/g, ' ');
    
    let iconHtml = '';
    if (type === 'blocks') {
      iconHtml = `<img src="https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data/1.19.2/items/${rawName}.png" 
                       onerror="this.onerror=null; this.src='https://cdn.jsdelivr.net/gh/PrismarineJS/minecraft-assets@master/data/1.19.2/blocks/${rawName}.png';"
                       class="mc-logo-sm" alt="" />`;
    } else {
      iconHtml = `<span style="font-size:1.2rem">${mobEmoji(rawName)}</span>`;
    }

    const pct = Math.max(0, Math.min(100, (v / maxVal) * 100));

    return `
      <div class="stat-row" title="ID: ${k}\nTotal: ${fmtNum(v)}">
        <div class="stat-row-top">
          <div class="stat-row-name">${iconHtml} <span>${name}</span></div>
          <div class="stat-row-val">${fmtNum(v)}</div>
        </div>
        <div class="stat-bar-bg">
          <div class="stat-bar-fill" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderTimelineChart(p) {
  const ctx = $('timelineChart').getContext('2d');
  if(timelineChartInstance) timelineChartInstance.destroy();

  timelineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: p.history.labels,
      datasets: [
        {
          label: 'Total Kills (Simulated)',
          data: p.history.kills,
          borderColor: '#00e5ff',
          backgroundColor: 'rgba(0, 229, 255, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'K/D Ratio',
          data: p.history.kd,
          borderColor: '#ff007b',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#73859e' } },
        y: { type: 'linear', display: true, position: 'left', grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#00e5ff' } },
        y1: { type: 'linear', display: true, position: 'right', grid: { display: false }, ticks: { color: '#ff007b' } }
      },
      plugins: { legend: { labels: { color: '#fff', font: { family: "'Outfit', sans-serif" } } } }
    }
  });
}

function renderSkillRadar(p) {
  const ctx = $('skillRadarChart').getContext('2d');
  if(skillRadarChartInstance) skillRadarChartInstance.destroy();

  const combatScore = Math.min(100, (p.total_mob_kills / Math.max(1, Math.max(...PLAYERS.map(x=>x.total_mob_kills)))) * 100);
  const miningScore = Math.min(100, (p.blocks_mined / Math.max(1, Math.max(...PLAYERS.map(x=>x.blocks_mined)))) * 100);
  const survivalScore = Math.min(100, (Math.min(...PLAYERS.map(x=>x.deaths)) / Math.max(1, p.deaths)) * 100);
  const movementScore = Math.min(100, ((p.walk_km+p.sprint_km+p.fly_km) / Math.max(1, Math.max(...PLAYERS.map(x=>x.walk_km+x.sprint_km+x.fly_km)))) * 100);
  const craftScore = Math.min(100, (Object.values(p.crafted_obj||{}).reduce((a,b)=>a+b,0) / Math.max(1, Math.max(...PLAYERS.map(x=>Object.values(x.crafted_obj||{}).reduce((a,b)=>a+b,0))))) * 100);

  skillRadarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['⚔️ Combat', '⛏️ Mining', '🛡️ Survival', '🏃 Agility', '🔨 Crafting'],
      datasets: [{
        label: 'Skill Profile',
        data: [combatScore, miningScore, survivalScore, movementScore, craftScore],
        backgroundColor: 'rgba(0, 229, 255, 0.2)',
        borderColor: '#00e5ff',
        pointBackgroundColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          pointLabels: { color: '#fff', font: { family: "'Outfit', sans-serif", size: 12 } },
          ticks: { display: false, min: 0, max: 100 }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function renderRivalRadar(p1, p2) {
  const ctx = $('rivalRadarChart').getContext('2d');
  if(rivalRadarChartInstance) rivalRadarChartInstance.destroy();

  const getScores = (p) => [
    Math.min(100, (p.total_mob_kills / Math.max(1, Math.max(...PLAYERS.map(x=>x.total_mob_kills)))) * 100),
    Math.min(100, (p.blocks_mined / Math.max(1, Math.max(...PLAYERS.map(x=>x.blocks_mined)))) * 100),
    Math.min(100, (Math.min(...PLAYERS.map(x=>x.deaths)) / Math.max(1, p.deaths)) * 100),
    Math.min(100, ((p.walk_km+p.sprint_km+p.fly_km) / Math.max(1, Math.max(...PLAYERS.map(x=>x.walk_km+x.sprint_km+x.fly_km)))) * 100),
    Math.min(100, (Object.values(p.crafted_obj||{}).reduce((a,b)=>a+b,0) / Math.max(1, Math.max(...PLAYERS.map(x=>Object.values(x.crafted_obj||{}).reduce((a,b)=>a+b,0))))) * 100)
  ];

  rivalRadarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['⚔️ Combat', '⛏️ Mining', '🛡️ Survival', '🏃 Agility', '🔨 Crafting'],
      datasets: [
        {
          label: p1.name,
          data: getScores(p1),
          backgroundColor: 'rgba(0, 229, 255, 0.2)',
          borderColor: '#00e5ff',
          pointBackgroundColor: '#fff',
          borderWidth: 2
        },
        {
          label: p2.name,
          data: getScores(p2),
          backgroundColor: 'rgba(255, 0, 123, 0.2)',
          borderColor: '#ff007b',
          pointBackgroundColor: '#fff',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          pointLabels: { color: '#fff', font: { family: "'Outfit', sans-serif", size: 12 } },
          ticks: { display: false, min: 0, max: 100 }
        }
      },
      plugins: { legend: { labels: { color: '#fff', font: { family: "'Outfit', sans-serif" } } } }
    }
  });
}

function renderResourceDoughnut(p) {
  const ctx = $('miningDoughnutChart').getContext('2d');
  if(miningDoughnutChartInstance) miningDoughnutChartInstance.destroy();

  const sorted = Object.entries(p.mined_obj).sort((a,b) => b[1] - a[1]).slice(0, 5);
  const labels = sorted.map(x => x[0].replace('minecraft:', '').replace(/_/g, ' '));
  const data = sorted.map(x => x[1]);
  const colors = ['#00e5ff', '#ffaa00', '#d130ff', '#44ff88', '#ff007b'];

  miningDoughnutChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderColor: 'rgba(0,0,0,0.5)',
        borderWidth: 2,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { color: '#fff', font: { family: "'Outfit', sans-serif" } } }
      }
    }
  });
}

function renderMobBarChart(p) {
  const ctx = $('mobsBarChart').getContext('2d');
  if(mobsBarChartInstance) mobsBarChartInstance.destroy();

  const sorted = Object.entries(p.killed_obj).sort((a,b) => b[1] - a[1]).slice(0, 6);
  const labels = sorted.map(x => x[0].replace('minecraft:', '').replace(/_/g, ' '));
  const data = sorted.map(x => x[1]);

  mobsBarChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Times Killed',
        data: data,
        backgroundColor: 'rgba(255, 0, 123, 0.7)',
        borderColor: '#ff007b',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#00e5ff' } },
        y: { grid: { display: false }, ticks: { color: '#fff', font: { family: "'Outfit', sans-serif" } } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function renderSlateCharts(p) {
  if (chartKdBarInstance) chartKdBarInstance.destroy();
  if (chartDistBarInstance) chartDistBarInstance.destroy();
  if (chartActivityPieInstance) chartActivityPieInstance.destroy();

  const kdCtx = $('chartKdBar').getContext('2d');
  chartKdBarInstance = new Chart(kdCtx, {
    type: 'bar',
    data: {
      labels: ['Mob Kills', 'PvP Kills', 'Deaths'],
      datasets: [{
        data: [p.total_mob_kills, p.player_kills, p.deaths],
        backgroundColor: ['#4ade80', '#fbbf24', '#ef4444'],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
      }
    }
  });

  const distCtx = $('chartDistBar').getContext('2d');
  chartDistBarInstance = new Chart(distCtx, {
    type: 'bar',
    data: {
      labels: ['Walked', 'Sprinted', 'Swum', 'Climbed', 'Flew'],
      datasets: [{
        data: [p.walk_km, p.sprint_km, p.swim_km, p.climb_km, p.fly_km],
        backgroundColor: '#4ade80',
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
        y: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }
      }
    }
  });

  const actCtx = $('chartActivityPie').getContext('2d');
  const activityData = [
    Object.values(p.mined_obj || {}).reduce((a,b)=>a+b,0),
    Object.values(p.used_obj || {}).reduce((a,b)=>a+b,0),
    Object.values(p.crafted_obj || {}).reduce((a,b)=>a+b,0),
    p.total_mob_kills,
    Object.values(p.picked_obj || {}).reduce((a,b)=>a+b,0),
    Object.values(p.dropped_obj || {}).reduce((a,b)=>a+b,0)
  ];
  
  chartActivityPieInstance = new Chart(actCtx, {
    type: 'pie',
    data: {
      labels: ['Mined', 'Used', 'Crafted', 'Kills', 'Picked Up', 'Dropped'],
      datasets: [{
        data: activityData,
        backgroundColor: ['#f59e0b', '#22c55e', '#3b82f6', '#ef4444', '#8b5cf6', '#64748b'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 10, font: { size: 10 } } } }
    }
  });
}

// Tab Switching inside Profile
document.querySelectorAll('.ptab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    $('tab-'+btn.dataset.tab).classList.add('active');
  });
});

$('closeProfile').addEventListener('click', () => {
  $('playerProfile').classList.remove('open');
  document.body.style.overflow = '';
});

// ── EXPORT FLEX CARD ───────────────────────────────────────────────────
$('btnDownload').addEventListener('click', () => {
  const btn = $('btnDownload');
  const originalText = btn.textContent;
  btn.textContent = '⏳ Rendering God-Tier Card...';
  
  html2canvas($('exportCard'), { backgroundColor: '#03050a', scale: 2 }).then(canvas => {
    const link = document.createElement('a');
    link.download = `Better_Ansh_V3_FlexCard.png`;
    link.href = canvas.toDataURL();
    link.click();
    btn.textContent = '✅ Exported!';
    setTimeout(() => btn.textContent = originalText, 2000);
  });
});

// ── AI CHATBOT SYSTEM ──────────────────────────────────────────────────
const chatWidget = $('chatWidget');
$('chatFab').addEventListener('click', () => chatWidget.classList.add('open'));
$('chatClose').addEventListener('click', () => chatWidget.classList.remove('open'));

function appendMessage(sender, text) {
  const div = document.createElement('div');
  div.className = `chat-msg ${sender}`;
  div.innerHTML = `<div class="chat-bubble">${text}</div>`;
  $('chatBody').appendChild(div);
  $('chatBody').scrollTop = $('chatBody').scrollHeight;
}

function getAiResponse(msg) {
  const query = msg.toLowerCase();
  
  // Find player mentioned
  let target = null;
  for(let p of PLAYERS) {
    if(query.includes(p.name.toLowerCase())) {
      target = p; break;
    }
  }

  // Answer patterns
  if (query.includes('who is the best') || query.includes('who is rank 1')) {
    const best = [...PLAYERS].sort((a,b) => b.bas_score - a.bas_score)[0];
    return `Currently, **${best.name}** is Rank 1 with an Ultimate Score of ${fmtNum(best.bas_score)}! They are an absolute ${best.rank.title}.`;
  }
  
  if (query.includes('most kills') || query.includes('highest kills')) {
    const best = [...PLAYERS].sort((a,b) => b.total_mob_kills - a.total_mob_kills)[0];
    return `**${best.name}** has the most blood on their hands with **${fmtNum(best.total_mob_kills)}** total mob kills!`;
  }
  
  if (query.includes('most deaths') || query.includes('worst player') || query.includes('noob')) {
    const worst = [...PLAYERS].sort((a,b) => b.deaths - a.deaths)[0];
    return `Well, **${worst.name}** has died **${worst.deaths}** times... definitely the server's favorite punching bag! 💀`;
  }

  if (target) {
    if (query.includes('weakness')) {
      const insight = target.insights.find(i => i.type === 'bad');
      if (insight) return `A glaring weakness for **${target.name}**: ${insight.text}`;
      if (target.deaths > 100) return `**${target.name}** dies way too often (${target.deaths} deaths). They need to play safer!`;
      return `Honestly, **${target.name}** is playing solidly. Hard to find a major weakness right now!`;
    }
    if (query.includes('good') || query.includes('strength') || query.includes('best thing')) {
      const insight = target.insights.find(i => i.type === 'good');
      if (insight) return `**${target.name}**'s biggest strength: ${insight.text}`;
      return `**${target.name}** has a great playstyle (${target.playstyle}). Very consistent!`;
    }
    if (query.includes('stats')) {
      return `**${target.name}** Stats:\n- Rank: ${target.rank.title}\n- Kills: ${target.total_mob_kills}\n- Deaths: ${target.deaths}\n- K/D: ${target.kd}\n- Score: ${fmtNum(target.bas_score)}`;
    }
  }

  return "I have analyzed the server data! You can ask me things like 'Who is the best?', 'What is [Player]'s weakness?', or 'Who has the most kills?'.";
}

$('chatSend').addEventListener('click', async () => {
  const val = $('chatInput').value.trim();
  if(!val) return;
  appendMessage('user', val);
  $('chatInput').value = '';
  
  // Show typing indicator
  const typingId = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = `chat-msg bot`;
  div.id = typingId;
  div.innerHTML = `<div class="chat-bubble" style="opacity:0.7"><em>Analyzing server data...</em></div>`;
  $('chatBody').appendChild(div);
  $('chatBody').scrollTop = $('chatBody').scrollHeight;

  try {
    // We send a tiny subset of PLAYERS stats to save token size
    const miniStats = PLAYERS.map(p => ({ name: p.name, bas: p.bas_score, rank: p.rank.title, kills: p.total_mob_kills, deaths: p.deaths, kd: p.kd }));
    
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: val, statsContext: JSON.stringify(miniStats) })
    });
    
    $(typingId).remove();

    if (!res.ok) throw new Error("API failed");
    
    const data = await res.json();
    appendMessage('bot', data.reply.replace(/\n/g, '<br>'));
    
  } catch (err) {
    $(typingId).remove();
    console.log("Falling back to local basic AI because Vercel backend isn't active or failed:", err);
    // Fallback if running locally without backend
    const reply = getAiResponse(val);
    appendMessage('bot', reply.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'));
  }
});
$('chatInput').addEventListener('keypress', e => { if(e.key === 'Enter') $('chatSend').click(); });

// ── INIT ────────────────────────────────────────────────────────────────
initServerAI();
renderPlayersGrid();
renderDashboard();
initBattleSystem();

