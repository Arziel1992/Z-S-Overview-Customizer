<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';

  // Mock grid targets containing standing characteristics
  let mockTargets = [
    { name: "Sela Siona", type: "Rifter", typeId: 587, distance: "14,250 m", velocity: "340 m/s", radVel: "-120 m/s", transVel: "318 m/s", standing: "fleetMember", angle: 120, x: 25, y: 35 },
    { name: "Vandis Alar", type: "Rapier", typeId: 11963, distance: "28,910 m", velocity: "120 m/s", radVel: "10 m/s", transVel: "119 m/s", standing: "warTarget", angle: 240, x: 70, y: 65 },
    { name: "Guristas Scout", type: "Infiltrator", typeId: 0, distance: "45,210 m", velocity: "450 m/s", radVel: "-450 m/s", transVel: "0 m/s", standing: "neutral", angle: 45, x: 45, y: 20 },
    { name: "CEO Kira", type: "Rupture", typeId: 620, distance: "5,420 m", velocity: "280 m/s", radVel: "-180 m/s", transVel: "214 m/s", standing: "corpMember", angle: 310, x: 55, y: 45 }
  ];

  // Helper matching state orders with layout priority colors
  function getStandingColors(standingKey) {
    const bg = customiser.globalSettings.backgroundStates[standingKey];
    const flag = customiser.globalSettings.flagStates[standingKey];
    return {
      bg: bg?.active ? bg.color : 'transparent',
      blink: bg?.active && bg?.blink,
      flag: flag?.active ? flag.color : 'transparent'
    };
  }

  // Construct label based on customized EVE template options
  function formatLabels(target) {
    const s = customiser.globalSettings;
    // FIXED: Added fail-safe validation checks. Prevents map crashes if settings arrays are temporarily empty during compile transitions.
    if (!s || !s.shipLabelOrder || !Array.isArray(s.shipLabelOrder)) return '';
    
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
      
      let classes = [];
      if (spec.bold) classes.push('font-bold');
      if (spec.italic) classes.push('italic');
      
      return `<span class="${classes.join(' ')}">${formatted}</span>`;
    }).filter(Boolean).join(' ');
  }

  // Parse HTML formatting inside tab names dynamically
  function formatTabMarkup(rawName) {
    let text = rawName;
    const colorRegex = /<color=(0x[0-9a-fA-F]+)>(.*?)<\/color>/g;
    text = text.replace(colorRegex, (match, hex, content) => {
      // Extract alpha value
      const cleanHex = hex.replace("0x", "");
      const rgbHex = cleanHex.length === 8 ? cleanHex.substring(2) : cleanHex;
      return `<span style="color: #${rgbHex}">${content}</span>`;
    });
    return text;
  }
</script>

<div class="grid grid-cols-1 xl:grid-cols-5 gap-4">
  <!-- Interactive Space View Grid -->
  <div class="xl:col-span-3 bg-[#020406] border border-eve-border rounded h-[380px] relative overflow-hidden flex flex-col">
    <div class="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"></div>
    
    <!-- Coordinate crosshair indicator -->
    <div class="absolute left-1/2 top-0 bottom-0 border-l border-eve-border/30 pointer-events-none"></div>
    <div class="absolute top-1/2 left-0 right-0 border-t border-eve-border/30 pointer-events-none"></div>
    
    <div class="p-3 border-b border-eve-border/50 flex justify-between items-center z-10 bg-eve-panel/80 backdrop-blur-sm">
      <span class="text-xs font-semibold text-eve-textMuted uppercase tracking-wider">Tactical 3D Projection</span>
      <span class="text-[10px] text-eve-textMuted bg-eve-border px-2 py-0.5 rounded">Active Camera: Orbit</span>
    </div>

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
                <!-- Redesign shapes on selection priority -->
                <rect x="6" y="6" width="12" height="12" stroke={colors.flag} stroke-width="2" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke={colors.flag} stroke-width="1.5"/>
              </svg>

              <!-- Color flag tag -->
              <span 
                class="absolute -right-1 -top-1 w-1.5 h-1.5 rounded-full"
                style="background-color: {colors.flag}"
              ></span>
            </div>

            <!-- Customized bracket label -->
            <div class="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded border border-eve-border text-[9px] pointer-events-none text-gray-300 opacity-80 group-hover:opacity-100 transition">
              <!-- Render html formatted labels dynamic state -->
              {@html formatLabels(tgt)}
              <span class="text-eve-textMuted block text-[8px]">{tgt.distance}</span>
            </div>
          </div>
        {/each}
      {/if}

      <!-- Center coordinate system overlay -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
        <div class="w-3 h-3 rounded-full border border-eve-accent animate-pulse"></div>
        <span class="text-[8px] text-eve-accent/80 font-mono mt-1">N.E.S.</span>
      </div>
    </div>
  </div>

  <!-- Real-time Overview Grid Panel -->
  <div class="xl:col-span-2 bg-eve-panel border border-eve-border rounded h-[380px] flex flex-col overflow-hidden font-mono text-[11px]">
    <!-- Tab Index Header -->
    <div class="bg-[#0b0e14] border-b border-eve-border flex items-center px-1 overflow-x-auto whitespace-nowrap">
      {#each customiser.tabs as tab}
        <button 
          onclick={() => customiser.activeTabId = tab.id}
          class="px-3 py-2 text-xs font-semibold border-b-2 transition-all {customiser.activeTabId === tab.id ? 'border-eve-accent text-white bg-eve-panel' : 'border-transparent text-eve-textMuted hover:text-gray-200'}"
        >
          {@html formatTabMarkup(tab.name)}
        </button>
      {/each}
    </div>

    <!-- Overview Columns Header -->
    <div class="bg-[#131924] text-eve-textMuted px-2 py-1 flex border-b border-eve-border select-none uppercase font-semibold text-[10px]">
      <!-- Re-arrange header elements dynamically -->
      {#each customiser.globalSettings.columnOrder as colKey}
        {#if customiser.globalSettings.overviewColumns.includes(colKey)}
          <div class="flex-1 px-1 truncate capitalize">{colKey}</div>
        {/if}
      {/each}
    </div>

    <!-- Active List rows -->
    <div class="flex-1 overflow-y-auto divide-y divide-eve-border/40">
      {#each mockTargets as tgt}
        {@const colors = getStandingColors(tgt.standing)}
        
        <div 
          class="flex items-center px-2 py-1.5 hover:bg-white/5 transition-all relative {colors.blink ? 'animate-pulse' : ''}"
          style="background-color: {colors.bg}22"
        >
          <!-- Left priority flag tag indicator -->
          <div 
            class="absolute left-0 top-0 bottom-0 w-1"
            style="background-color: {colors.flag}"
          ></div>

          <!-- Structured dynamic alignment columns -->
          {#each customiser.globalSettings.columnOrder as colKey}
            {#if customiser.globalSettings.overviewColumns.includes(colKey)}
              <div class="flex-1 px-1 truncate">
                {#if colKey === 'icon'}
                  <span class="text-xs" style="color: {colors.flag}">▲</span>
                {:else if colKey === 'distance'}
                  <span class="text-white">{tgt.distance}</span>
                {:else if colKey === 'name'}
                  <span class="text-gray-300 font-semibold">{tgt.name}</span>
                {:else if colKey === 'type'}
                  <span class="text-eve-textMuted">{tgt.type}</span>
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
      {/each}
    </div>
  </div>
</div>