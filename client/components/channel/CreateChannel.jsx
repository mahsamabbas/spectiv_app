import React, { Component } from 'react';
import _ from 'lodash';
import axios from 'axios';
import { browserHistory } from 'react-router';

import infoValidation from './../../utils/infoValidation';
import AlertHandle from './../alertHandle/AlertHandle.jsx';
import ImageUploader from './../general/ImageUploader.jsx';
import ColorPicker from './ColorPicker.jsx';

class CreateChannel extends Component {
  constructor(props) {
    super(props);

    // Bind methods to component
    this.createChannel = this.createChannel.bind(this);
    this.renderContent = this.renderContent.bind(this);
    this.handleColor = this.handleColor.bind(this);

    this.state = {
      categories: {},
      numSelectedCats: 0,
      catMsg: false,
      color: '#4ebd94',
      alert: false,
      alertMsg: '',
      name: '',
    };
  }

  componentDidMount() {
    this.setNameWithUsername();
    axios.get('/api/categories')
    .then((res) => {
      const categories = _.reduce(res.data, (obj, cat) => {
        obj[cat.name] = { id: cat.id, value: false };
        return obj;
      }, {});
      this.setState({ categories });
    })
    .catch(err => console.log('something went wrong', err));
  }

  setNameWithUsername() {
    this.setState({
      name: this.props.account.username,
    });
  }

  getCategories() {
    const { categories } = this.state;
    return _.map(categories, (value, key) => {
      return (
        <div
          className="category"
          key={`cat-${value.id}`}
        >
          <label className="category-checkbox">
            <input
              ref={(r) => { this.category = r; }}
              type="checkbox"
              checked={this.state.categories[key].value}
              onClick={(e) => {
                if (this.state.numSelectedCats < 3) {
                  const updatedCats = { ...categories };
                  const numCats = this.state.numSelectedCats;
                  const newNumCats = categories[key].value ? numCats - 1 : numCats + 1;

                  updatedCats[key].value = !categories[key].value;

                  this.setState({
                    categories: updatedCats,
                    numSelectedCats: newNumCats,
                    catMsg: false,
                  });
                } else if (!e.target.checked) {
                  const updatedCats = { ...categories };
                  const numCats = this.state.numSelectedCats - 1;

                  updatedCats[key].value = !categories[key].value;

                  this.setState({
                    categories: updatedCats,
                    numSelectedCats: numCats,
                    catMsg: false,
                  });
                } else {
                  e.target.checked = false;
                  this.setState({ catMsg: true });
                }
              }}
            />
            <span className="category-label">{key}</span>
          </label>
        </div>
      );
    });
  }

  createChannel(e) {
    e.preventDefault();
    const nameValue = this.name.value;
    const descValue = this.desc.value;
    const emailValue = this.businessEmail.value;
    const categories = [];

    _.forEach(this.state.categories, (obj) => {
      if (obj.value) categories.push(obj.id);
    });

    infoValidation('Channel', nameValue, descValue, emailValue)
    .then((result) => {
      this.setState({
        ...result,
      });
      if (!this.state.alert) {
        axios({
          url: '/api/channel',
          method: 'POST',
          data: {
            name: nameValue,
            desc: descValue,
            businessEmail: emailValue,
            color: this.state.color,
            categories,
          },
        }).then((res) => {
          const { channel } = res.data;
          this.props.setUserChannel(channel);
          browserHistory.push(`/channel/${channel.channelURL}`);
        }).catch((err) => {
          console.log(err);
        });
      }
    });
  }

  handleColor(e) {
    let { color } = this.state;
    color = e.target.value;
    this.setState({
      color,
    });
  }

  renderContent() {
    return (
      <section id="edit-channel">
        <AlertHandle
          message={this.state.alertMsg}
          visible={this.state.alert}
          onClose={() => this.setState({ alertMsg: '', alert: false })}
        />
        <h2 className="channel-header">Create Channel</h2>
        <div className="edit-channel-wrapper">
          <div className="left-wrapper">
            <ImageUploader
              type="avatar"
              options={{ userId: this.props.account.id }}
              updateUserAvatar={this.props.setUserAvatar}
              imageUrl={this.props.account.avatarPath}
              isAvatar="true"
            />

            <div className="channel-color-picker">
              <h3>Channel Background Color</h3>
              <ColorPicker handle={this.handleColor} />
            </div>
          </div>

          <div className="right-wrapper">
            <form onSubmit={this.createChannel}>
              <div className="channel-title">
                <h3>Channel Title</h3>
                <input
                  ref={(r) => { this.name = r; }}
                  value={this.state.name}
                  onChange={(e) => {
                    this.setState({
                      name: e.target.value,
                    });
                  }}
                  placeholder="Name"
                />
              </div>

              <div className="channel-description">
                <h3>Channel Description</h3>
                <textarea rows="4" ref={(r) => { this.desc = r; }} placeholder="Description" />
              </div>

              <div className="channel-email">
                <h3>Channel Business Email</h3>
                <input ref={(r) => { this.businessEmail = r; }} placeholder="Business Email" />
              </div>

              <div className="categories-wrapper">
                <h3>
                  Categories {this.state.catMsg
                    ? <span className="category-error">You can only select up to 3 categories.</span> : null}
                </h3>
                <div className="channel-categories">
                  {this.getCategories()}
                </div>
              </div>
              <div className="save-btn-wrapper">
                <button
                  className="save-btn"
                  type="submit"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    );
  }

  render() {
    return (
      <div className="create-channel">
        { this.renderContent() }
      </div>
    );
  }
}

export default CreateChannel;
