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
    documentViewerInstance.value.setToolMode(
      documentViewerInstance.value.getTool(
        window.Core.Tools.ToolNames.RECTANGLE
      )
    );
    console.log(
      'getToolModeMap',
      documentViewerInstance.value.getToolModeMap(),
      documentViewerInstance.value.getTool(
        window.Core.Tools.ToolNames.RECTANGLE
      )
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

  const selectTool = () => {
    documentViewerInstance.value.setToolMode(
      documentViewerInstance.value.getTool(window.Core.Tools.ToolNames.EDIT)
    );
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
        Width: 40,
        Height: 40,
      });

      const base64data = reader.result;
      await annot.setImageData(base64data, { keepAsSVG: true }); // Base64 URL or SVG, default is png
      annot.NoResize = true;
      annot.NoZoom = true;
      annot.NoRotate = true;
      documentViewerInstance.value.getAnnotationManager().addAnnotation(annot);
      documentViewerInstance.value
        .getAnnotationManager()
        .redrawAnnotation(annot);
    };
    reader.readAsDataURL(imageBlob);
  };

  const createStamp = () => {
    documentViewerInstance.value.setToolMode(
      documentViewerInstance.value.getTool(window.Core.Tools.ToolNames.STAMP)
    );
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
    createStamp,
  };
}
