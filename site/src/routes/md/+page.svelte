<script>
    import {page} from '$app/state';
</script>

<svelte:head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/digitallytailored/classless@latest/classless.min.css">
</svelte:head>

<div class="w-full h-full p-4">
    <div class="w-full h-full overflow-auto">
        {@html page.data.code}
    </div>
</div>