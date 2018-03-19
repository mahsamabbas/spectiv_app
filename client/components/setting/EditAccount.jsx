import axios from 'axios';
import React, { Component } from 'react';
import validator from 'validator';

import OverlaySaving from './../general/OverlaySaving.jsx';
import AlertHandle from './../alertHandle/AlertHandle.jsx';

class EditAccount extends Component {
  constructor(props) {
    super(props);

    this.editInfo = this.editInfo.bind(this);
    this.handleInput = this.handleInput.bind(this);

    this.state = {
      user: {},
      email: '',
      firstName: '',
      lastName: '',
      text: 'Save',
      success: false,
      alert: false,
      alertMsg: '',
      isSaving: false,
    };
  }

  componentDidMount() {
    this.setUserInfo();
  }

  setUserInfo() {
    const { user } = this.props;
    let firstName = '';
    let lastName = '';

    if (user.firstName) {
      firstName = user.firstName;
    }

    if (user.lastName) {
      lastName = user.lastName;
    }

    this.setState({
      user,
      email: user.email,
      firstName,
      lastName,
    });
  }

  handleInput(e, state) {
    if (state === 'email') {
      this.setState({
        email: e.target.value,
      });
    } else if (state === 'firstName') {
      this.setState({
        firstName: e.target.value,
      });
    } else if (state === 'lastName') {
      this.setState({
        lastName: e.target.value,
      });
    }
  }

  editInfo() {
    if (!validator.isEmail(this.state.email)) {
      this.setState({ success: false, alert: true, alertMsg: 'The email you entered is not a valid email' });
    } else {
      const oldUser = this.state.user;
      const user = this.state.user;
      user.email = this.state.email;
      user.firstName = this.state.firstName;
      user.lastName = this.state.lastName;

      this.setState({
        user,
        showEdit: false,
        isSaving: true,
      });

      axios({
        method: 'PATCH',
        url: '/api/account/user-info',
        data: {
          firstName: this.state.firstName,
          lastName: this.state.lastName,
          email: this.state.email,
        },
      }).then(() => {
        this.setState({
          isSaving: false,
          success: true,
          alert: true,
          alertMsg: 'Your account info has been updated!',
        });
      }).catch((err) => {
        console.error(err);
        this.setState({
          user: oldUser,
          isSaving: false,
          success: false,
          alert: true,
          alertMsg: 'Something went wrong! Please refresh the page and try agian.',
        });
        this.setState({ success: false, alert: true, alertMsg: 'There was an unexpected error please try again' });
      });
    }
  }

  render() {
    return (
      <div className="edit-user-info">
        { this.state.isSaving ? <OverlaySaving /> : null }
        <AlertHandle
          success={this.state.success}
          message={this.state.alertMsg}
          visible={this.state.alert}
          onClose={() => this.setState({ alertMsg: '', alert: false })}
        />
        <h4>Edit User Info</h4>
        <div>Email: <input
          onChange={e => this.handleInput(e, 'email')}
          value={this.state.email}
          type="text"
          name="email"
          placeholder="Enter your new Email"
        />
        </div>
        <div>First Name: <input
          onChange={e => this.handleInput(e, 'firstName')}
          value={this.state.firstName}
          type="text"
          name="firstName"
          placeholder="Enter your first name"
        />
        </div>
        <div>Last Name: <input
          onChange={e => this.handleInput(e, 'lastName')}
          value={this.state.lastName}
          type="text"
          name="lastName"
          placeholder="Enter your last name"
        />
        </div>
        <div className="button-wrapper">
          <button onClick={this.editInfo}>SAVE</button>
        </div>
      </div>
    );
  }
}

export default EditAccount;
