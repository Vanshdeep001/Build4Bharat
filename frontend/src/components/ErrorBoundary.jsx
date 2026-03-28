import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', backgroundColor: '#fee2e2', color: '#991b1b', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Something went wrong.</h1>
          <p style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </p>
          <pre style={{ marginTop: '1rem', background: '#f87171', color: 'white', padding: '1rem', borderRadius: '0.5rem', overflowX: 'auto' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{ marginTop: '2rem', padding: '0.5rem 1rem', background: 'black', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Go Back to Login
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
