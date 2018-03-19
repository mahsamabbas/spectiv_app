import React from 'react';
import { browserHistory } from 'react-router';
import axios from 'axios';
import submitApply from '../../utils/api';
import ApplyCta from './../general/ApplyCta.jsx';

class ApplyPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      technology: '',
      yesNo: 'yes',
      explain: '',
      approveLoading: true,
      submitted: false,
      status: 'NA',
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.submitApplication = this.submitApplication.bind(this);
  }

  componentDidMount() {
    this.checkUserApplication();
  }

  checkUserApplication() {
    axios({
      method: 'GET',
      url: '/applyStatus',
    }).then((res) => {
      if (res.data.isApproved) {
        this.setState({
          status: 'approved',
          approveLoading: false,
        });
      } else if (res.data.questionnaire) {
        this.setState({
          status: 'reviewing',
          approveLoading: false,
        });
      } else if (res.data.login === false) {
        this.setState({
          status: 'login',
          approveLoading: false,
        });
      } else {
        this.setState({
          approveLoading: false,
        });
      }
    }).catch((err) => {
      if (err.response.status === 401) {
        this.setState({
          status: 'login',
          approveLoading: false,
        });
      } else {
        browserHistory.push('/error-handle');
      }
    });
  }

  handleInputChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }
  submitApplication(e) {
    e.preventDefault();
    if (!this.state.explain.toString().trim().length && !this.state.technology.toString().trim().length) {
      this.setState({ submitted: true });
      return;
    }
    this.setState({ approveLoading: true }, () => {
      submitApply(this.state.technology, this.state.yesNo, this.state.explain).then((res) => {
        this.setState({ status: 'reviewing' });
      }, (err) => {
        browserHistory.push('/error-handle');
        console.log(err);
      });
    });
  }

  renderContent() {
    const transitionClasses = ['transition-component'];
    if (this.state.approveLoading) {
      transitionClasses.push('show');
    }

    if (this.state.status === 'login') {
      return (<ApplyCta
        status="login"
        topText="You will need to login first if you want to apply to become a Publisher"
      />);
    }

    if (this.state.status === 'approved') {
      return (<ApplyCta
        status="approved"
        topText="Your application has been approved"
      />);
    }

    if (this.state.status === 'reviewing') {
      return (<ApplyCta
        status="reviewing"
        topText="Your application has been submitted. We are reviewing it now."
      />);
    }

    return (
      <section id="apply">
        <div className="apply-form">
          <h1 className="form-title">Become a Publisher</h1>
          <div className="apply-banner">
            <img src="/static/images/publisher.svg" alt="apply banner" />
          </div>
          <form id="apply" onSubmit={this.submitApplication}>
            <div>
              <p className="txt-question">What technologies (hardware/software) do you use to produce your VR content?</p>
              <input
                className="question-input"
                name="technology"
                type="text"
                value={this.state.technology}
                onChange={this.handleInputChange}
                placeholder="Enter your response here"
              />
              { !this.state.technology.toString().trim().length && this.state.submitted ? <div className="has-error">*Required Field</div> : <div className="has-error" /> }
            </div>
            <div>
              <p className="txt-question">Have you uploaded 360-video content on any other platforms?</p>
              <select
                name="yesNo"
                className="question-select"
                value={this.state.yesNo}
                onChange={this.handleInputChange}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <p className="txt-question">If the answer was yes please share with us a link to one of your 360-video contributions.</p>
              <p className="txt-question">If the answer was no please briefly explain your background and goals as a VR content publisher.</p>
              <input
                className="question-brief"
                placeholder="Enter your response here"
                type="text"
                name="explain"
                value={this.state.explain}
                onChange={this.handleInputChange}
              ></input>
              { !this.state.explain.toString().trim().length && this.state.submitted ? <div className="has-error">*Required Field</div> : <div className="has-error" /> }
            </div>
            <button className="qa-submit" id="submit-btn" type="submit">Submit</button>
          </form>
        </div>
        {
          <div className={transitionClasses.join(' ')}>
            <img className="loading-item" src="/static/images/loading.svg" alt="encoding" />
          </div>
        }
      </section>
    );
  }

  render() {
    return this.renderContent();
  }
}
export default ApplyPage;
