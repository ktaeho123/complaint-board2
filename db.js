const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'posts.json');

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const INITIAL_POSTS = [
  {
    id: 1,
    category: "공지사항",
    title: "학과 구성원 의견 수렴 및 불만 접수 게시판 운영 안내",
    content: "안녕하세요, 학과 학생회 및 행정실입니다.\n\n본 게시판은 학과 구성원들의 학사, 시설, 학업 등 다양한 의견과 건의/불만 사항을 자유롭게 나누고 소통하기 위해 마련된 공간입니다.\n\n- 누구나 자유롭게 익명 또는 실명으로 글을 작성할 수 있습니다.\n- 비방이나 욕설은 지양해주시고, 건전한 피드백 문화를 만들어 가요!\n\n앞으로 로그인, 댓글, 파일 첨부 등의 기능도 지속적으로 추가될 예정입니다. 많은 이용 부탁드립니다.",
    author: "학과 학생회",
    isAnonymous: false,
    password: "1234",
    status: "공지",
    views: 12,
    likes: 5,
    commentsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 2,
    category: "시설/환경",
    title: "3층 실습실 공학용 PC 마우스 교체 요청의 건",
    content: "3층 302호 전산 실습실 15번, 18번 좌석 마우스 클릭이 잘 안 되거나 휠이 헛돕니다. 과제 제출 기간이라 많은 학우들이 이용하고 있으니 빠른 점검 부탁드립니다!",
    author: "익명",
    isAnonymous: true,
    password: "1234",
    status: "처리중",
    views: 8,
    likes: 3,
    commentsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  }
];

function readPosts() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_POSTS, null, 2), 'utf8');
      return INITIAL_POSTS;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading posts:', error);
    return [];
  }
}

function writePosts(posts) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing posts:', error);
    throw error;
  }
}

const db = {
  // Get all posts with optional filtering & sorting
  getAllPosts({ category, status, search, sort = 'latest' } = {}) {
    let posts = readPosts();

    if (category && category !== '전체') {
      posts = posts.filter(p => p.category === category);
    }

    if (status && status !== '전체') {
      posts = posts.filter(p => p.status === status);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
      );
    }

    if (sort === 'views') {
      posts.sort((a, b) => b.views - a.views);
    } else if (sort === 'likes') {
      posts.sort((a, b) => b.likes - a.likes);
    } else {
      // Latest first
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return posts;
  },

  // Get single post by ID
  getPostById(id, incrementViews = false) {
    const posts = readPosts();
    const postIndex = posts.findIndex(p => p.id === Number(id));
    if (postIndex === -1) return null;

    if (incrementViews) {
      posts[postIndex].views = (posts[postIndex].views || 0) + 1;
      writePosts(posts);
    }

    return posts[postIndex];
  },

  // Create a new post
  createPost({ category, title, content, author, isAnonymous, password, status }) {
    const posts = readPosts();
    const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id || 0)) + 1 : 1;

    const newPost = {
      id: newId,
      category: category || "불만/건의",
      title: title.trim(),
      content: content.trim(),
      author: isAnonymous ? "익명" : (author ? author.trim() : "익명"),
      isAnonymous: Boolean(isAnonymous),
      password: password || "",
      status: status || (category === "공지사항" ? "공지" : "접수대기"),
      views: 0,
      likes: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    posts.unshift(newPost);
    writePosts(posts);
    return newPost;
  },

  // Update a post
  updatePost(id, { category, title, content, author, isAnonymous, status, password }) {
    const posts = readPosts();
    const index = posts.findIndex(p => p.id === Number(id));
    if (index === -1) return { success: false, message: '게시글을 찾을 수 없습니다.' };

    const target = posts[index];
    if (target.password && target.password !== password) {
      return { success: false, message: '비밀번호가 일치하지 않습니다.' };
    }

    if (category) target.category = category;
    if (title) target.title = title.trim();
    if (content) target.content = content.trim();
    if (author !== undefined) {
      target.isAnonymous = Boolean(isAnonymous);
      target.author = target.isAnonymous ? "익명" : (author ? author.trim() : "익명");
    }
    if (status) target.status = status;
    target.updatedAt = new Date().toISOString();

    writePosts(posts);
    return { success: true, post: target };
  },

  // Delete a post
  deletePost(id, password) {
    const posts = readPosts();
    const index = posts.findIndex(p => p.id === Number(id));
    if (index === -1) return { success: false, message: '게시글을 찾을 수 없습니다.' };

    const target = posts[index];
    if (target.password && target.password !== password) {
      return { success: false, message: '비밀번호가 일치하지 않습니다.' };
    }

    posts.splice(index, 1);
    writePosts(posts);
    return { success: true };
  },

  // Like a post (for future feature support)
  likePost(id) {
    const posts = readPosts();
    const index = posts.findIndex(p => p.id === Number(id));
    if (index === -1) return null;

    posts[index].likes = (posts[index].likes || 0) + 1;
    writePosts(posts);
    return posts[index];
  }
};

module.exports = db;

