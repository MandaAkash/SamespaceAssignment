import './App.css';
import { useState, useEffect, useRef } from 'react';
import searchlogo from './search.png';
import Vector from './Vector.svg'
import fastforward from './Fast.png'
import previous from './prev.svg'
function App() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTopTracks, setShowTopTracks] = useState(false); 
  const audioRef = useRef(null);
  const resultsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      let url = `https://cms.samespace.com/items/songs`;

      if (search) {
        url += `?filter[name][_contains]=${search}`;
      } else if (showTopTracks) {
        url += `?filter[top_track][_eq]=true`;
      } else {
        const offset = (currentPage - 1) * resultsPerPage;
        url += `?limit=${resultsPerPage}&offset=${offset}`;
      }

      try {
        const response = await fetch(url);
        const data = await response.json();
        setResults(data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [search, currentPage, showTopTracks]);

  useEffect(() => {
    const audioElement = audioRef.current;

    const updateProgress = () => {
      if (audioElement) {
        const { currentTime, duration } = audioElement;
        setProgress((currentTime / duration) * 100);
      }
    };

    if (audioElement) {
      audioElement.addEventListener('timeupdate', updateProgress);
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener('timeupdate', updateProgress);
      }
    };
  }, [isPlaying]);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const handleSelectSong = (song) => {
    setSelectedSong(song);
    setIsPlaying(false); // Reset play/pause state when a new song is selected
    setProgress(0); // Reset progress bar
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNextSong = () => {
    const currentIndex = results.findIndex(song => song.id === selectedSong.id);
    const nextIndex = (currentIndex + 1) % results.length;
    setSelectedSong(results[nextIndex]);
    setIsPlaying(false);
    setProgress(0);
  };

  const handlePrevSong = () => {
    const currentIndex = results.findIndex(song => song.id === selectedSong.id);
    const prevIndex = (currentIndex - 1 + results.length) % results.length;
    setSelectedSong(results[prevIndex]);
    setIsPlaying(false);
    setProgress(0);
  };

  const handleToggleTopTracks = () => {
    setShowTopTracks(!showTopTracks);
    setCurrentPage(1); // Reset to first page when toggling top tracks
  };
  const totalPages = Math.ceil(results.length / resultsPerPage);
  return (
    <div style={{ backgroundColor: 'black', minHeight: '100vh' }}>
  <div style={{ display: 'flex', backgroundColor: 'black' }}>
    <div className="other-elements" style={{ width: '25%' }}>
      <img
        width="60"
        height="60"
        src="https://img.icons8.com/3d-fluency/94/spotify-logo.png"
        alt="spotify-logo"
        style={{ marginLeft: '30px', marginTop: '20px' }}
      />
    </div>
    <div className="song-list-container" style={{ width: '35%' }}>
      <div style={{ display: 'flex' }}>
        <h2 style={{ color: 'white' }}>For you</h2>
        <h2
          onClick={handleToggleTopTracks}
          style={{ color: 'white', marginLeft: '40px', cursor: 'pointer' }}
        >
          {showTopTracks ? 'All Tracks' : 'Top Tracks'}
        </h2>
      </div>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <input
          type="text"
          placeholder="Search Song, Artist"
          style={{
            padding: '10px',
            borderRadius: '15px',
            paddingLeft: '40px',
            width: '200px',
          }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // Reset to first page when search changes
          }}
        />
        <img
          src={searchlogo}
          alt="search icon"
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
          }}
        />
      </div>
      <div style={{ marginTop: '20px', color: 'white' }}>
        {results.map((song) => (
          <div
            key={song.id}
            onClick={() => handleSelectSong(song)}
            className="song-item"
          >
            <img
              src={`https://cms.samespace.com/assets/${song.cover}`}
              alt={song.name}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                marginRight: '15px',
              }}
            />
            <div style={{ flex: '1' }}>
              <div>{song.name}</div>
              <div style={{ fontSize: '14px', color: 'gray' }}>{song.artist}</div>
            </div>
            {/* Date Created */}
            <div style={{ color: 'gray' }}>
              {new Date(song.date_created).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
      {/* Pagination if there is more data*/}
      {!search && (
        <div style={{ marginTop: '20px', color: 'white' }}>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              style={{
                margin: '5px',
                padding: '5px 10px',
                backgroundColor: index + 1 === currentPage ? 'gray' : 'black',
                color: 'white',
                border: '1px solid white',
                borderRadius: '5px',
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
    {/* Hide on smaller screens and showing only main list*/}
    <div className="other-elements" style={{ width: '40%', color: 'white', marginLeft: '90px', marginRight: '30px' }}>
      {selectedSong && (
        <>
          <h1 style={{ marginTop: "15%" }}>{selectedSong.name}</h1>
          <div style={{ marginBottom: "5%" }}>{selectedSong.artist}</div>
          <div>
            <img
              src={`https://cms.samespace.com/assets/${selectedSong.cover}`}
              alt={selectedSong.name}
              style={{ width: '400px', height: '200px', borderRadius: '10px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', width: "20%" }}>
              <button onClick={handlePrevSong} style={{ padding: '10px', backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '5px', marginLeft: "150%" }}>
                <img src={previous} alt='&gt;&gt;' style={{ width: "30px", height: "30px", cursor: "pointer" }} />
              </button>
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                {isPlaying ? <img src="https://static.vecteezy.com/system/resources/previews/009/992/357/original/pause-icon-sign-symbol-design-free-png.png" alt="pause" style={{ height: "30px", width: "30px", cursor: "pointer", backgroundColor: "black" }} onClick={handlePlayPause} /> : <img src={Vector} alt="play" style={{ height: "30px", width: "30px", backgroundColor: "black", cursor: "pointer" }} onClick={handlePlayPause} />}
              </div>
              <button onClick={handleNextSong} style={{ padding: '10px', backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '5px' }}>
                <img src={fastforward} alt='&lt;&lt;' style={{ width: "30px", height: "30px", cursor: "pointer" }} />
              </button>
            </div>
            <div style={{ width: '100%', height: '5px', backgroundColor: 'gray', borderRadius: '5px', marginTop: '10px' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  backgroundColor: 'white',
                  borderRadius: '5px',
                }}
              />
            </div>
          </div>
          <audio ref={audioRef} src={selectedSong ? selectedSong.url : ''} />
        </>
      )}
    </div>
  </div>
</div>

  );
}
export default App;
