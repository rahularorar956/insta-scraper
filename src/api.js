const { validateURL, saveInDB } = require("./helpers");

const fetchProfile = async (req, res) => {
  const page = res.locals.page;
  try {
    const postUrl = req.body.postUrl;
    if (!validateURL(postUrl)) {
      return res.json({ error: "Invalid Post URL" });
    }

    await page.goto(postUrl, {
      waitUntil: `networkidle0`
    });

    await page.waitFor(5000);
    let data = await page.evaluate(() => {
      if (
        window.__initialData &&
        window.__initialData.data &&
        window.__initialData.data.entry_data &&
        window.__initialData.data.entry_data.PostPage &&
        window.__initialData.data.entry_data.PostPage[0]
      ) {
        return {
          id:
            window.__initialData.data.entry_data.PostPage[0].graphql
              .shortcode_media.shortcode,
          likesCount:
            window.__initialData.data.entry_data.PostPage[0].graphql
              .shortcode_media.edge_media_preview_like.count,
          commentCount:
            window.__initialData.data.entry_data.PostPage[0].graphql
              .shortcode_media.edge_media_to_parent_comment.count,
          imageUrl: document.querySelector(".KL4Bh>img").src
        };
      }
      return { error: true };
    });

    if (data.error) {
      return res.json({
        error: "This Post is Private. Please Try again with Public Post URL"
      });
    }

    // saving in db
    saveInDB(data);
    res.json({ data: data });
  } catch (e) {
    console.log(e);
    return res.json({ error: "Something went wrong! Please try again " });
  }
};

const fetchLikes = async (req, res) => {
  const page = res.locals.page;
  try {
    const postUrl = req.body.postUrl;
    if (!validateURL(postUrl)) {
      return res.json({ error: "Invalid Post URL" });
    }

    await page.goto(postUrl, {
      waitUntil: `networkidle0`
    });

    const result = await page.evaluate(() => {
      const likeSelector = document.querySelectorAll(
        "button.sqdOP.yWX7d._8A5w5:not(.oW_lN)"
      );
      const postId =
        window.__initialData.data.entry_data.PostPage[0].graphql.shortcode_media
          .shortcode;
      if (likeSelector && likeSelector[0]) {
        likeSelector[0].click();
        return { error: false, postId: postId };
      } else {
        return { error: true };
      }
    });

    if (result.error) {
      return res.json({
        error: "This Post is Private. Please Try again with Public Post URL"
      });
    }

    let json = {};
    let data = [];
    do {
      const response = await page
        .waitForResponse(
          response => {
            if (response.url().includes("graphql")) {
              return response;
            }
          },
          { timeout: 2000 }
        )
        .catch(() => null);
      if (response) {
        json = await response.json();
        const likesList = json.data.shortcode_media.edge_liked_by.edges;
        const postId = json.data.shortcode_media.shortcode;
        if (likesList) {
          data.push(...likesList);
        }
      }
      await page.evaluate(() => {
        let div = document.querySelectorAll(
          ".Igw0E.IwRSH.eGOV_.vwCYk.i0EQd>div"
        )[0];
        div.scrollTop = div.offsetHeight * 100;
      });
    } while (json.data.shortcode_media.edge_liked_by.page_info.has_next_page);

    likesList = json.data.shortcode_media.edge_liked_by.edges;
    if (likesList) {
      data.push(...likesList);
    }

    // saving in db
    saveInDB({ id: result.postId, likesList: data });
    res.json({ likesList: data });
  } catch (e) {
    return res.json({ error: "Something went wrong! Please try again " });
  }
};

const fetchComments = async (req, res) => {
  const page = res.locals.page;
  try {
    const postUrl = req.body.postUrl;
    if (!validateURL(postUrl)) {
      return res.json({ error: "Invalid Post URL" });
    }
    await page.goto(postUrl, {
      waitUntil: `networkidle0`
    });

    let data = [];

    let { commentList, has_next_page, error, postId } = await page.evaluate(
      () => {
        if (
          window.__initialData &&
          window.__initialData.data &&
          window.__initialData.data.entry_data &&
          window.__initialData.data.entry_data.PostPage
        ) {
          let commentObj =
            window.__initialData.data.entry_data.PostPage[0].graphql
              .shortcode_media.edge_media_to_parent_comment;
          return {
            postId:
              window.__initialData.data.entry_data.PostPage[0].graphql
                .shortcode_media.shortcode,
            commentList: commentObj.edges,
            has_next_page: commentObj.page_info.has_next_page,
            error: false
          };
        } else {
          return { error: true };
        }
      }
    );
    if (error) {
      return res.json({
        error: "This Post is Private. Please Try again with Public Post URL"
      });
    }

    if (commentList) {
      data.push(...commentList);
    }
    let json = {};

    while (has_next_page) {
      await page.click('[aria-label="Load more comments"]');
      const response = await page
        .waitForResponse(
          response => {
            if (response.url().includes("graphql")) {
              console.log(response.url());
              return response;
            }
          },
          { timeout: 3000 }
        )
        .catch(() => null);

      if (response) {
        json = await response.json();
        commentList =
          json.data.shortcode_media.edge_media_to_parent_comment.edges;
        if (commentList) {
          data.push(...commentList);
        }
        has_next_page =
          json.data.shortcode_media.edge_media_to_parent_comment.page_info
            .has_next_page | false;
      }
    }
    saveInDB({ id: postId, commentList: data });
    res.json({ commentList: data });
  } catch (e) {
    console.log(e);
    return res.json({ error: "Something went wrong! Please try again " });
  }
};

module.exports = {
  fetchProfile,
  fetchComments,
  fetchLikes
};
