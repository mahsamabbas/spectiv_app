import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as accountActions from './../actions/accountActions';

const mapStateToProps = state => ({
  account: state.account,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ ...accountActions }, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
);
