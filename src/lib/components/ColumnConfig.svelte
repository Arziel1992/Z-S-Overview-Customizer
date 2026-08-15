<!--
  @component
  Profile-wide telemetry column editor: the checkbox toggles a column in/out of
  overviewColumns, DragList ordering rewrites columnOrder. Individual tabs can
  override both from the Tab Setup section — see ColumnPicker/TabManager.
-->
<script>
import { t } from "$lib/i18n/strings.svelte.js";
import { customiser } from "$lib/stores/customiserStore.svelte";
import ColumnPicker from "./ColumnPicker.svelte";

const tabsWithOwn = $derived(
	customiser.tabs.filter((tb) => customiser.tabHasOwnColumns(tb)).length,
);
</script>

<div class="space-y-3">
  <div>
    <h3 class="text-sm font-semibold text-app-text">{t('columns.heading')}</h3>
    <p class="text-[11px] text-app-muted mt-0.5">{t('columns.help')}</p>
    {#if tabsWithOwn}
      <p class="text-[11px] text-amber-500 mt-1">{t('columns.tabOverrides', { n: tabsWithOwn })}</p>
    {/if}
  </div>

  <ColumnPicker
    order={customiser.columnOrder}
    active={customiser.overviewColumns}
    onorder={(v) => (customiser.columnOrder = v)}
    ontoggle={(col) => customiser.toggleColumn(col)}
  />
</div>
