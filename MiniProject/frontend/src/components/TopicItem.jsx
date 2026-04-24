import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Trash2, Edit2 } from 'lucide-react';

const TopicItem = ({ topic, onStatusChange, onDelete, onEdit }) => {
  const isOverdue = topic.status !== 'Completed' && topic.deadline && new Date(topic.deadline) < new Date();
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'var(--color-mint-green)';
      case 'In Progress': return 'var(--color-light-blue)';
      default: return 'var(--color-pastel-orange)';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1rem',
        marginBottom: '1rem',
        borderLeft: `4px solid ${getStatusColor(topic.status)}`,
        backgroundColor: isOverdue ? 'var(--color-pastel-red)' : 'var(--bg-card)'
      }}
    >
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {topic.topicName}
          {isOverdue && <span className="badge" style={{ backgroundColor: '#9d0208', color: 'white', fontSize: '0.6rem' }}>OVERDUE</span>}
        </h4>
        {topic.description && <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: isOverdue ? '#4a0000' : 'var(--text-muted)' }}>{topic.description}</p>}
        
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: isOverdue ? '#4a0000' : 'var(--text-muted)' }}>
          {topic.deadline && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={14} /> 
              {new Date(topic.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <select 
          value={topic.status} 
          onChange={(e) => onStatusChange(topic._id, e.target.value)}
          style={{ width: '130px', padding: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        
        <button onClick={() => onEdit(topic)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
          <Edit2 size={16} />
        </button>
        <button onClick={() => onDelete(topic._id)} style={{ background: 'transparent', color: isOverdue ? '#9d0208' : 'var(--text-muted)' }}>
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default TopicItem;
