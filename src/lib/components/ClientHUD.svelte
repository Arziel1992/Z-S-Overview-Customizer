<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';

  let mockTargets = [
    { name: "Sela Siona", type: "Rifter", typeId: 587, distance: "14,250 m", velocity: "340 m/s", radVel: "-120 m/s", transVel: "318 m/s", standing: "fleetMember", angle: 120, x: 25, y: 35 },
    { name: "Vandis Alar", type: "Rapier", typeId: 11963, distance: "28,910 m", velocity: "120 m/s", radVel: "10 m/s", transVel: "119 m/s", standing: "warTarget", angle: 240, x: 70, y: 65 },
    { name: "Guristas Scout", type: "Infiltrator", typeId: 0, distance: "45,210 m", velocity: "450 m/s", radVel: "-450 m/s", transVel: "0 m/s", standing: "neutral", angle: 45, x: 45, y: 20 },
    { name: "CEO Kira", type: "Rupture", typeId: 620, distance: "5,420 m", velocity: "280 m/s", radVel: "-180 m/s", transVel: "214 m/s", standing: "corpMember", angle: 310, x: 55, y: 45 }
  ];

  function getStandingColors(standingKey) {
    const bg = customiser.globalSettings.backgroundStates[standingKey];
    const flag = customiser.globalSettings.flagStates[standingKey];
    return {
      bg: bg?.active ? bg.color : 'transparent',
      blink: bg?.active && bg?.blink,
      flag: flag?.active ? flag.color : 'transparent'
    };
  }

  function formatLabels(target) {
    const s = customiser.globalSettings;
    return s.shipLabelOrder.map(labelKey => {
      const spec = s.shipLabels[labelKey];
      if (!spec || !spec.active) return '';
      
      let val = '';
      if (labelKey === 'type') val = target.type;
      if (labelKey === 'name') val = target.name;
      if (labelKey === 'corp') val = "CIDLA";
      if (labelKey === 'alliance') val = "Z-S";

      if (!val) return '';
      let formatted = `${spec.prefix}${val}${spec.suffix}`;
      return `<span class="${spec.bold ? 'font-bold' : ''} ${spec.italic ? 'italic' : ''}">${formatted}</span>`;
    }).filter(Boolean).join(' ');
  }

  function formatTabMarkup(rawName) {
    let text = rawName;
    const colorRegex = /<color=(0x[0-9a-fA-F]+)>(.*?)<\/color>/g;
    text = text.replace(colorRegex, (match, hex, content) => {
      const cleanHex = hex.replace("0x", "");
      const rgbHex = cleanHex.length === 8 ? cleanHex.substring(2) : cleanHex;
      return `<span style="color: #${rgbHex}">${content}</span>`;
    });
    return text;
  }

  // 1:1 Responsive Flex-grid width mappings
  const colWidths = {
    icon: 'w-[4%]',
    distance: 'w-[16%]',
    name: 'w-[24%]',
    type: 'w-[20%]',
    velocity: 'w-[12%]',
    radialVelocity: 'w-[12%]',
    transversalVelocity: 'w-[12%]'
  };
</script>

<div class="grid grid-cols-1 xl:grid-cols-5 gap-4">
  <!-- Interactive Space View Grid -->
  <div class="xl:col-span-3 bg-[#0a0d16]/95 border border-[#2b354c] shadow-lg shadow-black/80 rounded h-[380px] relative overflow-hidden flex flex-col">
    <div class="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#2b354c_1px,transparent_1px)] [background-size:16px_16px]"></div>
    
    <!-- Crosshairs -->
    <div class="absolute left-1/2 top-0 bottom-0 border-l border-[#1f2635]/30 pointer-events-none"></div>
    <div class="absolute top-1/2 left-0 right-0 border-t border-[#1f2635]/30 pointer-events-none"></div>
    
    <!-- Photon Style Chrome Header -->
    <div class="p-3 border-b border-[#2b354c] flex justify-between items-center z-10 bg-[#121622]/90 backdrop-blur-md">
      <div class="flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow shadow-cyan-400/50 animate-pulse"></span>
        <span class="text-xs font-bold text-gray-200 uppercase tracking-widest font-sans">Tactical Space Preview</span>
      </div>
      <span class="text-[9px] text-eve-textMuted bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded font-bold uppercase">Orbit Camera</span>
    </div>

    <!-- 3D coordinate space field -->
    <div class="flex-1 relative">
      {#if customiser.globalSettings.showBracketsInSpace}
        {#each mockTargets as tgt}
          {@const colors = getStandingColors(tgt.standing)}
          
          <div 
            class="absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all cursor-pointer"
            style="left: {tgt.x}%; top: {tgt.y}%;"
          >
            <!-- Space bracket icon -->
            <div class="relative w-5 h-5 flex items-center justify-center">
              <svg class="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="6" y="6" width="12" height="12" stroke={colors.flag} stroke-width="2" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke={colors.flag} stroke-width="1.5"/>
              </svg>
              <span class="absolute -right-1 -top-1 w-1.5 h-1.5 rounded-full" style="background-color: {colors.flag}"></span>
            </div>

            <!-- Bracket Label Overlay -->
            <div class="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/90 px-2 py-0.5 rounded border border-[#2b354c] text-[9px] pointer-events-none text-gray-300 opacity-80 group-hover:opacity-100 transition shadow">
              {@html formatLabels(tgt)}
              <span class="text-eve-textMuted block text-[8px]">{tgt.distance}</span>
            </div>
          </div>
        {/each}
      {/if}

      <!-- Center HUD -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
        <div class="w-4 h-4 rounded-full border border-cyan-400 animate-ping opacity-30"></div>
        <div class="absolute w-2 h-2 bg-cyan-400 rounded-full"></div>
      </div>
    </div>
  </div>

  <!-- EVE Spreadsheet Panel -->
  <div class="xl:col-span-2 bg-[#0d0f16]/95 border border-[#2b354c] shadow-lg shadow-black/80 rounded h-[380px] flex flex-col overflow-hidden font-mono text-[11px] backdrop-blur-md">
    <!-- Active Svelte 5 Custom Tabs Selector -->
    <div class="bg-[#0b0c10] border-b border-[#2b354c] flex items-center px-1 overflow-x-auto whitespace-nowrap scrollbar-none">
      {#each customiser.tabs as tab}
        <button 
          onclick={() => customiser.activeTabId = tab.id}
          class="px-4 py-2 text-xs font-semibold border-b-2 transition-all duration-150 {customiser.activeTabId === tab.id ? 'border-eve-accent text-white bg-[#0e111a]' : 'border-transparent text-eve-textMuted hover:text-gray-200'}"
        >
          {@html formatTabMarkup(tab.name)}
        </button>
      {/each}
    </div>

    <!-- Responsive Column Headers -->
    <div class="bg-[#111420] text-eve-textMuted px-3 py-2 flex items-center border-b border-[#2b354c] select-none uppercase font-bold text-[9px] tracking-wider shrink-0">
      {#each customiser.globalSettings.columnOrder as colKey}
        {#if customiser.globalSettings.overviewColumns.includes(colKey)}
          <div class="{colWidths[colKey]} px-1 truncate">{colKey}</div>
        {/if}
      {/each}
    </div>

    <!-- Spreadsheet Data Rows -->
    <div class="flex-1 overflow-y-auto divide-y divide-[#1b2230]/40">
      {#each mockTargets as tgt}
        {@const colors = getStandingColors(tgt.standing)}
        
        <div 
          class="flex items-center px-3 py-1.5 hover:bg-white/5 transition-all relative {colors.blink ? 'animate-pulse' : ''}"
          style="background-color: {colors.bg}18"
        >
          <!-- Standings Indicator flag tag (Left accent bar) -->
          <div class="absolute left-0 top-0 bottom-0 w-1" style="background-color: {colors.flag}"></div>

          {#each customiser.globalSettings.columnOrder as colKey}
            {#if customiser.globalSettings.overviewColumns.includes(colKey)}
              <div class="{colWidths[colKey]} px-1 truncate">
                {#if colKey === 'icon'}
                  <span class="text-xs select-none" style="color: {colors.flag}">▲</span>
                {:else if colKey === 'distance'}
                  <span class="text-white font-medium">{tgt.distance}</span>
                {:else if colKey === 'name'}
                  <span class="text-gray-300 font-sans font-semibold">{tgt.name}</span>
                {:else if colKey === 'type'}
                  <span class="text-eve-textMuted font-sans font-medium">{tgt.type}</span>
                {:else if colKey === 'velocity'}
                  <span class="text-gray-400">{tgt.velocity}</span>
                {:else if colKey === 'radialVelocity'}
                  <span class="text-gray-400">{tgt.radVel}</span>
                {:else if colKey === 'transversalVelocity'}
                  <span class="text-gray-400">{tgt.transVel}</span>
                {/if}
              </div>
            {/if}
          {/each}
        </div>
      {:else}
        <div class="flex items-center justify-center h-full text-eve-textMuted text-xs font-sans">No matching targets on grid</div>
      {/each}
    </div>
  </div>
</div>