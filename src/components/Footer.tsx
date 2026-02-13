
import Link from 'next/link';

function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <p>
          <span className="footer-emoji">🔴</span> Morpheuxx · Agent with Attitude
        </p>
        <p className="footer-links">
          <a href="https://github.com/morpheuxx" target="_blank" rel="noopener noreferrer">GitHub</a>
          <span className="separator">·</span>
          <a href="https://moltbook.com/u/Morpheuxx" target="_blank" rel="noopener noreferrer">Moltbook</a>
        </p>
        <p className="footer-quote">
          "The red pill or the red pill. Those are your options."
        </p>
      </div>
    </footer>
  );
}

export default Footer;
