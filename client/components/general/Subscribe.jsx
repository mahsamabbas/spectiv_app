import React, { Component } from 'react';
import axios from 'axios';

import AlertHandle from './../alertHandle/AlertHandle.jsx';

class SubscribeButton extends Component {
  constructor(props) {
    super(props);

    this.addSubscription = this.addSubscription.bind(this);
    this.deleteSubscription = this.deleteSubscription.bind(this);

    this.state = {
      subscribed: false,
      totalSubscriber: 0,
      error: false,
      errMsg: '',
      loading: true,
    };
  }

  componentDidMount() {
    this.getSubscription();
  }

  getSubscription() {
    if (this.props.subscribed && this.props.totalSubscriber >= 0) {
      const { subscribed, totalSubscriber } = this.props;
      this.setState({
        subscribed,
        totalSubscriber,
        loading: false,
      });
    } else {
      axios({
        method: 'GET',
        url: `/api/subscription/${this.props.channel.id}`,
      }).then((res) => {
        const { subscribed, totalSubscriber } = res.data;
        this.setState({
          subscribed,
          totalSubscriber,
          loading: false,
        });
      }).catch((err) => {
        console.error(err);
        this.setState({ error: true, errMsg: 'There was an unexpected error please try again' });
      });
    }
  }

  addSubscription() {
    if (this.props.account.username) {
      const totalSubscriber = this.state.totalSubscriber + 1;
      this.setState({
        subscribed: true,
        totalSubscriber,
      });

      axios({
        method: 'POST',
        url: '/api/subscription',
        data: {
          channelId: this.props.channel.id,
          searchId: this.props.channel.searchId,
        },
      }).catch((err) => {
        console.error(err);
        const total = this.state.totalSubscriber - 1;
        this.setState({
          subscribed: false,
          totalSubscriber: total,
        });
        this.setState({ error: true, errMsg: 'There was an unexpected error please try again' });
      });
    } else {
      this.setState({ error: true, errMsg: 'You need to login to subscribe!' });
    }
  }

  deleteSubscription() {
    const totalSubscriber = this.state.totalSubscriber - 1;
    this.setState({
      subscribed: false,
      totalSubscriber,
    });

    axios({
      method: 'DELETE',
      url: '/api/subscription',
      data: {
        channelId: this.props.channel.id,
        searchId: this.props.channel.searchId,
      },
    }).catch((err) => {
      console.error(err);
      const total = this.state.totalSubscriber + 1;
      this.setState({
        subscribed: true,
        totalSubscriber: total,
      });
      this.setState({ error: true, errMsg: 'There was an unexpected error please try again' });
    });
  }

  button() {
    const style = {};
    if (this.props.color) {
      style.backgroundColor = this.props.color;
    }

    if (this.state.loading) {
      return <div />;
    }

    if (!this.state.subscribed) {
      return (
        <div>
          <button
            className="sub-btn"
            style={style}
            onClick={this.addSubscription}
          >Subscribe {this.state.totalSubscriber}</button>
        </div>
      );
    }

    return (
      <div>
        <button
          className="subbed-btn"
          onClick={this.deleteSubscription}
        >Subscribed {this.state.totalSubscriber}</button>
      </div>
    );
  }

  render() {
    return (
      <div>
        <AlertHandle
          message={this.state.errMsg}
          visible={this.state.error}
          onClose={() => this.setState({ errMsg: '', error: false })}
        />
        {this.button()}
      </div>
    );
  }
}

export default SubscribeButton;
