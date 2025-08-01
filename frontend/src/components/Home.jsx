import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            {/* --- HERO SECTION --- */}
            <div className="container col-xxl-8 px-4 py-5 text-center">
                <h1 className="display-4 fw-bold lh-1 mb-3">Welcome to BookExchange</h1>
                <p className="lead" style={{ maxWidth: '600px', margin: '0 auto', color: '#6c757d' }}>
                    The best place to find, lend, and sell your favorite books. Discover hidden gems in your community and share your own collection with fellow readers.
                </p>
                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mt-4">
                    <Link to="/browse" className="btn btn-primary btn-lg px-4 gap-3">Browse Books</Link>
                    <Link to="/register" className="btn btn-outline-secondary btn-lg px-4">Join Now</Link>
                </div>
            </div>
        </div>
    );
};

export default Home;