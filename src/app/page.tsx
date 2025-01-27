import Link from 'next/link';

export default function Home() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Welcome to Converse</h1>
        <p style={styles.subtitle}>
          A sleek app to create chat rooms and connect with friends. Share ideas, have fun, and stay connected.
        </p>
      </header>
      <main style={styles.main}>
        <Link href="/auth/login" style={styles.button}>
          Get Started
        </Link>
      </main>
      <footer style={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Converse. All rights reserved.</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#000',
    color: '#fff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#fff',
    margin: 0,
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#aaa',
    margin: '0.5rem 0',
  },
  main: {
    marginTop: '1rem',
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#fff',
    color: 'black',
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    textDecoration: 'none',
    borderRadius: '5px',
    transition: 'transform 0.2s, background-color 0.2s',
  },
  buttonHover: {
    transform: 'scale(1.05)',
    backgroundColor: '#ddd',
  },
  footer: {
    marginTop: '2rem',
    fontSize: '0.9rem',
    color: '#666',
  },
};
