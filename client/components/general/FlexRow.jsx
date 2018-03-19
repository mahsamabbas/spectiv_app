import React, { PropTypes, Component } from 'react';

class FlexRow extends Component {
  render() {
    const {
      align,
      wrap,
      alignStart,
      contained,
      fullHeight,
    } = this.props;

    const style = {
      width: '100%',
      display: 'flex',
      alignItems: alignStart || 'stretch',
      justifyContent: align,
    };

    if (contained) {
      style.maxWidth = 1280;
      style.marginLeft = 'auto';
      style.marginRight = 'auto';
    }

    if (fullHeight) {
      style.height = '100%';
    }

    if (wrap) {
      style.flexWrap = 'wrap';
    }

    return (
      <div
        style={style}
      >
        {this.props.children}
      </div>
    );
  }
}

FlexRow.propTypes = {
  align: PropTypes.string,
  children: PropTypes.node.isRequired,
};

FlexRow.defaultProps = {
  align: 'flex-start',
};

export default FlexRow;
