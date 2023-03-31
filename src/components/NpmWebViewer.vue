<template>
    <div>
        <div class="title">This is a custom NPM PDF tron</div>
        <div id="header">
            <button id="zoom-out-button" @click="zoomOut" :disabled="!hasDocumentLoaded">🔍 zoom out</button>
            <button id="zoom-in-button" @click="zoomIn" :disabled="!hasDocumentLoaded">🔍 zoom in</button>
            <!-- <input type="color" name="colorpicker" :value="color" @change="colorPickerHandler"> -->
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
            <button @click="createStamp" :disabled="!hasDocumentLoaded">upload stamp</button>
        </div>
        <div id="scroll-view" ref="scrollViewElem">
            <div v-if="!hasDocumentLoaded">
                Loading...
            </div>
            <div id="viewer" ref="viewerElem"></div>
        </div>
    </div>
</template>

<script setup>
// import webViewerCore from '@pdftron/webviewer/public/core/webviewer-core.min';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import useDocViewer from '../composables/useDocViewer';

const isWebViewerCoreReady = ref(false);
const hasDocumentLoaded = ref(false);
const documentViewerInstance = ref(null);
const scrollViewElem = ref(null);
const viewerElem = ref(null);
// const color = ref(null);

onMounted(async () => {
    try {
        window?.Core && (isWebViewerCoreReady.value = true);
        if (!window?.Core) {
            await import('@pdftron/webviewer/public/core/webviewer-core.min');
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
        const pdfUrl = "https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf";
        // const pdfUrl = "/sample.pdf";
        try {
            documentViewer.loadDocument(pdfUrl, { l: null });
        } catch (error) {
            console.log('ERROR:::', error)
        }
        documentViewer.enableAnnotations();
        Core.Annotations.SelectionModel.defaultNoPermissionSelectionOutlineColor = new Core.Annotations.Color(
            65,
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

        /* Custom StampAnnotation svg */
        // documentViewer.addEventListener('annotationsLoaded', async () => {
        //     const res = await fetch('/vite.svg'); // Include custom headers as necessary

        //     const imageBlob = await res.blob();
        //     const reader = new FileReader();
        //     reader.onloadend = async () => {
        //         const annot = new Core.Annotations.StampAnnotation({
        //             PageNumber: 1,
        //             X: 100,
        //             Y: 400,
        //             Width: 40,
        //             Height: 40,
        //         });

        //         const base64data = reader.result;
        //         await annot.setImageData(base64data, { keepAsSVG: true }); // Base64 URL or SVG, default is png
        //         // annot.IsHoverable = true;
        //         // annot.addEventListener('mouseover', () => {
        //         //     console.log('annot HOVERED');

        //         // })
        //         // annot.NoZoom = true;
        //         // console.log('zoom', annot.NoZoom)
        //         documentViewer.getAnnotationManager().addAnnotation(annot);
        //         documentViewer.getAnnotationManager().redrawAnnotation(annot);
        //     }
        //     reader.readAsDataURL(imageBlob);
        // });

        documentViewerInstance.value = documentViewer;
    }
});

// const colorPickerHandler = (event) => {
//     color.value = event.target.value;
//     // console.log(window.Core.getAllAnnotations())
//     console.log('Color selected', color.value);

//     // const test = new Core.Annotations.MarkupAnnotation();
//     // console.log(test.Color, test.FillColor, test.StrokeColor);
//     // test.StrokeColor = new Core.Annotations.Color(255, 99, 71, 0.5);
//     // console.log('updated color', test.StrokeColor)

//     /******/
//     // const tool = new Core.Tools.Tool(documentViewerInstance.value);
//     // console.log('tool', tool);
//     // tool.setStyles({
//     //     'StrokeColor': 'red',
//     // })
// }

// const

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
    createStamp,
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
</style>