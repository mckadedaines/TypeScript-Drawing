class DrawingApp {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private painting: boolean = false;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.context = this.canvas.getContext('2d')!;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.canvas.addEventListener('mousedown', this.startPainting.bind(this));
        this.canvas.addEventListener('mouseup', this.stopPainting.bind(this));
        this.canvas.addEventListener('mousemove', this.paint.bind(this));
        this.canvas.addEventListener('mouseleave', this.stopPainting.bind(this));
    }

    private startPainting(event: MouseEvent): void {
        this.painting = true;
        this.paint(event);
    }

    private stopPainting(): void {
        this.painting = false;
        this.context.beginPath(); // Reset the context path to start a new path
    }

    private paint(event: MouseEvent): void {
        if (!this.painting) return;
        this.context.lineWidth = 5;
        this.context.lineCap = 'round';
        const {offsetLeft, offsetTop} = this.canvas;
        const x = event.clientX - offsetLeft;
        const y = event.clientY - offsetTop;
        this.context.lineTo(x, y);
        this.context.stroke();
        this.context.beginPath();
        this.context.moveTo(x, y);
    }
}

new DrawingApp('drawingCanvas');
