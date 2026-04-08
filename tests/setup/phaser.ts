const canvasContextStub = {
  fillStyle: "",
  globalCompositeOperation: "source-over",
  clearRect: () => {},
  createImageData: (width: number, height: number) => ({
    data: new Uint8ClampedArray(width * height * 4)
  }),
  drawImage: () => {},
  fillRect: () => {},
  getImageData: () => ({
    data: new Uint8ClampedArray([255, 0, 0, 255])
  }),
  measureText: () => ({ width: 0 }),
  putImageData: () => {},
  restore: () => {},
  save: () => {},
  scale: () => {},
  setTransform: () => {},
  translate: () => {}
};

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  configurable: true,
  value: () => canvasContextStub
});
