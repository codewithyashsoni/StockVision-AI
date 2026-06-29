import React from 'react'
import Header from './Header'
import Footer from './Footer'
import Button from './Button'

const Main = () => {
  return (
    <>
    <div className="hero-wrapper">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className='hero-card p-5 text-center'>
                <h1 className='text-light'>AI-Powered Stock Prediction</h1>
                <p className="lead text-light">Predict future stock prices using
    Deep Learning (LSTM), Moving Averages,
    and Machine Learning techniques. <br /> 

    Get historical trends,
    interactive charts,
    and intelligent predictions.</p>
                <Button text="Explore Now" class="btn-info" url="/dashboard" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    
    </>
  )
}

export default Main