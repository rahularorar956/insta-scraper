import React from "react";
import "./App.css";
import axios from "axios";
// get our fontawesome imports
import {
  faHeart,
  faCommentAlt,
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
class App extends React.Component {
  constructor() {
    super();
    this.state = {
      postUrl: "",
      likesCount: 0,
      commentCount: 0,
      imageUrl: "",
      likesList: [],
      commentsList: [],
      showPopup: false,
      errorMessage: "",
      loading: false,
      showRepliesPopup: false,
      repliesList: []
    };
  }
  render() {
    const handle = e => {
      e.preventDefault();
      this.setState({ loading: true });
      axios
        .post("http://localhost:3001/", { postUrl: this.input.value })
        .then(response => {
          if (response.data.error) {
            this.setState({
              errorMessage: response.data.error,
              postUrl: "",
              loading: false
            });
            return;
          }
          let data = response.data.data;
          this.setState({
            postUrl: this.input.value,
            likesCount: data.likesCount,
            imageUrl: data.imageUrl,
            commentCount: data.commentCount,
            errorMessage: "",
            loading: false
          });
        });
    };

    const showLikes = e => {
      e.preventDefault();

      this.setState({ loading: true });
      axios
        .post("http://localhost:3001/fetchLikes", {
          postUrl: this.state.postUrl
        })
        .then(response => {
          if (response.data.error) {
            this.setState({
              errorMessage: response.data.error,
              postUrl: "",
              loading: false
            });
            return;
          }
          let data = response.data;
          this.setState({
            likesList: data.likesList,
            showPopup: true,
            loading: false
          });
        });
    };

    const showComments = e => {
      e.preventDefault();

      this.setState({ loading: true });
      axios
        .post("http://localhost:3001/fetchComments", {
          postUrl: this.state.postUrl
        })
        .then(response => {
          if (response.data.error) {
            this.setState({
              errorMessage: response.data.error,
              postUrl: "",
              loading: false
            });
            return;
          }
          let data = response.data;
          this.setState({
            commentsList: data.commentList,
            showPopup: true,
            loading: false
          });
        })
        .catch(err => {
          console.log(err);
        });
    };
    const closePopup = e => {
      e.preventDefault();
      this.setState({ showPopup: false, likesList: [], commentsList: [] });
    };

    const openReplies = (e, items) => {
      e.preventDefault();
      if (items.length > 0)
        this.setState({ showRepliesPopup: true, repliesList: items });
    };
    const closeRepliesPopup = e => {
      e.preventDefault();
      this.setState({ showRepliesPopup: false, repliesList: [] });
    };
    return (
      <>
        {this.state.loading && (
          <div id="spinner">
            <div class="loading"></div>
            <p>
              Fetching Data...
              <br /> Please wait !!
            </p>
          </div>
        )}

        <div className="outer-container">
          <div className="outer-input">
            <form onSubmit={handle}>
              <div className="input">
                <input
                  type="text"
                  name="name"
                  className="question"
                  autoFocus
                  ref={input => (this.input = input)}
                  id="nme"
                  required
                />
                <label htmlFor="nme">
                  <span>Enter Post URL...</span>
                </label>
              </div>
              <div className="search-button">
                <button className="button">Submit</button>
              </div>
            </form>
          </div>

          {this.state.postUrl && (
            <div className="card">
              <img src={this.state.imageUrl} alt="profile pic" />
              <div className="container" style={{ padding: "0px" }}>
                <button title="Get Likes" onClick={showLikes}>
                  <FontAwesomeIcon icon={faHeart} />
                  {" " + this.state.likesCount}
                </button>
                <button
                  title="Get Comments"
                  onClick={showComments}
                  style={{ marginLeft: "20px" }}
                >
                  <FontAwesomeIcon icon={faCommentAlt} />
                  {" " + this.state.commentCount}
                </button>
              </div>
            </div>
          )}

          {this.state.errorMessage && (
            <div className="card">
              <b>{this.state.errorMessage}</b>
            </div>
          )}

          {this.state.showPopup && (
            <div id="myModal" className="modal">
              <div className="modal-content">
                <div className="modal-header">
                  <span className="close" onClick={closePopup}>
                    &times;
                  </span>
                  <h2>Result</h2>
                </div>
                <div className="modal-body">
                  {this.state.likesList.length > 0 &&
                    this.state.likesList.map(item => (
                      <div className="chip" title={item.node.username}>
                        <img
                          src={item.node.profile_pic_url}
                          key={item.node.id}
                          alt="Person"
                          width="96"
                          height="96"
                        />
                        {item.node.username}
                      </div>
                    ))}

                  {this.state.commentsList.length > 0 &&
                    this.state.commentsList.map(item => (
                      <div
                        onClick={e => {
                          openReplies(
                            e,
                            item.node.edge_threaded_comments.edges
                          );
                        }}
                        className="chip"
                        title={item.node.owner.username}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={item.node.owner.profile_pic_url}
                          key={item.node.id}
                          alt="Person"
                          width="96"
                          height="96"
                        />
                        {item.node.owner.username} (
                        {new Date(item.node.created_at * 1000).toUTCString()})
                        {item.node.edge_threaded_comments.edges.length > 0 && (
                          <FontAwesomeIcon
                            icon={faPlus}
                            style={{ paddingLeft: "15px" }}
                            title="View Replies"
                          />
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {this.state.showRepliesPopup && (
            <div id="myModal1" className="modal">
              <div className="modal-content">
                <div className="modal-header">
                  <span className="close" onClick={closeRepliesPopup}>
                    &times;
                  </span>
                  <h2>Comment Replies</h2>
                </div>
                <div className="modal-body">
                  {this.state.repliesList.length > 0 &&
                    this.state.repliesList.map(item => (
                      <div
                        className="chip"
                        title={item.node.owner.username}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={item.node.owner.profile_pic_url}
                          key={item.node.id}
                          alt="Person"
                          width="96"
                          height="96"
                        />
                        {item.node.owner.username} (
                        {new Date(item.node.created_at * 1000).toUTCString()})
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
}

export default App;
