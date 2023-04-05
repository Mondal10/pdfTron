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
        X: x,
        Y: y,
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
      console.log(`Thumbnail generated for page ${pageNum}`, thumbnail);
    });
  };

  const createHighlight = () => {
    documentViewerInstance.value.setToolMode(
      documentViewerInstance.value.getTool(
        window.Core.Tools.ToolNames.HIGHLIGHT
      )
    );
  };

  const measureDistanceTool = () => {
    const distanceMeasureTool = documentViewerInstance.value.getTool(
      window.Core.Tools.ToolNames.DISTANCE_MEASUREMENT
    );
    documentViewerInstance.value.setToolMode(distanceMeasureTool);
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
  };
}
