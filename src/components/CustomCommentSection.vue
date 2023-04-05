<template>
    <div id="comment-section">
        <div class="comment-card">comment1</div>
        <div class="comment-card">comment2</div>
        <div class="comment-card">comment3</div>
        <div class="comment-card top-300">comment4</div>
    </div>
</template>

<script setup>

</script>

<style scoped>
#comment-section {
    border: 1px solid blue;

    /* overflow-y: auto; */
    padding: 10px;
    min-width: 30%;
    /* height: 500px; */
}

.comment-card {
    background-color: white;
    color: black;
    padding: 10px;
    border-radius: 1rem;
    margin-bottom: 4px;
    position: relative;
    /* top: 328px; */
    /* left: 36px; */
}

.top-300 {
    top: 300px;
}
</style>