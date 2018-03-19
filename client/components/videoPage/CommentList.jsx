import axios from 'axios';
import moment from 'moment';
import React, { Component } from 'react';

import SubCommentList from './SubCommentList.jsx';
import SmallLoading from './../general/SmallLoading.jsx';
import EmptyList from './../general/EmptyList.jsx';
import AlertHandle from './../alertHandle/AlertHandle.jsx';


const CommentList = (props) => {
  if (props.isLoading) {
    return <SmallLoading message={'Loading...'} />;
  }

  if (props.comments.length === 0) {
    return <EmptyList text={'No Comments'} />;
  }

  return (
    <div className="comment-list">
      {
        props.comments.map((comment, i) => {
          if (comment.id) {
            return (<CommentItem
              params={props.params}
              account={props.account}
              owner={props.owner}
              deleteComment={props.deleteComment}
              comment={comment}
              index={i}
              key={comment.id}
            />);
          }
          return (<CommentItem
            params={props.params}
            account={props.account}
            owner={props.owner}
            deleteComment={props.deleteComment}
            comment={comment}
            index={i}
            key={0}
          />);
        },
        )
      }
    </div>
  );
};

class CommentItem extends Component {
  constructor(props) {
    super(props);

    this.commentField = this.commentField.bind(this);

    this.state = {
      comment: {},
      reply: '',
      showSubcomments: false,
      showReplyField: false,
      showEditField: false,
      showUserControl: false,
      subcomments: [],
      replies: [],
      characters: 160,
      numberOfReplies: 0,
      success: false,
      alert: false,
      alertMsg: '',
    };

    this.handleReply = this.handleReply.bind(this);
    this.addReplyComment = this.addReplyComment.bind(this);
    this.deleteSubComment = this.deleteSubComment.bind(this);
    this.editComment = this.editComment.bind(this);
    this.getSubComment = this.getSubComment.bind(this);
    this.showReplyField = this.showReplyField.bind(this);
    this.showEditField = this.showEditField.bind(this);
    this.hideReplyField = this.hideReplyField.bind(this);
    this.hideSubcomments = this.hideSubcomments.bind(this);
    this.hideEditField = this.hideEditField.bind(this);
  }

  componentWillMount() {
    if (this.props.comment.ParentComment) {
      if (this.props.comment.User.username === this.props.account.username) {
        this.setState({
          numberOfReplies: this.props.comment.ParentComment.length,
          comment: this.props.comment,
          showUserControl: true,
        });
      } else {
        this.setState({
          numberOfReplies: this.props.comment.ParentComment.length,
          comment: this.props.comment,
        });
      }
    } else if (this.props.comment.User.username === this.props.account.username) {
      this.setState({
        comment: this.props.comment,
        showUserControl: true,
      });
    } else {
      this.setState({
        comment: this.props.comment,
      });
    }
  }

  getSubComment() {
    if (this.state.subcomments.length > 0) {
      this.setState({
        showSubcomments: true,
        showReplies: false,
      });
    } else {
      axios({
        method: 'GET',
        url: `/api/video/${this.props.params.videoId}/comment/${this.props.comment.id}`,
      }).then((res) => {
        const subcomments = res.data.comments;
        this.setState({
          subcomments,
          showSubcomments: true,
          showReplies: false,
        });
      }).catch((err) => {
        this.setState({ success: false, alert: true, alertMsg: 'There was an unexpected error please try again' });
        console.error(err);
      });
    }
  }

  handleReply(e) {
    const characters = this.state.characters - (e.target.value.length - this.state.reply.length);
    this.setState({
      reply: e.target.value,
      characters,
    });
  }

  showReplyField() {
    if (this.props.account.username) {
      this.setState({
        showReplyField: true,
      });
    } else {
      this.setState({ success: false, alert: true, alertMsg: 'You need to login to reply' });
    }
  }

  showEditField() {
    this.setState({
      showEditField: true,
      showUserControl: false,
      reply: this.state.comment.comment,
      characters: 160 - this.state.comment.comment.length,
    });
  }

  hideReplyField() {
    this.setState({
      showReplyField: false,
      characters: 160,
      reply: '',
    });
  }

  hideSubcomments() {
    this.setState({
      showSubcomments: false,
      showReplies: true,
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

  addReplyComment(reply, replyComment = null) {
    reply = reply.trim();
    if (reply.length !== 0 && this.props.account.username) {
      if (this.state.showSubcomments) {
        const comment = `@${this.props.comment.User.username} ${this.state.reply}`;
        const commentObj = {
          comment,
          User: {
            username: this.props.account.username,
          },
        };
        this.state.subcomments.push(commentObj);
        this.state.replies.push(commentObj);
        const subcomments = this.state.subcomments;
        const replies = this.state.replies;
        this.setState({
          reply: '',
          characters: 160,
          showReplyField: false,
          subcomments,
          replies,
        });
      } else {
        const comment = `@${this.props.comment.User.username} ${this.state.reply}`;
        const commentObj = {
          comment,
          User: {
            username: this.props.account.username,
          },
        };
        this.state.replies.push(commentObj);
        const replies = this.state.replies;
        this.setState({
          reply: '',
          characters: 160,
          showReplyField: false,
          replies,
        });
      }
      const replyId = replyComment ? replyComment.id : null;

      axios({
        method: 'POST',
        url: `/api/video/${this.props.params.videoId}/comment`,
        data: {
          comment: reply,
          parentId: this.props.comment.id,
          replyId,
        },
      }).then((res) => {
        res.data.comment.User = {
          username: this.props.account.username,
        };
        if (this.state.showSubcomments) {
          this.state.subcomments.pop();
          this.state.replies.pop();
          res.data.comment.comment = `@${this.props.comment.User.username} ${res.data.comment.comment}`;
          this.state.subcomments.push(res.data.comment);
          this.state.replies.push(res.data.comment);
          const newSubcomments = this.state.subcomments;
          const newReplies = this.state.replies;
          this.setState({
            subcomments: newSubcomments,
            replies: newReplies,
          });
        } else {
          this.state.replies.pop();
          res.data.comment.comment = `@${this.props.comment.User.username} ${res.data.comment.comment}`;
          this.state.replies.push(res.data.comment);
          const newReplies = this.state.replies;
          this.setState({
            replies: newReplies,
          });
        }
      }).catch((err) => {
        if (this.state.numberOfReplies > 0) {
          this.state.subcomments.pop();
          this.state.replies.pop();
          const newSubcomments = this.state.subcomments;
          const newReplies = this.state.replies;
          this.setState({
            subcomments: newSubcomments,
            replies: newReplies,
          });
        } else {
          this.state.replies.pop();
          const newReplies = this.states.replies;
          this.setState({
            replies: newReplies,
          });
        }
        this.setState({ success: false, alert: true, alertMsg: 'There was an unexpected error please submit your reply again' });
        console.error(err);
      });
    } else if (!this.props.account.username) {
      this.setState({ success: false, alert: true, alertMsg: 'You need to login to reply to a comment' });
    } else {
      this.setState({ success: false, alert: true, alertMsg: 'Reply cannot be empty!' });
    }
  }

  deleteSubComment(subcomment, index) {
    let oldSubComments;
    let oldReplies;
    let replyIndex;
    if (this.state.showSubcomments) {
      oldSubComments = this.state.subcomments;
      replyIndex = this.state.replies.findIndex((comment) => {
        return comment.id === subcomment.id;
      });
      if (replyIndex !== -1) {
        oldReplies = this.state.replies;
        this.state.subcomments.splice(index, 1);
        this.state.replies.splice(replyIndex, 1);
        const subcomments = this.state.subcomments;
        const replies = this.state.replies;
        this.setState({
          subcomments,
          replies,
        });
      } else {
        this.state.subcomments.splice(index, 1);
        const subcomments = this.state.subcomments;
        this.setState({
          subcomments,
        });
      }
    } else {
      oldSubComments = this.state.replies;
      this.state.replies.splice(index, 1);
      const replies = this.state.replies;
      this.setState({
        replies,
      });
    }

    axios({
      method: 'DELETE',
      url: `/api/video/${this.props.params.videoId}/comment`,
      data: {
        comment: subcomment,
        owner: this.props.owner,
      },
    }).catch((err) => {
      console.error(err);
      if (this.state.showSubcomments) {
        if (replyIndex) {
          this.setState({
            subcomments: oldSubComments,
            replies: oldReplies,
          });
        } else {
          this.setState({
            subcomments: oldSubComments,
          });
        }
      } else {
        this.setState({
          replies: oldSubComments,
        });
      }
      this.setState({ success: false, alert: true, alertMsg: 'There was an unexpected error please try again' });
    });
  }

  editComment() {
    const reply = this.state.reply.trim();

    if (reply.length !== 0) {
      const oldComment = this.state.comment;
      const newComment = this.state.comment;
      newComment.comment = this.state.reply;
      newComment.isEdited = true;
      this.setState({
        comment: newComment,
        showEditField: false,
        showUserControl: true,
        reply: '',
        characters: 160,
      });

      axios({
        method: 'PUT',
        url: `/api/video/${this.props.params.videoId}/comment`,
        data: {
          comment: oldComment,
          id: this.state.comment.id,
        },
      }).catch((err) => {
        this.setState({
          comment: oldComment,
        });
        this.setState({ success: false, alert: true, alertMsg: 'There was an unexpected error please try again!' });
        console.error(err);
      });
    } else {
      this.setState({ success: false, alert: true, alertMsg: 'You cannot leave your comment blank!' });
    }
  }

  counter() {
    const red = {
      color: 'red',
    };

    if (this.state.characters < 0) {
      return <div style={red} className="character-counter">{this.state.characters}/160</div>;
    }

    return <div className="character-counter">{this.state.characters}/160</div>;
  }

  submit(button) {
    const action = button === 'Reply' ? () => this.addReplyComment(this.state.reply) : this.editComment;
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
      return (<button onClick={this.showReplyField} className="reply-btn">Reply</button>);
    }
  }

  subcomments() {
    if (this.state.subcomments.length > 0 && this.state.showSubcomments) {
      return (<SubCommentList
        account={this.props.account}
        params={this.props.params}
        owner={this.props.owner}
        comment={this.state.comment}
        addSubComment={this.addReplyComment}
        deleteSubComment={this.deleteSubComment}
        subcomments={this.state.subcomments}
      />);
    }
  }

  replies() {
    if (this.state.replies.length > 0 && !this.state.showSubcomments) {
      return (<SubCommentList
        account={this.props.account}
        params={this.props.params}
        owner={this.props.owner}
        comment={this.state.comment}
        addSubComment={this.addReplyComment}
        deleteSubComment={this.deleteSubComment}
        subcomments={this.state.replies}
      />);
    }
  }

  showAllSubcomments() {
    if (this.state.numberOfReplies > 0) {
      if (!this.state.showSubcomments) {
        return (
          <button
            className="reply-btn"
            onClick={this.getSubComment}
          >
            {this.state.numberOfReplies} <img src="/static/images/videopage_comment.svg" alt="Reply Icon" />
          </button>
        );
      } else if (this.state.showSubcomments) {
        return (
          <button
            className="reply-btn"
            onClick={this.hideSubcomments}
          >
            Hide <img src="/static/images/up-arrow.svg" alt="Reply Icon" />
          </button>
        );
      }
    }
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
            onClick={() => this.props.deleteComment(this.props.comment, this.props.index)}
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
            onClick={() => this.props.deleteComment(this.props.comment, this.props.index)}
          >Delete</button>
        </div>
      );
    }
  }

  commentField() {
    const createdAt = moment(this.state.comment.createdAt).fromNow();
    const edited = this.state.comment.isEdited ? '(edited)' : '';

    if (!this.state.showEditField) {
      return (
        <div className="comment-field">
          <span><b>{this.state.comment.User.username}</b> { createdAt }</span>
          <p>{ this.state.comment.comment } <small style={{ fontSize: 10, color: '#B7B7B7' }}>{ edited }</small></p>
          { this.showAllSubcomments() }
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
      margin: '10px',
    };

    return (
      <div className="comment-item" style={style}>
        <AlertHandle
          success={this.state.success}
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
        { this.subcomments() }
        { this.replies() }
      </div>
    );
  }
}

export default CommentList;
