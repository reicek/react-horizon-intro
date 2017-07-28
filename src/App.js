import React, { Component } from 'react';
import './App.css';
import Horizon from '@horizon/client';

const horizon = new Horizon({host: 'localhost:8181'});
const weNeedList_collection = horizon('weNeedList');
const weHaveList_collection = horizon('weHaveList');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      weNeedList : [],
      weHaveList : [],
      user : '',
    };
    this.updateUser = this.updateUser.bind(this);
  }

  render() {
    return (
      <div
        className= 'app'>
        <h1>Party Checklist</h1>
        <p>I am:</p>
        <input
          value = {this.state.user}
          onChange = {this.updateUser} />
        <NewItem />
        <WeNeedList
          items = {this.state.weNeedList}
          user = {this.state.user} />
        <WeHaveList
          items = {this.state.weHaveList} />
      </div>
    );
  }

  updateUser(e) {
    this.setState({user: e.target.value});
  }

  componentDidMount(){
    horizon.connect();

    horizon
      .onReady()
        .subscribe(() =>
          console.info('Connected to Horizon server'));

    horizon
      .onDisconnected()
        .subscribe(() =>
          console.info('Disconnected from Horizon server'));

    weNeedList_collection
      .order('id')
        .watch()
          .subscribe(allItems =>
            this.setState({weNeedList: allItems}),
            error => console.error(error));

    weHaveList_collection
      .order('id')
        .watch()
          .subscribe(allItems =>
            this.setState({weHaveList: allItems}),
            error => console.error(error));
  }
}

class NewItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      item  : '',
    };
    this.updateItem = this.updateItem.bind(this);
    this.insertItem = this.insertItem.bind(this);
  }
  render() {
    return (
      <div>
        <p>Add to need list:</p>
        <form
          onSubmit = {this.insertItem}>
          <input
            value = {this.state.item}
            onChange = {this.updateItem} />
        </form>
      </div>
    );
  }

  updateItem(e) {
    this.setState({item: e.target.value});
  }

  insertItem(e) {
    e.preventDefault();
    const newItem = {
      description: this.state.item,
      id: Date.now()
    };

    weNeedList_collection.insert(newItem);
    this.setState({item: ''});
  }
}

class WeNeedList extends React.Component {
  render() {
    return (
      <div>
        <h2>We need...</h2>
        {this.props.items.map(item => (
          <div
            className= 'row'>
            <button
              className= 'remove'
              onClick= {() => this.remove(item)}>
              x
            </button>
            {item.description}
            <button
              className= 'add'
              onClick= {() => this.moveToHave(item)}>
              +
            </button>
          </div>
        ))}
      </div>
    );
  }

  remove(item) {
    weNeedList_collection.remove(item);
  }

  moveToHave(item) {
    weNeedList_collection.remove(item);
    item.user = this.props.user;
    weHaveList_collection.insert(item);
  }
}

class WeHaveList extends React.Component {
  render() {
    return (
      <div>
        <h2>We have...</h2>
        {this.props.items.map(item => (
          <div
            className= 'row'
            key = {item.id}>
            <button
              className= 'cancel'
              onClick= {() => this.returnToNeed(item)}>
              x
            </button>
            {item.description} from {item.user}
          </div>
        ))}
      </div>
    );
  }

  returnToNeed(item) {
    weHaveList_collection.remove(item);
    weNeedList_collection.insert(item);
  }
}

export default App;
