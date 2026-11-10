const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// 1. Get posts list
app.get('/api/posts', (req, res) => {
  try {
    const { category, status, search, sort } = req.query;
    const posts = db.getAllPosts({ category, status, search, sort });
    res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    console.error('API Error /api/posts:', error);
    res.status(500).json({ success: false, message: '게시글 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 2. Get single post by id
app.get('/api/posts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const increment = req.query.view !== 'false';
    const post = db.getPostById(id, increment);

    if (!post) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('API Error /api/posts/:id:', error);
    res.status(500).json({ success: false, message: '게시글 조회 중 오류가 발생했습니다.' });
  }
});

// 3. Create post (Essential Feature)
app.post('/api/posts', (req, res) => {
  try {
    const { category, title, content, author, isAnonymous, password, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: '게시글 제목을 입력해주세요.' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: '게시글 내용을 입력해주세요.' });
    }

    const createdPost = db.createPost({
      category: category || '불만/건의',
      title: title.trim(),
      content: content.trim(),
      author: author ? author.trim() : '익명',
      isAnonymous: Boolean(isAnonymous),
      password: password ? String(password) : '',
      status
    });

    res.status(201).json({
      success: true,
      message: '게시글이 성공적으로 등록되었습니다.',
      data: createdPost
    });
  } catch (error) {
    console.error('API Error POST /api/posts:', error);
    res.status(500).json({ success: false, message: '게시글 등록 중 오류가 발생했습니다.' });
  }
});

// 4. Update post
app.put('/api/posts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { category, title, content, author, isAnonymous, status, password } = req.body;

    const result = db.updatePost(id, {
      category,
      title,
      content,
      author,
      isAnonymous,
      status,
      password: password ? String(password) : ''
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({ success: true, message: '게시글이 수정되었습니다.', data: result.post });
  } catch (error) {
    console.error('API Error PUT /api/posts/:id:', error);
    res.status(500).json({ success: false, message: '게시글 수정 중 오류가 발생했습니다.' });
  }
});

// 5. Delete post
app.delete('/api/posts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const result = db.deletePost(id, password ? String(password) : '');

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({ success: true, message: '게시글이 삭제되었습니다.' });
  } catch (error) {
    console.error('API Error DELETE /api/posts/:id:', error);
    res.status(500).json({ success: false, message: '게시글 삭제 중 오류가 발생했습니다.' });
  }
});

// 6. Like post (추천)
app.post('/api/posts/:id/like', (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.likePost(id);
    if (!updated) {
      return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }
    res.json({ success: true, likes: updated.likes });
  } catch (error) {
    console.error('API Error POST /api/posts/:id/like:', error);
    res.status(500).json({ success: false, message: '추천 처리 중 오류가 발생했습니다.' });
  }
});

// Fallback to index.html for SPA/client routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` 학과 불만/의견 게시판 웹 서버가 실행되었습니다!`);
  console.log(` 접속 주소: http://localhost:${PORT}`);
  console.log(`=================================================`);
});

