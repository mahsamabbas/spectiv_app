import React, { Component } from 'react';

class ColorPicker extends Component {

  render() {
    return (
      <div className="color-picker">
        <input type="radio" name="color" id="light-green" value="#4ebd94" onClick={this.props.handle} defaultChecked />
        <label htmlFor="light-green"><span className="light-green" /></label>
        <input type="radio" name="color" id="dark-green" value="#358666" onClick={this.props.handle} />
        <label htmlFor="dark-green"><span className="dark-green" /></label>
        <input type="radio" name="color" id="black" value="#383838" onClick={this.props.handle} />
        <label htmlFor="black"><span className="black" /></label>
        <input type="radio" name="color" id="grey" value="#888888" onClick={this.props.handle} />
        <label htmlFor="grey"><span className="grey" /></label>
        <input type="radio" name="color" id="yellow" value="#fdd900" onClick={this.props.handle} />
        <label htmlFor="yellow"><span className="yellow" /></label>
        <input type="radio" name="color" id="red" value="#ff5562" onClick={this.props.handle} />
        <label htmlFor="red"><span className="red" /></label>
        <input type="radio" name="color" id="orange" value=" #ff7415" onClick={this.props.handle} />
        <label htmlFor="orange"><span className="orange" /></label>
        <input type="radio" name="color" id="blue" value="#138bce" onClick={this.props.handle} />
        <label htmlFor="blue"><span className="blue" /></label>
      </div>
    );
  }
}

export default ColorPicker;
