import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import TopicItem from '../components/TopicItem';
import Modal from '../components/Modal';
import { ArrowLeft, PlusCircle, Search, Filter } from 'lucide-react';

const SubjectDetails = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [formData, setFormData] = useState({
    topicName: '',
    description: '',
    status: 'Not Started',
    deadline: ''
  });

  const fetchData = async () => {
    try {
      const [subjectRes, topicsRes] = await Promise.all([
        api.get('/subjects'), // Since there's no get by id for subjects, filter from all
        api.get(`/topics/${id}`)
      ]);
      const currentSubject = subjectRes.data.find(s => s._id === id);
      setSubject(currentSubject);
      setTopics(topicsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTopic) {
        const { data } = await api.put(`/topics/${editingTopic._id}`, formData);
        setTopics(topics.map(t => t._id === data._id ? data : t));
      } else {
        const { data } = await api.post('/topics', { ...formData, subjectId: id });
        setTopics([data, ...topics]);
      }
      setIsModalOpen(false);
      setEditingTopic(null);
      setFormData({ topicName: '', description: '', status: 'Not Started', deadline: '' });
      // In a real app, you might want to refetch the subject to update the progress locally.
      // But we can also calculate it locally if needed.
    } catch (err) {
      console.error('Error saving topic:', err);
    }
  };

  const handleStatusChange = async (topicId, newStatus) => {
    try {
      const { data } = await api.put(`/topics/${topicId}`, { status: newStatus });
      setTopics(topics.map(t => t._id === topicId ? data : t));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDelete = async (topicId) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        await api.delete(`/topics/${topicId}`);
        setTopics(topics.filter(t => t._id !== topicId));
      } catch (err) {
        console.error('Error deleting topic:', err);
      }
    }
  };

  const openEditModal = (topic) => {
    setEditingTopic(topic);
    setFormData({
      topicName: topic.topicName,
      description: topic.description || '',
      status: topic.status,
      deadline: topic.deadline ? new Date(topic.deadline).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.topicName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate local progress based on current topics state
  const completedCount = topics.filter(t => t.status === 'Completed').length;
  const progress = topics.length === 0 ? 0 : Math.round((completedCount / topics.length) * 100);

  if (loading) return <div>Loading...</div>;
  if (!subject) return <div>Subject not found</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0 }}>{subject.subjectName}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{completedCount} / {topics.length} Topics Completed</span>
              <span style={{ fontWeight: 600, color: 'var(--color-mint-green)' }}>{progress}%</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => {
            setEditingTopic(null);
            setFormData({ topicName: '', description: '', status: 'Not Started', deadline: '' });
            setIsModalOpen(true);
          }}>
            <PlusCircle size={18} /> Add Topic
          </button>
        </div>
        
        <div className="progress-container" style={{ marginTop: '1rem' }}>
          <div 
            className="progress-bar"
            style={{ width: `${progress}%`, transition: 'width 0.5s ease' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search topics..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="var(--text-muted)" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '150px' }}>
            <option value="All">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div>
        {filteredTopics.length > 0 ? (
          filteredTopics.map(topic => (
            <TopicItem 
              key={topic._id} 
              topic={topic} 
              onStatusChange={handleStatusChange} 
              onDelete={handleDelete}
              onEdit={openEditModal}
            />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '16px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No topics match your criteria.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTopic ? "Edit Topic" : "Add New Topic"}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Topic Name *</label>
            <input 
              type="text" 
              value={formData.topicName}
              onChange={(e) => setFormData({...formData, topicName: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Deadline</label>
              <input 
                type="date" 
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            {editingTopic ? "Update Topic" : "Create Topic"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default SubjectDetails;
