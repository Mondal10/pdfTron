<script setup>
import { ref } from 'vue';
import CustomWebViewer from './components/CustomWebViewer.vue';
import NpmWebViewer from './components/NpmWebViewer.vue';

const showIcons = ref(false);
const showCustomWebViewer = ref(false); // to simulate dynamic import of the script on route change
const showNpmWebViewer = ref(false);
const showPopup = ref(false);


</script>

<template>
  <!-- <button @click="() => showIcons = !showIcons">{{ showIcons ? 'Hide' : 'Show' }} Icons</button> -->
  <!-- <button @click="() => showCustomWebViewer = !showCustomWebViewer">{{ showCustomWebViewer ? 'Hide' : 'Show' }}
                                                                                                                  CustomWebViewer</button> -->
  <button @click="() => showNpmWebViewer = !showNpmWebViewer">{{ showNpmWebViewer ? 'Hide' : 'Show' }}
    NPM customWebViewer</button>
  <button @click="() => showPopup = !showPopup">{{ showPopup ? 'Hide' : 'Show' }}
    popup</button>
  <div v-if="showIcons">
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <hr>
  <CustomWebViewer v-if="showCustomWebViewer" />
  <NpmWebViewer v-if="showNpmWebViewer" :presetTools="[]" :showAllTools="true" />
  <!-- <NpmWebViewer v-if="showNpmWebViewer" :presetTools="[
    'zoomIn',
    'zoomOut',
    'rectangle',
    'ellipse',
    'line'
      ]" />
      <NpmWebViewer v-if="showNpmWebViewer" :presetTools="[
        'ellipse',
        'highlight',
        'stamp',
        'exportAnnotation',
        'importAnnotation'
      ]" />
        <NpmWebViewer v-if="showNpmWebViewer" :presetTools="[
          'undo',
          'redo',
          'measureDistance',
        ]" /> -->
  <div class="popup" v-if="showPopup">
    <NpmWebViewer :presetTools="[
      // 'undo',
      // 'redo',
      'select',
      'zoomIn',
      'zoomOut',
      'text',
      'textOpacity',
      'fillOpacity',
      'customStyle',
      // 'extractText',
    ]" />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.popup {
  background-color: antiquewhite;
  position: absolute;
  border: 1px solid;
  top: 10%;
  margin: auto;
  height: 80%;
  width: 80%;
}
</style>
