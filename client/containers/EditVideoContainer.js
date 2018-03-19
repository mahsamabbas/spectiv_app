import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as uploadActions from './../actions/uploadActions';

const mapStateToProps = state => ({
  videoInfo: state.upload.videoInfo,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ ...uploadActions }, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
);
