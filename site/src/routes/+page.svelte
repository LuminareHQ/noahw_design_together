<script lang="ts">
    import {onDestroy, onMount} from "svelte";
    import {PostEvent} from "$lib/ws_events";
    import {
        experience,
        identity,
        identityStates,
        mousePositionCanvas,
        mousePositionWorld, sceneLoaded,
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

    let lastMessageSent: number = $state(Date.now());

    function updateMouseCanvasPosition(event: MouseEvent) {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        mousePositionCanvas.set({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        })
        if ($websocket && $identityStates.length > 1 && Date.now() - lastMessageSent > (1000 / 20)) {
            $websocket.send(new PostEvent($identity).Mouse({
                x: $mousePositionWorld.x,
                y: $mousePositionWorld.z,
            }))
            lastMessageSent = Date.now();
        }
    }
</script>

<div class="w-full h-full relative" onmousemove={updateMouseCanvasPosition} role="presentation">
    <canvas class="w-full h-full bg-[#0f172a]" bind:this={canvas}></canvas>
    {#if !$sceneLoaded}
        <div class="loader absolute z-50 top-[50%] left-[50%]"></div>
    {/if}
    <MouseCursors/>
    <ConnectedClients/>
    <div class="absolute bottom-2 right-2 left-2 flex items-center justify-center">
        <div class="relative">
            <div class="text-black rounded-full shadow m-1 relative transition-all pointer-events-auto">
                <span>
                    <a href="/md" target="_blank" rel="noopener noreferrer"
                       class="bg-white rounded-full items-center justify-center flex border-1 cursor-pointer py-2 px-4 font-semibold">
                        View Markdown Portfolio
                    </a>
                </span>
            </div>
        </div>
    </div>
</div>

