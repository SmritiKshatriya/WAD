import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import SubjectCard from '../components/SubjectCard';
import Modal from '../components/Modal';
import { PlusCircle, Calendar, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [subjectsRes, topicsRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/topics/user/all')
      ]);
      setSubjects(subjectsRes.data);
      setTopics(topicsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/subjects', { subjectName: newSubject });
      setSubjects([data, ...subjects]);
      setNewSubject('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding subject', err);
    }
  };

  const handleDeleteSubject = async (id) => {
    if(window.confirm('Are you sure? This will delete all topics inside.')) {
      try {
        await api.delete(`/subjects/${id}`);
        setSubjects(subjects.filter(s => s._id !== id));
        setTopics(topics.filter(t => t.subjectId._id !== id));
      } catch (err) {
        console.error('Error deleting subject', err);
      }
    }
  };

  const today = new Date();
  
  // Calculate overdue topics (status not completed AND deadline has passed)
  const overdueTopics = topics.filter(t => 
    t.status !== 'Completed' && t.deadline && new Date(t.deadline) < today
  );

  // Upcoming deadlines (next 7 days, not completed)
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const upcomingTopics = topics.filter(t => 
    t.status !== 'Completed' && 
    t.deadline && 
    new Date(t.deadline) >= today && 
    new Date(t.deadline) <= nextWeek
  ).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Overview of your learning progress</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={18} /> Add Subject
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {subjects.map(subject => (
          <SubjectCard key={subject._id} subject={subject} onDelete={handleDeleteSubject} />
        ))}
        {subjects.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '16px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No subjects added yet. Start by adding a subject!</p>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Overdue Section */}
        <div className="card" style={{ borderColor: 'var(--color-pastel-red)', borderWidth: '1px', borderStyle: 'solid' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9d0208' }}>
            <AlertCircle size={20} /> Overdue Tasks
          </h3>
          {overdueTopics.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {overdueTopics.map(topic => (
                <li key={topic._id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{topic.topicName} <small style={{ color: 'var(--text-muted)' }}>({topic.subjectId?.subjectName})</small></span>
                  <span className="badge" style={{ backgroundColor: 'var(--color-pastel-red)' }}>
                    {new Date(topic.deadline).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No overdue tasks!</p>
          )}
        </div>

        {/* Upcoming Section */}
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-light-blue)' }}>
            <Calendar size={20} /> Upcoming Deadlines (7 Days)
          </h3>
          {upcomingTopics.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {upcomingTopics.map(topic => (
                <li key={topic._id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{topic.topicName} <small style={{ color: 'var(--text-muted)' }}>({topic.subjectId?.subjectName})</small></span>
                  <span className="badge" style={{ backgroundColor: 'var(--color-pastel-orange)' }}>
                    {new Date(topic.deadline).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
             <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No upcoming deadlines this week.</p>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Subject">
        <form onSubmit={handleAddSubject}>
          <div className="form-group">
            <label>Subject Name</label>
            <input 
              type="text" 
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="e.g. Mathematics, React.js"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Subject</button>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
