/* eslint-disable no-plusplus */
import { Component } from 'preact';

/** @type {Window} */
const wnd = typeof window !== 'undefined' ? window : false;
/** @type {(callback: FrameRequestCallback) => number} */
const raf = wnd && (wnd.requestAnimationFrame ||
  wnd.webkitRequestAnimationFrame ||
  wnd.mozRequestAnimationFrame ||
  wnd.msRequestAnimationFrame ||
  wnd.oRequestAnimationFrame).bind(wnd);

export default class RSVirtualScrollList extends Component {
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
    const { rowBuffer, scrollArea } = this.props;
    const { scrollBoxTop, viewBoxHeight, flexRowHeight, visibleRows, flexItemsPerRow } = this;
    /** calculate window scroll Y */
    const viewBoxScrollY = scrollArea ? scrollArea.scrollTop : wnd.scrollY;

    /** visible area - user's visible area rectangle */
    const visibleAreaTop = viewBoxScrollY >= scrollBoxTop ? 0 : scrollBoxTop - viewBoxScrollY;
    const visibleAreaHeight = viewBoxHeight - visibleAreaTop;
    const realVisibleRows = viewBoxScrollY
      ? visibleRows : Math.round(visibleAreaHeight / flexRowHeight);

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
          const _items = this.getBufferElements(sliceStart, sliceEnd);
          return {
            itemsBuffer: _items,
            endRow,
          };
        }
        return null;
      });
    }
  }

  scrollHandler() {
    raf(this.loopFn);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.uniqueListKey && nextProps.uniqueListKey !== this.props.uniqueListKey) {
      this.state.endRow = -1; // this action will force items re-rendering
      this.props.items = nextProps.items;
    }
    this.recalculateData();
  }

  recalculateData() {
    const { items } = this.props;
    /** calculate static values */
    this.viewBoxHeight = wnd.innerHeight;
    if (!this.base) return;
    this.scrollBoxTop = this.base.offsetTop;

    /** calculate static flex row length */
    const grid = this.base && this.base.children ? Array.from(this.base.children) : [];
    const baseOffset = grid[0] ? grid[0].offsetTop : 0;
    const breakIndex = grid.findIndex(item => item.offsetTop > baseOffset);
    this.flexItemsPerRow = (breakIndex === -1 ? grid.length : breakIndex);
    this.rowsCount = Math.ceil(items.length / this.flexItemsPerRow);

    /** calculate static values */
    const betweenColumnsGap = 5;
    this.flexItemClientRect = grid[0] ? grid[0].getBoundingClientRect() : null;
    this.flexRowHeight = this.flexItemClientRect ? this.flexItemClientRect.height + (betweenColumnsGap / 2) : 0;
    this.scrollBoxHeight = this.flexRowHeight * this.rowsCount;
    this.visibleRows = Math.ceil(this.viewBoxHeight / this.flexRowHeight);

    if (this.flexRowHeight > 1500 && !this.recalculatedTwice) {
      this.recalculatedTwice = setTimeout(() => this.recalculateData(), 200);
    }

    /** trigger first loop */
    this.scrollHandler();
  }

  getBufferElements(sliceStart, sliceEnd) {
    const { itemRenderFn, items, plugRenderFn, onItemsReqCallback } = this.props;
    const bufferElements = [];
    /** for ... i++ is faster than map or forEach with slice */
    const _sliceStart = sliceStart > ((items.length - 1) - this.flexItemsPerRow)
      ? (items.length - 1) - this.flexItemsPerRow : sliceStart;
    for (let i = 0, x = items.length; i < x; i++) {
      bufferElements.push(i < _sliceStart || i > sliceEnd
        ? plugRenderFn(items[i], i) : itemRenderFn(items[i], i));
    }
    if (onItemsReqCallback) {
      const visibleItemsCount = this.visibleRows * this.flexItemsPerRow;
      if (!Number.isNaN(visibleItemsCount)) {
        onItemsReqCallback({
          sliceStart: _sliceStart,
          sliceEnd,
          visibleItemsCount,
        });
      }
    }
    return bufferElements;
  }

  componentWillMount() {
    const sliceEnd = this.props.itemsBufferLength || 6;
    this.state.itemsBuffer = this.getBufferElements(0, sliceEnd);
    this.state.endRow = -1;

    /** inner integrity tests */
    const { items, keyFunction, itemRenderFn, plugRenderFn } = this.props;
    switch (true) {
      case this.props.scrollArea === wnd:
        throw new Error('RSVirtualScrollList scrollArea shouldn\'t be a Window, use null instead');
      case !this.props.uniqueListKey:
        throw new Error('RSVirtualScrollList should have a uniqueListKey property');
      case !itemRenderFn:
        throw new Error('RSVirtualScrollList should have a itemRenderFn function property');
      case !plugRenderFn:
        throw new Error('RSVirtualScrollList should have a plugRenderFn function property');
      case !keyFunction:
        throw new Error('RSVirtualScrollList should have a keyFunction function property');
      case items && items.length && keyFunction(items[0]) === keyFunction(items[0], true):
        throw new Error('RSVirtualScrollList keyFunction should return the different values for the fake objects');
      case items && items.length && items[0] && items[1] && keyFunction(items[0]) === keyFunction(items[1]):
        throw new Error('RSVirtualScrollList keyFunction should return the different values for the objects');
      default: break;
    }
  }

  componentDidMount() {
    const scrollArea = this.props.scrollArea || wnd;
    /** no need these calculations for ssr */
    if (!wnd && !scrollArea) return;
    if (wnd && typeof wnd.document.createElement('div').style.grid === 'string') {
      /** setup passive scroll listener */
      scrollArea.addEventListener('scroll', this.scrollHandlerFn, { passive: true });
      this.recalculateData();
      if (this.scrollBoxTop > 1000) {
        setTimeout(() => this.recalculateData(), 100);
      }
    }
    else {
      setTimeout(() => {
        this.setState({
          itemsBuffer: this.getBufferElements(0, this.props.items.length - 1),
        });
      });
    }
  }

  componentWillUnmount() {
    const scrollArea = this.props.scrollArea || wnd;
    if (scrollArea) { scrollArea.removeEventListener('scroll', this.scrollHandlerFn); }
  }

  render({ children }, { itemsBuffer }) {
    return { ...children[0], children: itemsBuffer };
  }
}
