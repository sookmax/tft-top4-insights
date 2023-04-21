let instance: ScrollListener | undefined;

export type ScrollListenerCallback = (instance: ScrollListener) => void;

export default class ScrollListener {
  private _requested = false;
  private _callbacks: Set<ScrollListenerCallback> = new Set();
  private _registered = false;

  public prevScrollY: number | undefined;

  public scrollDirection: "up" | "down" | undefined;
  public prevScrollDirection: "up" | "down" | undefined;

  public overscrolledAtBottom: boolean | undefined;
  public scrollProgress: number | undefined;

  constructor() {
    if (instance) return instance;

    this._listener = this._listener.bind(this);

    instance = this;
  }

  private _listener() {
    if (!this._requested) {
      this._requested = true;
      requestAnimationFrame(() => {
        this.overscrolledAtBottom = this._isOverscrolledAtBottom();

        const scrollDiff = this.prevScrollY
          ? window.scrollY - this.prevScrollY
          : 0;
        this.scrollDirection =
          scrollDiff > 0 ? "down" : scrollDiff < 0 ? "up" : undefined;

        this.scrollProgress = this._getScrollProgress();

        this._callbacks.forEach((listener) => listener(this));

        // update the previous scrollY
        this.prevScrollY = window.scrollY;

        // update the previous scrollDirection
        this.prevScrollDirection = this.scrollDirection;

        this._requested = false;
      });
    }
  }

  public resetState() {
    this.prevScrollY = undefined;
    this.scrollDirection = undefined;
    this.prevScrollDirection = undefined;
    this.overscrolledAtBottom = this._isOverscrolledAtBottom();
    this.scrollProgress = undefined;
  }

  public call() {
    this._listener();
  }

  public add(callback: ScrollListenerCallback) {
    if (!this._registered) {
      document.addEventListener("scroll", this._listener, { passive: true });
      this._registered = true;
    }

    this._callbacks.add(callback);
  }

  public remove(callback: ScrollListenerCallback) {
    if (this._callbacks.has(callback)) {
      this._callbacks.delete(callback);
      if (this._callbacks.size === 0 && this._registered) {
        document.removeEventListener("scroll", this._listener);
        this._registered = false;
      }
    }
  }

  private _getScrollProgress() {
    return document.documentElement.scrollHeight - window.innerHeight !== 0
      ? window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)
      : 0;
  }

  private _isOverscrolledAtBottom() {
    return (
      window.scrollY > 0 &&
      window.scrollY + window.innerHeight >
        document.documentElement.scrollHeight
    );
  }
}
