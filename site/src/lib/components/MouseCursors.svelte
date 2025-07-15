<script>
    import Icon from '@iconify/svelte';
    import {experience, experienceTime, identity, identityStates, showMouseCursors} from "$lib/state.svelte.ts";
    import {identToIcon, worldPositionToMousePosition} from "$lib/utils.js";
    import {Vector3} from "three";
</script>

<div class="absolute top-4 left-4">
    <div class="relative">
        <div class="relative group">
            <div class="absolute opacity-0 group-hover:opacity-100 group-hover:bottom-6 top-0 left-14 flex flex-col transition-all">
                        <span class="text-xs text-gray-800 text-center bg-white rounded-full scale-50 group-hover:scale-100 whitespace-nowrap p-1">
                            View Others Cursors
                        </span>
            </div>
            <div class="bg-white text-black rounded-full shadow m-1 relative transition-all pointer-events-auto">
                <span>
                    <button onclick={() => showMouseCursors.update(v => !v)}
                            class="bg-white w-12 h-12 rounded-full items-center justify-center flex border-1 cursor-pointer">
                        {#if $showMouseCursors}
                            <Icon icon="hugeicons:cursor-02" width="24" height="24"/>
                        {:else}
                            <Icon icon="hugeicons:cursor-disabled-01" width="24" height="24"/>
                        {/if}
                    </button>
                </span>
            </div>
        </div>
    </div>
</div>

{#key [$identityStates, $experienceTime]}
    {#if $showMouseCursors}
        {#each $identityStates.filter(ident => ident.ident !== $identity) as ident}
            {@const
                mousePosition = worldPositionToMousePosition(new Vector3(ident.mousePosition.x, 0, ident.mousePosition.y), $experience.canvas, $experience.camera)}
            {#if ident.mousePosition.x !== 0 && ident.mousePosition.y !== 0}
                <div class="absolute pointer-events-none z-10"
                     style={`top: ${mousePosition.y}px; left: ${mousePosition.x}px;`}>
                    <div class="relative">
                        <Icon icon="streamline-flex:arrow-cursor-2-solid" width="20" height="20"
                              class="text-gray-300 stroke-1 stroke-black overflow-visible"/>
                        <div class="absolute -bottom-5 -right-5 bg-gray-300 rounded-full p-0.5 border-2 border-black">
                            <Icon icon={identToIcon(ident.ident)} width="20" height="20"/>
                        </div>
                    </div>
                </div>
            {/if}
        {/each}
    {/if}
{/key}