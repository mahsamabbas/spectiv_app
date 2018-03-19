import React from 'react';
import PropTypes from 'prop-types';
import NoAvatar from './../general/NoAvatar.jsx';
import Avatar from './../general/Avatar.jsx';

class NavDropItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hoverState: false,
    };
    this.activeItem = this.activeItem.bind(this);
    this.disableItem = this.disableItem.bind(this);
  }
  activeItem() {
    this.setState({
      hoverState: true,
    });
  }
  disableItem() {
    this.setState({
      hoverState: false,
    });
  }
  render() {
    const imgSrc = this.state.hoverState ? this.props.activeImage : this.props.defaultImage;
    const { account } = this.props;
    let hasDisplayNames = false;
    if (account) {
      if (account.firstName) {
        hasDisplayNames = true;
      }
    }

    return (
      <div>
        { this.props.userInfo ? <div className="avatar-drop-item">
          { this.props.account.avatarPath ?
            <Avatar
              image={this.props.account.avatarPath}
              size="sm"
            />
            : <NoAvatar letter={this.props.displayName.substring(0, 2)} />
          }
          <div className="user-info">
            <div className="name">{hasDisplayNames ? `${account.firstName} ${account.lastName}` : 'Spectiv VR'}</div>
            <div className="email" style={{ color: '#565656' }}>{this.props.account.email}</div>
          </div>
        </div> : <div
          className="drop-item"
          onMouseEnter={this.activeItem}
          onMouseLeave={this.disableItem}
          onClick={() => {
            this.props.function();
            this.props.close();
          }}
        >
          <div
            className="item-icon"
            alt="Avatar Img"
            style={{ backgroundImage: `url('${imgSrc}')`, transition: '.25s' }}
          />
          <div className="displayName">
            {this.props.displayName}
          </div>
        </div>
        }
      </div>
    );
  }
}
NavDropItem.propTypes = {
  userInfo: PropTypes.bool,
};
NavDropItem.defaultProps = {
  userInfo: false,
};
export default NavDropItem;
