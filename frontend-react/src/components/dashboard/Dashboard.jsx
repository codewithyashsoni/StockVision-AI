import {useEffect, useState} from 'react'
import axiosInstance from '../../axiosInstance'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

const Dashboard = () => {
    const [ticker, setTicker] = useState('')
    const [error, setError] = useState()
    const [loading, setLoading] = useState(false)
    const [plot, setPlot] = useState()
    const [ma100, setMA100] = useState()
    const [ma200, setMA200] = useState()
    const [prediction, setPrediction] = useState()
    const [mse, setMSE] = useState()
    const [rmse, setRMSE] = useState()
    const [r2, setR2] = useState()

    useEffect(()=>{
        const fetchProtectedData = async () =>{
            try{
                const response = await axiosInstance.get('/protected-view/');
            }catch(error){
                console.error('Error fetching data:', error)
            }
        }
        fetchProtectedData();
    }, [])

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setLoading(true)
        try{
            const response = await axiosInstance.post('/predict/', {
                ticker: ticker
            });
            console.log(response.data);
            const backendRoot = import.meta.env.VITE_BACKEND_ROOT
            const plotUrl = `${backendRoot}${response.data.plot_img}`
            const ma100Url = `${backendRoot}${response.data.plot_100_dma}`
            const ma200Url = `${backendRoot}${response.data.plot_200_dma}`
            const predictionUrl = `${backendRoot}${response.data.plot_prediction}`
            setPlot(plotUrl)
            setMA100(ma100Url)
            setMA200(ma200Url)
            setPrediction(predictionUrl)
            setMSE(response.data.mse)
            setRMSE(response.data.rmse)
            setR2(response.data.r2)
            // Set plots
            if(response.data.error){
                setError(response.data.error)
            }
        }catch(error){
            console.error('There was an error making the API request', error)
        }finally{
            setLoading(false);
        }
    }

  return (
    <div className="dashboard-wrapper">
        <div className='container '>
            <div className="row">
                <div className="col-md-6 mx-auto">
                    <div className="prediction-card p-4">
                        <h2 className="text-light mb-4 text-center">Search Your Stock</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" className='form-control' placeholder='Enter Stock Ticker' 
                            onChange={(e) => setTicker(e.target.value)} required
                            />
                            <small>{error && <div className='text-danger'>{error}</div>}</small>
                            <button type='submit' className='btn btn-info mt-3'>
                                {loading ? <span><FontAwesomeIcon icon={faSpinner} spin /> Please wait...</span>: 'See Prediction'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Print prediction plots */}
                {prediction && (
                    <div className="prediction mt-5">
                    <div className="prediction-card p-4 mb-4">
                        <h4 className="text-light mb-3">📈 Closing Price</h4>
                        {plot && (
                            <img src={plot} className="prediction-image mx-auto d-block" />
                        )}
                    </div>

                    <div className="prediction-card p-4 mb-4">
                        <h4 className="text-light mb-3">📊 100 Day Moving Average</h4>
                        {ma100 && (
                            <img src={ma100} className="prediction-image mx-auto d-block" />
                        )}
                    </div>

                    <div className="prediction-card p-4 mb-4">
                        <h4 className="text-light mb-3">📉 200 Day Moving Average</h4>
                        {ma200 && (
                            <img src={ma200} className="prediction-image mx-auto d-block" />
                        )}
                    </div>

                    <div className="prediction-card p-4 mb-4">
                        <h4 className="text-light mb-3">🤖 AI Prediction</h4>
                        {prediction && (
                            <img src={prediction} className="prediction-image mx-auto d-block" />
                        )}
                    </div>

                    <div className="prediction-card p-4 text-light">
                        <h2 className="text-center text-light mt-4 mb-4">
                            📊 Model Evaluation
                        </h2>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="feature-card">
                                    <h5>MSE</h5>
                                    <h2>{Number(mse).toFixed(3)}</h2>
                                    <p>Mean Squared Error</p>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="feature-card">
                                    <h5>RMSE</h5>
                                    <h2>{Number(rmse).toFixed(3)}</h2>
                                    <p>Root Mean Squared Error</p>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="feature-card">
                                    <h5>R²</h5>
                                    <h2>{Number(r2).toFixed(3)}</h2>
                                    <p>Accuracy Score</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                )}
                

            </div>
        </div>
    </div>    
  )
}

export default Dashboard