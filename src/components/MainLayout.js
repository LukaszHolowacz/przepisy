import React from 'react';
import '../styles/main-layout.css';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';

function MainLayout() {
    return (
        <div className="App">
            <div className="leftPanel">
                <LeftPanel />
            </div>
            <div className="rightPanel">
                <RightPanel />
            </div>
        </div>
    );
};

export default MainLayout;