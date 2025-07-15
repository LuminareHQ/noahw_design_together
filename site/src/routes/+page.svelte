<script lang="ts">
    import {onDestroy, onMount} from "svelte";
    import {PostEvent} from "$lib/ws_events";
    import {
        experience,
        identity,
        identityStates,
        mousePositionCanvas,
        mousePositionWorld,
        showMouseCursors
    } from "$lib/state.svelte";
    import Icon from '@iconify/svelte';
    import {identToIcon} from "$lib/utils";
    import Experience from "$lib/experience";
    import {websocket} from "$lib/state.svelte";
    import MouseCursors from "$lib/components/MouseCursors.svelte";
    import ConnectedClients from "$lib/components/ConnectedClients.svelte";
    import {joinChat} from "$lib/connection";
    import {IsIdle, watch} from "runed";

    let canvas: HTMLCanvasElement | null = null;
    const idle = $state(new IsIdle({timeout: 1000 * 7.5}));

    watch(() => idle.current, () => {
        $experience?.setIdleState(idle.current);
    })

    onMount(async () => {
        if ($websocket) {
            $websocket.close();
        }

        if (!$websocket) joinChat();

        experience.set(new Experience(canvas!));

        addEventListener("resize", () => {
            $experience!.setSize(canvas!.parentElement!.clientWidth, canvas!.parentElement!.clientHeight);
        })
    })

    onDestroy(() => {
        $websocket?.close();
    })

    function updateMouseCanvasPosition(event: MouseEvent) {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mousePositionCanvas.set({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        })
        if ($websocket) {
            $websocket.send(new PostEvent($identity).Mouse({
                x: $mousePositionWorld.x,
                y: $mousePositionWorld.z,
            }))
        }
    }
</script>

<div class="loader"></div>

<div class="w-full h-full relative" onmousemove={updateMouseCanvasPosition} role="presentation">
    <canvas class="w-full h-full" bind:this={canvas}></canvas>
    <!--    <MouseCursors/>-->
    <!--    <ConnectedClients/>-->
    <div class="absolute top-4 right-4">
        <div class="relative">
            <div class="relative group">
                <div class="absolute opacity-0 group-hover:opacity-100 group-hover:bottom-6 top-0 right-14 flex flex-col transition-all">
                        <span class="text-xs text-gray-800 text-center bg-white rounded-full scale-50 group-hover:scale-100 whitespace-nowrap p-1">
                            View Plain Text
                        </span>
                </div>
                <div class="bg-white text-black rounded-full shadow m-1 relative transition-all pointer-events-auto">
                <span>
                    <a href="/md" target="_blank" rel="noopener noreferrer"
                       class="bg-white w-12 h-12 rounded-full items-center justify-center flex border-1 cursor-pointer">
                            <Icon icon="lucide:file-text" width="24" height="24"/>
                    </a>
                </span>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    html {
        background-color: black;
    }

    /* HTML: <div class="loader"></div> */
    /* HTML: <div class="loader"></div> */
    /* HTML: <div class="loader"></div> */
    .loader {
        --s: 25px;
        --g: 5px;

        height: calc(1.353 * var(--s) + var(--g));
        aspect-ratio: 3;
        display: grid;
        justify-items: end;
        overflow: hidden;
        --_m: linear-gradient(90deg, #0000, #000 15px calc(100% - 15px), #0000);
        -webkit-mask: var(--_m);
        mask: var(--_m);

        position: absolute;
        top: calc(50% - 0.5 * var(--s) - 0.5 * var(--g));
        left: calc(50% - 0.5 * var(--s) - 0.5 * var(--g));
        transform: translate(-50%, -50%);
    }

    .loader:before {
        content: "";
        width: calc(4 * 100% / 3);
        background: conic-gradient(from -90deg at var(--s) calc(0.353 * var(--s)),
        #fff 135deg, #666 0 270deg, #aaa 0);
        --_m: linear-gradient(to bottom right,
        #0000 calc(0.25 * var(--s)), #000 0 calc(100% - calc(0.25 * var(--s)) - 1.414 * var(--g)), #0000 0),
        conic-gradient(from -90deg at right var(--g) bottom var(--g), #000 90deg, #0000 0);
        -webkit-mask: var(--_m);
        mask: var(--_m);
        background-size: calc(100% / 4) 100%;
        -webkit-mask-size: calc(100% / 4) 100%;
        mask-size: calc(100% / 4) 100%;
        -webkit-mask-composite: source-in;
        mask-composite: intersect;
        animation: l8 1s infinite linear;
    }

    @keyframes l8 {
        to {
            transform: translate(calc(100% / 4))
        }
    }
</style>