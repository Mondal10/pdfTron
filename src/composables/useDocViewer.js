// import { saveAs } from 'file-saver';

/**
 * create an array containing 1…N
 * @param {Number} count
 */
const createArrayFromCount = (count) =>
  Array.from({ length: count }, (_, i) => i + 1);

/**
 * download blob data to pdf
 * @param {Blob} blob
 * @param {String} name
 * @returns
 */
function downloadBlob(blob, name = 'file.pdf') {
  if (window.navigator && window.navigator.msSaveOrOpenBlob)
    return window.navigator.msSaveOrOpenBlob(blob);

  // For other browsers:
  // Create a link pointing to the ObjectURL containing the blob.
  const data = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = data;
  link.download = name;

  // this is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );

  setTimeout(() => {
    // For Firefox it is necessary to delay revoking the ObjectURL
    window.URL.revokeObjectURL(data);
    link.remove();
  }, 100);
}

export default function useDocViewer(documentViewerInstance) {
  const zoomOut = () => {
    documentViewerInstance.value.zoomTo(
      documentViewerInstance.value.getZoomLevel() - 0.25
    );
    console.log('z-out', documentViewerInstance.value.getZoomLevel());
  };

  const zoomIn = () => {
    documentViewerInstance.value.zoomTo(
      documentViewerInstance.value.getZoomLevel() + 0.25
    );
    console.log('z-in', documentViewerInstance.value.getZoomLevel());
  };

  const createRectangle = () => {
    const rectTool = documentViewerInstance.value.getTool(
      window.Core.Tools.ToolNames.RECTANGLE
    );
    rectTool.setStyles({
      StrokeColor: new Core.Annotations.Color(66, 184, 131, 1),
      StrokeThickness: 5,
      FillColor: null, // text extractor has fill colour
    });
    documentViewerInstance.value.setToolMode(rectTool);
    console.log(
      window.Core.Tools.ToolNames.RECTANGLE,
      // documentViewerInstance.value.getToolModeMap(),
      rectTool
    );
  };

  const setCustomStyleAnnotation = () => {
    const annotationManager =
      documentViewerInstance.value.getAnnotationManager();
    selectedAnnotations()?.length &&
      selectedAnnotations().forEach((annotation) => {
        console.log('annotation', annotation);
        annotationManager.setAnnotationStyles(annotation, {
          StrokeColor: new Core.Annotations.Color(242, 113, 14, 1),
          FillColor: new Core.Annotations.Color(198, 171, 221, 0.4),
          StrokeThickness: 5,
        });
      });
  };

  const exportAnnotations = () => {
    const annotationManager =
      documentViewerInstance.value.getAnnotationManager();
    let annotations = null;
    annotationManager.exportAnnotations().then((res) => {
      annotations = res;
      console.log(annotations);
      localStorage.setItem('myAnnotations', annotations);
    });
    console.log('annotations', annotations);
  };

  const importAnnotations = () => {
    const annotationManager =
      documentViewerInstance.value.getAnnotationManager();
    const savedAnnotations = localStorage.getItem('myAnnotations');
    annotationManager.importAnnotations(savedAnnotations);
  };

  const createLine = () => {
    documentViewerInstance.value.setToolMode(
      documentViewerInstance.value.getTool(window.Core.Tools.ToolNames.LINE)
    );
  };

  const createEllipse = () => {
    documentViewerInstance.value.setToolMode(
      documentViewerInstance.value.getTool(window.Core.Tools.ToolNames.ELLIPSE)
    );
  };

  const selectTool = (e) => {
    e.preventDefault();
    const editTool = documentViewerInstance.value.getTool(
      window.Core.Tools.ToolNames.EDIT
    );
    // editTool.cursor = 'crosshair';
    editTool.contextMenu(e);
    console.log(e, window.Core.Tools.ToolNames.EDIT, editTool);
    documentViewerInstance.value.setToolMode(editTool);
  };

  const selectedAnnotations = () => {
    const annotationManager =
      documentViewerInstance.value.getAnnotationManager();

    return annotationManager.getSelectedAnnotations();
  };

  const undoHandler = () => {
    const annotationHistory =
      documentViewerInstance.value.getAnnotationHistoryManager();
    console.log('Can Undo ?', annotationHistory.canUndo());
    annotationHistory.undo();
  };

  const redoHandler = () => {
    const annotationHistory =
      documentViewerInstance.value.getAnnotationHistoryManager();
    console.log('Can Redo ?', annotationHistory.canRedo());
    annotationHistory.redo();
  };

  const createStampIcon = async (x, y, pageNum) => {
    const res = await fetch('/vite.svg'); // Include custom headers as necessary
    const imageBlob = await res.blob();
    const reader = new FileReader();
    reader.onloadend = async () => {
      const annot = new Core.Annotations.StampAnnotation({
        PageNumber: pageNum,
        X: x - 20,
        Y: y - 20,
        Width: 25,
        Height: 25,
      });

      const base64data = reader.result;
      await annot.setImageData(base64data, { keepAsSVG: true }); // Base64 URL or SVG, default is png
      annot.NoZoom = true;
      annot.NoRotate = true;
      annot.disableRotationControl();

      documentViewerInstance.value.getAnnotationManager().addAnnotation(annot);
      documentViewerInstance.value
        .getAnnotationManager()
        .redrawAnnotation(annot);
    };
    reader.readAsDataURL(imageBlob);
  };

  const deleteSelectedAnnotations = () => {
    const annotationManager =
      documentViewerInstance.value.getAnnotationManager();
    annotationManager.deleteAnnotation(selectedAnnotations());
  };

  const customStampTool = () => {
    const stampTool = new Core.Tools.StampCreateTool(
      documentViewerInstance.value
    );
    stampTool.mouseLeftDown = function (event) {
      console.log('stampTool', this, this.pageCoordinates[1]);
      const pagePoint = this.pageCoordinates[1];
      const pageNumber = pagePoint.pageNumber;
      createStampIcon(pagePoint.x, pagePoint.y, pageNumber);
    };
    documentViewerInstance.value.setToolMode(stampTool);
  };

  const generateThumbnail = () => {
    const doc = documentViewerInstance.value.getDocument();
    const pageNum = documentViewerInstance.value.getCurrentPage();
    doc.loadThumbnail(pageNum, (thumbnail) => {
      // thumbnail is a HTMLCanvasElement or HTMLImageElement
      console.log(
        `Thumbnail generated for page ${pageNum}`,
        thumbnail,
        thumbnail.toDataURL('image/jpeg')
      );
    });
  };

  const createHighlight = () => {
    const { Tools } = window.Core;
    const annotationManager =
      documentViewerInstance.value.getAnnotationManager();
    const highlightMouseUp =
      Tools.TextHighlightCreateTool.prototype.mouseLeftUp;
    const highlightTool = documentViewerInstance.value.getTool(
      window.Core.Tools.ToolNames.HIGHLIGHT
    );

    Tools.TextHighlightCreateTool.prototype.mouseLeftUp = function (event) {
      if (this.annotation) {
        const { pageNumber, x, y } = this.pageCoordinates[1];

        const currentPageHeight =
          documentViewerInstance.value.getPageHeight(pageNumber);
        const currentZoomLevel = documentViewerInstance.value.getZoomLevel();
        // console.log(
        //   'highlightTool mouseLeftUp',
        //   this.annotation,
        //   this.annotation.Id
        // );
        // console.log(
        //   this.annotation.Height,
        //   this.pageCoordinates[1],
        //   currentPageHeight,
        //   event.y,
        //   // currentZoomLevel,
        //   currentPageHeight * (this.pageCoordinates[1].pageNumber - 1) +
        //     (this.pageCoordinates[1].y - this.annotation.Height)
        // );

        const localComments = JSON.parse(
          localStorage.getItem('comments') ?? '[]'
        );
        localComments.push({
          id: this.annotation.Id,
          pos: this.pageCoordinates[1],
          highlightHeight: this.annotation.Height,
          pageHeight: currentPageHeight,
          zoomLevel: currentZoomLevel,
        });
        localStorage.setItem('comments', JSON.stringify(localComments));

        this.annotation.StrokeColor = new Core.Annotations.Color(0, 255, 255);
        annotationManager.redrawAnnotation(this.annotation); // need to redraw the annotation inside the tool so that it's updated right away.
      }
      highlightMouseUp.apply(this, arguments);
    };

    documentViewerInstance.value.setToolMode(highlightTool);
  };

  const measureDistanceTool = () => {
    const distanceMeasureTool = documentViewerInstance.value.getTool(
      window.Core.Tools.ToolNames.DISTANCE_MEASUREMENT
    );
    // distanceMeasureTool.setSnapMode(1);
    distanceMeasureTool.setStyles({
      // value of Scale is an array that is consisted of two arrays
      // the first element in each array is the scale ratio and the second element is the unit.
      // valid units are: mm, cm, m, km, mi, yd, ft, in and pt
      // the following array means that for the annotations created by the distance measurement tool, 0.25 inches on the document is equal to 1 inch in the real world
      Scale: [
        [0.25, 'in'],
        [1, 'in'],
      ],

      // value of Precision is a number that means how many decimal places the calculated value should have
      Precision: 0.001,
    });
    documentViewerInstance.value.setToolMode(distanceMeasureTool);
  };

  const calibrateDistance = () => {
    const annotationManager =
      documentViewerInstance.value.getAnnotationManager();
    const annotations = annotationManager.getAnnotationsList();
    const measurementAnnotations = annotations.filter(
      (annotation) => annotation.Measure
    );

    measurementAnnotations.forEach((annotation) => {
      annotationManager.setAnnotationStyles(annotation, {
        // value of Scale is an array that is consisted of two arrays
        // the first element in each array is the scale ratio and the second element is the unit.
        // valid units are: mm, cm, m, km, mi, yd, ft, in and pt
        // the following array means that for the annotations created by the distance measurement tool, 0.25 inches on the document is equal to 1 inch in the real world
        Scale: [
          [0.25, 'in'],
          [2, 'in'],
        ],

        // value of Precision is a number that means how many decimal places the calculated value should have
        Precision: 0.1,
      });
    });
  };

  const extractText = async () => {
    await Core.PDFNet.initialize();
    const doc = await documentViewerInstance.value.getDocument().getPDFDoc();
    const annotationManager =
      documentViewerInstance.value.getAnnotationManager();
    // export annotations from the document
    const annots = `<?xml version="1.0" encoding="UTF-8" ?><xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve"><pdf-info xmlns="http://www.pdftron.com/pdfinfo" version="2" import-version="4" /><fields /><annots><square page="0" rect="40,705.850,307.690,770.460" color="#42B883" flags="print" name="370644b2-a586-15c8-fcab-eb14c97a9438" subject="Rectangle" date="D:20230411194404+05'30'" creationdate="D:20230411194402+05'30'"/><square page="0" rect="64.620,582.770,398.460,642.770" color="#42B883" flags="print" name="9e890585-9574-4d6b-1fbc-07a3522e1372" subject="Rectangle" date="D:20230411194540+05'30'" creationdate="D:20230411194538+05'30'"/></annots><pages><defmtx matrix="1,0,0,-1,0,792" /></pages></xfdf>`;
    annotationManager.importAnnotations(annots);
    // Run PDFNet methods with memory management
    await Core.PDFNet.runWithCleanup(async () => {
      // lock the document before a write operation
      // runWithCleanup will auto unlock when complete
      doc.lock();
      // import annotations to PDFNet
      const fdf_doc = await Core.PDFNet.FDFDoc.createFromXFDF(annots);
      await doc.fdfUpdate(fdf_doc);
      const page = await doc.getPage(1);
      const rect = await page.getCropBox();
      const titleAnnot = await page.getAnnot(0);
      const descAnnot = await page.getAnnot(1);
      console.log(page, rect);
      const te = await Core.PDFNet.TextExtractor.create();
      te.begin(page, rect);
      const titleText = await te.getTextUnderAnnot(titleAnnot);
      const descText = await te.getTextUnderAnnot(descAnnot);
      console.log({ titleText, descText });
    });
  };

  const extractPages = async (pagesToExtract) => {
    const doc = documentViewerInstance.value.getDocument();
    const annotationManager =
      documentViewerInstance.value.getAnnotationManager();

    // only include annotations on the pages to extract
    const annotList = annotationManager
      .getAnnotationsList()
      .filter((annot) => pagesToExtract.indexOf(annot.PageNumber) > -1);
    const xfdfString = await annotationManager.exportAnnotations({ annotList });
    const data = await doc.extractPages(pagesToExtract, xfdfString);
    const arr = new Uint8Array(data);

    //optionally save the blob to a file or upload to a server
    const blob = new Blob([arr], { type: 'application/pdf' });
    console.log('blob', blob, data);
    // saveAs(blob, 'extracted.pdf');
    downloadBlob(blob, 'extracted.pdf');
  };

  const downloadPDF = async () => {
    const totalPages = documentViewerInstance.value.getPageCount();
    const pagesArr = createArrayFromCount(totalPages);
    pagesArr.length && extractPages(pagesArr);
  };

  const mergePages = () => {
    // array of url of PDFs to merge
    const urls = [
      // 'https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf',
      // 'https://pdftron.s3.amazonaws.com/downloads/pl/Cheetahs.pdf',
      // 'https://pdftron.s3.amazonaws.com/downloads/pl/magazine-short.pdf',
      '/sample.pdf',
      '/Plan.pdf',
    ];

    // recursive function with promise
    function mergeDocuments(urlArray, nextCount = 1, doc = null) {
      return new Promise(async function (resolve, reject) {
        if (!doc) {
          doc = await Core.createDocument(urlArray[0]);
        }
        const newDoc = await Core.createDocument(urlArray[nextCount]);
        const newDocPageCount = newDoc.getPageCount();

        // create an array containing 1…N
        const pages = createArrayFromCount(newDocPageCount);
        const pageIndexToInsert = doc.getPageCount() + 1;
        // in this example doc.getPageCount() returns 3

        doc.insertPages(newDoc, pages, pageIndexToInsert).then((result) =>
          resolve({
            next: urlArray.length - 1 > nextCount,
            doc: doc,
          })
        );
        // end Promise
      }).then((res) => {
        return res.next
          ? mergeDocuments(urlArray, nextCount + 1, res.doc)
          : res.doc;
      });
    }

    mergeDocuments(urls).then(async (mergedPdf) => {
      // merged pdf, here you can download it using mergedPdf.getFileData
      const data = await mergedPdf.getFileData();
      const arr = new Uint8Array(data);
      const blob = new Blob([arr], { type: 'application/pdf' });
      // saveAs(blob, 'merged.pdf');
      downloadBlob(blob, 'merged.pdf');
    });
  };

  return {
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
    extractText,
    extractPages,
    downloadPDF,
    mergePages,
  };
}
