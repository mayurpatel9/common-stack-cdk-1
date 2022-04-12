import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'


function App() {

  const [allPhotos, setAllPhotos] = useState([]);
  const [photo, setPhoto] = useState();

  async function fetchPhotos() {
    const { data } = await axios.get(`${baseUri}getPhotos`);
    setAllPhotos(data)

    console.log(data);
  }

  async function fetchPhoto() {
    const { data } = await axios.get(`${baseUri}getPhoto`);
    setPhoto(data)

    console.log(data);
  }

  useEffect(() => {
    fetchPhotos();
    fetchPhoto();
  }, [])

  const baseUri = process.env.REACT_APP_API_URL;
  console.log(baseUri);

  function getCarouseImage(p: any) {
    return (
      <Carousel.Item interval={1000} style={{height: 350}}>
        <img src={p.url} alt={p.filename} className='h-100'/>
        <Carousel.Caption>
          <h3 style={{backgroundColor: 'rgba(0,0,0,.3)'}}> {p.filename}</h3>
        </Carousel.Caption>
      </Carousel.Item>)
  }
  return (
    <div className='App bg-secondary min-vh-100'>
      <Carousel>
        <h1 className='display-3 p-3 mb-5'>My Random images</h1>
          {allPhotos.map(photo => getCarouseImage(photo))}
      </Carousel>
      <Carousel>
        <h1 className='display-3 p-3 mb-5'>My Random image</h1>
        {() => getCarouseImage(photo)}
      </Carousel>
    </div>
  );
}

export default App;
