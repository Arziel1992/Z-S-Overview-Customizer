<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import { buildShipLabelHtml } from '$lib/utils/labels';

  const bracketPreset = $derived(
    customiser.activeTab?.bracket ? customiser.presetByName(customiser.activeTab.bracket) : null
  );

  // Place visible entities on a radial grid; radius scales with (log) distance.
  const marks = $derived.by(() => {
    if (!bracketPreset) return [];
    const visible = customiser.roster
      .map((e) => ({ entity: e, res: customiser.resolveEntity(e, bracketPreset) }))
      .filter((r) => r.res.visible);
    const maxLog = Math.log10(Math.max(1000, ...visible.map((v) => v.entity.distance || 1000)));
    return visible.map((v, i) => {
      const angle = (v.entity.id * 67 + i * 23) % 360;
      const rad = (angle * Math.PI) / 180;
      const dLog = Math.log10(Math.max(100, v.entity.distance || 100));
      const r = 12 + (dLog / maxLog) * 34; // % from centre
      return {
        ...v,
        x: 50 + Math.cos(rad) * r,
        y: 50 + Math.sin(rad) * r * 0.82,
      };
    });
  });
</script>

<div class="bg-[#020406] border border-eve-border rounded relative overflow-hidden h-full">
  <!-- grid + crosshair -->
  <div class="absolute inset-0 opacity-[0.12] pointer-events-none bg-[radial-gradient(#274056_1px,transparent_1px)] [background-size:18px_18px]"></div>
  <div class="absolute left-1/2 top-0 bottom-0 border-l border-eve-border/30 pointer-events-none"></div>
  <div class="absolute top-1/2 left-0 right-0 border-t border-eve-border/30 pointer-events-none"></div>

  <div class="absolute top-2 left-3 text-[10px] uppercase tracking-wider text-eve-muted z-10">Tactical Brackets</div>

  {#if !customiser.activeTab?.bracket}
    <div class="absolute inset-0 flex items-center justify-center text-eve-muted text-[10px]">Brackets disabled for this tab.</div>
  {/if}

  <!-- centre marker -->
  <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
    <div class="w-3 h-3 rounded-full border border-eve-accent animate-pulse"></div>
  </div>

  {#each marks as { entity, res, x, y } (entity.id)}
    <div class="absolute -translate-x-1/2 -translate-y-1/2 group" style="left:{x}%; top:{y}%;">
      <div class="relative w-4 h-4 flex items-center justify-center {res.flagBlink ? 'eve-blink' : ''}">
        <svg viewBox="0 0 24 24" class="w-full h-full" fill="none" stroke={res.flagColor ?? '#9fb2c8'} stroke-width="2">
          <path d="M5 9V5h4M19 9V5h-4M5 15v4h4M19 15v4h-4" />
        </svg>
      </div>
      <div
        class="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] leading-tight font-mono pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
        style="color:#cdd9e8"
      >
        {@html buildShipLabelHtml(entity, customiser.shipLabelOrder, customiser.shipLabels)}
      </div>
    </div>
  {/each}
</div>
