<Menu>
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