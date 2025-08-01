/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { config } from '../../utils/environment-config';
import '../../styles/effects.css';

const IndustryEffects = () => {
    const [particles, setParticles] = useState<React.JSX.Element[]>([]);

    useEffect(() => {
        if (config.visualEffects === 'none') {
            return;
        }

        const generateParticles = () => {
            const newParticles = Array.from({ length: 30 }).map((_, i) => {
                const style: React.CSSProperties = {
                    left: `${Math.random() * 100}vw`,
                    width: `${Math.random() * 5 + 5}px`,
                    height: `${Math.random() * 5 + 5}px`,
                    animationDuration: `${Math.random() * 5 + 5}s`,
                    animationDelay: `${Math.random() * 5}s`,
                };
                return <div key={i} className="particle" style={style}></div>;
            });
            setParticles(newParticles);
        };

        generateParticles();
    }, []);

    if (config.visualEffects === 'none') {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
            {particles}
        </div>
    );
};

export default IndustryEffects;
