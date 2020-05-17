## Instagram Scraper
Scrapes `likes` and `comments` from a public instagram post

### Start Server 

`npm start`

### There are 3 endpoints available-
  - `/`:
    - **params**: `{ postUrl: <url of a public post> }`
    - **returns**: `{ likesCount: <like_count> ,commentCount: <comment_count>,imageUrl:<post_image_url> }`
  - `/fetchLikes`:
    - **params**: `{ postUrl: <url of a public post> }`
    - **returns**: `{ likesList: <list of all likes> }`
  - `/fetchComments`:
    - **params**: `{ postUrl: < url of a public post> }`
    - **returns**: `{ commentList: <list of all comments> }`
