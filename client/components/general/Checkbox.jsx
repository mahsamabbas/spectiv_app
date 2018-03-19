import React, { Component } from 'react';
import classNames from 'classnames';

class Checkbox extends Component {
  render() {
    const { checked, label, onChange } = this.props;

    return (
      <div className="check-box-wrapper" onClick={() => onChange(!checked)}>
        <div
          className={classNames('check-box', { active: checked })}
        />
        <span>{label}</span>
      </div>
    );
  }
}

export default Checkbox;
