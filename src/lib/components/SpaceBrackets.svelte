<!--
  @component
  Tactical 3D-space preview: roster entities that pass the active tab's
  *bracket* preset render as bracket icons over an animated starfield, with
  their fully styled shipLabels text. Placement is deterministic per entity
  (pseudo-angle from id) with radius ~ log(distance), clamped so labels stay
  inside the viewport.
-->
<script>
  import { t } from '$lib/i18n/strings.svelte.js';
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import { buildShipLabelHtml } from '$lib/utils/labels';

  const bracketPreset = $derived(
    customiser.activeTab?.bracket ? customiser.presetByName(customiser.activeTab.bracket) : null
  );

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // Place visible entities on a radial grid; radius scales with (log) distance.
  // Positions are clamped (biased left) so brackets + their right-side labels
  // stay inside the viewport.
  const marks = $derived.by(() => {
    if (!bracketPreset) return [];
    const visible = customiser.roster
      .map((e) => ({ entity: e, res: customiser.resolveEntity(e, bracketPreset) }))
      .filter((r) => r.res.visible);
    const maxLog = Math.log10(Math.max(1000, ...visible.map((v) => v.entity.distance || 1000)));
    return visible.map((v, i) => {
      const angle = (v.entity.id * 67 + i * 29) % 360;
      const rad = (angle * Math.PI) / 180;
      const dLog = Math.log10(Math.max(100, v.entity.distance || 100));
      const r = 10 + (dLog / maxLog) * 26; // % from centre
      return {
        ...v,
        x: clamp(46 + Math.cos(rad) * r * 0.85, 9, 52),
        y: clamp(50 + Math.sin(rad) * r, 16, 84),
      };
    });
  });
</script>

<div class="relative overflow-hidden h-full rounded-lg border border-eve-border bg-gradient-to-br from-[#0a0f1a] via-[#0b1220] to-[#070a12]">
  <!-- Starfield: layered twinkling dots -->
  <div class="starfield star-a"></div>
  <div class="starfield star-b"></div>
  <div class="starfield star-c"></div>
  <!-- faint nebula glow -->
  <div class="absolute -inset-10 opacity-40 pointer-events-none" style="background: radial-gradient(40% 50% at 65% 35%, rgba(56,90,150,0.18), transparent 70%), radial-gradient(35% 45% at 25% 75%, rgba(120,60,140,0.14), transparent 70%);"></div>

  <!-- grid + crosshair -->
  <div class="absolute left-1/2 top-0 bottom-0 border-l border-eve-border/25 pointer-events-none"></div>
  <div class="absolute top-1/2 left-0 right-0 border-t border-eve-border/25 pointer-events-none"></div>

  <div class="absolute top-2 left-3 text-[10px] uppercase tracking-wider text-eve-muted z-10">{t('preview.spaceView')}</div>

  {#if !customiser.activeTab?.bracket}
    <div class="absolute inset-0 flex items-center justify-center text-eve-muted text-[10px]">{t('preview.bracketsDisabled')}</div>
  {/if}

  <!-- centre marker -->
  <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
    <div class="w-3 h-3 rounded-full border border-eve-accent animate-pulse"></div>
  </div>

  {#each marks as { entity, res, x, y } (entity.id)}
    <div class="absolute -translate-y-1/2 z-[5]" style="left:{x}%; top:{y}%;">
      <div class="flex items-center gap-1">
        <div class="relative w-4 h-4 shrink-0 {res.flagBlink ? 'eve-blink' : ''}">
          <svg viewBox="0 0 24 24" class="w-full h-full" fill="none" stroke={res.flagColor ?? '#9fb2c8'} stroke-width="2">
            <path d="M5 9V5h4M19 9V5h-4M5 15v4h4M19 15v4h-4" />
          </svg>
        </div>
        <div class="whitespace-nowrap text-[10px] leading-tight font-mono pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]" style="color:#cdd9e8">
          {@html buildShipLabelHtml(entity, customiser.shipLabelOrder, customiser.shipLabels)}
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .starfield {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-repeat: repeat;
  }
  .star-a {
    background-image:
      radial-gradient(1px 1px at 20px 30px, #fff, transparent),
      radial-gradient(1px 1px at 80px 120px, #cfe0ff, transparent),
      radial-gradient(1.5px 1.5px at 150px 60px, #fff, transparent),
      radial-gradient(1px 1px at 200px 180px, #bcd, transparent);
    background-size: 240px 240px;
    opacity: 0.7;
    animation: twinkle 4.5s ease-in-out infinite;
  }
  .star-b {
    background-image:
      radial-gradient(1px 1px at 60px 50px, #fff, transparent),
      radial-gradient(1px 1px at 120px 160px, #e6eeff, transparent),
      radial-gradient(1px 1px at 190px 90px, #fff, transparent);
    background-size: 200px 200px;
    opacity: 0.5;
    animation: twinkle 6.5s ease-in-out infinite 1s;
  }
  .star-c {
    background-image:
      radial-gradient(0.5px 0.5px at 40px 80px, #aab, transparent),
      radial-gradient(0.5px 0.5px at 140px 40px, #99a, transparent),
      radial-gradient(0.5px 0.5px at 100px 150px, #bbc, transparent);
    background-size: 160px 160px;
    opacity: 0.45;
    animation: twinkle 9s ease-in-out infinite 0.5s;
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.55; }
    50% { opacity: 0.25; }
  }
  @media (prefers-reduced-motion: reduce) {
    .starfield { animation: none; }
  }
</style>
