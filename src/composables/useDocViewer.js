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

  const customIconAnnotation = async () => {
    const res = await fetch('/vite.svg'); // Include custom headers as necessary
    const imageBlob = await res.blob();
    const reader = new FileReader();
    reader.onloadend = async () => {
      const annot = new Core.Annotations.StampAnnotation({
        PageNumber: documentViewerInstance.value.getCurrentPage(),
        X: 100,
        Y: 400,
        Width: 25,
        Height: 25,
      });
      annot.cursor = 'crosshair';

      console.log('stamp', annot);

      const base64data = reader.result;
      await annot.setImageData(base64data, { keepAsSVG: true }); // Base64 URL or SVG, default is png
      annot.NoZoom = true;
      annot.NoRotate = true;
      annot.disableRotationControl();
      console.log('annot', annot);
      // annot.NoResize = true;
      // annot.Locked = true; // No rotate does not work
      // annot.NoMove = false;

      // documentViewerInstance.value.on('click', (event) => {
      //   // Todo: Refactor later
      //   // const viewerElem = document.getElementById('viewer');
      //   // annot.X = event.x - viewerElem.offsetLeft;
      //   // annot.Y = event.y - viewerElem.offsetTop;
      //   annot.X = event.x;
      //   annot.Y = event.y;
      //   documentViewerInstance.value
      //     .getAnnotationManager()
      //     .addAnnotation(annot);
      //   // console.log('CLICKED', event, annot.getMouseLocation(event));
      //   documentViewerInstance.value
      //     .getAnnotationManager()
      //     .redrawAnnotation(annot);
      // });

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

  // Dummy
  const customStampTool = (e) => {
    console.clear();
    console.log('SELECTED ANNOTATIONS', selectedAnnotations());
    const stampTool = new Core.Tools.StampCreateTool(
      documentViewerInstance.value
    );
    stampTool.ACCEPTED_IMAGE_TYPES = 'svg';
    console.log('customStampTool', stampTool, e, stampTool.getMouseLocation(e));
  };

  const generateThumbnail = () => {
    const doc = documentViewerInstance.value.getDocument();
    const pageNum = documentViewerInstance.value.getCurrentPage();
    doc.loadThumbnail(pageNum, (thumbnail) => {
      // thumbnail is a HTMLCanvasElement or HTMLImageElement
      console.log(`Thumbnail generated for page ${pageNum}`, thumbnail);
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
    customIconAnnotation,
    deleteSelectedAnnotations,
    customStampTool,
    generateThumbnail,
  };
}
