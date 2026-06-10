/**
 * Browser-persisted YAML history (IndexedDB) plus paste-sharing.
 *
 * Each snapshot is a named, timestamped copy of an exported profile so users can
 * keep, reload, rename, export and share previous versions. No dependencies —
 * a thin promise wrapper over IndexedDB.
 */

const DB_NAME = "zs-overview";
const STORE = "snapshots";
const VERSION = 1;

function openDb() {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) {
				db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

function tx(db, mode) {
	return db.transaction(STORE, mode).objectStore(STORE);
}

function wrap(request) {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

export async function saveSnapshot(name, yaml, base) {
	const db = await openDb();
	const id = await wrap(
		tx(db, "readwrite").add({
			name: name?.trim() || "Untitled",
			yaml,
			base: base ?? null,
			createdAt: Date.now(),
		}),
	);
	db.close();
	return id;
}

export async function listSnapshots() {
	const db = await openDb();
	const all = await wrap(tx(db, "readonly").getAll());
	db.close();
	return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getSnapshot(id) {
	const db = await openDb();
	const rec = await wrap(tx(db, "readonly").get(id));
	db.close();
	return rec;
}

export async function renameSnapshot(id, name) {
	const db = await openDb();
	const store = tx(db, "readwrite");
	const rec = await wrap(store.get(id));
	if (rec) {
		rec.name = name?.trim() || rec.name;
		await wrap(store.put(rec));
	}
	db.close();
}

export async function deleteSnapshot(id) {
	const db = await openDb();
	await wrap(tx(db, "readwrite").delete(id));
	db.close();
}

/**
 * Best-effort public paste. Uses dpaste.org (keyless). If the network/CORS
 * blocks it, the caller should fall back to clipboard.
 */
export async function sharePaste(yaml) {
	const body = new URLSearchParams({
		content: yaml,
		lexer: "yaml",
		expires: "604800", // 7 days
		format: "url",
	});
	const res = await fetch("https://dpaste.org/api/", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body,
	});
	if (!res.ok) throw new Error(`Paste failed (${res.status})`);
	return (await res.text()).trim().replace(/^"|"$/g, "");
}
