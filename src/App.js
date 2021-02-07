import './App.css';
import { EasybaseProvider, useEasybase } from 'easybase-react';
import { useEffect } from 'react';
import ebconfig from './ebconfig';
import Timeline from './components/timeline'

function App() {
  return (
    <div className="App" style={{ display: "flex", justifyContent: "center" }}>
      <EasybaseProvider ebconfig={ebconfig}>
        <Timeline />
      </EasybaseProvider>
    </div>
  );
}

function Notes() {
  const { Frame, sync, configureFrame } = useEasybase();

  useEffect(() => {
    configureFrame({ tableName: "TRIALS" });
    sync();
  }, []);

  const noteRootStyle = {
    border: "2px #0af solid",
    borderRadius: 9,
    margin: 20,
    backgroundColor: "#efefef",
    padding: 6
  };


  return (
    <div style={{ width: 400 }}>
      {Frame().map(ele => 
        <div style={noteRootStyle}>
          <h3>{ele.type}</h3>
          <p>{ele.round}</p>
          <small>{String(ele['num-watching']).slice(0, 10)}</small>
        </div>
      )}
    </div>
  )
}

function NewNoteButton() {
  const { Frame, sync } = useEasybase();

  const buttonStyle = {
    position: "absolute",
    left: 10,
    top: 10,
    fontSize: 21
  }

  const handleClick = () => {
    
    Frame().push({
      "num-watching": 4,
      type: "abc",
      round: 3
    })
    
    sync();
  }

  return <button style={buttonStyle} onClick={handleClick}>📓 Add Note 📓</button>
}


export default App;