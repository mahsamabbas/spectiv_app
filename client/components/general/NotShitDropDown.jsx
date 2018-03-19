import React, { Component } from 'react';
import PropTypes from 'prop-types';

import NavDropItem from './NavDropItem.jsx';


class NotShitDropDown extends Component {
  componentDidMount() {
    document.querySelector(':not(.not-shit-drop-down)').addEventListener('click', (e) => {
      if (!e.target.closest('.account-nav') && this.props.isOpen) {
        this.props.close();
      }
    });
  }

  render() {
    const displayName = this.props.account.channel.name || this.props.account.username;
    return (
      <div
        className="not-shit-drop-down"
        style={{
          height: this.props.isOpen ? (62 * (this.props.options.length + 1)) + 1 : 0,
        }}
      >
        <NavDropItem
          account={this.props.account}
          userInfo
          displayName={displayName}
        />
        { this.props.options.map((option, i) => {
          return (
            <NavDropItem
              key={i}
              defaultImage={option.defaultImage}
              activeImage={option.activeImage}
              displayName={option.displayName}
              function={option.func}
              close={this.props.close}
              onClick={() => {
                option.func();
                this.props.close();
              }}
            />
            // <div
            //   key={i} className="drop-down-item" onClick={() => {
            //     option.func();
            //     this.props.close();
            //   }}
            // >{option.displayName}</div>
          );
        }) }
      </div>
    );
  }
}
NotShitDropDown.propTypes = {
  isOpen: PropTypes.bool,
};

NotShitDropDown.defaultProps = {
  isOpen: false,
};
export default NotShitDropDown;
