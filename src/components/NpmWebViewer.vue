<template>
    <div>
        <div class="title">This is a custom NPM PDF tron</div>
        <div id="header">
            <button id="zoom-out-button" @click="zoomOut" :disabled="!hasDocumentLoaded">🔍 zoom out</button>
            <button id="zoom-in-button" @click="zoomIn" :disabled="!hasDocumentLoaded">🔍 zoom in</button>
            <button id="create-rectangle" @click="createRectangle" :disabled="!hasDocumentLoaded">☐ Rectangle</button>
            <button id="set-color" @click="setCustomStyleAnnotation" :disabled="!hasDocumentLoaded">
                setCustomStyle</button>
            <button id="create-ellipse" @click="createEllipse" :disabled="!hasDocumentLoaded">Ellipse</button>
            <button id="create-line" @click="createLine" :disabled="!hasDocumentLoaded">Line</button>
            <button id="select" @click="selectTool" :disabled="!hasDocumentLoaded">🤚 Select</button>
            <button @click="undoHandler">undo</button>
            <button @click="redoHandler">redo</button>
            <button @click="exportAnnotations">export annotations</button>
            <button @click="importAnnotations">import annotations</button>
            <button @click="customIconAnnotation" :disabled="!hasDocumentLoaded">add custom icon</button>
            <button @click="customStampTool"> custom stamp tool</button>
            <button @click="deleteSelectedAnnotations">delete selected annotations</button>
            <button @click="generateThumbnail">generate thumbnail</button>
        </div>
        <div v-if="loadingErrMsg" class="error-section">
            {{ loadingErrMsg }}
        </div>
        <div id="scroll-view" ref="scrollViewElem">
            <div v-if="!hasDocumentLoaded">
                Loading...
            </div>
            <div id="viewer" ref="viewerElem"></div>
            <!-- Comments section -->
            <div v-if="false" id="comment-section">
                <div class="comment-card">comment1</div>
                <div class="comment-card">comment2</div>
                <div class="comment-card">comment3</div>
            </div>
        </div>
    </div>
</template>

<script setup>
// import webViewerCore from '@pdftron/webviewer/public/core/webviewer-core.min';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import useDocViewer from '../composables/useDocViewer';
import throttle from 'lodash.throttle';

const isWebViewerCoreReady = ref(false);
const hasDocumentLoaded = ref(false);
const loadingErrMsg = ref('');
const documentViewerInstance = ref(null);
const scrollViewElem = ref(null);
const viewerElem = ref(null);
// const color = ref(null);

onMounted(async () => {
    try {
        window?.Core && (isWebViewerCoreReady.value = true);
        if (!window?.Core) {
            await import('@pdftron/webviewer/public/core/webviewer-core.min');
            // await import { getInstance } from '@pdftron/webviewer'
            // console.log('webViewerCore::', window.Core);
            Core.setWorkerPath('/webviewer/core');
            // Todo: Find a better way as this will not work for prod-build
            // Core.setWorkerPath('../../node_modules/@pdftron/webviewer/public/core');
            isWebViewerCoreReady.value = true;
        }
    } catch (error) {
        console.error('ERROR', error)
    }
})

onUnmounted(() => {
    isWebViewerCoreReady.value = false;
    hasDocumentLoaded.value = false;
    documentViewerInstance.value = null;
    console.log('UNMOUNTEDD');
})

watch(isWebViewerCoreReady, (currentVal) => {
    console.log(`isWebViewerCoreReady is ${currentVal}`)
    if (currentVal) {
        const documentViewer = new Core.DocumentViewer();

        // Hook up the DocumentViewer object to your own elements
        documentViewer.setScrollViewElement(scrollViewElem.value);
        documentViewer.setViewerElement(viewerElem.value);

        // Load your document
        // const pdfUrl = "https://pdftron.s3.amazonaws.com/downloads/pl/demo.pdf";
        const pdfUrl = "https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf";
        // const pdfUrl = "/sample.pdf";
        documentViewer.loadDocument(pdfUrl, {
            l: null, onError: (err) => {
                loadingErrMsg.value = err.message ?? err;
            }
        });
        documentViewer.enableAnnotations();
        Core.Annotations.SelectionModel.defaultSelectionOutlineColor = new Core.Annotations.Color(
            165,
            140,
            252,
            1
        );
        Core.Annotations.SelectionModel.selectionOutlineThickness = 2;
        documentViewer.addEventListener('documentLoaded', async () => {
            // call methods relating to the loaded document
            console.log('PDF LOADED:::');
            hasDocumentLoaded.value = true;
        });

        // Normal left click
        documentViewer.addEventListener('click', (event) => {
            console.log('Clicked', event)
        })
        // Double click
        documentViewer.addEventListener('dblClick', (event) => {
            console.log('DoubleClicked', event)
        })
        // mouse right up
        documentViewer.addEventListener('mouseRightUp', (event) => {
            console.log('Mouse right up event', event);
        });
        // native right click
        viewerElem.value.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            const annot = documentViewer.getAnnotationManager().getAnnotationByMouseEvent(event);
            console.log('native contextmenu::', annot, event);
        })


        // documentViewer.addEventListener(
        viewerElem.value.addEventListener(
            "mousemove",
            throttle(evt => {
                const annot = documentViewer.getAnnotationManager().getAnnotationByMouseEvent(evt);
                if (annot) {
                    console.log(annot, annot, evt)
                } else {
                    // Core.offHover(evt);
                }
            }, 700)
        );

        documentViewerInstance.value = documentViewer;
    }
});

const {
    zoomOut,
    zoomIn,
    createRectangle,
    setCustomStyleAnnotation,
    createLine,
    createEllipse,
    selectTool,
    undoHandler,
    redoHandler,
    exportAnnotations,
    importAnnotations,
    customIconAnnotation,
    deleteSelectedAnnotations,
    customStampTool,
    generateThumbnail
} = useDocViewer(documentViewerInstance);

</script>

<style scoped>
#header {
    height: auto;
    padding-bottom: 10px;
}

.title {
    font-size: 2em;
    font-weight: bold;
}

#scroll-view {
    display: flex;
    bottom: 0;
    height: 500px;
    width: 100%;
    overflow: auto;
    background-color: lightgray;
}

#viewer {
    /* border: 1px solid red; */
    margin: auto;
}

#comment-section {
    padding: 10px;
    width: 30%
}

.comment-card {
    background-color: white;
    color: black;
    padding: 10px;
    border-radius: 1rem;
    margin-bottom: 4px;
    position: relative;
    top: 328px;
    /* left: 36px; */
}

.error-section {
    color: tomato;
    text-align: center;
}
</style>