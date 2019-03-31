import preact from 'preact';

/** @type {Window} */
const wnd = typeof window !== 'undefined' ? window : false;
/** @type {(callback: FrameRequestCallback) => number} */
const raf = wnd && (wnd.requestAnimationFrame ||
  wnd.webkitRequestAnimationFrame ||
  wnd.mozRequestAnimationFrame ||
  wnd.msRequestAnimationFrame ||
  wnd.oRequestAnimationFrame);

export default class RSVirtualListX extends preact.Component {
  constructor(props) {
    super(props);
    this.scrollHandlerFn = this.scrollHandler.bind(this);
    this.loopFn = this.loop.bind(this);
    this.state = {
      itemsBuffer: [],
      endRow: 1,
    };
  }

  loop() {
    const { rowBuffer } = this.props;
    const { scrollBoxTop, viewBoxHeight, flexRowHeight, visibleRows, flexItemsPerRow } = this;
    /** calculate window scroll Y */
    const viewBoxScrollY = wnd.scrollY;

    /** visible area - user's visible area rectangle */
    const visibleAreaTop = viewBoxScrollY >= scrollBoxTop ? 0 : scrollBoxTop - viewBoxScrollY;
    const visibleAreaHeight = viewBoxHeight - visibleAreaTop;
    const realVisibleRows = viewBoxScrollY ? visibleRows : Math.round(visibleAreaHeight / flexRowHeight);

    /** visible items */
    let startRow = Math.floor((viewBoxScrollY - scrollBoxTop) / flexRowHeight);

    if (rowBuffer) {
      startRow -= rowBuffer;
    }

    startRow = startRow < 0 ? 0 : startRow; // can't be less than 0
    let endRow = startRow + realVisibleRows - 1;

    const heightX = flexRowHeight * (1.00000000000000001);
    const countHeightX = Math.floor(viewBoxScrollY / heightX);
    endRow = countHeightX > startRow ? endRow + 1 : endRow;

    if (rowBuffer) {
      endRow += rowBuffer;
    }

    const sliceStart = startRow * flexItemsPerRow;
    const sliceEnd = (endRow + 1) * flexItemsPerRow - 1;

    if (this.state.endRow !== endRow) {
      this.setState((prevState) => {
        if (prevState.endRow !== endRow) {
          return {
            itemsBuffer: this.getBufferElements(sliceStart, sliceEnd),
            endRow,
          };
        }
      })
    }
  }

  scrollHandler() {
    raf(this.loopFn);
  }

  componentWillReceiveProps() {
    this.recalculateData();
  }

  recalculateData() {
    const { items } = this.props;
    /** calculate static values */
    this.viewBoxHeight = wnd.innerHeight;
    this.scrollBoxTop = this.base.offsetTop;

    /** calculate static flex row length */
    const grid = Array.from(this.base.children);
    // .filter(x => !x.dataset.plug)
    const baseOffset = grid[0].offsetTop;
    const breakIndex = grid.findIndex(item => item.offsetTop > baseOffset);
    this.flexItemsPerRow = (breakIndex === -1 ? grid.length : breakIndex);
    this.rowsCount = Math.ceil(items.length / this.flexItemsPerRow);

    /** calculate static values */
    const betweenColumnsGap = 5;
    this.flexItemClientRect = grid[0].getBoundingClientRect();
    this.flexRowHeight = this.flexItemClientRect.height + (betweenColumnsGap / 2);
    this.scrollBoxHeight = this.flexRowHeight * this.rowsCount;
    this.visibleRows = Math.ceil(this.viewBoxHeight / this.flexRowHeight);

    /** trigger first loop */
    this.scrollHandler();
  }

  getBufferElements(sliceStart, sliceEnd) {
    const { itemRenderFn, items, plugRenderFn } = this.props;
    const bufferElements = [];
    /** for ... i++ is faster than map or forEach with slice */
    for (let i = 0, x = items.length; i < x; i++) {
      bufferElements.push(i < sliceStart || i > sliceEnd
        ? plugRenderFn(items[i]) : itemRenderFn(items[i]));
    }
    return bufferElements;
  }

  componentWillMount() {
    const sliceEnd = this.props.itemsBufferLength || 6;
    this.state.itemsBuffer = this.getBufferElements(0, sliceEnd);
    this.state.endRow = -1;
    window.rtest = this.recalculateData.bind(this);
  }

  componentDidMount() {
    /** no need these calculations for ssr */
    if (!wnd) return;
    /** setup passive scroll listener */
    wnd.addEventListener('scroll', this.scrollHandlerFn, { passive: true });
    this.recalculateData();
  }

  componentWillUnmount() {
    if (wnd) { wnd.removeEventListener('scroll', this.scrollHandlerFn); }
  }

  render({ className }, { itemsBuffer }) {
    return (
      <section className={ className } id="vlist">
        { itemsBuffer }
      </section>
    );
  }
}