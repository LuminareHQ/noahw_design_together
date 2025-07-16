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

    let bgAudio: HTMLAudioElement | null = null;

    watch(() => idle.current, () => {
        $experience?.setIdleState(idle.current);
    })

    onMount(async () => {
        // bgAudio = new Audio("/Bar.mp3");
        // bgAudio.loop = true;
        // bgAudio.volume = 0.05;

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

<!--<svelte:head>-->
<!--    <link rel="preload" href="/Bar.mp3" as="audio">-->
<!--</svelte:head>-->


<div class="w-full h-full relative" onmousemove={updateMouseCanvasPosition} role="presentation">
    <canvas class="w-full h-full" bind:this={canvas} onclick={() => {
        // if (bgAudio && bgAudio.paused) {
        //     bgAudio.play();
        // }
    }}></canvas>
    <MouseCursors/>
    <ConnectedClients/>
    <div class="absolute top-2 right-2">
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

