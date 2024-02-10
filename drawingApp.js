"use strict";
class DrawingApp {
    constructor(canvasId) {
        this.painting = false;
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d');
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.startPainting.bind(this));
        this.canvas.addEventListener('mouseup', this.stopPainting.bind(this));
        this.canvas.addEventListener('mousemove', this.paint.bind(this));
        this.canvas.addEventListener('mouseleave', this.stopPainting.bind(this));
    }
    startPainting(event) {
        this.painting = true;
        this.paint(event);
    }
    stopPainting() {
        this.painting = false;
        this.context.beginPath(); // Reset the context path to start a new path
    }
    paint(event) {
        if (!this.painting)
            return;
        this.context.lineWidth = 5;
        this.context.lineCap = 'round';
        const { offsetLeft, offsetTop } = this.canvas;
        const x = event.clientX - offsetLeft;
        const y = event.clientY - offsetTop;
        this.context.lineTo(x, y);
        this.context.stroke();
        this.context.beginPath();
        this.context.moveTo(x, y);
    }
}
new DrawingApp('drawingCanvas');
