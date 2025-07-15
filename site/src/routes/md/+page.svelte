<script>
    import {compile} from "mdsvex";
    import NoahwDesign from "./NoahwDesign.md?raw";
</script>

<svelte:head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/digitallytailored/classless@latest/classless.min.css">
</svelte:head>

<div class="w-full h-full overflow-auto">
    {#await compile(NoahwDesign)}
        <p>Loading...</p>
    {:then compiled}
        {@html compiled.code}
    {:catch error}
        <p>Error: {error.message}</p>
    {/await}
</div>