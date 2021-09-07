import preact from 'preact';
import RSVirtualScrollList from './vlist';
import Item from './item';

const keyFunction = (rowData, isFakeRow) => `${ rowData.objectID }${ isFakeRow ? 'fake' : '' }`;

export default class App extends preact.Component {
  componentDidMount() {
    // window.addEventListener('resize', () => this.forceUpdate());
  }
  componentDidUpdate() {
    console.log('rolll...');
  }
  render({ products, filtered }, { roll }) {
    return (
      <div id="app">
        <header>
          <div class="dtbrandheader">
            <div class="dtbrandheader__left">
              <h1 class="dtbrandheader__header">Dope</h1>
              <div class="dtbrandheader__description">A bad day riding is better than a good day at work!</div>
            </div>
            <div class="dtbrandheader__image" style="background-image: url(https://d10g92rh9h0kij.cloudfront.net/media/catalog/category/dopeheaderzermatt_1.jpg);" />
          </div>
          {/* <!-- simple click on the line below to change the data for the test --> */}
          <div class="dtactions" onClick={ () => this.setState(prevState => ({ roll: !prevState.roll }))}>
            <div class="dtactions__filterspanel">
              <div class="dtselectbox">
                <button aria-label="Department" class="filterblock">
                  <div class="filterblock__label">Department</div>
                  <div class="filterblock__plus">+</div>
                  <div class="dtselectbox__picdn"></div>
                </button>
                <div class="dtselectbox__dropdown dtselectbox__dropdown--hidden">
                  <div class="dtselectbox__positioner" style="">
                    <div class="dtsortselector__dropdown">
                      <button class="dtselectbox__selectbtn">Streetwear</button>
                      <button class="dtselectbox__selectbtn">Snow</button>
                      <button class="dtselectbox__selectbtn">Skate</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="dtactions__sortpanel">
              <div class="dtselectbox">
                <button class="dtsortselector" aria-label="Sort by">
                  <span class="dtsortselector__sortbytext" data-e2e="sort">Sort by</span>
                  <span class="dtsortselector__sortbylabel">Hot products</span>
                  <div class="dtselectbox__picdn"></div>
                </button>
                <div class="dtselectbox__dropdown dtselectbox__dropdown--hidden">
                  <div class="dtselectbox__positioner" style="">
                    <div class="dtsortselector__dropdown">
                      <button class="dtselectbox__selectbtn">Cheapest first</button>
                      <button class="dtselectbox__selectbtn">Latest first</button>
                      <button class="dtselectbox__selectbtn">Hot products</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <RSVirtualScrollList
          innerWidth={ window.innerWidth } // resize updates
          itemsBufferLength={ 6 } // initial items count
          rowBuffer={ 2 } // render visible rows + this to bottom and to top
          items={ !roll ? products : filtered } // products
          uniqueListKey={ !roll ? 1 : 2 } // force re-rendering on change
          itemRenderFn={ item => <Item key={ keyFunction(item) } item={ item } /> }
          plugRenderFn={ item => <article key={ keyFunction(item) } className="rs-products-list-item" /> }
          keyFunction={ keyFunction }
        >
          <section className="vlist" id="vlist" />
        </RSVirtualScrollList>

      </div>
    )
  }
}
