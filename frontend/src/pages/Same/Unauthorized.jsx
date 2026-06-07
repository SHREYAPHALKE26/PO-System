import React from 'react';

/**
 * A component to display a full-screen loading indicator and message.
 */
export default function LoadingScreen() {
  return (
    <div
      style={{
        textAlign: 'center',
        marginTop: '100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      role="status" // Accessibility: indicates this is a status message
      aria-live="polite" // Accessibility: informs screen readers of updates
    >
      {/* This is where your actual spinner element (defined by the 'spinner-animation' CSS) would go.
        For this to work, you need CSS for .spinner-animation.
      */}
      <div className="spinner-animation"></div>

      <h1
        className="text-3xl"
        style={{
          color: '#007bff', // Added a brand color
          fontWeight: 'bold',
          letterSpacing: '2px',
          fontSize: '2.5rem', // Slightly larger text
        }}
      >
        Loading application data...
      </h1>
      <p style={{ marginTop: '10px', color: '#666' }}>
        Please wait a moment while we set things up.
      </p>
    </div>
  );
}