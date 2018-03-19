import axios from 'axios';
import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';

import SubscriptionList from './SubscriptionList.jsx';
import SmallLoading from './../general/SmallLoading.jsx';


class Subscription extends Component {
  constructor(props) {
    super(props);

    this.state = {
      subscribedChannel: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.getAllSubscriptions();
  }

  componentWillReceiveProps() {
    if (!this.props.account.username && !this.props.account.loading) {
      window.location = '/login';
    }
  }

  getAllSubscriptions() {
    axios({
      method: 'GET',
      url: '/api/subscription',
    }).then((subscription) => {
      this.setState({
        subscribedChannel: subscription.data.subscriptions,
        loading: false,
      });
    }).catch((err) => {
      if (err.response.status === 401) {
        window.location = '/login';
      }
    });
  }

  renderContent() {
    if (this.state.loading) {
      return <SmallLoading message={'Loading...'} />;
    }

    if (this.state.subscribedChannel.length === 0) {
      return (<div className="no-channels" style={{ width: '100%', background: '#EEEEEE' }}>
        <h5 style={{ textAlign: 'center', color: '#333', fontSize: 16, padding: 4 }}>You have no subscribers! Start subscribing to channels now.</h5>
        <Link to="/" className="home-btn">Back To Home</Link>
      </div>);
    }

    return (<SubscriptionList
      channels={this.state.subscribedChannel}
      account={this.props.account}
    />);
  }

  render() {
    return (
      <section id="subscription-page">
        { this.renderContent() }
      </section>
    );
  }
}

export default Subscription;
