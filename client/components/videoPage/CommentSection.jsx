import axios from 'axios';
import React, { Component } from 'react';

import AlertHandle from './../alertHandle/AlertHandle.jsx';
import CommentList from './CommentList.jsx';

class CommentSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      comments: [],
      comment: '',
      showMore: false,
      offset: 0,
      characters: 160,
      more: true,
      loading: false,
      success: false,
      alert: false,
      alertMsg: '',
    };

    this.addComment = this.addComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.handleComment = this.handleComment.bind(this);
    this.getComments = this.getComments.bind(this);
    this.onScroll = this.onScroll.bind(this);
  }

  componentDidMount() {
    this.getComments();
    document.querySelector('.comment-box').addEventListener('scroll', this.onScroll, false);
  }

  componentWillUnmount() {
    document.querySelector('.comment-box').removeEventListener('scroll', this.onScroll, false);
  }

  onScroll() {
    const element = document.querySelector('.comment-list');
    const body = document.querySelector('.comment-box');
    const isAtBottom = (body.scrollTop + body.clientHeight) > (element.clientHeight - 100);
    if (isAtBottom && this.state.showMore) {
      this.getComments();
    }
  }

  getComments() {
    this.setState({
      loading: true,
    });

    axios({
      method: 'GET',
      url: `/api/video/${this.props.params.videoId}/comment?offset=${this.state.offset}&more=${this.state.more}`,
    }).then((res) => {
      const result = res.data.comments;
      let offset = this.state.offset;
      if (result.length >= 20) {
        if (res.data.comments[19].User.username === this.props.account.username) {
          offset += res.data.limit;
        } else {
          offset = res.data.limit;
        }
        const comments = this.state.comments.concat(result);
        this.setState({
          comments,
          showMore: true,
          loading: false,
          offset,
          more: res.data.more,
        });
      } else {
        offset += res.data.length;
        const comments = this.state.comments.concat(result);
        this.setState({
          comments,
          showMore: false,
          loading: false,
          offset,
          more: res.data.more,
        });
      }
    }).catch((err) => {
      console.error(err);
    });
  }

  addComment() {
    const newComment = this.state.comment.trim();
    if (newComment.length !== 0 && this.props.account.username) {
      const comment = this.state.comment;
      const commentObj = {
        comment,
        User: {
          username: this.props.account.username,
        },
      };
      this.state.comments.unshift(commentObj);
      const comments = this.state.comments;

      this.setState({
        comment: '',
        characters: 160,
        comments,
      });

      axios({
        method: 'POST',
        url: `/api/video/${this.props.params.videoId}/comment`,
        data: {
          comment,
        },
      }).then((res) => {
        res.data.comment.User = {
          username: this.props.account.username,
        };
        this.state.comments.shift();
        this.state.comments.unshift(res.data.comment);
        const newComments = this.state.comments;
        this.setState({
          comments: newComments,
        });
      }).catch((err) => {
        this.state.comments.shift();
        const newComments = this.state.comments;
        this.setState({
          comments: newComments,
        });
        this.setState({ success: false, alert: true, alertMsg: 'There was an unexpected error please submit your comment again' });
        console.error(err);
      });
    } else if (!this.props.account.username) {
      this.setState({ success: false, alert: true, alertMsg: 'You need to login to add comment' });
    } else {
      this.setState({ success: false, alert: true, alertMsg: 'Comment cannot be empty!' });
    }
  }

  deleteComment(comment, index) {
    const oldComments = this.state.comments;
    this.state.comments.splice(index, 1);
    const comments = this.state.comments;
    this.setState({
      comments,
    });

    axios({
      method: 'DELETE',
      url: `/api/video/${this.props.params.videoId}/comment`,
      data: {
        comment,
        owner: this.props.owner,
      },
    }).catch((err) => {
      console.error(err);
      this.setState({
        comments: oldComments,
      });
      this.setState({ success: false, alert: true, alertMsg: 'There was an unexpected error please try again' });
    });
  }

  handleComment(e) {
    const characters = this.state.characters - (e.target.value.length - this.state.comment.length);
    this.setState({
      comment: e.target.value,
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

    return <div className="character-counter">{this.state.characters}/160</div>;
  }

  submit() {
    if (this.state.characters < 0) {
      return <button className="comment-btn" disabled>Comment</button>;
    }

    return <button className="comment-btn" onClick={this.addComment}>Comment</button>;
  }

  calculateRow(length) {
    if (length < 40) {
      return 1;
    }
    if (Math.ceil(length / 40) > 4) {
      return 4;
    }
    return Math.ceil(length / 40);
  }

  render() {
    return (
      <div className="comment-section">
        <AlertHandle
          success={this.state.success}
          message={this.state.alertMsg}
          visible={this.state.alert}
          onClose={() => this.setState({ alertMsg: '', alert: false })}
        />
        <div className="comment-box">
          <CommentList
            params={this.props.params}
            account={this.props.account}
            deleteComment={this.deleteComment}
            comments={this.state.comments}
            owner={this.props.owner}
            isLoading={this.state.loading}
          />
        </div>
        <div className="comment-textarea-wrapper">
          <textarea
            value={this.state.comment}
            onChange={this.handleComment}
            placeholder="Give a comment..."
            name="comment"
            className="comment-textarea"
            type="text"
            rows={this.calculateRow(this.state.comment.length)}
          />
          <div className="comment-bottom">
            { this.submit() }
            { this.counter() }
          </div>
        </div>
      </div>
    );
  }
}

export default CommentSection;
