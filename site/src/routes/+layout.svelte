<script lang="ts">
    import '../app.css';

    let {children} = $props();
</script>

<svelte:head>
    <title>NoahW Design</title>
</svelte:head>

{@render children()}
