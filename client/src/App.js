import React, { useEffect, useState } from 'react';
import './App.css';

function App() {

  const [backendData, setBackendData] = useState([{}]);
  const N = 2;

  useEffect(() => {
    fetch(`/api/photos/${N}`).then(
      response => response.json()
    ).then(
      data => {
        setBackendData(data);
      }
    );
  }, []);

  return (
    <div>
      {
        (typeof backendData.data === 'undefined') ? (
          <p>Loading...</p>
        ) : (
          backendData.data.map((item, i) => (
            <p key={i}>{item}</p>
          ))
        )
      }
    </div>
  );
}

export default App;