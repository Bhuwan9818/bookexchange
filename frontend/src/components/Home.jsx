import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="home-hero bg-light min-vh-100 d-flex align-items-center">
            <div className="container text-center py-5">
                <h1 className="display-3 fw-bold mb-4" style={{ color: '#1a365d' }}>
                    Empower Your Reading Journey
                </h1>
                <p className="lead mb-4" style={{ maxWidth: '650px', margin: '0 auto', color: '#495057' }}>
                    BookExchange is the premier platform for book enthusiasts to discover, exchange, and sell books within a trusted community. Connect with fellow readers, expand your library, and give your books a new life—all in one place.
                </p>
                <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4">
                    <Link to="/browse" className="btn btn-primary btn-lg px-5 shadow-sm">
                        Explore Books
                    </Link>
                    <Link to="/register" className="btn btn-outline-primary btn-lg px-5 shadow-sm">
                        Get Started
                    </Link>
                </div>
                <div className="mt-5 d-flex flex-wrap justify-content-center gap-3">
                    <img
                        src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80"
                        alt="Bookshelf"
                        className="img-fluid rounded shadow"
                        style={{ maxHeight: '340px', objectFit: 'cover' }}
                    />
                    <img
                        src="https://cdn-v2.asla.org/uploadedImages/CMS/Shop/Bookstore/books.jpg"
                        alt="Bookshelf"
                        className="img-fluid rounded shadow"
                        style={{ maxHeight: '340px', objectFit: 'cover' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;