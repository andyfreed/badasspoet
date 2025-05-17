"use client";
import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  List,
  ListItem,
  Divider,
  Window,
  WindowHeader,
  WindowContent,
  Tooltip
} from 'react95';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import original from 'react95/dist/themes/original';

// Type definitions
type DesktopItemType = 'computer' | 'recyclebin' | 'gayporn' | 'workfiles' | 'legalissues';

type ContextMenuType = {
  visible: boolean;
  x: number;
  y: number;
  item: DesktopItemType | null;
};

type MenuItemType = {
  name: string;
  icon: React.ReactNode;
};

type ContextMenuItemType = {
  name: string;
  action: string;
};

const GlobalStyles = createGlobalStyle`
  body {
    font-family: 'ms_sans_serif', sans-serif;
    background: url('/background.png') center center / cover no-repeat !important;
    min-height: 100vh;
    margin: 0;
    padding: 0;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }
`;

const TaskbarWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  height: 28px;
`;

const StyledToolbar = styled(Toolbar)`
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 2px;
`;

const StartButton = styled(Button)`
  height: 22px;
  margin: 0 2px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  font-weight: bold;
`;

const StartButtonLogo = styled.img`
  height: 16px;
  width: 16px;
  margin-right: 4px;
`;

const StartMenu = styled.div`
  position: absolute;
  bottom: 28px;
  left: 0;
  width: 220px;
  background: #c0c0c0;
  border: 2px solid #000000;
  border-top-color: #ffffff;
  border-left-color: #ffffff;
  box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.3);
  z-index: 20;
  display: flex;
`;

const StartMenuHeader = styled.div`
  width: 24px;
  background: #000080;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 16px;
`;

const StartMenuVerticalText = styled.div`
  transform: rotate(-90deg);
  color: white;
  font-weight: bold;
  font-size: 16px;
  white-space: nowrap;
  letter-spacing: 1px;
  margin-bottom: 80px;
`;

const StartMenuContent = styled.div`
  flex: 1;
`;

// Create a styled MenuList with custom background
const StyledMenuList = styled(List)`
  background: #c0c0c0;
  border: none;
  box-shadow: none;
  width: 100%;
`;

// Desktop icon styles
const DesktopIcon = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  min-height: 80px;
  margin: 10px;
  cursor: pointer;
  color: white;
  text-align: center;
  text-shadow: 1px 1px 1px black;
  
  &:hover {
    background: rgba(0, 0, 128, 0.3);
    outline: 1px dotted white;
  }
`;

const IconImage = styled.div`
  width: 40px;
  height: 40px;
  margin-bottom: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DesktopIcons = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 5;
  display: flex;
  flex-direction: column;
`;

const ClockWrapper = styled.div`
  font-size: 12px;
  padding: 0 8px;
  margin-left: 8px;
  height: 24px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #7e7e7e #fafafa #fafafa #7e7e7e;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
`;

const ContextMenu = styled.div`
  position: absolute;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #000000 #000000 #ffffff;
  box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.3);
  z-index: 50;
  min-width: 150px;
`;

function Clock() {
  const [time, setTime] = React.useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return <ClockWrapper>{time}</ClockWrapper>;
}

const menuItems = [
  { name: 'Poems', icon: '📝' },
  { name: 'Photos', icon: '🖼️' },
  { name: 'About', icon: 'ℹ️' },
  { name: 'Contact', icon: '✉️' },
];

const contextMenuItems = [
  { name: 'Open', action: 'open' },
  { name: 'Properties', action: 'properties' },
  { name: 'Delete', action: 'delete' },
];

export default function Home() {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuType>({ visible: false, x: 0, y: 0, item: null });
  const [activeWindow, setActiveWindow] = useState<DesktopItemType | null>(null);
  
  const toggleStartMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStartMenuOpen(!startMenuOpen);
  };
  
  // Close menus when clicking outside
  const handleClickOutside = () => {
    if (startMenuOpen) {
      setStartMenuOpen(false);
    }
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false });
    }
  };
  
  const handleRightClick = (e: React.MouseEvent, item: DesktopItemType) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item
    });
  };

  const handleIconDoubleClick = (item: DesktopItemType) => {
    setActiveWindow(item);
  };
  
  const closeWindow = () => {
    setActiveWindow(null);
  };
  
  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [startMenuOpen, contextMenu.visible]);

  return (
    <ThemeProvider theme={original}>
      <GlobalStyles />
      
      {/* Desktop area with background and icons */}
      <div style={{ width: '100vw', height: 'calc(100vh - 28px)' }}>
        {/* Desktop Icons */}
        <DesktopIcons>
          <DesktopIcon 
            onDoubleClick={() => handleIconDoubleClick('computer')}
            onContextMenu={(e) => handleRightClick(e, 'computer')}
          >
            <IconImage>
              <span style={{ fontSize: '32px' }}>💻</span>
            </IconImage>
            <span>My Computer</span>
          </DesktopIcon>
          
          <DesktopIcon 
            onDoubleClick={() => handleIconDoubleClick('recyclebin')}
            onContextMenu={(e) => handleRightClick(e, 'recyclebin')}
          >
            <IconImage>
              <span style={{ fontSize: '32px' }}>🗑️</span>
            </IconImage>
            <span>Recycle Bin</span>
          </DesktopIcon>
          
          <DesktopIcon 
            onDoubleClick={() => handleIconDoubleClick('gayporn')}
            onContextMenu={(e) => handleRightClick(e, 'gayporn')}
          >
            <IconImage>
              <span style={{ fontSize: '32px' }}>📁</span>
            </IconImage>
            <span>Gay Porn</span>
          </DesktopIcon>
          
          <DesktopIcon 
            onDoubleClick={() => handleIconDoubleClick('workfiles')}
            onContextMenu={(e) => handleRightClick(e, 'workfiles')}
          >
            <IconImage>
              <span style={{ fontSize: '32px' }}>📁</span>
            </IconImage>
            <span>Work Files</span>
          </DesktopIcon>
          
          <DesktopIcon 
            onDoubleClick={() => handleIconDoubleClick('legalissues')}
            onContextMenu={(e) => handleRightClick(e, 'legalissues')}
          >
            <IconImage>
              <span style={{ fontSize: '32px' }}>📁</span>
            </IconImage>
            <span>Various Legal Issues</span>
          </DesktopIcon>
        </DesktopIcons>
        
        {/* Context Menu */}
        {contextMenu.visible && (
          <ContextMenu 
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <StyledMenuList>
              {contextMenuItems.map((item) => (
                <ListItem 
                  key={item.action}
                  onClick={() => {
                    if (item.action === 'open' && contextMenu.item) {
                      handleIconDoubleClick(contextMenu.item);
                    }
                    setContextMenu({ ...contextMenu, visible: false });
                  }}
                >
                  {item.name}
                </ListItem>
              ))}
            </StyledMenuList>
          </ContextMenu>
        )}
        
        {/* Windows */}
        {activeWindow && (
          <Window
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '400px',
              height: '300px',
              zIndex: 40,
            }}
          >
            <WindowHeader style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>
                {activeWindow === 'computer' && 'My Computer'}
                {activeWindow === 'recyclebin' && 'Recycle Bin'}
                {activeWindow === 'gayporn' && 'Gay Porn'}
                {activeWindow === 'workfiles' && 'Work Files'}
                {activeWindow === 'legalissues' && 'Various Legal Issues'}
              </span>
              <Button onClick={closeWindow}>X</Button>
            </WindowHeader>
            <WindowContent>
              {activeWindow === 'computer' && 'This is My Computer. No hard drive found.'}
              {activeWindow === 'recyclebin' && 'Recycle Bin is empty.'}
              {activeWindow === 'gayporn' && 'This folder is empty. How disappointing.'}
              {activeWindow === 'workfiles' && 'No work found. You never do any work.'}
              {activeWindow === 'legalissues' && 'Too many legal issues to display.'}
            </WindowContent>
          </Window>
        )}
      </div>
      
      {/* Taskbar at the bottom */}
      <TaskbarWrapper>
        {startMenuOpen && (
          <StartMenu onClick={(e) => e.stopPropagation()}>
            <StartMenuHeader>
              <StartMenuVerticalText>Badasspoet 95</StartMenuVerticalText>
            </StartMenuHeader>
            <StartMenuContent>
              <StyledMenuList>
                {menuItems.map((item) => (
                  <ListItem key={item.name}>
                    <span style={{ marginRight: 8 }}>{item.icon}</span>
                    {item.name}
                  </ListItem>
                ))}
                <Divider />
                <ListItem>
                  <span style={{ marginRight: 8 }}>⚙️</span>
                  Settings
                </ListItem>
                <ListItem>
                  <span style={{ marginRight: 8 }}>🔍</span>
                  Find
                </ListItem>
                <ListItem>
                  <span style={{ marginRight: 8 }}>❓</span>
                  Help
                </ListItem>
                <Divider />
                <ListItem>
                  <span style={{ marginRight: 8 }}>🚪</span>
                  Shut Down...
                </ListItem>
              </StyledMenuList>
            </StartMenuContent>
          </StartMenu>
        )}
        
        <AppBar style={{ position: 'relative', width: '100%', height: '100%' }}>
          <StyledToolbar>
            <StartButton onClick={toggleStartMenu}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <img 
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAjklEQVR4nGNgoBAwgnBcXBwjTOzbt28MOTk5/9PT0/8zMDAwpKen/4+Li2MEqwfx////DzENnAH2DyjJhGwIXDMyZgLpgdmGrhhuCMxmZEPQncUEMwzZEHTXYXUBuiHYvMcI04xsCDZXw72AbAi6/1FcgGwIumthuLK8vPw/zBB016LHCjZDwIYThbGGMykAABvwZcG7nN/EAAAAAElFTkSuQmCC" 
                  alt="" 
                  style={{ width: 16, height: 16, marginRight: 4 }}
                />
                Start
              </span>
            </StartButton>
            <div style={{ flex: 1 }} />
            <Clock />
          </StyledToolbar>
        </AppBar>
      </TaskbarWrapper>
    </ThemeProvider>
  );
}
