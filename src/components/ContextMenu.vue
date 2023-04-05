<template>
    <div class="context-menu" v-show="show" :style="style" ref="contextMenuElem" tabindex="0" @blur="close">
        <slot></slot>
    </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';
const contextMenuElem = ref(null)

const props = defineProps({
    display: Boolean,
    left: Number,
    top: Number,
})

console.log('CHANGED', props)

const left = ref(props.left ?? 0);
const top = ref(props.top ?? 0);
const show = ref(props.display ?? false);
const style = computed(() => {
    return {
        top: top.value + 'px',
        left: left.value + 'px',
    }
});
const close = () => {
    console.log('CLOSEEE');
    show.value = false;
    left.value = 0;
    top.value = 0;
}
const open = (evt) => {
    // updates position of context menu 
    left.value = evt.pageX || evt.clientX;
    top.value = evt.pageY || evt.clientY;
    show.value = true;
}
</script>

<style scoped>
.context-menu {
    position: fixed;
    background: white;
    z-index: 999;
    outline: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    cursor: pointer;
}
</style>