declare module 'react95' {
  import * as React from 'react';
  
  export const AppBar: React.FC<any>;
  export const Toolbar: React.FC<any>;
  export const Button: React.FC<any>;
  export const List: React.FC<any>;
  export const ListItem: React.FC<any>;
  export const Divider: React.FC<any>;
  export const Window: React.FC<any>;
  export const WindowHeader: React.FC<any>;
  export const WindowContent: React.FC<any>;
  export const Tooltip: React.FC<any>;
}

declare module 'react95/dist/themes/original' {
  const theme: any;
  export default theme;
} 