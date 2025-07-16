<script lang="ts">
    import '../app.css';

    let {children} = $props();
</script>

<svelte:head>
    <title>NoahW Design</title>
</svelte:head>

<div style="background-color: var(--body-bg);" class="w-full h-full">
    {@render children()}
</div>
