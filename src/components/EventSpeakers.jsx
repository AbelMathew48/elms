/**
 * @file EventSpeakers.jsx
 * @description Renders the featured event speaker cards section.
 */
import React from 'react';
import styles from './EventSpeakers.module.css';
import { speakers } from '../data/data';

const EventSpeakers = () => {
  return (
    <section className={styles.speakersSection}>
      {/* Advanced Animated Grid Background */}
      <div className={styles.gridBackground}></div>
      
      {/* Decorative ambient lighting */}
      <div className={styles.ambientLight1}></div>
      <div className={styles.ambientLight2}></div>

      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Event Speakers</h2>
          <p className={styles.description}>
            Learn from industry leaders and creative minds shaping the digital landscape.
          </p>
        </div>
        
        <div className={styles.speakersList}>
          {speakers.map((speaker, index) => (
            <div 
              key={speaker.id} 
              className={styles.speakerCard}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Premium Glow effect element behind the card */}
              <div className={styles.cardGlow}></div>
              
              <div className={styles.cardContent}>
                {/* Specular highlight for glass effect */}
                <div className={styles.specularHighlight}></div>

                <div 
                  className={styles.imageWrapper}
                  style={{ backgroundColor: speaker.bgColor }}
                >
                  <img 
                    src={speaker.image} 
                    alt={speaker.name} 
                    className={styles.speakerImage}
                  />
                  {/* Rotating decorative border */}
                  <div className={styles.rotatingBorder}></div>
                </div>
                
                <h3 className={styles.speakerName}>{speaker.name}</h3>
                
                <div className={styles.roleContainer}>
                  <span className={styles.speakerRole}>{speaker.role}</span>
                </div>

                <div className={styles.socialLinks}>
                  <a href="#" aria-label="LinkedIn" className={styles.socialIcon} style={{ transitionDelay: '0.0s' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </a>
                  <a href="#" aria-label="Twitter" className={styles.socialIcon} style={{ transitionDelay: '0.05s' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                    </svg>
                  </a>
                  <a href="#" aria-label="Website" className={styles.socialIcon} style={{ transitionDelay: '0.1s' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventSpeakers;
