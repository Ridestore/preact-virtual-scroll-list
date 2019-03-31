import preact from 'preact';
import RSVirtualListX from './vlist';
import Item from './item';

export default class App extends preact.Component {
  componentDidMount() {
    window.addEventListener('resize', () => this.forceUpdate());
  }
  render({ products }) {
    return (
      <div id="app">
        <header><h1>test header</h1></header>
        <RSVirtualListX
          className="vlist"
          innerWidth={ window.innerWidth }
          itemsBufferLength={ 6 }
          rowBuffer={ 2 }
          items={ products }
          itemRenderFn={ item => <Item key={ item.id } item={ item } /> }
          plugRenderFn={ item => <a key={ item.id } className="rs-products-list-item" /> }
        />
      </div>
    )
  }
}
