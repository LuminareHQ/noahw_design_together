import {type Writable, writable} from "svelte/store";
import type {IdentityState} from "$lib/types";
import type Experience from "$lib/experience";

// Connection Socket
export let websocket: Writable<WebSocket | null> = writable(null);

// Experience Class
export let experience: Writable<Experience | null> = writable(null);
export let experienceTime: Writable<number> = writable(0);
export let sceneLoaded: Writable<boolean> = writable(false);

// Current Assigned Identity
export let identity: Writable<string> = writable("");

// Local Setting for showing mouse cursors
export let showMouseCursors: Writable<boolean> = writable(true);

// Calculated State of all identities
export let identityStates: Writable<Array<IdentityState>> = writable([]);

// Client Mouse Position on the canvas
export let mousePositionCanvas: Writable<{ x: number; y: number }> = writable({x: 0, y: 0});
export let mousePositionWorld: Writable<{ x: number; y: number, z: number }> = writable({x: 0, y: 0, z: 0});
