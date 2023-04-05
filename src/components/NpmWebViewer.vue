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
            <button @click="createHighlight" :disabled="!hasDocumentLoaded">Highlight Text</button>
            <button id="select" @click="selectTool" :disabled="!hasDocumentLoaded">🤚 Select</button>
            <button @click="undoHandler">undo</button>
            <button @click="redoHandler">redo</button>
            <button @click="exportAnnotations">export annotations</button>
            <button @click="importAnnotations">import annotations</button>
            <button @click="customStampTool" :disabled="!hasDocumentLoaded"> custom stamp tool</button>
            <button @click="deleteSelectedAnnotations">delete selected annotations</button>
            <button @click="generateThumbnail" :disabled="!hasDocumentLoaded">generate thumbnail</button>
            <button @click="measureDistanceTool" :disabled="!hasDocumentLoaded">measure distance</button>
            <button @click="calibrateDistance" :disabled="!hasDocumentLoaded">calibrate distance</button>
        </div>
        <div v-if="loadingErrMsg" class="error-section">
            {{ loadingErrMsg }}
        </div>
        <div id="page-container">
            <div id="scroll-view" ref="scrollViewElem">
                <div v-if="!hasDocumentLoaded">
                    Loading...
                </div>
                <div id="viewer" ref="viewerElem"></div>
                <CustomCommentSection />
            </div>
        </div>
        <ContextMenu v-if="showContextMenu" :display="showContextMenu" :left="contextMenuPos.x" :top="contextMenuPos.y"
            ref="contextMenuElem">
            <div>
                <span @click="deleteSelectedAnnotations"> 🗑️ </span> | <span @click="setCustomStyleAnnotation"> 🖌️ </span>
                |
                <span>3</span>
            </div>
        </ContextMenu>
    </div>
</template>

<script setup>
import CustomCommentSection from './CustomCommentSection.vue';
import ContextMenu from './ContextMenu.vue';
import { onMounted, onUnmounted, ref, watch, reactive } from 'vue';
import useDocViewer from '../composables/useDocViewer';
import throttle from 'lodash.throttle';

const isWebViewerCoreReady = ref(false);
const hasDocumentLoaded = ref(false);
const loadingErrMsg = ref('');
const documentViewerInstance = ref(null);
const scrollViewElem = ref(null);
const viewerElem = ref(null);
const commentSectionElem = ref(null);
const contextMenuElem = ref(null);
const showContextMenu = ref(false);
const contextMenuPos = reactive({
    x: 0,
    y: 0,
});

const openContextMenu = (evt) => {
    showContextMenu.value = true;
    contextMenuPos.x = evt.pageX || evt.clientX;
    contextMenuPos.y = evt.pageY || evt.clientY;
    console.log('openContextMenu', evt, showContextMenu.value, contextMenuPos)
    // contextMenuElem.value.open(e);
    // contextMenuElem.value.focus();
}

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
    showContextMenu.value = false;
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
        // const pdfUrl = "https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf";
        const pdfUrl = "/sample.pdf";
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
        const displayMode = new Core.DisplayMode(documentViewer, window.Core.DisplayModes.Continuous)
        documentViewer.addEventListener('mouseRightUp', function (event) {
            // console.log(displayMode);
            const coordinates = displayMode.windowToPage({ x: event.x, y: event.y }, documentViewer.getCurrentPage())
            console.log('Mouse right up event', event, coordinates);
            openContextMenu(event);
        });
        // native right click
        viewerElem.value.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            // const coordinates = documentViewer.getViewerCoordinatesFromMouseEvent(event);
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
                    const coordinates = displayMode.windowToPage({ x: evt.x, y: evt.y }, documentViewer.getCurrentPage())
                    console.log('Mouse hover', evt, coordinates);
                    openContextMenu(evt);
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
    deleteSelectedAnnotations,
    customStampTool,
    generateThumbnail,
    createHighlight,
    measureDistanceTool,
    calibrateDistance,
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

#page-container {
    display: flex;
}

#scroll-view {
    display: flex;

    bottom: 0;
    height: 500px;
    padding: 10px;
    width: 100%;
    overflow: auto;
    background-color: lightgray;
}

#viewer {
    flex: none;
    margin: auto;
}

.error-section {
    color: tomato;
    text-align: center;
}
</style>