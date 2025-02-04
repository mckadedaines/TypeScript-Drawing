interface Point {
  x: number;
  y: number;
}

type BrushType = "round" | "square" | "rainbow" | "spray" | "calligraphy";
type StampType = "star" | "circle" | "heart" | "square" | "triangle";
type Tool = "brush" | "stamp" | "eraser";

class DrawingApp {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private painting: boolean = false;
  private history: ImageData[] = [];
  private currentHistoryIndex: number = -1;

  // Controls
  private toolSelect: HTMLSelectElement;
  private brushTypeSelect: HTMLSelectElement;
  private stampTypeSelect: HTMLSelectElement;
  private colorPicker: HTMLInputElement;
  private brushSize: HTMLInputElement;
  private opacity: HTMLInputElement;
  private brushSizeValue: HTMLSpanElement;
  private opacityValue: HTMLSpanElement;
  private clearButton: HTMLButtonElement;
  private undoButton: HTMLButtonElement;
  private brushControls: HTMLDivElement;
  private stampControls: HTMLDivElement;

  // Drawing state
  private lastPoint: Point | null = null;
  private hue: number = 0;

  constructor(canvasId: string) {
    // Initialize canvas
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d")!;

    // Initialize controls
    this.toolSelect = document.getElementById(
      "toolSelect"
    ) as HTMLSelectElement;
    this.brushTypeSelect = document.getElementById(
      "brushType"
    ) as HTMLSelectElement;
    this.stampTypeSelect = document.getElementById(
      "stampType"
    ) as HTMLSelectElement;
    this.colorPicker = document.getElementById(
      "colorPicker"
    ) as HTMLInputElement;
    this.brushSize = document.getElementById("brushSize") as HTMLInputElement;
    this.opacity = document.getElementById("opacity") as HTMLInputElement;
    this.brushSizeValue = document.getElementById(
      "brushSizeValue"
    ) as HTMLSpanElement;
    this.opacityValue = document.getElementById(
      "opacityValue"
    ) as HTMLSpanElement;
    this.clearButton = document.getElementById(
      "clearCanvas"
    ) as HTMLButtonElement;
    this.undoButton = document.getElementById(
      "undoButton"
    ) as HTMLButtonElement;
    this.brushControls = document.querySelector(
      ".brush-controls"
    ) as HTMLDivElement;
    this.stampControls = document.querySelector(
      ".stamp-controls"
    ) as HTMLDivElement;

    // Set initial drawing style
    this.context.lineCap = "round";
    this.context.lineJoin = "round";
    this.updateBrushSize();
    this.updateOpacity();
    this.saveState();

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Canvas drawing events
    this.canvas.addEventListener("mousedown", this.startPainting.bind(this));
    this.canvas.addEventListener("mouseup", this.stopPainting.bind(this));
    this.canvas.addEventListener("mousemove", this.paint.bind(this));
    this.canvas.addEventListener("mouseleave", this.stopPainting.bind(this));

    // Touch events
    this.canvas.addEventListener("touchstart", this.handleTouch.bind(this));
    this.canvas.addEventListener("touchend", this.stopPainting.bind(this));
    this.canvas.addEventListener("touchmove", this.handleTouch.bind(this));

    // Control events
    this.toolSelect.addEventListener(
      "change",
      this.updateToolControls.bind(this)
    );
    this.brushSize.addEventListener("input", this.updateBrushSize.bind(this));
    this.opacity.addEventListener("input", this.updateOpacity.bind(this));
    this.clearButton.addEventListener("click", this.clearCanvas.bind(this));
    this.undoButton.addEventListener("click", this.undo.bind(this));
  }

  private updateToolControls(): void {
    const selectedTool = this.toolSelect.value as Tool;
    this.brushControls.style.display =
      selectedTool === "brush" ? "flex" : "none";
    this.stampControls.style.display =
      selectedTool === "stamp" ? "flex" : "none";

    // Hide color picker for eraser
    const colorPickerGroup = this.colorPicker.closest(
      ".control-group"
    ) as HTMLElement;
    colorPickerGroup.style.display =
      selectedTool === "eraser" ? "none" : "flex";
  }

  private updateBrushSize(): void {
    const size = this.brushSize.value;
    this.context.lineWidth = Number(size);
    this.brushSizeValue.textContent = `${size}px`;
  }

  private updateOpacity(): void {
    const opacity = this.opacity.value;
    this.context.globalAlpha = Number(opacity) / 100;
    this.opacityValue.textContent = `${opacity}%`;
  }

  private saveState(): void {
    const imageData = this.context.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    this.history = this.history.slice(0, this.currentHistoryIndex + 1);
    this.history.push(imageData);
    this.currentHistoryIndex++;
  }

  private undo(): void {
    if (this.currentHistoryIndex > 0) {
      this.currentHistoryIndex--;
      const imageData = this.history[this.currentHistoryIndex];
      this.context.putImageData(imageData, 0, 0);
    }
  }

  private clearCanvas(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.saveState();
  }

  private startPainting(event: MouseEvent): void {
    this.painting = true;
    const point = this.getPoint(event);
    if (this.toolSelect.value === "stamp") {
      this.drawStamp(point);
    } else {
      this.lastPoint = point;
      this.paint(event);
    }
  }

  private stopPainting(): void {
    if (this.painting) {
      this.painting = false;
      this.lastPoint = null;
      this.context.beginPath();
      if (this.toolSelect.value !== "stamp") {
        this.saveState();
      }
    }
  }

  private getPoint(event: MouseEvent | Touch): Point {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  private paint(event: MouseEvent): void {
    if (!this.painting) return;

    const currentPoint = this.getPoint(event);
    if (!this.lastPoint) {
      this.lastPoint = currentPoint;
      return;
    }

    if (this.toolSelect.value === "eraser") {
      this.erase(currentPoint);
    } else if (this.toolSelect.value === "stamp") {
      this.drawStamp(currentPoint);
    } else {
      const brushType = this.brushTypeSelect.value as BrushType;
      switch (brushType) {
        case "rainbow":
          this.drawRainbowBrush(currentPoint);
          break;
        case "spray":
          this.drawSprayBrush(currentPoint);
          break;
        case "square":
          this.drawSquareBrush(currentPoint);
          break;
        case "calligraphy":
          this.drawCalligraphyBrush(currentPoint);
          break;
        default:
          this.drawRegularBrush(currentPoint);
      }
    }

    this.lastPoint = currentPoint;
  }

  private drawRegularBrush(point: Point): void {
    this.context.strokeStyle = this.colorPicker.value;
    this.context.lineTo(point.x, point.y);
    this.context.stroke();
    this.context.beginPath();
    this.context.moveTo(point.x, point.y);
  }

  private drawRainbowBrush(point: Point): void {
    this.hue = (this.hue + 1) % 360;
    this.context.strokeStyle = `hsl(${this.hue}, 100%, 50%)`;
    this.context.lineTo(point.x, point.y);
    this.context.stroke();
    this.context.beginPath();
    this.context.moveTo(point.x, point.y);
  }

  private drawSprayBrush(point: Point): void {
    const density = 50;
    const radius = Number(this.brushSize.value);

    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const x = point.x + r * Math.cos(angle);
      const y = point.y + r * Math.sin(angle);

      this.context.beginPath();
      this.context.fillStyle = this.colorPicker.value;
      this.context.arc(x, y, 0.5, 0, Math.PI * 2);
      this.context.fill();
    }
  }

  private drawSquareBrush(point: Point): void {
    const size = Number(this.brushSize.value);
    this.context.fillStyle = this.colorPicker.value;
    this.context.fillRect(point.x - size / 2, point.y - size / 2, size, size);
  }

  private drawCalligraphyBrush(point: Point): void {
    this.context.save();
    this.context.translate(point.x, point.y);
    this.context.rotate(-Math.PI / 4);
    this.context.scale(2, 0.5);

    this.context.beginPath();
    this.context.arc(0, 0, Number(this.brushSize.value), 0, Math.PI * 2);
    this.context.fillStyle = this.colorPicker.value;
    this.context.fill();

    this.context.restore();
  }

  private drawStamp(point: Point): void {
    const stampType = this.stampTypeSelect.value as StampType;
    const size = Number(this.brushSize.value) * 2;

    this.context.save();
    this.context.translate(point.x, point.y);
    this.context.fillStyle = this.colorPicker.value;

    switch (stampType) {
      case "star":
        this.drawStar(size);
        break;
      case "heart":
        this.drawHeart(size);
        break;
      case "triangle":
        this.drawTriangle(size);
        break;
      case "square":
        this.drawSquareStamp(size);
        break;
      case "circle":
        this.drawCircle(size);
        break;
    }

    this.context.restore();
    this.saveState();
  }

  private drawStar(size: number): void {
    const spikes = 5;
    const outerRadius = size / 2;
    const innerRadius = outerRadius / 2;

    this.context.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) this.context.moveTo(x, y);
      else this.context.lineTo(x, y);
    }
    this.context.closePath();
    this.context.fill();
  }

  private drawHeart(size: number): void {
    const scale = size / 100;
    this.context.scale(scale, scale);
    this.context.beginPath();

    // Move to the top middle of the heart
    this.context.moveTo(50, 15);

    // Left curve
    this.context.bezierCurveTo(50, 12, 40, 0, 15, 0);
    this.context.bezierCurveTo(-10, 0, -10, 37.5, -10, 37.5);
    this.context.bezierCurveTo(-10, 55, 20, 77, 50, 95);

    // Right curve
    this.context.bezierCurveTo(80, 77, 110, 55, 110, 37.5);
    this.context.bezierCurveTo(110, 37.5, 110, 0, 85, 0);
    this.context.bezierCurveTo(60, 0, 50, 12, 50, 15);

    this.context.closePath();
    this.context.fill();
  }

  private drawTriangle(size: number): void {
    const height = (size * Math.sqrt(3)) / 2;
    this.context.beginPath();
    this.context.moveTo(0, -height / 2);
    this.context.lineTo(-size / 2, height / 2);
    this.context.lineTo(size / 2, height / 2);
    this.context.closePath();
    this.context.fill();
  }

  private drawSquareStamp(size: number): void {
    this.context.fillRect(-size / 2, -size / 2, size, size);
  }

  private drawCircle(size: number): void {
    this.context.beginPath();
    this.context.arc(0, 0, size / 2, 0, Math.PI * 2);
    this.context.fill();
  }

  private erase(point: Point): void {
    const size = Number(this.brushSize.value);
    this.context.save();

    // Set composite operation to destination-out to create eraser effect
    this.context.globalCompositeOperation = "destination-out";

    // Draw a circle for smooth erasing
    this.context.beginPath();
    this.context.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
    this.context.fill();

    // Reset composite operation
    this.context.restore();
  }

  private handleTouch(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];

    if (event.type === "touchstart") {
      this.painting = true;
      if (this.toolSelect.value === "stamp") {
        this.drawStamp(this.getPoint(touch));
      } else {
        this.lastPoint = this.getPoint(touch);
      }
    } else if (event.type === "touchmove" && this.painting) {
      this.paint(touch as unknown as MouseEvent);
    }
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new DrawingApp("drawingCanvas");
});
