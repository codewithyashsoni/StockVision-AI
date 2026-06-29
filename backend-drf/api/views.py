from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import StockPredictionSerializer
from rest_framework import status
from rest_framework.response import Response
import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
import os
from django.conf import settings
from .utils import save_plot

plt.style.use("dark_background")
plt.rcParams["font.family"] = "DejaVu Sans"
plt.rcParams["figure.dpi"] = 220

def dark_theme(ax):
    ax.set_facecolor("#1E293B")
    ax.grid(
        True,
        color="#334155",
        linestyle="--",
        linewidth=0.5,
        alpha=0.35
    )
    ax.tick_params(colors="white", labelsize=10)

    ax.xaxis.label.set_color("white")
    ax.yaxis.label.set_color("white")

    ax.title.set_color("white")
    ax.title.set_fontsize(16)
    ax.title.set_weight("bold")

    for spine in ax.spines.values():
        spine.set_color("#64748B")

    legend = ax.legend(
        facecolor="#1E293B",
        edgecolor="#475569",
        fontsize=10,
        loc="upper left",
        framealpha=0.9
    )

    for text in legend.get_texts():
        text.set_color("white")


class StockPredictionAPIView(APIView):
    def post(self, request):
        serializer = StockPredictionSerializer(data=request.data)
        if serializer.is_valid():
            ticker = serializer.validated_data['ticker']

            # Fetch the data from yfinance
            now = datetime.now()
            start = datetime(now.year-10, now.month, now.day)
            end = now
            df = yf.download(ticker, start, end)
            if df.empty:
                return Response({"error": "No data found for the given ticker.",
                                 'status': status.HTTP_404_NOT_FOUND})
            df = df.reset_index()
            # Generate Basic Plot
            plt.switch_backend('AGG')
            fig, ax = plt.subplots(figsize=(12,5))
            fig.patch.set_facecolor("#0F172A")
            ax.plot(
                df.Close,
                color="#38BDF8",
                linewidth=2.6,
                label="Closing Price"
            )
            ax.set_title(f"Closing Price of {ticker}", fontsize=15, weight="bold")
            ax.set_xlabel("Days")
            ax.set_ylabel("Price")
            dark_theme(ax)
            # Save the plot to a file
            plt.tight_layout()
            plot_img_path = f'{ticker}_plot.png'
            plot_img = save_plot(plot_img_path)
            
            # 100 Days moving average

            ma100 = df.Close.rolling(100).mean()
            plt.switch_backend('AGG')
            fig, ax = plt.subplots(figsize=(12,5))
            fig.patch.set_facecolor("#0F172A")
            ax.plot(
                df.Close,
                color="#38BDF8",
                linewidth=2.5,
                label="Closing Price"
            )
            ax.plot(
                ma100,
                color="#F59E0B",
                linewidth=2.2,
                label="100 DMA"
            )
            ax.set_title(f"100 Day Moving Average - {ticker}", fontsize=15, weight="bold")
            ax.set_xlabel("Days")
            ax.set_ylabel("Price")
            dark_theme(ax)
            plt.tight_layout()
            plot_img_path = f"{ticker}_100_dma.png"
            plot_100_dma = save_plot(plot_img_path)

            # 200 Days moving average

            ma200 = df.Close.rolling(200).mean()
            plt.switch_backend('AGG')
            fig, ax = plt.subplots(figsize=(12,5))
            fig.patch.set_facecolor("#0F172A")
            ax.plot(
                df.Close,
                color="#38BDF8",
                linewidth=2.5,
                label="Closing Price"
            )
            ax.plot(
                ma100,
                color="#F59E0B",
                linewidth=2.2,
                label="100 DMA"
            )
            ax.plot(
                ma200,
                color="#EF4444",
                linewidth=2.2,
                label="200 DMA"
            )
            ax.set_title(f"200 Day Moving Average - {ticker}", fontsize=15, weight="bold")
            ax.set_xlabel("Days")
            ax.set_ylabel("Price")
            dark_theme(ax)
            plt.tight_layout()
            plot_img_path = f"{ticker}_200_dma.png"
            plot_200_dma = save_plot(plot_img_path)

            # Splitting data into Training & Testing datasets
            data_training = pd.DataFrame(df.Close[0:int(len(df)*0.7)])
            data_testing = pd.DataFrame(df.Close[int(len(df)*0.7): int(len(df))])

            # Scaling down the data between 0 and 1
            from sklearn.preprocessing import MinMaxScaler
            from keras.models import load_model
            from sklearn.metrics import mean_squared_error, r2_score
            
            scaler = MinMaxScaler(feature_range=(0,1))

            # Load ML Model
            model = load_model('stock_prediction_model.keras')

            # Preparing Test Data
            past_100_days = data_training.tail(100)
            final_df = pd.concat([past_100_days, data_testing], ignore_index=True)
            input_data = scaler.fit_transform(final_df)

            x_test = []
            y_test = []
            for i in range(100, input_data.shape[0]):
                x_test.append(input_data[i-100: i])
                y_test.append(input_data[i, 0])
            x_test, y_test = np.array(x_test), np.array(y_test)

            # Making Predictions
            y_predicted = model.predict(x_test)

            # Revert the scaled prices to original price
            y_predicted = scaler.inverse_transform(y_predicted.reshape(-1, 1)).flatten()
            y_test = scaler.inverse_transform(y_test.reshape(-1, 1)).flatten()

            # Plot the final prediction

            plt.switch_backend('AGG')
            fig, ax = plt.subplots(figsize=(12,5))
            fig.patch.set_facecolor("#0F172A")
            ax.plot(
                y_test,
                color="#38BDF8",
                linewidth=2.5,
                label="Actual Price"
            )
            ax.plot(
                y_predicted,
                color="#FACC15",
                linewidth=2.5,
                label="Predicted Price"
            )
            ax.set_title(f"AI Prediction - {ticker}", fontsize=15, weight="bold")
            ax.set_xlabel("Days")
            ax.set_ylabel("Price")
            dark_theme(ax)
            plt.tight_layout()
            plot_img_path = f"{ticker}_final_prediction.png"
            plot_prediction = save_plot(plot_img_path)

            # Model Evaluation
            # Mean Squared Error (MSE)
            mse = mean_squared_error(y_test, y_predicted)

            # Root Mean Squared Error (RMSE)
            rmse = np.sqrt(mse)

            # R-Squared
            r2 = r2_score(y_test, y_predicted)


            return Response({
                'status': 'success',
                'plot_img': plot_img,
                'plot_100_dma': plot_100_dma,
                'plot_200_dma': plot_200_dma,
                'plot_prediction': plot_prediction,
                'mse': mse,
                'rmse': rmse,
                'r2': r2
                })