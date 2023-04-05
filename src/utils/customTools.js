class TriangleAnnotation extends Annotations.CustomAnnotation {
  constructor() {
    super('triangle'); // provide the custom XFDF element name
    this.Subject = 'Triangle';
  }

  draw(ctx, pageMatrix) {
    // the setStyles function is a function on markup annotations that sets up
    // certain properties for us on the canvas for the annotation's stroke thickness.
    this.setStyles(ctx, pageMatrix);

    // first we need to translate to the annotation's x/y coordinates so that it's
    // drawn in the correct location
    ctx.translate(this.X, this.Y);
    ctx.beginPath();
    ctx.moveTo(this.Width / 2, 0);
    ctx.lineTo(this.Width, this.Height);
    ctx.lineTo(0, this.Height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

// this is necessary to set the elementName before instantiation
TriangleAnnotation.prototype.elementName = 'triangle';
TriangleAnnotation.prototype.cursor = 'crosshair';

// register the annotation type so that it can be saved to XFDF files
documentViewer
  .getAnnotationManager()
  .registerAnnotationType(
    TriangleAnnotation.prototype.elementName,
    TriangleAnnotation
  );

class TriangleCreateTool extends Tools.GenericAnnotationCreateTool {
  constructor(documentViewer) {
    // TriangleAnnotation is the class (function) for our annotation we defined previously
    super(documentViewer, TriangleAnnotation);
  }
}

const triangleToolName = 'AnnotationCreateTriangle';
const triangleTool = new TriangleCreateTool(documentViewer);
triangleTool.name = triangleToolName;
console.log('triangleToolName', triangleToolName, triangleTool);
