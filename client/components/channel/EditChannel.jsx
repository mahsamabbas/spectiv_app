import React, { Component } from 'react';
import _ from 'lodash';
import { browserHistory } from 'react-router';
import axios from 'axios';

import infoValidation from './../../utils/infoValidation';
import ImageUploader from './../general/ImageUploader.jsx';
import OverlaySaving from './../general/OverlaySaving.jsx';
import AlertHandle from './../alertHandle/AlertHandle.jsx';
import ColorPicker from './ColorPicker.jsx';

class EditChannel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      categories: {},
      currentCats: [],
      numSelectedCats: 0,
      catMsg: false,
      isLoading: false,
      success: false,
      alert: false,
      alertMsg: '',
      loading: false,
    };

    this.handleColor = this.handleColor.bind(this);
  }

  componentDidMount() {
    if (!this.props.account.active) {
      browserHistory.push('/');
    } else {
      axios.get('/api/categories')
      .then((res) => {
        const categories = _.reduce(res.data, (obj, cat) => {
          obj[cat.name] = { id: cat.id, value: false };
          return obj;
        }, {});
        _.forEach(document.querySelector('.color-picker').childNodes, (el) => {
          if (this.props.account.channel.color === el.value) {
            el.checked = true;
          }
        });
        this.setState({ categories });
        this.autoSelectCategories();
      })
      .catch(err => console.log('something went wrong', err));
    }
  }

  componentWillReceiveProps() {
    if (!this.state.isLoading && this.props.account.channel.id) {
      this.setState({ isLoading: true });
    }
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

  autoSelectCategories() {
    axios.get(`/api/channel-categories/${this.props.account.channel.id}`)
    .then((res) => {
      const categories = _.reduce(this.state.categories, (obj, catobj, key) => {
        if (_.indexOf(res.data, catobj.id) > -1) {
          catobj.value = true;
        }
        obj[key] = catobj;
        return obj;
      }, {});

      this.setState({ categories, isLoading: false, numSelectedCats: res.data.length });
    })
    .catch((err) => {
      console.log(err);
      this.setState({ isLoading: false });
    });
  }

  updateChannel() {
    const { channel } = this.props.account;
    const cats = this.state.categories;
    const channelId = this.props.account.channel.id;
    const categories = _.reduce(cats, (arr, obj) => {
      if (obj.value) {
        arr.push(obj.id);
      }
      return arr;
    }, []);

    infoValidation('Channel', channel.name, channel.desc, channel.businessEmail)
    .then((results) => {
      this.setState({ success: false, ...results });

      if (!this.state.alert) {
        this.setState({ loading: true });
        axios.post('/api/categories', { categories, channelId })
        .then(() => {
          axios.post('/api/edit-channel', { ...channel })
          .then(() => this.setState({ loading: false, success: true, alert: true, alertMsg: 'You channel has been updated!' }))
          .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
      } else {
        this.setState({ loading: false });
      }
    });
  }

  handleColor(e) {
    const { channel } = this.props.account;
    channel.color = e.target.value;
    this.props.actions.setUserChannel({ ...channel });
  }

  renderContent() {
    if (this.props.account.loading) {
      return <div>loading...</div>;
    }

    if (this.props.account.channel.id) {
      return (
        <section id="edit-channel">
          { this.state.loading ? <OverlaySaving /> : null }
          <AlertHandle
            success={this.state.success}
            message={this.state.alertMsg}
            visible={this.state.alert}
            onClose={() => this.setState({ alertMsg: '', alert: false })}
          />
          <h2 className="channel-header">Edit Channel</h2>
          <div className="edit-channel-wrapper">
            <div className="left-wrapper">
              <ImageUploader
                type="avatar"
                options={{ userId: this.props.account.id }}
                updateUserAvatar={this.props.actions.setUserAvatar}
                channel={this.props.account.channel}
                imageUrl={this.props.account.channel.avatarPath}
                isAvatar="true"
              />

              <div className="channel-color-picker">
                <h3>Channel Background Color</h3>
                <ColorPicker handle={this.handleColor} />
              </div>
            </div>

            <div className="right-wrapper">
              <div className="channel-title">
                <h3>Channel Title</h3>
                <input
                  placeholder="Name"
                  onChange={(e) => {
                    const { channel } = this.props.account;
                    channel.name = e.target.value;
                    this.props.actions.setUserChannel({ ...channel });
                  }}
                  value={this.props.account.channel.name}
                />
              </div>

              <div className="channel-description">
                <h3>Channel Description</h3>
                <textarea
                  rows="4"
                  placeholder="Description"
                  onChange={(e) => {
                    const { channel } = this.props.account;
                    channel.desc = e.target.value;
                    this.props.actions.setUserChannel({ ...channel });
                  }}
                  value={this.props.account.channel.desc}
                />
              </div>

              <div className="channel-email">
                <h3>Channel Business Email</h3>
                <input
                  placeholder="Business Email"
                  onChange={(e) => {
                    const { channel } = this.props.account;
                    channel.businessEmail = e.target.value;
                    this.props.actions.setUserChannel({ ...channel });
                  }}
                  value={this.props.account.channel.businessEmail}
                />
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
            </div>
          </div>

          <div className="save-btn-wrapper">
            <button
              className="save-btn"
              onClick={() => this.updateChannel()}
            >
              Submit
            </button>
          </div>
        </section>
      );
    } else if (this.props.account.id) {
      browserHistory.push('/my-channel');
      return <div>loading...</div>;
    }
    window.location = '/login';
    return <div>loading...</div>;
  }

  render() {
    return this.renderContent();
  }
}

export default EditChannel;
