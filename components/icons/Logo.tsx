import React from 'react';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 100 100" 
    xmlns="http://www.w3.org/2000/svg" 
    {...props}
    >
    <rect width="100" height="100" fill="#D60000" rx="20"/>
    <g stroke="white" strokeWidth="7" fill="none">
      <path d="M 0 15 C 33 30, 67 30, 100 15" />
      <path d="M 0 85 C 33 70, 67 70, 100 85" />
      <path d="M 42 15 V 85" />
      <path d="M 58 15 V 85" />
    </g>
  </svg>
);

export default Logo;