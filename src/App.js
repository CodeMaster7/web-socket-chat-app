import React, { Component } from 'react';
import { Container, Button, Input, Segment, Menu, Header } from 'semantic-ui-react';
import io from 'socket.io-client'
import Message from './components/Message/Message';

const socket = io('http://localhost:3005'); // remove link for production

class App extends Component {
  constructor() {
    super();
    this.state = {
      id: null,
      userInput: '',
      username: '',
      usernameInput: '',
      rooms: [
        {
          name: 'General',
          path: '/general',
          messages: [],
          connected: true,
          occupants: []
        },
        {
          name: 'Private',
          path: '/private',
          messages: [],
          connected: false,
          occupants: []
        },
        {
          name: 'Admin',
          path: '/admin',
          messages: [],
          connected: false,
          occupants: []
        }
      ]
    }
    socket.on('occupants', data => {
      let newRooms = this.state.rooms;
      let index = newRooms.findIndex(room => room.path.slice(1) === data.room)
      newRooms[index].occupants = data.users
      this.setState({ rooms: newRooms })
    })
    socket.on('response', data => { // username set or taken
      if (data.status === 'username set') {
        this.setState({ username: data.username })
      }
    })
    socket.on('contact', data => {
      this.setState({ id: data.id })
    })
    socket.on('message', (data) => {
      let newRooms = this.state.rooms
      let index = newRooms.findIndex(room => room.path === data.path);
      newRooms[index].messages.push({ message: data.message, username: data.username, timestamp: data.timestamp })
      this.setState({ rooms: newRooms })
    })
    this.handleMessageEvent = this.handleMessageEvent.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.handleUsernameInput = this.handleUsernameInput.bind(this);
    this.setUsername = this.setUsername.bind(this);
  }
  joinRoom(path, ind) {
    socket.emit('join room', path)
    let newRooms = this.state.rooms;
    newRooms[ind].connected = true;
    this.setState({ rooms: newRooms })
  }
  handleUsernameInput(e) {
    this.setState({ usernameInput: e.target.value })
  }
  setUsername() {
    this.state.usernameInput &&
      socket.emit('set username', { username: this.state.usernameInput })
  }
  handleMessageEvent(event) {
    if (!this.state.userInput.length) return // prevent empty message from being sent.
    socket.emit('event', { type: event.type, message: this.state.userInput, ind: event.ind, path: event.path })
    this.setState({ userInput: '' })
  }
  render() {
    let rooms = this.state.rooms.map((el, i) => {
      if (el.connected === true) {
        return (
          <div key={i}>
            <div><h4>{el.name}</h4></div>
            <Segment as='div' className='chat-box'>{el.messages.map((message, i) => (
              <Message key={i} message={message} />
            ))}</Segment>
            <div className='button-container'>
              <Button onClick={() => this.handleMessageEvent({
                path: el.path,
                ind: i
              })}>send</Button>
            </div>
          </div>
        )
      } else return (
        <div key={i}>
          <div><h4>-- {el.name} --</h4></div>
          <Segment as='div' className='chat-box'>not connected</Segment>
          <div >
            <Button onClick={() => this.joinRoom(el.path, i)}>Join Room</Button>
          </div>
        </div>
      )
    })
    return (
      <div className="App">
        <section>
          <div className='top-left-header' style={{ minHeight: "2.85714286em" }}> <h3>Users</h3>
          </div>
          <div className='userlist-container'>

            <Header inverted as='h3' dividing>general</Header>
            <div>
              {this.state.rooms[0].occupants.map((el, i) => (
                <p key={i}>{el}</p>
              ))}
            </div>
            <Header inverted as='h3' dividing>private</Header>
            <div>
              {this.state.rooms[1].occupants.map((el, i) => (
                <p key={i}>{el}</p>
              ))}
            </div>
            <Header inverted as='h3' dividing>admin</Header>
            <div>
              {this.state.rooms[2].occupants.map((el, i) => (
                <p key={i}>{el}</p>
              ))}
            </div>

          </div>
        </section>

        <section>
          <div className='chat-container'>
            <Menu style={{ borderRadius: 0, color: "2c302e" }} className='navbar'>
              <Menu.Item
                name='Web Socket Chat App'
              >

              </Menu.Item>
              {
                this.state.id ?
                  <Menu.Item>socket id: {this.state.id}</Menu.Item>
                  : <Menu.Item name={`disconnected`}></Menu.Item>
              }
              {
                this.state.username ?
                  <Menu.Item>Username: {this.state.username}</Menu.Item>
                  : <Menu.Item name='Set Username' onClick={this.setUsername}></Menu.Item>
              }
              {!this.state.username &&
                <Menu.Item>
                  <Input placeholder='enter username' value={this.state.usernameInput} onChange={this.handleUsernameInput} />
                </Menu.Item>
              }
            </Menu>
            <div className='grid'>
              {rooms}

            </div>
            <div className='input-container'>

              <Input icon='mail outline colored-icon' placeholder='Your message...' className='input-box' value={this.state.userInput} type="text" onChange={e => this.setState({ userInput: e.target.value })} />
            </div>
          </div>
          <div className='text-container' >
            <div>
              <p><a href='https://reactjs.org/'>React</a>, <a href='https://react.semantic-ui.com/'>Semantic UI</a>, <a href='https://www.npmjs.com/package/socket.io'>Socket.io</a>, <a href='https://www.npmjs.com/package/socket.io-client'>Socket.io-client</a>, <a href='https://github.com/nathan-08/web-socket-chat-app'>Github</a></p>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default App;
    // emit, broadcast, blast
// rooms: general, private, admin