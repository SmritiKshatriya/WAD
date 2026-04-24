import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

const SubjectCard = ({ subject, onDelete }) => {
  return (
    <motion.div 
      className="card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <Link to={`/subject/${subject._id}`}>
          <h3 style={{ margin: 0 }}>{subject.subjectName}</h3>
        </Link>
        <button onClick={() => onDelete(subject._id)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
          <Trash2 size={18} />
        </button>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span>{subject.completedTopics} / {subject.totalTopics} Topics</span>
          <span style={{ fontWeight: 600, color: 'var(--color-mint-green)' }}>{subject.progress}%</span>
        </div>
        
        <div className="progress-container">
          <motion.div 
            className="progress-bar"
            initial={{ width: 0 }}
            animate={{ width: `${subject.progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default SubjectCard;
