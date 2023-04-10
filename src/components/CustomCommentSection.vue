<template>
    <div id="comment-section">
        <div v-for="comment in localComments" :style="{ top: `${calcTopPx(comment)}px` }" class="comment-card"
            :class="{ selected: comment.id === selectedHighlightAnnot }" :key="comment.id">
            {{
                `${comment.id}-${comment.pos.y} comment` }}</div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
defineProps({
    selectedHighlightAnnot: String,
})


const localComments = computed(() => JSON.parse(localStorage.getItem('comments') ?? '[]'));
const calcTopPx = (comment) => comment?.pos && (comment.pageHeight * (comment.pos.pageNumber - 1)) + (comment.pos.y - comment.highlightHeight);


</script>

<style scoped>
#comment-section {
    min-width: 30%;
}

.comment-card {
    background-color: white;
    color: black;
    padding: 5px;
    border-radius: 1rem;
    margin-bottom: 4px;
    position: relative;
    font-size: 12px;
}

.selected {
    border: 2px solid tomato;
}
</style>