import React from 'react';
import Rodal from 'rodal';
import PropTypes from 'prop-types';

const AlertHandle = props => (
  <Rodal
    visible={props.visible}
    showCloseButton={false}
    width={props.width}
    height={props.height}
    showMask={props.showMask}
    closeOnEsc={props.closeOnEsc}
    animation={props.animation}
    closeMaskOnClick={props.closeMaskOnClick}
    onClose={props.onClose}
    className="error-modal"
  >
    {props.success ?
      <div className="modal-body">
        <img className="warning-img" src="/static/images/greencheck.svg" alt="success" />
        <h1>Nailed it!</h1>
        <p>{props.message}</p>
        <button className="success-btn" onClick={props.onClose}>Dismiss</button>
      </div>
    :
      <div className="modal-body">
        <img className="warning-img" src="/static/images/ic-warning.svg" alt="warning" />
        <h1>Oh snap!</h1>
        <p>{props.message}</p>
        <button className="dismiss-btn" onClick={props.onClose}>Dismiss</button>
      </div>
    }
  </Rodal>
);

AlertHandle.propTypes = {
  visible: PropTypes.bool,
  message: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  showMask: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
  animation: PropTypes.string,
  closeMaskOnClick: PropTypes.bool,
  success: PropTypes.bool,
};

AlertHandle.defaultProps = {
  visible: false,
  message: 'Description can’t be longer than 600 characters.',
  width: 400,
  height: 300,
  showMask: true,
  closeOnEsc: true,
  animation: 'flip',
  closeMaskOnClick: true,
  success: false,
};
export default AlertHandle;
