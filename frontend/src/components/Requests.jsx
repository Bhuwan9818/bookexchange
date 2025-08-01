import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

export default function Requests({ token }) {
  const [requests, setRequests] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const navigate = useNavigate();

  

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const decoded = jwtDecode(token);
    setCurrentUserId(decoded.userId);
    fetch('http://localhost:5000/api/requests', { headers: { Authorization: `Bearer ${token}` }})
      .then(res => res.json()).then(setRequests).catch(console.error);
  }, [token, navigate]);

  const handleStatusUpdate = async (id, status) => {
    await fetch(`http://localhost:5000/api/requests/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }),});
    setRequests(requests.map(req => req._id === id ? { ...req, status } : req));
    toast.success(`Request has been ${status}.`);
  };
  
  const viewContact = async (id) => {
    try {
        const res = await fetch(`http://localhost:5000/api/requests/${id}/contact`, { headers: { Authorization: `Bearer ${token}` }});
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setContactInfo(data);
    } catch(err) { toast.error(err.message); }
  };


  const infoToShow = contactInfo && contactInfo.owner ? (currentUserId === contactInfo.owner._id ? contactInfo.requester : contactInfo.owner) : null;
  const incoming = requests.filter(req => req.ownerId._id === currentUserId);
  console.log(incoming);
  const outgoing = requests.filter(req => req.requesterId._id === currentUserId);
  const hasUserRated = (req) => {
      const isOwner = req.ownerId._id === currentUserId;
      return isOwner ? req.isRatedByOwner : req.isRatedByRequester;
  };

  // console.log(req.bookId)

  return (
    <div className="container py-2">

      <h2 className="mb-4">My Requests</h2>
      
      <div className="card card-ui">
        <div className="card-header bg-white py-3"><h4 className="mb-0">Incoming Requests</h4></div>
        <div className="card-body"><div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead><tr><th>Book Title</th><th>Requester</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
            <tbody>{incoming.map(req => (<tr key={req._id}>
              {console.log(req.bookId)}
                <td>{req.bookId.title}</td><td>{req.requesterId.username}</td>
                <td>
                  <span className={`badge rounded-pill text-bg-${req.status === 'accepted' ? 'success' : 'warning'}`}>{req.status}</span>
                </td>
                <td className="text-end"><div className="d-flex justify-content-end gap-2">
                    {req.status === 'pending' && (<><button onClick={() => handleStatusUpdate(req._id, 'accepted')} className="btn btn-success btn-sm">Accept</button><button onClick={() => handleStatusUpdate(req._id, 'rejected')} className="btn btn-danger btn-sm">Reject</button></>)}
                </div></td>
            </tr>))}</tbody>
          </table>
        </div></div>
      </div>

      <div className="card card-ui mt-5">
        <div className="card-header bg-white py-3"><h4 className="mb-0">Outgoing Requests</h4></div>
        <div className="card-body"><div className="table-responsive">
          <table className="table table-hover align-middle">
          <thead><tr><th>Book Title</th><th>Owner</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
            <tbody>{outgoing.map(req => (<tr key={req._id}>
                <td>{req.bookId.title}</td><td>{req.ownerId.username}</td>
                <td>
                  <span className={`badge rounded-pill text-bg-${req.status === 'accepted' ? 'success' : 'warning'}`}>{req.status}</span>
                  {req.deliveryStatus === 'sent' && <span className="badge rounded-pill text-bg-info ms-2">Shipped</span>}
                  {req.deliveryStatus === 'received' && <span className="badge rounded-pill text-bg-dark ms-2">Completed</span>}
                </td>
                <td className="text-end"><div className="d-flex justify-content-end gap-2">
                    {req.status === 'accepted' && req.deliveryStatus === 'sent' && (<button onClick={() => handleDeliverClick(req)} className="btn btn-success btn-sm">Confirm Receipt</button>)}
                    {/* {req.status === 'accepted' && (<><button onClick={() => viewContact(req._id)} className="btn btn-secondary btn-sm">Contact</button></>)} */}
                </div></td>
            </tr>))}</tbody>
          </table>
        </div></div>
      </div>
    </div>
  );
}