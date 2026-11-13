import { useEffect, useMemo, useRef, useState } from 'react';
import {
  birthdayArt,
  birthdayGirl,
  birthdayPin,
  keepsakeElements,
  loveLetter,
  lovePhotos,
  puzzleImage,
  puzzleImageAspectRatio,
  videos,
} from './content';

const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '↵'];
const heartGrid = { columns: 17, rows: 15 };
const scatterPlacements = {
  hero: [
    { index: 0, top: '18%', left: '4%', width: '10vw', angle: '-13deg' },
    { index: 1, right: '5%', bottom: '17%', width: '9vw', angle: '11deg' },
  ],
  birthdayArt: [
    { index: 2, top: '30%', left: '1%', width: '8vw', angle: '-8deg' },
    { index: 3, right: '2%', bottom: '16%', width: '10vw', angle: '12deg' },
  ],
  eyes: [
    { index: 4, top: '12%', right: '6%', width: '9vw', angle: '9deg' },
  ],
  film: [
    { index: 5, top: '26%', left: '1%', width: '9vw', angle: '-12deg' },
    { index: 6, right: '2%', bottom: '10%', width: '10vw', angle: '8deg' },
  ],
  puzzle: [
    { index: 7, top: '25%', right: '4%', width: '9vw', angle: '-9deg' },
  ],
  birthday: [
    { index: 8, top: '35%', left: '4%', width: '10vw', angle: '13deg' },
  ],
  letter: [
    { index: 9, top: '15%', right: '4%', width: '9vw', angle: '-12deg' },
  ],
};

function ScatteredElements({ pieces }) {
  return (
    <div aria-hidden="true" className="scatter-field">
      {pieces.map((piece) => (
        <img
          alt=""
          className="scatter-item"
          key={piece.index}
          loading="lazy"
          src={keepsakeElements[piece.index]}
          style={{
            '--scatter-top': piece.top,
            '--scatter-left': piece.left,
            '--scatter-right': piece.right,
            '--scatter-bottom': piece.bottom,
            '--scatter-width': piece.width,
            '--scatter-angle': piece.angle,
            '--scatter-delay': `${(piece.index % 4) * -0.8}s`,
          }}
        />
      ))}
    </div>
  );
}

function isHeartPixel(column, row) {
  const x = ((column + 0.5) / heartGrid.columns) * 2.9 - 1.45;
  const y = 1.35 - ((row + 0.5) / heartGrid.rows) * 2.7;
  return (x * x + y * y - 1) ** 3 - x * x * y ** 3 <= 0;
}

function createPuzzle() {
  const tiles = Array.from({ length: 9 }, (_, index) => index);
  for (let index = tiles.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [tiles[index], tiles[randomIndex]] = [tiles[randomIndex], tiles[index]];
  }
  if (tiles.every((tile, index) => tile === index)) [tiles[0], tiles[1]] = [tiles[1], tiles[0]];
  return tiles;
}

function App() {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [puzzle, setPuzzle] = useState(createPuzzle);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [blownCandles, setBlownCandles] = useState([]);
  const pageRef = useRef(null);

  const heartPixels = useMemo(() => {
    let photoIndex = 0;
    return Array.from({ length: heartGrid.rows }, (_, row) =>
      Array.from({ length: heartGrid.columns }, (_, column) => {
        if (!isHeartPixel(column, row)) return null;
        const index = photoIndex;
        photoIndex += 1;
        return {
          src: lovePhotos[index % lovePhotos.length],
          delay: `${((row * 17 + column * 7) % 31) * 60}ms`,
        };
      }),
    );
  }, []);

  useEffect(() => {
    if (!leaving) return undefined;
    const timer = window.setTimeout(() => setUnlocked(true), 650);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  useEffect(() => {
    if (!unlocked) return undefined;
    window.scrollTo(0, 0);

    const items = pageRef.current?.querySelectorAll('.reveal');
    if (!items?.length) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach((item) => item.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14 },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [unlocked]);

  function handlePinKey(key) {
    if (key === '↵') {
      if (pin === birthdayPin) {
        setPinError('');
        setLeaving(true);
      } else {
        setPinError('Coba lagi, sayang.');
        setPin('');
      }
      return;
    }
    if (key === '⌫') {
      setPin((current) => current.slice(0, -1));
      setPinError('');
      return;
    }
    if (pin.length < 4) {
      setPin((current) => `${current}${key}`);
      setPinError('');
    }
  }

  function handlePinChange(event) {
    setPin(event.currentTarget.value.replace(/\D/g, '').slice(0, 4));
    setPinError('');
  }

  function submitPin(event) {
    event.preventDefault();
    if (pin === birthdayPin) {
      setPinError('');
      setLeaving(true);
    } else {
      setPinError('Coba lagi, sayang.');
      setPin('');
    }
  }

  function swapPieces(first, second) {
    if (first === second || first === null || second === null) return;
    setPuzzle((current) => {
      const next = [...current];
      [next[first], next[second]] = [next[second], next[first]];
      return next;
    });
  }

  function selectPiece(index) {
    if (selectedPiece === null) {
      setSelectedPiece(index);
      return;
    }
    swapPieces(selectedPiece, index);
    setSelectedPiece(null);
  }

  const solved = puzzle.every((tile, index) => tile === index);

  if (!unlocked) {
    return (
      <main className={`page-shell pin-screen${leaving ? ' pin-screen--leaving' : ''}`}>
        <div className="pin-brand">Buat Cantiknya akuuu</div>
        <form className="pin-panel" onSubmit={submitPin}>
          <div className="pin-title">Hai, sayang.</div>
          <p>Hayoloh lupa kan pinnya apa, kode nuklir nih</p>
          <label className="pin-display" htmlFor="birthday-pin">
            {Array.from({ length: 4 }, (_, index) => (
              <span className={index < pin.length ? 'filled' : ''} key={index}>
                {index < pin.length ? '♥' : '·'}
              </span>
            ))}
            <input
              aria-label="PIN ulang tahun"
              autoComplete="one-time-code"
              id="birthday-pin"
              inputMode="numeric"
              maxLength={4}
              onChange={handlePinChange}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submitPin(event);
              }}
              pattern="[0-9]*"
              type="password"
              value={pin}
            />
          </label>
          <div className="keypad">
            {keypad.map((key) => (
              <button
                key={key}
                aria-label={key === '↵' ? 'Buka kejutan' : key === '⌫' ? 'Hapus angka terakhir' : key}
                onClick={() => handlePinKey(key)}
                type="button"
              >
                {key}
              </button>
            ))}
          </div>
          <p className="pin-error" aria-live="polite">{pinError}</p>
        </form>
      </main>
    );
  }

  return (
    <main className="archive-page page-enter" ref={pageRef}>
      <section className="heart-hero" aria-label={`Hati dari foto-foto ${birthdayGirl}`}>
        <ScatteredElements pieces={scatterPlacements.hero} />
        <header className="archive-nav">
          <a className="nav-brand" href="#home" aria-label="Kembali ke awal"></a>
          <nav aria-label="Bagian halaman">
            <a href="#memories">KENANGAN</a>
            <a href="#moments">MOMEN</a>
            <a href="#letter">SURAT</a>
          </nav>
        </header>
        <div className="heart-hero-title">BUAT TIARA</div>
        <div
          className="heart-mosaic"
          id="home"
          style={{ '--columns': heartGrid.columns, '--rows': heartGrid.rows }}
          role="img"
          aria-label="Kolase hati dari foto-foto kita yang terus bergerak"
        >
          {heartPixels.flatMap((row, rowIndex) =>
            row.map((pixel, columnIndex) =>
              pixel ? (
                <span
                  className="heart-pixel"
                  key={`${rowIndex}-${columnIndex}`}
                  style={{ '--tile-delay': pixel.delay }}
                >
                  <img src={pixel.src} alt="" draggable="false" />
                </span>
              ) : (
                <span aria-hidden="true" className="heart-pixel heart-pixel--empty" key={`${rowIndex}-${columnIndex}`} />
              ),
            ),
          )}
        </div>
        <a className="scroll-cue" href="#memories" aria-label="Lihat kenangan">
          <span />
        </a>
      </section>

      <section className="birthday-art-section section-wrap" id="memories">
        <ScatteredElements pieces={scatterPlacements.birthdayArt} />
        <header className="section-heading reveal">
          <span className="section-index">01 / 03</span>
          <h1>Hari spesialmu</h1>
        </header>
        <div className="birthday-art-grid">
          {birthdayArt.map((art, index) => (
            <figure className={`birthday-art-card reveal birthday-art-card--${index + 1}`} key={art.src}>
              <img src={art.src} alt={art.alt} loading="lazy" />
            </figure>
          ))}
        </div>
      </section>

      <section className="eyes-feature reveal" aria-label="Matamu yang cantik">
        <ScatteredElements pieces={scatterPlacements.eyes} />
        <img
          alt="Mata yang cantik"
          className="eyes-image"
          loading="lazy"
          src="/media/love-beautiful-eyes.webp"
        />
        <div className="eyes-caption">
          <span>FOTO FAVORITKU</span>
          <h2>Matamu.</h2>
        </div>
      </section>

      <section className="film-section section-wrap" id="moments">
        <ScatteredElements pieces={scatterPlacements.film} />
        <header className="section-heading reveal">
          <span className="section-index">02 / 03</span>
          <h2>Momen-momen kecil</h2>
        </header>
        <div className="film-grid">
          {videos.map((video, index) => (
            <figure className={`film-card reveal film-card--${index + 1}`} key={video.src}>
              <video
                autoPlay
                controls
                loop
                muted
                playsInline
                preload="metadata"
                poster={video.poster}
              >
                <source src={video.src} type="video/mp4" />
              </video>
              <figcaption>{video.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="puzzle-section section-wrap reveal">
        <ScatteredElements pieces={scatterPlacements.puzzle} />
        <header className="section-heading">
          <span className="section-index">PERMAINAN KECIL</span>
          <h2>Susun foto ini neh cepatttt</h2>
        </header>
        <div
          aria-label="Puzzle foto"
          className={`puzzle-board${solved ? ' puzzle-board--solved' : ''}`}
          style={{ aspectRatio: puzzleImageAspectRatio }}
        >
          {puzzle.map((tile, index) => (
            <button
              aria-label={`Potongan foto ${tile + 1}${selectedPiece === index ? ', dipilih' : ''}`}
              className={`puzzle-piece${selectedPiece === index ? ' puzzle-piece--selected' : ''}`}
              draggable={!solved}
              onDragStart={(event) => {
                event.dataTransfer.setData('text/plain', String(index));
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                swapPieces(Number(event.dataTransfer.getData('text/plain')), index);
                setSelectedPiece(null);
              }}
              key={`${tile}-${index}`}
              onClick={() => selectPiece(index)}
              style={{
                backgroundImage: `url(${puzzleImage})`,
                backgroundPosition: `${(tile % 3) * 50}% ${Math.floor(tile / 3) * 50}%`,
              }}
              type="button"
            />
          ))}
          {solved && <div className="puzzle-solved">Pas banget!</div>}
        </div>
        <div className="puzzle-controls">
          <button onClick={() => setPuzzle(createPuzzle())} type="button">Acak susunan</button>
          <button onClick={() => setPuzzle([0, 1, 2, 3, 4, 5, 6, 7, 8])} type="button">Lihat foto utuh</button>
        </div>
        {selectedPiece !== null && <span className="visually-hidden" aria-live="polite">Pilih potongan lain untuk ditukar.</span>}
      </section>

      <section className="birthday-section section-wrap reveal">
        <ScatteredElements pieces={scatterPlacements.birthday} />
        <header className="section-heading">
          <span className="section-index">20 TAHUN</span>
          <h2>Yuk, Doa dulu yukkkkkk, doa woiiiik!</h2>
        </header>
        <div className="cake-scene">
          <div className="candles" aria-label="20 lilin ulang tahun">
            {Array.from({ length: 20 }, (_, index) => (
              <button
                aria-label={`Lilin ${index + 1}${blownCandles.includes(index) ? ', sudah padam' : ', menyala'}`}
                className={`candle${blownCandles.includes(index) ? ' candle--out' : ''}`}
                key={index}
                onClick={() =>
                  setBlownCandles((current) =>
                    current.includes(index) ? current.filter((candle) => candle !== index) : [...current, index],
                  )
                }
                style={{ '--candle-index': index }}
                type="button"
              />
            ))}
          </div>
          <div className="cake">
            <div className="cake-icing" />
          </div>
        </div>
        <button className="wish-button" onClick={() => setBlownCandles(Array.from({ length: 20 }, (_, index) => index))} type="button">
          Tiup semua lilin
        </button>
      </section>

      <section className="letter-section section-wrap" id="letter">
        <ScatteredElements pieces={scatterPlacements.letter} />
        <header className="section-heading reveal">
          <span className="section-index">03 / 03</span>
          <h2>Ada surat buat kamu</h2>
        </header>
        <div className={`letter-wrap${letterOpen ? ' letter-wrap--open' : ''}`}>
          <button
            aria-expanded={letterOpen}
            className={`envelope${letterOpen ? ' envelope--open' : ''}`}
            onClick={() => setLetterOpen((current) => !current)}
            type="button"
          >
            <span className="envelope-flap" />
            <span className="envelope-seal">♥</span>
            <span className="envelope-hint">{letterOpen ? 'TUTUP' : 'BUKA'}</span>
          </button>
          <article
            aria-hidden={!letterOpen}
            className={`letter-paper${letterOpen ? ' letter-paper--open' : ''}`}
          >
            {loveLetter.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>
        </div>
      </section>

      <footer className="archive-footer">
        <span>Dengan penuh sayang</span>
        <strong>{birthdayGirl}</strong>
        <a href="#home" aria-label="Kembali ke hati">↑</a>
      </footer>
    </main>
  );
}

export default App;
