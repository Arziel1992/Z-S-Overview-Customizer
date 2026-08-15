<!--
  @component
  Privacy notice + full privacy/licence panel in one. A first-visit bottom
  banner summarises the (entirely local, consent-exempt) storage; "Details"
  opens the panel, "Got it" stores the dismissal (with date) under
  PRIVACY_KEY. The panel itself is the app's complete privacy documentation:
  storage inventory table, network posture, self-service erasure (deletes
  every zs-overview-* localStorage key and the IndexedDB snapshot store),
  and third-party licence attribution (MIT deps, OFL fonts, CCP notice).

  Props: open (bindable) — panel visibility, so the header button in
  App.svelte can reopen it any time after the banner is gone.
-->
<script>
import { getLocale, t } from "$lib/i18n/strings.svelte.js";
import Modal from "./Modal.svelte";

let { open = $bindable(false) } = $props();

const PRIVACY_KEY = "zs-overview-privacy";
const REPO = "https://github.com/Arziel1992/Z-S-Overview-Customizer/";
const GITHUB_PRIVACY =
	"https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement";

function readAck() {
	try {
		return JSON.parse(localStorage.getItem(PRIVACY_KEY))?.date ?? null;
	} catch {
		return null;
	}
}

let ackDate = $state(readAck());

function acknowledge() {
	ackDate = new Date().toISOString();
	localStorage.setItem(
		PRIVACY_KEY,
		JSON.stringify({ ack: true, date: ackDate }),
	);
}

// Everything the app ever stores client-side, kept in one visible place.
// Adding a storage key elsewhere means adding a row here.
const STORAGE_ITEMS = [
	["zs-overview-theme", "localStorage", "privacy.stTheme"],
	["zs-overview-locale", "localStorage", "privacy.stLocale"],
	["zs-overview-scale", "localStorage", "privacy.stScale"],
	["zs-overview-layout", "localStorage", "privacy.stLayout"],
	["zs-overview-session", "localStorage", "privacy.stSession"],
	["zs-overview-base", "localStorage", "privacy.stBase"],
	["zs-overview-rostersets-v3", "localStorage", "privacy.stSets"],
	["zs-overview-privacy", "localStorage", "privacy.stAck"],
	["zs-overview → snapshots", "IndexedDB", "privacy.stHistory"],
];

/** Right to erasure, self-service: wipe every key we own, then reload. */
function clearAllData() {
	if (!confirm(t("privacy.clearDataConfirm"))) return;
	for (const key of Object.keys(localStorage)) {
		if (key.startsWith("zs-overview")) localStorage.removeItem(key);
	}
	const req = indexedDB.deleteDatabase("zs-overview");
	req.onsuccess = req.onerror = req.onblocked = () => location.reload();
}

const fmtAckDate = $derived(
	ackDate ? new Date(ackDate).toLocaleDateString(getLocale()) : null,
);
</script>

{#if !ackDate}
  <!-- First-visit notice. z-40 keeps it under the Modal chrome (z-50). -->
  <div
    class="fixed bottom-0 inset-x-0 z-40 bg-app-panel border-t border-app-border shadow-2xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3"
    role="region"
    aria-label={t("privacy.title")}
  >
    <p class="text-xs text-app-text flex-1">{t("privacy.banner")}</p>
    <div class="flex items-center gap-2 shrink-0">
      <button
        onclick={() => (open = true)}
        class="text-xs border border-app-border hover:border-app-accent rounded px-3 py-1.5 transition-colors"
      >{t("privacy.details")}</button>
      <button
        onclick={acknowledge}
        class="text-xs bg-app-accent hover:bg-app-accentHover text-white font-semibold rounded px-3 py-1.5 transition-colors"
      >{t("privacy.gotIt")}</button>
    </div>
  </div>
{/if}

{#if open}
  <Modal title={t("privacy.title")} onclose={() => (open = false)} maxWidth="max-w-2xl">
    <div class="text-xs text-app-text space-y-4">
      <p>{t("privacy.intro")}</p>
      <p class="text-app-muted">{t("privacy.noConsent")}</p>

      <section>
        <h3 class="text-[10px] uppercase tracking-wider font-bold text-app-muted mb-1.5">
          {t("privacy.storageHeading")}
        </h3>
        <p class="text-app-muted mb-2">{t("privacy.storageNote")}</p>
        <div class="overflow-x-auto border border-app-border rounded">
          <table class="w-full text-[11px]">
            <thead>
              <tr class="bg-app-panel2 text-left text-app-muted uppercase text-[9px] tracking-wider">
                <th class="px-2 py-1.5 font-bold">{t("privacy.colKey")}</th>
                <th class="px-2 py-1.5 font-bold">{t("privacy.colType")}</th>
                <th class="px-2 py-1.5 font-bold">{t("privacy.colPurpose")}</th>
              </tr>
            </thead>
            <tbody>
              {#each STORAGE_ITEMS as [key, type, purposeKey] (key)}
                <tr class="border-t border-app-border/60 align-top">
                  <td class="px-2 py-1.5 font-mono whitespace-nowrap">{key}</td>
                  <td class="px-2 py-1.5 text-app-muted whitespace-nowrap">{type}</td>
                  <td class="px-2 py-1.5">{t(purposeKey)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 class="text-[10px] uppercase tracking-wider font-bold text-app-muted mb-1.5">
          {t("privacy.networkHeading")}
        </h3>
        <p class="mb-1.5">{t("privacy.network1")}</p>
        <p class="text-app-muted">
          {t("privacy.network2")}
          <a
            href={GITHUB_PRIVACY}
            target="_blank"
            rel="noopener noreferrer"
            class="text-app-accent hover:underline"
          >{t("privacy.githubPrivacy")}</a>
        </p>
      </section>

      <section>
        <h3 class="text-[10px] uppercase tracking-wider font-bold text-app-muted mb-1.5">
          {t("privacy.rightsHeading")}
        </h3>
        <p class="mb-2">{t("privacy.rights1")}</p>
        <button
          onclick={clearAllData}
          class="text-xs border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded px-3 py-1.5 transition-colors"
        >{t("privacy.clearData")}</button>
        {#if fmtAckDate}
          <p class="text-app-muted mt-2">{t("privacy.ackOn", { date: fmtAckDate })}</p>
        {/if}
      </section>

      <section>
        <h3 class="text-[10px] uppercase tracking-wider font-bold text-app-muted mb-1.5">
          {t("privacy.licencesHeading")}
        </h3>
        <ul class="space-y-1.5 text-app-muted list-disc pl-4">
          <li>
            {t("privacy.licApp")}
            <a
              href={REPO}
              target="_blank"
              rel="noopener noreferrer"
              class="text-app-accent hover:underline"
            >GitHub</a>
          </li>
          <li>{t("privacy.licDeps")}</li>
          <li>{t("privacy.licFonts")}</li>
          <li>{t("privacy.licCcp")}</li>
        </ul>
      </section>

      {#if !ackDate}
        <div class="flex justify-end pt-1">
          <button
            onclick={() => {
              acknowledge();
              open = false;
            }}
            class="text-xs bg-app-accent hover:bg-app-accentHover text-white font-semibold rounded px-3 py-1.5 transition-colors"
          >{t("privacy.gotIt")}</button>
        </div>
      {/if}
    </div>
  </Modal>
{/if}
