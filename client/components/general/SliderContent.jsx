import React, { Component } from 'react';
import isMobile from 'ismobilejs';

class SliderContent extends Component {
  constructor(props) {
    super(props);


    this.changeSlideCount = this.changeSlideCount.bind(this);
    this.giveTransform = this.giveTransform.bind(this);

    this.state = {
      slideIdx: 0,
    };
  }

  changeSlideCount(num) {
    const { slides } = this.props;
    const { slideIdx } = this.state;
    let resetSlide;

    if (slideIdx === 0 && num === -1) {
      resetSlide = slides.length - 1;
    }

    if (slideIdx + 1 === slides.length && num === 1) {
      this.setState({
        slideIdx: 0,
      });
    } else {
      this.setState({
        slideIdx: resetSlide || slideIdx + num,
      });
    }
  }

  giveTransform(slide, i) {
    let translateAmount;
    const { slideIdx } = this.state;

    if (slideIdx === i) {
      translateAmount = 0;
    } else {
      translateAmount = `${i}00%`;
    }


    return React.cloneElement(slide, { injectStyle: { transform: `translateX(${translateAmount})` } });
  }
  render() {
    const style = {};
    if (isMobile.phone) {
      style.height = 300;
      style.width = '100%';
      style.background = 'rgba(0, 0, 0, 0.35)';
      style.display = 'flex';
      style.overflowX = 'hidden';
    }

    return (
      <div className="slider-content" style={style}>
        <div className="left-arrow" onClick={() => this.changeSlideCount(-1)}>
          <img alt="Left Arrow" src="/static/images/other-left-arrow.svg" />
        </div>
        {this.props.slides.map(this.giveTransform)}
        <div className="right-arrow" onClick={() => this.changeSlideCount(1)}>
          <img alt="Right Arrow" src="/static/images/other-left-arrow.svg" />
        </div>
      </div>
    );
  }
}

export default SliderContent;
