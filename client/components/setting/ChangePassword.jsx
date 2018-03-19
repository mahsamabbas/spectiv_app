import axios from 'axios';
import React, { Component } from 'react';

import OverlaySaving from './../general/OverlaySaving.jsx';
import AlertHandle from '../alertHandle/AlertHandle.jsx';

class ChangePassword extends Component {
  constructor(props) {
    super(props);

    this.handleInput = this.handleInput.bind(this);
    this.changePassword = this.changePassword.bind(this);

    this.state = {
      password: '',
      newPassword: '',
      confirmPassword: '',
      alert: false,
      alertMsg: '',
      success: false,
      savingPW: false,
    };
  }

  handleInput(e, state) {
    if (state === 'password') {
      this.setState({
        password: e.target.value,
      });
    } else if (state === 'newPassword') {
      this.setState({
        newPassword: e.target.value,
      });
    } else if (state === 'confirmPassword') {
      this.setState({
        confirmPassword: e.target.value,
      });
    }
  }

  changePassword() {
    if (this.state.newPassword !== this.state.confirmPassword) {
      this.setState({ success: false, alert: true, alertMsg: 'The confirm password does not match the new password please try again' });
    } else if (this.state.newPassword.length < 8) {
      this.setState({ success: false, alert: true, alertMsg: 'Password must be 8 characters or more' });
    } else {
      this.setState({ savingPW: true })

      axios({
        method: 'PATCH',
        url: '/api/account/password',
        data: {
          oldPassword: this.state.password,
          newPassword: this.state.newPassword,
        },
      }).then(() => {
        this.setState({
          password: '',
          newPassword: '',
          confirmPassword: '',
          showPasswordChange: false,
          savingPW: false,
        });
        this.setState({ savingPW: false, success: true, alert: true, alertMsg: 'Your password has been changed' });
      }).catch((err) => {
        console.log(err);
        this.setState({ savingPW: false, success: false, alert: true, alertMsg: 'Incorrect password' });
      });
    }
  }

  render() {
    return (
      <div className="change-password" style={{ position: 'relative' }}>
        { this.state.savingPW ? <OverlaySaving /> : null }
        <AlertHandle
          success={this.state.success}
          message={this.state.alertMsg}
          visible={this.state.alert}
          onClose={() => this.setState({ alertMsg: '', alert: false })}
        />
        <h4>Change Password</h4>
        <div>Current Password: <input
          onChange={e => this.handleInput(e, 'password')}
          value={this.state.password}
          type="password"
          name="currentPassword"
          placeholder="Enter your current password"
        />
        </div>
        <div>New Password: <input
          onChange={e => this.handleInput(e, 'newPassword')}
          value={this.state.newPassword}
          type="password"
          name="newPassword"
          placeholder="Enter your new password"
        />
        </div>
        <div>Confirm New Password: <input
          onChange={e => this.handleInput(e, 'confirmPassword')}
          value={this.state.confirmPassword}
          type="password"
          name="confirmPassword"
          placeholder="Enter your new password again"
        />
        </div>
        <div className="button-wrapper">
          <button onClick={this.changePassword}>Change Password</button>
        </div>
      </div>
    );
  }
}

export default ChangePassword;
