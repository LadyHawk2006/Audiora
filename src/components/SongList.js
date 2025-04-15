import React from "react";
import useQueueStore from "@/store/useQueueStore";

const SongList = () => {
  const { queue, setCurrentSong } = useQueueStore();

  return (
    <div style={styles.songList}>
      {queue.length === 0 ? (
        <p style={styles.emptyQueue}>No songs in queue</p>
      ) : (
        queue.map((song, index) => (
          <div 
            key={index} 
            style={styles.songItem} 
            onClick={() => setCurrentSong(song)}
          >
            <img src={song.thumbnail} alt={song.title} style={styles.songThumbnail} />
            <div style={styles.songInfo}>
              <p style={styles.songTitle}>{song.title}</p>
              <p style={styles.songArtist}>{song.artist}</p>
            </div>
            <p style={styles.songDuration}>{song.duration}</p>
          </div>
        ))
      )}
    </div>
  );
};

// 🔥 Inline Styles Object
const styles = {
  songList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "10px",
    maxHeight: "300px",
    overflowY: "auto",
  },
  songItem: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "10px",
    cursor: "pointer",
    borderRadius: "8px",
    transition: "background 0.3s ease",
  },
  songItemHover: {
    background: "rgba(255, 255, 255, 0.1)",
  },
  songThumbnail: {
    width: "50px",
    height: "50px",
    borderRadius: "5px",
  },
  songInfo: {
    flexGrow: 1,
  },
  songTitle: {
    fontSize: "14px",
    fontWeight: "bold",
  },
  songArtist: {
    fontSize: "12px",
    color: "#aaa",
  },
  songDuration: {
    fontSize: "12px",
    color: "#ccc",
  },
  emptyQueue: {
    textAlign: "center",
    color: "#888",
  },
};

export default SongList;
