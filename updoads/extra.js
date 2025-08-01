// Folder Structure (Monorepo Style): // - backend/ // - frontend/

// ----------------------- // File: backend/server.js // ----------------------- const express = require('express'); const mongoose = require('mongoose'); const cors = require('cors'); const dotenv = require('dotenv'); const authRoutes = require('./routes/auth'); const problemRoutes = require('./routes/problems'); const solutionRoutes = require('./routes/solutions');

const app = express(); dotenv.config();

app.use(cors()); app.use(express.json());

mongoose.connect(process.env.MONGO_URI) .then(() => console.log('MongoDB connected')) .catch(err => console.error(err));

app.use('/api/auth', authRoutes); app.use('/api/problems', problemRoutes); app.use('/api/solutions', solutionRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));

// ---------------------------- // File: backend/models/User.js // ----------------------------
 const mongoose = require('mongoose'); const userSchema = new mongoose.Schema({ username: String, email: String, password: String }); module.exports = mongoose.model('User', userSchema);

// ------------------------------- // File: backend/models/Problem.js // ------------------------------- 
const mongoose = require('mongoose'); const problemSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, location: String, description: String, imageUrl: String, createdAt: { type: Date, default: Date.now } }); module.exports = mongoose.model('Problem', problemSchema);

// -------------------------------- // File: backend/models/Solution.js // -------------------------------- 

const mongoose = require('mongoose'); const solutionSchema = new mongoose.Schema({ problemId: mongoose.Schema.Types.ObjectId, userId: mongoose.Schema.Types.ObjectId, text: String, upvotes: [mongoose.Schema.Types.ObjectId], comments: [ { userId: mongoose.Schema.Types.ObjectId, comment: String, createdAt: { type: Date, default: Date.now } } ] }); module.exports = mongoose.model('Solution', solutionSchema);

// -------------------------------------- // File: backend/routes/auth.js // -------------------------------------- const express = require('express'); const router = express.Router(); const bcrypt = require('bcrypt'); const jwt = require('jsonwebtoken'); const User = require('../models/User');

router.post('/register', async (req, res) => { const { username, email, password } = req.body; const hash = await bcrypt.hash(password, 10); const newUser = new User({ username, email, password: hash }); await newUser.save(); res.status(201).json('User registered'); });

router.post('/login', async (req, res) => { const { email, password } = req.body; const user = await User.findOne({ email }); if (!user || !(await bcrypt.compare(password, user.password))) { return res.status(401).json('Invalid credentials'); } const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET); res.json({ token }); });

module.exports = router;

// ------------------------------------------ // File: backend/routes/problems.js // ------------------------------------------ const express = require('express'); const router = express.Router(); const Problem = require('../models/Problem'); const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => { const token = req.headers.authorization; if (!token) return res.sendStatus(401); jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => { if (err) return res.sendStatus(403); req.userId = decoded.id; next(); }); };

router.post('/', verifyToken, async (req, res) => { const { location, description, imageUrl } = req.body; const problem = new Problem({ userId: req.userId, location, description, imageUrl }); await problem.save(); res.status(201).json(problem); });

router.get('/', async (req, res) => { const problems = await Problem.find().sort({ createdAt: -1 }); res.json(problems); });

router.get('/:id', async (req, res) => { const problem = await Problem.findById(req.params.id); res.json(problem); });

module.exports = router;

// ------------------------------------------ // File: backend/routes/solutions.js // ------------------------------------------
 const express = require('express'); const router = express.Router(); const Solution = require('../models/Solution'); const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => { const token = req.headers.authorization; if (!token) return res.sendStatus(401); jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => { if (err) return res.sendStatus(403); req.userId = decoded.id; next(); }); };

router.post('/:problemId', verifyToken, async (req, res) => { const { text } = req.body; const solution = new Solution({ problemId: req.params.problemId, userId: req.userId, text }); await solution.save(); res.status(201).json(solution); });

router.get('/:problemId', async (req, res) => { const solutions = await Solution.find({ problemId: req.params.problemId }); res.json(solutions); });

router.post('/upvote/:id', verifyToken, async (req, res) => { const solution = await Solution.findById(req.params.id); if (!solution.upvotes.includes(req.userId)) { solution.upvotes.push(req.userId); await solution.save(); } res.json(solution); });

router.post('/comment/:id', verifyToken, async (req, res) => { const { comment } = req.body; const solution = await Solution.findById(req.params.id); solution.comments.push({ userId: req.userId, comment }); await solution.save(); res.json(solution); });

module.exports = router;

// ------------------------------------------ // File: frontend structure (basic pages) // ------------------------------------------ // - frontend/ //   - pages/ //     - Login.jsx //     - Register.jsx //     - Dashboard.jsx (List problems) //     - PostProblem.jsx //     - ProblemDetail.jsx (View problem + solutions) //   - components/ //     - ProblemCard.jsx //     - SolutionItem.jsx //   - App.jsx //   - main.jsx //   - api.js (Axios instance with token) //   - context/AuthContext.jsx

// Routing will be handled with react-router-dom (v6)















// Folder Structure (Monorepo Style):
// - backend/
// - frontend/

// ----------------------- BACKEND CODE -----------------------
// [omitted for brevity, already added above]

// ----------------------- FRONTEND CODE -----------------------

// File: frontend/context/AuthContext.jsx
[...existing code...]

// File: frontend/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const fetchProblems = async () => {
      const res = await API.get('/problems');
      setProblems(res.data);
    };
    fetchProblems();
  }, []);

  return (
    <div>
      <h2>All Problems</h2>
      {problems.map((p) => (
        <div key={p._id} style={{ border: '1px solid #ccc', marginBottom: 10, padding: 10 }}>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
          <Link to={`/problem/${p._id}`}>View Solutions</Link>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;

// File: frontend/pages/PostProblem.jsx
import { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const PostProblem = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post('/problems', { title, description });
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Post a New Problem</h2>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
      <button type="submit">Submit</button>
    </form>
  );
};

export default PostProblem;

// File: frontend/pages/ProblemDetail.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';

const ProblemDetail = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [text, setText] = useState('');

  const fetchData = async () => {
    const res1 = await API.get(`/problems/${id}`);
    const res2 = await API.get(`/solutions/${id}`);
    setProblem(res1.data);
    setSolutions(res2.data);
  };

  useEffect(() => { fetchData(); }, [id]);

  const submitSolution = async (e) => {
    e.preventDefault();
    await API.post(`/solutions/${id}`, { text });
    setText('');
    fetchData();
  };

  const upvote = async (sid) => {
    await API.post(`/solutions/upvote/${sid}`);
    fetchData();
  };

  const comment = async (sid, commentText) => {
    await API.post(`/solutions/comment/${sid}`, { comment: commentText });
    fetchData();
  };

  if (!problem) return <div>Loading...</div>;

  return (
    <div>
      <h2>{problem.title}</h2>
      <p>{problem.description}</p>

      <form onSubmit={submitSolution}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a solution..." required />
        <button type="submit">Submit Solution</button>
      </form>

      <h3>Solutions</h3>
      {solutions.map((s) => (
        <div key={s._id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: 10 }}>
          <p>{s.text}</p>
          <p>Upvotes: {s.upvotes}</p>
          <button onClick={() => upvote(s._id)}>Upvote</button>

          <form onSubmit={(e) => {
            e.preventDefault();
            const commentText = e.target.elements.comment.value;
            comment(s._id, commentText);
            e.target.reset();
          }}>
            <input name="comment" placeholder="Add a comment..." required />
            <button type="submit">Comment</button>
          </form>

          <div>
            <strong>Comments:</strong>
            <ul>
              {s.comments.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProblemDetail;

// File: frontend/components/Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout } = useAuth();

  return (
    <nav style={{ display: 'flex', gap: 10, padding: 10, borderBottom: '1px solid #ccc' }}>
      {token ? (
        <>
          <Link to="/">Dashboard</Link>
          <Link to="/post">Post Problem</Link>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;