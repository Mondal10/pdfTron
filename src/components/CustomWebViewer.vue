<template>
    <div>
        <!-- <h1>Custom WebViewer</h1> -->
        <div class="title">This is a custom viewer</div>
        <div id="header">
            <button id="zoom-out-button" @click="zoomOut" :disabled="!hasDocumentLoaded">🔍 zoom out</button>
            <button id="zoom-in-button" @click="zoomIn" :disabled="!hasDocumentLoaded">🔍 zoom in</button>
            <button id="create-rectangle" @click="createRectangle" :disabled="!hasDocumentLoaded">☐ Rectangle</button>
            <button id="select" @click="selectTool" :disabled="!hasDocumentLoaded">🤚 Select</button>
        </div>
        <div v-if="!hasDocumentLoaded">
            Loading...
        </div>
        <div id="scroll-view">
            <div id="viewer"></div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import useDocViewer from '../composables/useDocViewer';

const isWebViewerCoreReady = ref(false);
const hasDocumentLoaded = ref(false);
const documentViewerInstance = ref(null);

onMounted(() => {

    window?.Core && (isWebViewerCoreReady.value = true);
    if (!window?.Core) {
        console.log('webViewCore Loading...');
        const webViewerCoreScript = document.createElement("script");
        webViewerCoreScript.setAttribute(
            "src",
            "/webviewer/core/webviewer-core.min.js"
        );
        webViewerCoreScript.onload = function () {
            (async function () {
                // Core namespace is now available on the window
                Core.setWorkerPath('/webviewer/core');
                isWebViewerCoreReady.value = true;
                console.log('webViewCore Loaded');
            })()
        };
        document.head.appendChild(webViewerCoreScript);
    }


})

onUnmounted(() => {
    isWebViewerCoreReady.value = false;
    hasDocumentLoaded.value = false;
    documentViewerInstance.value = null;
    console.log('UNMOUNTEDD', isWebViewerCoreReady.value);
})

watch(isWebViewerCoreReady, (currentVal) => {
    console.log(`isWebViewerCoreReady is ${currentVal}`)
    if (currentVal) {
        const documentViewer = new Core.DocumentViewer();

        // Hook up the DocumentViewer object to your own elements
        console.log('ddddd', document.getElementById('scroll-view'));
        documentViewer.setScrollViewElement(document.getElementById('scroll-view'));
        documentViewer.setViewerElement(document.getElementById('viewer'));

        // Load your document
        const pdfUrl = "https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf";
        documentViewer.loadDocument(pdfUrl, { l: null });
        // documentViewer.setOptions({ enableAnnotations: true });
        documentViewer.enableAnnotations();

        documentViewer.addEventListener('documentLoaded', () => {
            // call methods relating to the loaded document
            console.log('PDF LOADED:::');
            hasDocumentLoaded.value = true;
        });
        documentViewerInstance.value = documentViewer;
    }
})

const {
    zoomOut,
    zoomIn,
    createRectangle,
    selectTool,
} = useDocViewer(documentViewerInstance);

</script>

<style scoped>
#header {
    height: 100px;
}

.title {
    font-size: 2em;
    font-weight: bold;
}

#scroll-view {
    bottom: 0;
    /* leave room for 100px header */
    height: calc(100% - 100px);
    width: 100%;
    overflow: auto;
}

#viewer {
    /* border: 1px solid red; */
    margin: auto;
}
</style>