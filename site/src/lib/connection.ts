import {get} from "svelte/store";
import {identity, identityStates, websocket} from "$lib/state.svelte";

export function joinChat() {
    return; // Disable for now

    websocket.set(new WebSocket("ws://" + window.location.host + "/ws"));

    get(websocket)!.onopen = function () {
        console.log("connection opened");
    }

    get(websocket)!.onclose = function () {
        console.log("connection closed");
        location.reload();
    }

    get(websocket)!.onmessage = function (e) {
        let data = e.data as string;
        if (data.startsWith("CM|")) {
            parseCommand(data);
        }
    }
}

function parseCommand(command_string: string) {
    let segments = command_string.split("|");

    switch (segments[1]) {
        case "IDENT":
            identity.set(segments[2]);
            console.log("Identity set to:", get(identity));
            break;
        case "ACTIVE":
            identityStates.update(v => [...v, ...segments.slice(2).map(ident => ({
                ident,
                mousePosition: {x: 0, y: 0}
            }))])
            break;
        case "ENTER":
            if (get(identityStates).some(
                idents => idents.ident === segments[2]
            )) return;
            identityStates.update(idents => [...idents, {
                ident: segments[2],
                mousePosition: {x: 0, y: 0}
            }]);
            break;
        case "LEAVE":
            identityStates.update(idents => idents.filter(ident => ident.ident !== segments[2]));
            break;
        case "CURSOR":
            identityStates.update(idents => {
                return idents.map(ident => {
                    if (ident.ident === segments[2]) {
                        return {
                            ...ident,
                            mousePosition: {
                                x: parseFloat(segments[3]),
                                y: parseFloat(segments[4]),
                            }
                        };
                    }
                    return ident;
                });
            });
            break;
    }
}