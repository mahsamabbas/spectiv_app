import axios from 'axios';
import moment from 'moment';
import React, { Component } from 'react';

import AlertHandle from './../alertHandle/AlertHandle.jsx';

const SubCommentList = (props) => {
  return (
    <div className="sub-comment-list">
      {
        props.subcomments.map((subcomment, i) => {
          if (subcomment.id) {
            return (<SubCommentItem
              account={props.account}
              params={props.params}
              owner={props.owner}
              parentComment={props.comment}
              addSubComment={props.addSubComment}
              deleteSubComment={props.deleteSubComment}
              subcomment={subcomment}
              index={i}
              key={subcomment.id}
            />);
          }
          return (<SubCommentItem
            account={props.account}
            params={props.params}
            owner={props.owner}
            parentComment={props.comment}
            addSubComment={props.addSubComment}
            deleteSubComment={props.deleteSubComment}
            subcomment={subcomment}
            index={i}
            key={0}
          />);
        },
        )
      }
    </div>
  );
};

class SubCommentItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      subcomment: {},
      reply: '',
      showReplyField: false,
      showUserControl: false,
      showEditField: false,
      characters: 160,
      alert: false,
      alertMsg: '',
    };

    this.showReplyField = this.showReplyField.bind(this);
    this.showEditField = this.showEditField.bind(this);
    this.hideReplyField = this.hideReplyField.bind(this);
    this.hideEditField = this.hideEditField.bind(this);
    this.handleReply = this.handleReply.bind(this);
    this.addComment = this.addComment.bind(this);
    this.editComment = this.editComment.bind(this);
  }

  componentWillMount() {
    if (this.props.subcomment.User.username === this.props.account.username) {
      this.setState({
        subcomment: this.props.subcomment,
        showUserControl: true,
      });
    } else {
      this.setState({
        subcomment: this.props.subcomment,
      });
    }
  }

  addComment() {
    this.props.addSubComment(this.state.reply, this.props.subcomment);
    this.setState({
      reply: '',
      showReplyField: false,
      characters: 160,
    });
  }

  editComment() {
    const reply = this.state.reply.trim();

    if (reply.length !== 0) {
      const oldSubComment = this.state.subcomment;
      const newSubComment = this.state.subcomment;
      newSubComment.comment = this.state.reply;
      newSubComment.isEdited = true;
      this.setState({
        subcomment: newSubComment,
        showEditField: false,
        showUserControl: true,
        reply: '',
        characters: 160,
      });

      axios({
        method: 'PUT',
        url: `/api/video/${this.props.params.videoId}/comment`,
        data: {
          comment: oldSubComment,
          id: this.state.subcomment.id,
        },
      }).catch((err) => {
        this.setState({
          comment: oldSubComment,
        });
        this.setState({ alert: true, alertMsg: 'There was an unexpected error please try again!' });
        console.error(err);
      });
    } else {
      this.setState({ alert: true, alertMsg: 'You cannot leave your comment blank!' });
    }
  }

  showReplyField() {
    this.setState({
      showReplyField: true,
    });
  }

  showEditField() {
    if (this.state.subcomment.comment[0] === '@') {
      const comment = this.state.subcomment.comment.split(' ');
      comment.shift();
      const reply = comment.join(' ');
      this.setState({
        showEditField: true,
        showUserControl: false,
        reply,
        characters: 160 - reply.length,
      });
    } else {
      this.setState({
        showEditField: true,
        showUserControl: false,
        reply: this.state.subcomment.comment,
        characters: 160 - this.state.subcomment.comment.length,
      });
    }
  }

  hideReplyField() {
    this.setState({
      showReplyField: false,
      characters: 160,
      reply: '',
    });
  }

  hideEditField() {
    this.setState({
      showEditField: false,
      showUserControl: true,
      characters: 160,
      reply: '',
    });
  }

  handleReply(e) {
    const characters = this.state.characters - (e.target.value.length - this.state.reply.length);
    this.setState({
      reply: e.target.value,
      characters,
    });
  }

  counter() {
    const red = {
      color: 'red',
    };

    if (this.state.characters < 0) {
      return <div style={red} className="character-counter">{this.state.characters}</div>;
    }

    return <div className="character-counter">{this.state.characters}</div>;
  }

  submit(button) {
    const action = button === 'Reply' ? this.addComment : this.editComment;
    if (this.state.characters < 0) {
      return <button disabled>{button}</button>;
    }

    return <button onClick={action}>{button}</button>;
  }

  replyField() {
    if (this.state.showReplyField) {
      return (
        <div className="reply-wrapper">
          <input
            onChange={this.handleReply}
            value={this.state.reply}
            type="text"
            name="reply"
            placeholder="Give a reply"
          />
          <div className="reply-action-wrapper">
            <div>
              <button
                onClick={this.hideReplyField}
              >Cancel</button>
              { this.submit('Reply') }
            </div>
            <div>
              { this.counter() }
            </div>
          </div>
        </div>
      );
    } else if (!this.state.showEditField) {
      return (
        <button
          className="reply-btn"
          onClick={this.showReplyField}
        >
          Reply
        </button>
      );
    }
  }

  comment() {
    if (this.state.subcomment.ReplyComment && this.state.subcomment.comment[0] !== '@') {
      return `@${this.state.subcomment.ReplyComment.User.username} ${this.state.subcomment.comment}`;
    } else if (this.state.subcomment.parentCommentId && this.state.subcomment.comment[0] !== '@') {
      return `@${this.props.parentComment.User.username} ${this.state.subcomment.comment}`;
    }

    return this.state.subcomment.comment;
  }

  ownerButtons() {
    if (this.state.showUserControl) {
      return (
        <div className="user-comment-buttons">
          <button
            className="edit-btn"
            onClick={this.showEditField}
          >Edit</button>
          <button
            className="delete-btn"
            onClick={() =>
              this.props.deleteSubComment(this.state.subcomment, this.props.index)}
          >Delete</button>
        </div>
      );
    }
  }

  vcButton() {
    if (this.props.owner && !this.state.showUserControl) {
      return (
        <div className="user-comment-buttons">
          <button
            className="delete-btn"
            onClick={() =>
            this.props.deleteSubComment(this.state.subcomment, this.props.index)}
          >Delete</button>
        </div>
      );
    }
  }

  commentField() {
    const createdAt = moment(this.state.subcomment.createdAt).fromNow();
    const edited = this.state.subcomment.isEdited ? '(edited)' : '';

    if (!this.state.showEditField) {
      return (
        <div className="comment-field">
          <span><b>{this.state.subcomment.User.username}</b> { createdAt }</span>
          <p>{ this.comment() } <small style={{ fontSize: 10, color: '#B7B7B7' }}>{ edited }</small></p>
        </div>
      );
    } else if (this.state.showEditField) {
      return (
        <div className="comment-field">
          <textarea
            value={this.state.reply}
            onChange={this.handleReply}
            type="text"
            name="edit"
            placeholder="Give a comment..."
            className="comment-textarea"
            rows={3}
          />
          <div className="comment-bottom">
            { this.counter() }
            <div>
              <button
                onClick={this.hideEditField}
              >Cancel</button>
              { this.submit('Save') }
            </div>
          </div>
        </div>
      );
    }
  }

  render() {
    const style = {
      margin: '0 0 0 24px',
    };

    return (
      <div className="sub-comment-item" style={style}>
        <AlertHandle
          message={this.state.alertMsg}
          visible={this.state.alert}
          onClose={() => this.setState({ alertMsg: '', alert: false })}
        />
        { this.commentField() }
        <div className="comment-btn-wrapper">
          { this.ownerButtons() }
          { this.vcButton() }
          { this.replyField() }
        </div>
      </div>
    );
  }
}

export default SubCommentList;
