<script>
    import {identity, identityStates, websocket} from "$lib/state.svelte.js";
    import {identToIcon} from "$lib/utils.js";
    import Icon from "@iconify/svelte";
    import MouseCursors from "$lib/components/MouseCursors.svelte";
</script>

<div class="absolute flex flex-col items-center justify-center bottom-2 left-2 right-2 pointer-events-none z-50 gap-1">
    <div class="flex flex-row items-center justify-center gap-1">
        {#if $websocket?.OPEN}
            {#each $identityStates as ident}
                <div class="relative group">
                    <div class="absolute opacity-0 group-hover:opacity-100 group-hover:-top-6 top-4 left-0 right-0 flex flex-col w-full transition-all">
                        <span class="text-xs text-gray-800 text-center bg-white rounded-full scale-50 group-hover:scale-100 whitespace-nowrap">
                            {ident.ident === $identity ? "You" : ident.ident}
                        </span>
                    </div>
                    <div class="bg-white text-black p-2 rounded-full shadow m-1 relative transition-all pointer-events-auto"
                         class:border-2={ident.ident === $identity}>
                <span>
                    <Icon icon={identToIcon(ident.ident)} width="32" height="32"/>
                </span>
                    </div>
                </div>
            {/each}
        {:else}
            <Icon icon="codex:loader"/>
        {/if}
    </div>
    <p class="rounded-full py-0.5 px-1 text-xs font-mono text-black bg-white border-1">Connected Clients</p>
</div>